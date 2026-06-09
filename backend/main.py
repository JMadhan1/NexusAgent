import os
import json
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from agent.graph import agent_graph
from agent.state import AgentState
from agent.nodes.orchestrator import get_agent_addresses, AGENT_PRIVATE_KEY
from services.delegation_signer import create_root_delegation

load_dotenv()

# Base mainnet MetaMask delegation-framework v1.3.0 — used by /agent/demo
_DEMO_DELEGATION_MANAGER = "0x739f517E8e4f4dba64f4FEADCA6eBfe6B23Ac5f7"
_DEMO_ENFORCER = "0xb56fea86Db0B7EB0Ad3c43a2D2AB6D3D2D36B285"
_DEMO_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
_DEMO_USER_KEY = "0x" + "de" * 32  # throwaway demo wallet — no real funds

app = FastAPI(title="NexusAgent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store (use Redis in production)
stored_delegations: dict = {}

class AgentRunRequest(BaseModel):
    goal: str
    rootDelegation: dict
    delegator: str
    delegationManager: str
    enforcerAddress: str
    usdcAddress: str
    chainId: str = "8453"
    budgetUsdc: float

class StoreDelegationRequest(BaseModel):
    encodedDelegation: str
    delegatorAddress: str
    delegationManager: str
    budgetUsdc: float
    userAddress: str

@app.get("/health")
def health():
    return {"status": "ok", "service": "NexusAgent"}

@app.get("/agent/address")
def get_agent_address():
    """Return the orchestrator agent wallet address."""
    try:
        addrs = get_agent_addresses()
        return {"agentAddress": addrs["orchestrator"]}
    except Exception as e:
        return {"agentAddress": "0x0000000000000000000000000000000000000000", "error": str(e)}


@app.get("/agent/addresses")
def get_all_agent_addresses():
    """Return all agent addresses (orchestrator + sub-agents) for frontend delegation setup."""
    try:
        return get_agent_addresses()
    except Exception as e:
        return {"error": str(e)}

@app.post("/agent/run/sync")
async def run_agent_sync(req: AgentRunRequest):
    """
    Non-streaming JSON endpoint — runs full agent pipeline and returns when done.
    Useful for curl tests and judge demos. For real-time UI use /agent/run (SSE).
    """
    initial_state: AgentState = {
        "goal": req.goal,
        "subtasks": [],
        "results": [],
        "payments": [],
        "total_spent_usdc": 0.0,
        "budget_usdc": req.budgetUsdc,
        "report": None,
        "root_delegation": req.rootDelegation,
        "delegator": req.delegator,
        "delegation_manager": req.delegationManager,
        "enforcer_address": req.enforcerAddress,
        "usdc_address": req.usdcAddress,
        "chain_id": req.chainId,
        "sub_agents": {},
        "metamask_user_address": req.delegator,
        "smart_account_address": req.delegator,
        "permission_granted": True,
        "opportunities": None,
        "top_opportunities": None,
        "risk_assessments": None,
        "decision": None,
        "events": [],
        "error": None,
    }
    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(None, lambda: agent_graph.invoke(initial_state))
    return {
        "success": True,
        "report": result.get("report"),
        "payments": result.get("payments", []),
        "total_spent_usdc": result.get("total_spent_usdc", 0),
        "events": result.get("events", []),
        "sub_agents": list(result.get("sub_agents", {}).keys()),
    }


@app.post("/delegation/store")
def store_delegation(req: StoreDelegationRequest):
    """Store user's signed ERC-7710 delegation for agent use."""
    stored_delegations[req.userAddress] = req.dict()
    return {"success": True, "message": "Delegation stored"}

@app.get("/")
def root():
    """API documentation & entry point."""
    return {
        "service": "NexusAgent",
        "description": "Autonomous Research & Risk Assessment AI Agent",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "GET /health": "Service health check",
            "GET /agent/addresses": "Get orchestrator + sub-agent addresses",
            "POST /agent/run": "Execute agent with delegation (SSE streaming)",
            "POST /agent/run/sync": "Execute agent — full JSON response (no streaming)",
            "POST /agent/demo": "One-click judge demo — real delegation, no MetaMask needed",
        },
        "tracks": [
            "Best Agent",
            "Best A2A Coordination",
            "Best Venice AI",
            "Best 1Shot Relayer",
            "Best x402 + ERC-7710"
        ]
    }


@app.post("/agent/demo")
async def run_agent_demo():
    """
    One-click judge demo: builds a real ERC-7710 signed delegation
    (throwaway wallet → orchestrator) and runs the full agent pipeline.
    Returns full JSON report + payment breakdown. No MetaMask required.
    """
    from eth_account import Account as _Acct
    try:
        addrs = get_agent_addresses()
        orchestrator_addr = addrs["orchestrator"]
    except Exception:
        orchestrator_addr = _Acct.from_key(AGENT_PRIVATE_KEY).address

    demo_user = _Acct.from_key(_DEMO_USER_KEY)
    root_delegation = create_root_delegation(
        delegator_private_key=_DEMO_USER_KEY,
        delegate_address=orchestrator_addr,
        max_usdc_units=50_000,  # 0.05 USDC
        enforcer_address=_DEMO_ENFORCER,
        usdc_address=_DEMO_USDC,
        delegation_manager=_DEMO_DELEGATION_MANAGER,
        chain_id=8453,
    )

    initial_state: AgentState = {
        "goal": "Research the current state of AI agents in crypto: key projects, adoption, and the regulatory landscape in 2025.",
        "subtasks": [],
        "results": [],
        "payments": [],
        "total_spent_usdc": 0.0,
        "budget_usdc": 0.05,
        "report": None,
        "root_delegation": root_delegation,
        "delegator": demo_user.address,
        "delegation_manager": _DEMO_DELEGATION_MANAGER,
        "enforcer_address": _DEMO_ENFORCER,
        "usdc_address": _DEMO_USDC,
        "chain_id": "8453",
        "sub_agents": {},
        "metamask_user_address": demo_user.address,
        "smart_account_address": demo_user.address,
        "permission_granted": True,
        "events": [],
        "error": None,
    }
    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(None, lambda: agent_graph.invoke(initial_state))
    return {
        "success": True,
        "demo_user": demo_user.address,
        "orchestrator": orchestrator_addr,
        "report": result.get("report"),
        "payments": result.get("payments", []),
        "total_spent_usdc": result.get("total_spent_usdc", 0),
        "sub_agents": list(result.get("sub_agents", {}).keys()),
        "event_count": len(result.get("events", [])),
    }


@app.post("/agent/run")
async def run_agent(req: AgentRunRequest):
    """
    Run the NexusAgent pipeline with SSE streaming.
    Streams real-time events back to the frontend.
    """

    initial_state: AgentState = {
        "goal": req.goal,
        "subtasks": [],
        "results": [],
        "payments": [],
        "total_spent_usdc": 0.0,
        "budget_usdc": req.budgetUsdc,
        "report": None,
        "root_delegation": req.rootDelegation,
        "delegator": req.delegator,
        "delegation_manager": req.delegationManager,
        "enforcer_address": req.enforcerAddress,
        "usdc_address": req.usdcAddress,
        "chain_id": req.chainId,
        "sub_agents": {},
        "metamask_user_address": req.delegator,
        "smart_account_address": req.delegator,
        "permission_granted": True,
        "opportunities": None,
        "top_opportunities": None,
        "risk_assessments": None,
        "decision": None,
        "events": [],
        "error": None,
    }

    async def event_stream():
        yield f"data: {json.dumps({'type': 'thinking', 'message': 'NexusAgent starting\u2026'})}\n\n"

        queue: asyncio.Queue = asyncio.Queue()
        loop = asyncio.get_running_loop()

        def run_graph():
            try:
                for output in agent_graph.stream(initial_state):
                    for _node, node_output in output.items():
                        for event in node_output.get("events", []):
                            loop.call_soon_threadsafe(queue.put_nowait, event)
            except Exception as exc:
                loop.call_soon_threadsafe(
                    queue.put_nowait,
                    {"type": "error", "message": str(exc)},
                )
            finally:
                loop.call_soon_threadsafe(queue.put_nowait, None)  # sentinel

        loop.run_in_executor(None, run_graph)

        while True:
            event = await queue.get()
            if event is None:
                break
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

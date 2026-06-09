"""
NexusAgent Demo Runner
======================
Run the full agent pipeline from the command line — no MetaMask or frontend required.
Creates a real ERC-7710 root delegation signed with a demo wallet, then invokes
the LangGraph graph (planner → orchestrator → executor → synthesizer).

Usage:
    cd backend
    python demo_run.py
    python demo_run.py --goal "Analyze the DeFi lending market in 2025"
    python demo_run.py --budget 0.02 --dry-run

Environment:
    Requires .env with AGENT_PRIVATE_KEY and VENICE_API_KEY at minimum.
    ONESHOT_RELAYER_URL is optional (defaults to 1Shot public relayer).
"""
import os
import sys
import json
import time
import argparse
from dotenv import load_dotenv
from eth_account import Account

load_dotenv()

# ── Board ─────────────────────────────────────────────────────────────────────
AGENT_PRIVATE_KEY = os.getenv("AGENT_PRIVATE_KEY", "0x" + "a" * 64)
CHAIN_ID = int(os.getenv("CHAIN_ID", "8453"))
USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"

DEFAULT_GOAL = (
    "Research the current state of AI agents in crypto: "
    "key projects, real-world adoption, regulatory landscape, and investment activity in 2025."
)


def _get_environment():
    """Fetch deployed contract addresses from the smart-accounts-kit environment."""
    try:
        # Use known Base mainnet addresses from MetaMask delegation-framework v1.3.0
        return {
            "DelegationManager": "0x739f517E8e4f4dba64f4FEADCA6eBfe6B23Ac5f7",
            "caveatEnforcers": {
                "ERC20TransferAmountEnforcer": "0xb56fea86Db0B7EB0Ad3c43a2D2AB6D3D2D36B285",
            },
        }
    except Exception as e:
        print(f"[warn] Could not get environment: {e}")
        return None


def _build_demo_delegation(orchestrator_address: str, budget_usdc: float, env: dict) -> dict:
    """
    Create a demo root delegation signed by a throwaway 'user' wallet.
    In production this is signed by the user in MetaMask.
    """
    from services.delegation_signer import create_root_delegation

    # Use a deterministic demo user key so the 'user' address is reproducible
    demo_user_key = "0x" + "de" * 32  # demo wallet — no real funds
    demo_user = Account.from_key(demo_user_key)

    max_units = int(budget_usdc * 1_000_000)
    delegation_manager = env["DelegationManager"]
    enforcer = env["caveatEnforcers"]["ERC20TransferAmountEnforcer"]

    print(f"  Demo user wallet : {demo_user.address}")
    print(f"  Orchestrator     : {orchestrator_address}")
    print(f"  Budget           : {budget_usdc} USDC ({max_units} units)")
    print(f"  DelegationManager: {delegation_manager}")

    root_delegation = create_root_delegation(
        delegator_private_key=demo_user_key,
        delegate_address=orchestrator_address,
        max_usdc_units=max_units,
        enforcer_address=enforcer,
        usdc_address=USDC_ADDRESS,
        delegation_manager=delegation_manager,
        chain_id=CHAIN_ID,
    )

    print(f"  Root delegation  : delegate={root_delegation['delegate'][:10]}…")
    print(f"  Signature        : {root_delegation['signature'][:18]}…")
    return root_delegation, demo_user.address, delegation_manager, enforcer


def run_demo(goal: str, budget_usdc: float, dry_run: bool = False):
    from agent.graph import agent_graph
    from agent.state import AgentState

    print("\n" + "=" * 60)
    print("  NexusAgent Demo — ERC-7710 Delegation Cascade")
    print("=" * 60)

    orchestrator_address = Account.from_key(AGENT_PRIVATE_KEY).address
    print(f"\n[1/5] Orchestrator wallet: {orchestrator_address}")

    env = _get_environment()
    if not env:
        print("[ERROR] Could not load smart accounts environment. Check chain config.")
        sys.exit(1)

    print("\n[2/5] Building root delegation (User → Orchestrator)…")
    root_delegation, user_address, delegation_manager, enforcer_address = \
        _build_demo_delegation(orchestrator_address, budget_usdc, env)

    if dry_run:
        print("\n[DRY RUN] Delegation built. Skipping agent execution.")
        print(json.dumps(root_delegation, indent=2))
        return

    state: AgentState = {
        "goal": goal,
        "subtasks": [],
        "results": [],
        "payments": [],
        "total_spent_usdc": 0.0,
        "budget_usdc": budget_usdc,
        "report": None,
        "root_delegation": root_delegation,
        "delegator": user_address,
        "delegation_manager": delegation_manager,
        "enforcer_address": enforcer_address,
        "usdc_address": USDC_ADDRESS,
        "chain_id": str(CHAIN_ID),
        "sub_agents": {},
        "metamask_user_address": user_address,
        "smart_account_address": user_address,
        "permission_granted": True,
        "events": [],
        "error": None,
    }

    print(f"\n[3/5] Goal: {goal}\n")
    print("[4/5] Running agent pipeline (planner → orchestrator → executor → synthesizer)…\n")

    t0 = time.time()
    result = agent_graph.invoke(state)
    elapsed = time.time() - t0

    # Print event log
    for event in result.get("events", []):
        icon = {"thinking": "🧠", "cascade": "🔗", "relay": "⚡", "venice_call": "🤖",
                "payment": "💸", "done": "✅", "error": "❌"}.get(event.get("type", ""), "•")
        print(f"  {icon} {event.get('message', '')}")

    print("\n" + "=" * 60)
    print("[5/5] FINAL REPORT")
    print("=" * 60)
    print(result.get("report") or "[No report generated]")

    payments = result.get("payments", [])
    total = result.get("total_spent_usdc", 0.0)
    print(f"\n{'─' * 60}")
    print(f"  Venice AI calls : {len(payments)}")
    print(f"  Total spent     : ${total:.4f} USDC via ERC-7710 + 1Shot relayer")
    print(f"  Elapsed         : {elapsed:.1f}s")
    if payments:
        for p in payments:
            status = p.get("status", "?")
            tx = (p.get("txHash") or "")[:14]
            print(f"    [{p.get('agent','?')}] ${p.get('amountUsdc',0):.4f} — {status} — tx: {tx}…")
    print(f"{'─' * 60}\n")

    if result.get("error"):
        print(f"[ERROR] {result['error']}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="NexusAgent demo runner")
    parser.add_argument("--goal", default=DEFAULT_GOAL, help="Research goal for the agent")
    parser.add_argument("--budget", type=float, default=0.05, help="USDC budget (default: 0.05)")
    parser.add_argument("--dry-run", action="store_true", help="Build delegation only, skip execution")
    args = parser.parse_args()

    run_demo(goal=args.goal, budget_usdc=args.budget, dry_run=args.dry_run)

"""
Orchestrator node: Creates the ERC-7710 A2A delegation cascade.

Flow:
  User Smart Account → Orchestrator (root delegation, signed by user)
  Orchestrator → Researcher  (redelegation, 40% budget, signed by orchestrator key)
  Orchestrator → Analyst     (redelegation, 35% budget, signed by orchestrator key)
  Orchestrator → Synthesizer (redelegation, 25% budget, signed by orchestrator key)

Authority for each redelegation = struct_hash(root_delegation), per ERC-7710 spec.
"""
import os
from eth_account import Account
from ..state import AgentState
from services.delegation_signer import (
    create_signed_redelegation,
    derive_agent_key,
)

AGENT_PRIVATE_KEY = os.getenv("AGENT_PRIVATE_KEY", "0x" + "a" * 64)

# Budget split ratios for sub-agents
BUDGET_SPLIT = {"researcher": 0.40, "analyst": 0.35, "synthesizer": 0.25}


def get_agent_addresses() -> dict[str, str]:
    """Return orchestrator + sub-agent addresses (derived deterministically)."""
    orchestrator = Account.from_key(AGENT_PRIVATE_KEY)
    return {
        "orchestrator": orchestrator.address,
        "researcher": Account.from_key(derive_agent_key(AGENT_PRIVATE_KEY, "researcher_v1")).address,
        "analyst": Account.from_key(derive_agent_key(AGENT_PRIVATE_KEY, "analyst_v1")).address,
        "synthesizer": Account.from_key(derive_agent_key(AGENT_PRIVATE_KEY, "synthesizer_v1")).address,
    }


def orchestrator_node(state: AgentState) -> dict:
    """
    LangGraph node: creates redelegations for each sub-agent.
    Returns updated state with sub_agents populated.
    """
    orchestrator_key = AGENT_PRIVATE_KEY
    orchestrator_acct = Account.from_key(orchestrator_key)

    root_delegation = state["root_delegation"]
    delegation_manager = state["delegation_manager"]
    enforcer_address = state["enforcer_address"]
    usdc_address = state["usdc_address"]
    chain_id = int(state.get("chain_id", "8453"))
    budget_raw = int(state["budget_usdc"] * 1_000_000)

    sub_agents: dict = {}
    events: list[dict] = [
        {
            "type": "cascade",
            "message": (
                f"🔗 Building delegation cascade: {orchestrator_acct.address[:10]}… → 3 sub-agents"
            ),
        }
    ]

    for role, ratio in BUDGET_SPLIT.items():
        sub_key = derive_agent_key(orchestrator_key, f"{role}_v1")
        sub_acct = Account.from_key(sub_key)
        sub_budget_units = int(budget_raw * ratio)
        sub_budget_usdc = sub_budget_units / 1_000_000

        if root_delegation and delegation_manager and enforcer_address and usdc_address:
            signed_redelegation = create_signed_redelegation(
                delegate_address=sub_acct.address,
                delegator_address=orchestrator_acct.address,
                parent_delegation=root_delegation,
                max_usdc_units=sub_budget_units,
                enforcer_address=enforcer_address,
                usdc_address=usdc_address,
                private_key=orchestrator_key,
                delegation_manager=delegation_manager,
                chain_id=chain_id,
            )
        else:
            signed_redelegation = {}

        sub_agents[role] = {
            "address": sub_acct.address,
            "private_key": sub_key,
            "delegation": signed_redelegation,
            "budget_usdc": sub_budget_usdc,
        }

        events.append({
            "type": "cascade",
            "message": (
                f"   ↳ {role.capitalize()} {sub_acct.address[:10]}… "
                f"({sub_budget_usdc:.2f} USDC, authority=root#{root_delegation.get('salt',0)})"
            ),
        })

    return {"sub_agents": sub_agents, "events": events}

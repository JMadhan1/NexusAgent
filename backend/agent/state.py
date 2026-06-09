from typing import TypedDict, Annotated, List, Optional, Dict, Any
import operator


class PaymentRecord(TypedDict):
    endpoint: str
    amountUsdc: float
    txHash: Optional[str]
    taskId: Optional[str]
    status: str
    timestamp: float
    agent: str


class SubAgentInfo(TypedDict):
    address: str
    private_key: str
    delegation: Dict[str, Any]
    budget_usdc: float


class AgentState(TypedDict):
    goal: str
    subtasks: List[str]
    results: Annotated[List[str], operator.add]
    payments: Annotated[List[PaymentRecord], operator.add]
    total_spent_usdc: float
    budget_usdc: float
    report: Optional[str]
    # Root delegation (User → Orchestrator), parsed dict
    root_delegation: Dict[str, Any]
    delegator: str
    delegation_manager: str
    # ERC20TransferAmountEnforcer address for the chain
    enforcer_address: str
    # USDC contract address for the chain
    usdc_address: str
    # chain id as string e.g. "8453"
    chain_id: str
    # A2A redelegations created by orchestrator
    sub_agents: Dict[str, SubAgentInfo]
    # MetaMask Smart Accounts context (set by frontend, optional in demo mode)
    metamask_user_address: Optional[str]    # User's EOA (connected MetaMask account)
    smart_account_address: Optional[str]   # EIP-7702 smart account address
    permission_granted: bool               # True when delegation is signed
    # Intelligence pipeline (yield strategist analysis)
    opportunities: Optional[List[Dict[str, Any]]]  # All yield opportunities analyzed
    top_opportunities: Optional[List[Dict[str, Any]]]  # Top 3-5 opportunities
    risk_assessments: Optional[List[Dict[str, Any]]]  # Risk-scored opportunities
    decision: Optional[Dict[str, Any]]  # Final executable decision with reasoning
    # SSE event queue
    events: Annotated[List[dict], operator.add]
    error: Optional[str]

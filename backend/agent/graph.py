from langgraph.graph import StateGraph, END
from .state import AgentState
from .nodes.yield_analyzer import yield_analyzer_node
from .nodes.risk_scorer import risk_scorer_node
from .nodes.decision_maker import decision_maker_node
from .nodes.orchestrator import orchestrator_node
from .nodes.executor import executor_node
from .nodes.synthesizer import synthesizer_node


def build_agent_graph():
    """
    NexusAgent Pipeline (Institutional Yield Strategist):

    YieldAnalyzer → RiskScorer → DecisionMaker → Orchestrator → Executor → Synthesizer

    Each stage builds on previous analysis:
    1. YieldAnalyzer: Identifies top opportunities
    2. RiskScorer: Quantifies risk dimensions
    3. DecisionMaker: Makes executable decision with reasoning
    4. Orchestrator: Creates delegation cascade
    5. Executor: Executes via 1Shot + x402
    6. Synthesizer: Final report with proof
    """
    graph = StateGraph(AgentState)

    graph.add_node("yield_analyzer", yield_analyzer_node)
    graph.add_node("risk_scorer", risk_scorer_node)
    graph.add_node("decision_maker", decision_maker_node)
    graph.add_node("orchestrator", orchestrator_node)
    graph.add_node("executor", executor_node)
    graph.add_node("synthesizer", synthesizer_node)

    graph.set_entry_point("yield_analyzer")
    graph.add_edge("yield_analyzer", "risk_scorer")
    graph.add_edge("risk_scorer", "decision_maker")
    graph.add_edge("decision_maker", "orchestrator")
    graph.add_edge("orchestrator", "executor")
    graph.add_edge("executor", "synthesizer")
    graph.add_edge("synthesizer", END)

    return graph.compile()


agent_graph = build_agent_graph()

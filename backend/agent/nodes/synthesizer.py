from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from ..state import AgentState
import os

def synthesizer_node(state: AgentState) -> dict:
    """
    Synthesize all research results + decision into a final report.
    """
    llm = ChatOpenAI(
        base_url=os.getenv("VENICE_BASE_URL", "https://api.venice.ai/api/v1"),
        api_key=os.getenv("VENICE_API_KEY"),
        model=os.getenv("VENICE_MODEL", "llama-3.3-70b"),
        temperature=0.4,
        max_tokens=2000,
    )

    combined_research = "\n\n---\n\n".join(state["results"]) if state.get("results") else ""

    # Include decision from decision_maker if available
    decision = state.get("decision", {})
    decision_summary = ""
    if decision:
        decision_summary = f"""
## AI DECISION

**Recommendation:** {decision.get('recommendation', 'N/A')}
**Confidence:** {decision.get('decision_details', {}).get('decision_confidence', 0):.0%}
**Expected APY:** {decision.get('decision_details', {}).get('expected_apy', 0):.2f}%
**Risk Score:** {decision.get('risk_profile', {}).get('composite_risk_score', 0):.0%}

**Reasoning Chain:**
{chr(10).join([f"• {step}" for step in decision.get('reasoning_chain', [])])}
"""

    response = llm.invoke([
        SystemMessage(content="""You are a senior research analyst.
        Synthesize the provided research and AI decision into a comprehensive report.
        Use markdown formatting. Include: Executive Summary, Analysis, Decision Rationale,
        Risk Assessment, and Final Recommendations. Be specific, data-driven, and actionable."""),
        HumanMessage(content=f"""
Original Goal: {state['goal']}

Research Collected:
{combined_research}

{decision_summary}

Total spent on Venice AI inference: {state['total_spent_usdc']:.4f} USDC via x402 payments
Research calls made: {len(state['results'])}
Delegation levels: User → Orchestrator → 3 Sub-agents (Researcher/Analyst/Decider)
Execution method: 1Shot Permissionless Relayer (ERC-7710 + ERC-7702)

Synthesize this into a final professional report that highlights the decision and its rationale.
""")
    ])

    report = response.content

    return {
        "report": report,
        "events": [
            {
                "type": "thinking",
                "message": "Synthesizing research into final report..."
            },
            {
                "type": "done",
                "message": f"✅ Report complete! Spent {state['total_spent_usdc']:.4f} USDC across {len(state['payments'])} Venice AI calls.",
                "data": {"report": report}
            }
        ]
    }

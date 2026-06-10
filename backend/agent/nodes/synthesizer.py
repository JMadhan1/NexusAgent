from ..state import AgentState
import os
import requests as _requests

VENICE_BASE_URL = os.getenv("VENICE_BASE_URL", "https://api.venice.ai/api/v1")
VENICE_API_KEY = os.getenv("VENICE_API_KEY", "")
VENICE_MODEL = os.getenv("VENICE_MODEL", "llama-3.3-70b")


def _venice_chat(messages: list, max_tokens: int = 2000) -> str:
    key = os.getenv("VENICE_API_KEY", VENICE_API_KEY)
    resp = _requests.post(
        f"{VENICE_BASE_URL}/chat/completions",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        json={"model": VENICE_MODEL, "messages": messages, "max_tokens": max_tokens,
              "venice_parameters": {"enable_web_search": "off"}},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


def synthesizer_node(state: AgentState) -> dict:
    """
    Synthesize all research results + decision into a final report.
    """

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

    report = _venice_chat([
        {"role": "system", "content": "You are a Chief Investment Officer at a top crypto fund. Write an institutional-grade markdown report with: Executive Summary, Investment Thesis, Risk Assessment, and Actionable Recommendation. Be specific with APY, risk scores, and position sizing."},
        {"role": "user", "content": f"Goal: {state['goal']}\n\nResearch:\n{combined_research[:3000]}\n\nWrite a comprehensive investment report."},
    ], max_tokens=1500)

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

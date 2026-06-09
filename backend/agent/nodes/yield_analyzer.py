"""
Yield Analyzer Node: Identifies top yield opportunities using Venice LLM + market intelligence.
Replaces generic planner with DeFi-specific analysis.

Flow:
  1. User provides goal (e.g., "maximize yield safely")
  2. Venice LLM analyzes 10+ DeFi protocols
  3. Generates opportunities with confidence/risk scores
  4. Returns top 3 for deep analysis by sub-agents
"""

import os
import json
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from ..state import AgentState

VENICE_MODEL = os.getenv("VENICE_MODEL", "llama-3.3-70b")
VENICE_BASE_URL = os.getenv("VENICE_BASE_URL", "https://api.venice.ai/api/v1")


def yield_analyzer_node(state: AgentState) -> dict:
    """
    Analyze DeFi yield opportunities intelligently.
    Returns ranked opportunities with confidence & risk scores.
    """

    llm = ChatOpenAI(
        base_url=VENICE_BASE_URL,
        api_key=os.getenv("VENICE_API_KEY"),
        model=VENICE_MODEL,
        temperature=0.2,
    )

    prompt = f"""
You are a world-class DeFi yield strategist. Analyze current yield opportunities across major protocols.

User goal: {state.get('goal', 'maximize yield safely')}
Available budget: {state.get('budget_usdc', 10)} USDC

Generate ONLY a JSON array. No other text. Format exactly:
[
  {{
    "protocol": "Protocol name",
    "strategy": "Specific opportunity (e.g., Stake ETH → bETH)",
    "estimated_apy": 3.24,
    "base_confidence": 0.92,
    "risk_score": 0.12,
    "rationale": "Why this is a great opportunity right now",
    "validator_health": "Key metrics and trends",
    "smart_contract_risk": 0.08,
    "liquidity_risk": 0.05,
    "regulatory_risk": 0.08,
    "slashing_risk_pct": 0.01,
    "apy_stable_days": 90,
    "audit_status": "Yes",
    "tvl_usd": 15000000,
    "recent_changes": "None/Minor/Major"
  }}
]

Analyze these protocols: Lido, Aave, Curve, Pendle, Stargate, Yearn, Compound, MakerDAO, Eigenlayer, dYdX
Return ONLY valid JSON.
"""

    try:
        response = llm.invoke([
            SystemMessage(content="You are a DeFi research expert. Output only valid JSON."),
            HumanMessage(content=prompt)
        ])

        try:
            opportunities = json.loads(response.content)
            if not isinstance(opportunities, list):
                opportunities = [opportunities]
        except json.JSONDecodeError:
            opportunities = _fallback_opportunities()
    except Exception as e:
        print(f"Venice LLM error: {e}, using fallback")
        opportunities = _fallback_opportunities()

    # Score each opportunity: confidence * (1 - risk)
    for opp in opportunities:
        confidence = opp.get("base_confidence", 0.5)
        risk = opp.get("risk_score", 0.3)
        opp["composite_score"] = confidence * (1 - risk)

    # Sort by composite score
    opportunities.sort(key=lambda x: x.get("composite_score", 0), reverse=True)

    top_3 = opportunities[:3]
    subtasks = [
        f"Research {opp['protocol']}: {opp['strategy']} ({opp['estimated_apy']:.2f}% APY, confidence {opp['base_confidence']:.0%})"
        for opp in top_3
    ]

    return {
        "subtasks": subtasks,
        "opportunities": opportunities,
        "top_opportunities": top_3,
        "events": [
            {
                "type": "thinking",
                "message": f"📊 YieldAnalyzer: Identified {len(opportunities)} opportunities across major protocols"
            },
            {
                "type": "thinking",
                "message": f"🌟 Top opportunity: {top_3[0]['protocol']} - {top_3[0]['strategy']}"
            },
            {
                "type": "thinking",
                "message": f"   APY: {top_3[0]['estimated_apy']:.2f}% | Risk: {top_3[0]['risk_score']:.0%} | Confidence: {top_3[0]['base_confidence']:.0%}"
            }
        ]
    }


def _fallback_opportunities():
    """Fallback data if Venice API unavailable (for demo purposes)."""
    return [
        {
            "protocol": "Lido Ethereum",
            "strategy": "Stake ETH → bETH (liquid staking)",
            "estimated_apy": 3.24,
            "base_confidence": 0.92,
            "risk_score": 0.12,
            "rationale": "Largest validator set (40k validators), proven safety, liquid staking improves DeFi composability",
            "validator_health": "40k validators, 32.2M ETH staked (+2.1% week), 0 slashing incidents",
            "smart_contract_risk": 0.08,
            "liquidity_risk": 0.05,
            "regulatory_risk": 0.10,
            "slashing_risk_pct": 0.01,
            "apy_stable_days": 180,
            "audit_status": "Yes",
            "tvl_usd": 15200000000,
            "recent_changes": "None",
            "composite_score": 0.808
        },
        {
            "protocol": "Aave (Ethereum)",
            "strategy": "Supply USDC → aUSDC (lending)",
            "estimated_apy": 2.87,
            "base_confidence": 0.88,
            "risk_score": 0.18,
            "rationale": "Highest utilization rates post-Shapella, stable borrow demand from leverage traders",
            "validator_health": "TVL: $8.2B across all assets, $1.2B USDC supplied, stable 30+ days",
            "smart_contract_risk": 0.12,
            "liquidity_risk": 0.08,
            "regulatory_risk": 0.15,
            "slashing_risk_pct": 0.0,
            "apy_stable_days": 120,
            "audit_status": "Yes",
            "tvl_usd": 8200000000,
            "recent_changes": "Minor",
            "composite_score": 0.723
        },
        {
            "protocol": "Curve Finance",
            "strategy": "Provide liquidity to ETH/USD pool",
            "estimated_apy": 3.15,
            "base_confidence": 0.81,
            "risk_score": 0.25,
            "rationale": "High volume, but impermanent loss risk in volatile markets, strong governance",
            "validator_health": "ETH/USD pool: $820M, 15% fee APY + veCRV incentives",
            "smart_contract_risk": 0.10,
            "liquidity_risk": 0.25,
            "regulatory_risk": 0.08,
            "slashing_risk_pct": 0.0,
            "apy_stable_days": 90,
            "audit_status": "Yes",
            "tvl_usd": 820000000,
            "recent_changes": "None",
            "composite_score": 0.609
        }
    ]

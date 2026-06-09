"""
Risk Scorer Node: Quantifies risk dimensions of yield opportunities.
Generates risk-adjusted returns and confidence levels.

Input: List of opportunities from YieldAnalyzer
Output: Detailed risk assessment with scoring rationale
"""

import json
from typing import Dict, Any, List
from ..state import AgentState


def risk_scorer_node(state: AgentState) -> dict:
    """
    Assess risk dimensions of identified opportunities.
    Generates detailed risk profile for each.
    """

    opportunities = state.get("opportunities", [])
    if not opportunities:
        return {
            "events": [{"type": "error", "message": "No opportunities to score"}],
            "risk_assessments": []
        }

    risk_assessments = []

    for opp in opportunities:
        assessment = {
            "protocol": opp.get("protocol", ""),
            "strategy": opp.get("strategy", ""),
            "base_apy": opp.get("estimated_apy", 0),
            "risk_analysis": {
                "dimensions": {
                    "smart_contract": {
                        "score": opp.get("smart_contract_risk", 0.1),
                        "severity": _score_to_severity(opp.get("smart_contract_risk", 0.1)),
                        "mitigation": _mitigation_for_contract_risk(opp.get("audit_status", ""))
                    },
                    "slashing": {
                        "score": opp.get("slashing_risk_pct", 0) / 100,
                        "severity": _score_to_severity(opp.get("slashing_risk_pct", 0) / 100),
                        "mitigation": "Distributed validator set reduces concentration risk"
                    },
                    "liquidity": {
                        "score": opp.get("liquidity_risk", 0.05),
                        "severity": _score_to_severity(opp.get("liquidity_risk", 0.05)),
                        "mitigation": "Largest pools maintain deep liquidity"
                    },
                    "regulatory": {
                        "score": opp.get("regulatory_risk", 0.1),
                        "severity": _score_to_severity(opp.get("regulatory_risk", 0.1)),
                        "mitigation": "Decentralized infrastructure reduces jurisdiction risk"
                    },
                    "market": {
                        "score": 0.15,  # General market risk
                        "severity": "Medium",
                        "mitigation": "Diversification across protocols reduces correlation risk"
                    }
                },
                "composite_risk": opp.get("risk_score", 0.15),
                "apy_stability": {
                    "days_sustained": opp.get("apy_stable_days", 60),
                    "trend": "Stable" if opp.get("recent_changes", "") in ["None", "Minor"] else "Volatile"
                }
            },
            "risk_adjusted_apy": _calculate_risk_adjusted_apy(
                opp.get("estimated_apy", 2.5),
                opp.get("risk_score", 0.15)
            ),
            "confidence": {
                "base_confidence": opp.get("base_confidence", 0.7),
                "confidence_adjusted": opp.get("base_confidence", 0.7) * (1 - opp.get("risk_score", 0.15)),
                "reasoning": _generate_confidence_reasoning(opp)
            },
            "recommendation": _generate_recommendation(opp),
            "allocation_percent": _recommend_allocation(
                opp.get("risk_score", 0.15),
                opp.get("base_confidence", 0.7)
            )
        }

        risk_assessments.append(assessment)

    # Sort by risk-adjusted returns
    risk_assessments.sort(
        key=lambda x: x["risk_adjusted_apy"],
        reverse=True
    )

    events = [
        {
            "type": "thinking",
            "message": f"🎯 RiskScorer: Analyzed {len(risk_assessments)} opportunities"
        },
        {
            "type": "thinking",
            "message": f"📈 Risk-adjusted returns: {risk_assessments[0]['protocol']} leads at {risk_assessments[0]['risk_adjusted_apy']:.2f}%"
        },
        {
            "type": "thinking",
            "message": f"⚠️ Risk profile: {_summarize_risks(risk_assessments[0])}"
        }
    ]

    return {
        "risk_assessments": risk_assessments,
        "top_recommendation": risk_assessments[0] if risk_assessments else None,
        "events": events
    }


def _score_to_severity(score: float) -> str:
    """Convert risk score to severity level."""
    if score < 0.05:
        return "Minimal"
    elif score < 0.15:
        return "Low"
    elif score < 0.30:
        return "Medium"
    else:
        return "High"


def _mitigation_for_contract_risk(audit_status: str) -> str:
    """Provide mitigation strategies based on audit."""
    if audit_status == "Yes":
        return "Professional audit completed; consider position sizing limits"
    elif audit_status == "Partial":
        return "Partial audit; recommend conservative allocation"
    else:
        return "No audit; only use if comfortable with unvetted smart contracts"


def _calculate_risk_adjusted_apy(apy: float, risk_score: float) -> float:
    """Calculate APY adjusted for risk (Sharpe-like ratio)."""
    return apy * (1 - risk_score)


def _generate_confidence_reasoning(opp: Dict[str, Any]) -> str:
    """Generate human-readable confidence reasoning."""
    confidence = opp.get("base_confidence", 0.5)
    recent = opp.get("recent_changes", "None")
    stable_days = opp.get("apy_stable_days", 30)

    reasons = []
    if confidence > 0.85:
        reasons.append("High confidence in protocol safety")
    if stable_days > 120:
        reasons.append("APY stable for >120 days shows consistency")
    if recent == "None":
        reasons.append("No recent smart contract changes reduces risk")
    if opp.get("audit_status") == "Yes":
        reasons.append("Professionally audited reduces smart contract risk")

    return " | ".join(reasons) if reasons else "Moderate confidence opportunity"


def _generate_recommendation(opp: Dict[str, Any]) -> str:
    """Generate trading recommendation."""
    confidence = opp.get("base_confidence", 0.5)
    risk = opp.get("risk_score", 0.2)

    if confidence > 0.90 and risk < 0.15:
        return "STRONG BUY - Low risk, high confidence"
    elif confidence > 0.80 and risk < 0.25:
        return "BUY - Good risk-reward profile"
    elif confidence > 0.70 and risk < 0.35:
        return "HOLD / ACCUMULATE - Acceptable risk"
    else:
        return "CAUTIOUS - Higher risk, lower confidence"


def _recommend_allocation(risk_score: float, confidence: float) -> float:
    """Recommend allocation percentage based on risk/confidence."""
    # Conservative allocation model
    # Max 30% for high-risk, max 10% for low-confidence
    allocation = 30 * (1 - risk_score) * confidence
    return min(30, max(5, allocation))


def _summarize_risks(assessment: Dict[str, Any]) -> str:
    """Generate brief risk summary."""
    dims = assessment.get("risk_analysis", {}).get("dimensions", {})
    highest_risk = max(
        [(k, v.get("score", 0)) for k, v in dims.items()],
        key=lambda x: x[1]
    )
    return f"Highest risk: {highest_risk[0]} ({_score_to_severity(highest_risk[1])})"

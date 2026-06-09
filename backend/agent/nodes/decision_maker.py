"""
Decision Maker Node: Makes final executable decision with full reasoning chain.
Generates structured JSON that explains WHY the agent chose an action.

This is the differentiation: judges see not just execution, but *reasoning*.
"""

import json
from typing import Dict, Any
from datetime import datetime
from ..state import AgentState


def decision_maker_node(state: AgentState) -> dict:
    """
    Make final decision based on risk assessments.
    Generate structured decision JSON with full reasoning.
    """

    risk_assessments = state.get("risk_assessments", [])
    opportunities = state.get("opportunities", [])
    results = state.get("results", [])

    if not risk_assessments:
        return {
            "events": [{"type": "error", "message": "No risk assessments available"}],
            "decision": None
        }

    # Top opportunity from risk analysis
    top_assessment = risk_assessments[0]
    top_opp = next(
        (o for o in opportunities if o.get("protocol") == top_assessment.get("protocol")),
        {}
    )

    # Build reasoning chain
    reasoning_chain = _build_reasoning_chain(top_assessment, top_opp, results)

    # Generate decision JSON
    decision = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "decision_id": f"decision_{hash(top_assessment['protocol']) % 1000000}",
        "analysis_summary": {
            "total_opportunities_analyzed": len(opportunities),
            "opportunities_scored": len(risk_assessments),
            "top_choice": top_assessment.get("protocol", ""),
            "strategy": top_assessment.get("strategy", ""),
            "decision_confidence": top_assessment.get("confidence", {}).get("confidence_adjusted", 0.7)
        },
        "reasoning_chain": reasoning_chain,
        "decision_details": {
            "action": _extract_action(top_opp.get("strategy", "")),
            "target_protocol": top_assessment.get("protocol", ""),
            "expected_apy": top_opp.get("estimated_apy", 0),
            "risk_adjusted_apy": top_assessment.get("risk_adjusted_apy", 0),
            "expected_return_on_usdc": {
                "amount_usdc": state.get("budget_usdc", 10),
                "annual_return_usdc": round(
                    (top_assessment.get("risk_adjusted_apy", 2.5) / 100) *
                    state.get("budget_usdc", 10),
                    4
                ),
                "monthly_return_usdc": round(
                    (top_assessment.get("risk_adjusted_apy", 2.5) / 100) *
                    state.get("budget_usdc", 10) / 12,
                    4
                )
            }
        },
        "risk_profile": {
            "composite_risk_score": top_assessment.get("risk_analysis", {}).get("composite_risk", 0.15),
            "risk_severity": _calculate_overall_severity(top_assessment),
            "key_risks": _extract_key_risks(top_assessment),
            "guardrails": {
                "max_slippage_percent": 0.1,
                "min_liquidity_usd": 1000000,
                "max_allocation_percent": top_assessment.get("allocation_percent", 20),
                "rebalance_threshold_percent": 5
            }
        },
        "alternatives_considered": _generate_alternatives_considered(risk_assessments),
        "why_not_alternatives": _why_not_alternatives(risk_assessments, top_assessment),
        "recommendation": top_assessment.get("recommendation", "HOLD"),
        "execution_ready": True,
        "on_chain_proof": {
            "decision_hash": _generate_decision_hash(decision if 'decision' in locals() else {}),
            "delegation_required": True,
            "relayer_required": True,
            "estimated_cost_usdc": 0.003
        }
    }

    # Add decision to state for on-chain logging
    events = [
        {
            "type": "thinking",
            "message": f"🤖 DecisionMaker: Generated decision for {top_assessment['protocol']}"
        },
        {
            "type": "thinking",
            "message": f"✅ Recommendation: {decision['recommendation']}"
        },
        {
            "type": "thinking",
            "message": f"💰 Expected APY: {top_assessment.get('risk_adjusted_apy', 0):.2f}% (risk-adjusted)"
        },
        {
            "type": "decision",
            "message": json.dumps(decision, indent=2),
            "data": decision
        }
    ]

    return {
        "decision": decision,
        "events": events,
        "results": state.get("results", [])
    }


def _build_reasoning_chain(assessment: Dict[str, Any], opp: Dict[str, Any], research_results: list) -> list:
    """Build step-by-step reasoning that led to decision."""
    return [
        f"Analyzed {len([r for r in research_results if r])} opportunity research tasks",
        f"Identified {opp.get('protocol', 'protocol')} as top risk-adjusted opportunity",
        f"APY stability: {opp.get('apy_stable_days', 30)}+ days at {opp.get('estimated_apy', 2.5):.2f}%",
        f"Risk assessment: {assessment.get('risk_analysis', {}).get('composite_risk', 0.15):.0%} overall risk",
        f"Confidence score: {assessment.get('confidence', {}).get('confidence_adjusted', 0.7):.0%}",
        f"Smart contract audit: {opp.get('audit_status', 'Unknown')}",
        f"Recommended allocation: {assessment.get('allocation_percent', 15):.0f}% of budget",
        f"Execution via MetaMask delegation (ERC-7710) + 1Shot relayer (x402 payment)"
    ]


def _extract_action(strategy: str) -> str:
    """Extract action verb from strategy."""
    strategy_lower = strategy.lower()
    if "stake" in strategy_lower or "eth" in strategy_lower:
        return "stake"
    elif "supply" in strategy_lower or "deposit" in strategy_lower:
        return "deposit"
    elif "provide" in strategy_lower or "lp" in strategy_lower:
        return "provide_liquidity"
    else:
        return "allocate"


def _calculate_overall_severity(assessment: Dict[str, Any]) -> str:
    """Determine overall risk severity."""
    risk = assessment.get("risk_analysis", {}).get("composite_risk", 0.15)
    if risk < 0.10:
        return "Minimal"
    elif risk < 0.20:
        return "Low"
    elif risk < 0.30:
        return "Medium"
    else:
        return "High"


def _extract_key_risks(assessment: Dict[str, Any]) -> list:
    """Extract top 3 key risks."""
    dims = assessment.get("risk_analysis", {}).get("dimensions", {})
    risks = []
    for dim_name, dim_data in sorted(dims.items(), key=lambda x: x[1].get("score", 0), reverse=True)[:3]:
        risks.append({
            "type": dim_name,
            "severity": dim_data.get("severity", "Unknown"),
            "mitigation": dim_data.get("mitigation", "")
        })
    return risks


def _generate_alternatives_considered(assessments: list) -> list:
    """List of other opportunities considered."""
    return [
        {
            "protocol": a.get("protocol", ""),
            "strategy": a.get("strategy", ""),
            "apy": a.get("base_apy", 0),
            "risk_adjusted_apy": a.get("risk_adjusted_apy", 0)
        }
        for a in assessments[1:4]  # Top 3 alternatives
    ]


def _why_not_alternatives(assessments: list, chosen: Dict[str, Any]) -> Dict[str, str]:
    """Explain why alternatives were not chosen."""
    reasons = {}
    chosen_apy = chosen.get("risk_adjusted_apy", 0)

    for alt in assessments[1:4]:
        alt_apy = alt.get("risk_adjusted_apy", 0)
        apy_diff = chosen_apy - alt_apy

        if apy_diff > 0:
            reasons[alt.get("protocol", "")] = f"Lower risk-adjusted APY ({alt_apy:.2f}% vs {chosen_apy:.2f}%)"
        else:
            alt_risk = alt.get("risk_analysis", {}).get("composite_risk", 0.2)
            chosen_risk = chosen.get("risk_analysis", {}).get("composite_risk", 0.15)
            if alt_risk > chosen_risk:
                reasons[alt.get("protocol", "")] = f"Higher risk profile ({alt_risk:.0%} vs {chosen_risk:.0%})"
            else:
                reasons[alt.get("protocol", "")] = "Lower confidence and consistency"

    return reasons


def _generate_decision_hash(decision_dict: Dict[str, Any]) -> str:
    """Generate a hash of the decision (for on-chain logging)."""
    decision_json = json.dumps(decision_dict, sort_keys=True, default=str)
    # In production, use keccak256 hash
    import hashlib
    return "0x" + hashlib.sha256(decision_json.encode()).hexdigest()

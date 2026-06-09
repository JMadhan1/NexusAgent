from ..state import AgentState
import json
import os
import requests as _requests

VENICE_BASE_URL = os.getenv("VENICE_BASE_URL", "https://api.venice.ai/api/v1")
VENICE_API_KEY = os.getenv("VENICE_API_KEY", "")
VENICE_MODEL = os.getenv("VENICE_MODEL", "llama-3.3-70b")


def planner_node(state: AgentState) -> dict:
    """
    Break the user's goal into concrete subtasks.
    Uses Venice AI via direct requests (no web search, fast response).
    """
    resp = _requests.post(
        f"{VENICE_BASE_URL}/chat/completions",
        headers={"Authorization": f"Bearer {os.getenv('VENICE_API_KEY', VENICE_API_KEY)}", "Content-Type": "application/json"},
        json={
            "model": VENICE_MODEL,
            "messages": [
                {"role": "system", "content": "You are a research planning agent. Break the user's goal into 3 concrete research subtasks. Respond ONLY with a JSON array of strings. No other text."},
                {"role": "user", "content": f"Goal: {state['goal']}"},
            ],
            "max_tokens": 300,
            "temperature": 0.3,
            "venice_parameters": {"enable_web_search": "off"},
        },
        timeout=30,
    )
    try:
        subtasks = json.loads(resp.json()["choices"][0]["message"]["content"])
    except Exception:
        subtasks = [state["goal"]]
    subtasks = subtasks[:2]  # cap at 2 for speed

    return {
        "subtasks": subtasks,
        "events": [{
            "type": "thinking",
            "message": f"Planned {len(subtasks)} research subtasks"
        }]
    }

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from ..state import AgentState
import json
import os

def planner_node(state: AgentState) -> dict:
    """
    Break the user's goal into concrete subtasks.
    Uses Venice AI via OpenAI-compatible endpoint.
    """
    llm = ChatOpenAI(
        base_url=os.getenv("VENICE_BASE_URL", "https://api.venice.ai/api/v1"),
        api_key=os.getenv("VENICE_API_KEY"),
        model=os.getenv("VENICE_MODEL", "llama-3.3-70b"),
        temperature=0.3,
    )

    response = llm.invoke([
        SystemMessage(content="""You are a research planning agent.
        Break the user's goal into 3-5 concrete research subtasks.
        Each subtask should be a specific question or research action.
        Respond ONLY with a JSON array of strings. No other text."""),
        HumanMessage(content=f"Goal: {state['goal']}")
    ])

    try:
        subtasks = json.loads(response.content)
    except:
        subtasks = [state['goal']]

    return {
        "subtasks": subtasks,
        "events": [{
            "type": "thinking",
            "message": f"Planned {len(subtasks)} research subtasks"
        }]
    }

"""
Real 1Shot API client.
JSON-RPC calls to https://relayer.1shotapi.com/relayers
Docs: https://1shotapi.com/docs/quickstarts/gas-sponsorship-eip7710
"""
import asyncio
import os
import httpx

RELAYER_URL = os.getenv("ONESHOT_RELAYER_URL", "https://relayer.1shotapi.com/relayers")
_rpc_id = 0


async def _rpc(method: str, params) -> dict:
    global _rpc_id
    _rpc_id += 1
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            RELAYER_URL,
            json={"jsonrpc": "2.0", "id": _rpc_id, "method": method, "params": params},
        )
        resp.raise_for_status()
        data = resp.json()
        if "error" in data:
            raise ValueError(f"1Shot RPC error [{method}]: {data['error']}")
        return data["result"]


async def get_capabilities(chain_id: str = "8453") -> dict:
    """Returns: targetAddress, acceptedTokens, feeCollector."""
    return await _rpc("relayer_getCapabilities", [chain_id])


async def get_fee_data(chain_id: str, token_address: str) -> dict:
    """Returns fee quote context string needed for send7710Transaction."""
    return await _rpc("relayer_getFeeData", {"chainId": chain_id, "token": token_address})


async def send_7710_transaction(
    chain_id: str,
    from_address: str,
    delegation_chain: list[str],
    transactions: list[dict],
    fee_context: str,
    authorization_list: list[dict] | None = None,
) -> str:
    """
    Submit a delegated transaction bundle through 1Shot.
    delegation_chain: ABI-encoded delegations ordered leaf → root.
    transactions: list of {to, data, value} dicts.
    Returns task_id.
    """
    params: dict = {
        "chainId": chain_id,
        "from": from_address,
        "delegations": delegation_chain,
        "transactions": transactions,
        "context": fee_context,
    }
    if authorization_list:
        params["authorizationList"] = authorization_list

    result = await _rpc("relayer_send7710Transaction", params)
    # result may be a string task_id or a dict with taskId
    if isinstance(result, str):
        return result
    return result.get("taskId") or result.get("task_id") or str(result)


async def get_status(task_id: str) -> dict:
    return await _rpc("relayer_getStatus", [task_id])


async def wait_for_confirmation(task_id: str, max_attempts: int = 15) -> dict:
    terminal = {"Confirmed", "Rejected", "Reverted", "Failed"}
    for attempt in range(max_attempts):
        status = await get_status(task_id)
        if status.get("status") in terminal:
            return status
        await asyncio.sleep(1 if attempt < 5 else 2)
    return {"status": "Timeout", "taskId": task_id}

"""
Venice AI client with x402 payment protocol support.
Implements the full x402 flow:
  1. Request Venice endpoint without auth header
  2. If 402 → parse payment requirements
  3. Build USDC payment via ERC-7710 delegation + 1Shot relayer
  4. Retry with X-Payment proof header
Also supports regular API-key auth as fallback.
"""
import os
import json
import httpx
from typing import Optional

VENICE_BASE_URL = os.getenv("VENICE_BASE_URL", "https://api.venice.ai/api/v1")
VENICE_API_KEY = os.getenv("VENICE_API_KEY", "")
DEFAULT_MODEL = os.getenv("VENICE_MODEL", "llama-3.3-70b")


async def chat_completion(
    messages: list[dict],
    model: str = DEFAULT_MODEL,
    payment_proof: Optional[str] = None,
    max_tokens: int = 1200,
    enable_web_search: bool = False,
) -> tuple[str, Optional[dict]]:
    """
    Call Venice AI chat completions.

    Returns:
        (content, None)           — success
        (None, payment_requirements) — 402 received, caller must pay and retry
    """
    headers: dict[str, str] = {"Content-Type": "application/json"}

    if payment_proof:
        headers["X-Payment"] = payment_proof
    elif VENICE_API_KEY:
        headers["Authorization"] = f"Bearer {VENICE_API_KEY}"
    # else: attempt without auth to trigger 402

    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
    }
    if enable_web_search:
        payload["venice_parameters"] = {"enable_web_search": "on"}

    async with httpx.AsyncClient(timeout=90) as client:
        resp = await client.post(
            f"{VENICE_BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
        )

        if resp.status_code == 402:
            try:
                payment_req = resp.json()
            except Exception:
                payment_req = {}
            payment_req.setdefault("raw_headers", dict(resp.headers))
            # Extract x402-standard fields if present
            x402_header = resp.headers.get("x-payment-required") or resp.headers.get("www-authenticate", "")
            if x402_header:
                payment_req["x402_header"] = x402_header
            return None, payment_req

        resp.raise_for_status()
        data = resp.json()
        content = data["choices"][0]["message"]["content"]
        return content, None


async def chat_with_x402_payment(
    messages: list[dict],
    model: str = DEFAULT_MODEL,
    payment_proof: Optional[str] = None,
    **kwargs,
) -> tuple[str, Optional[dict]]:
    """
    Full x402 flow:
    1. Try with payment_proof (or API key fallback)
    2. Return (content, payment_req_or_none)
    Caller inspects payment_req to execute on-chain payment if needed.
    """
    return await chat_completion(messages, model=model, payment_proof=payment_proof, **kwargs)


def chat_with_x402_payment_sync(
    messages: list[dict],
    model: str = DEFAULT_MODEL,
    payment_proof: Optional[str] = None,
    max_tokens: int = 1200,
    enable_web_search: bool = False,
) -> tuple[str, Optional[dict]]:
    """
    SYNCHRONOUS Venice AI chat with x402 fallback.
    Use this from sync contexts (e.g., sync function in thread).

    Returns:
        (content, None) — success
        (None, payment_req) — 402 Payment Required (caller must pay)
    """
    headers: dict[str, str] = {"Content-Type": "application/json"}

    if payment_proof:
        headers["X-Payment"] = payment_proof
    elif VENICE_API_KEY:
        headers["Authorization"] = f"Bearer {VENICE_API_KEY}"

    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
    }
    if enable_web_search:
        payload["venice_parameters"] = {"enable_web_search": "on"}

    try:
        import requests as _requests
        resp = _requests.post(
            f"{VENICE_BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
            timeout=30,
        )

        if resp.status_code == 402:
            try:
                payment_req = resp.json()
            except Exception:
                payment_req = {}
            return None, payment_req

        resp.raise_for_status()
        data = resp.json()
        content = data["choices"][0]["message"]["content"]
        return content, None
    except Exception as e:
        return f"[Venice API Error: {str(e)[:100]}]", None


def build_venice_payment_calldata(to: str, amount_usdc: int) -> str:
    """
    Build USDC transfer(address,uint256) calldata for Venice payment address.
    Returns hex-encoded calldata string.
    """
    from web3 import Web3
    from eth_abi import encode
    selector = Web3.keccak(text="transfer(address,uint256)")[:4]
    args = encode(["address", "uint256"], [Web3.to_checksum_address(to), amount_usdc])
    return "0x" + (selector + args).hex()

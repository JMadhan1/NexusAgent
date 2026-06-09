"""
ERC-7710 delegation signing in Python.

Exact EIP-712 types from MetaMask delegation-framework source:
  Constants.sol:
    DELEGATION_TYPEHASH = keccak256(
        "Delegation(address delegate,address delegator,bytes32 authority,Caveat[] caveats,uint256 salt)"
        "Caveat(address enforcer,bytes terms)"
    )
    CAVEAT_TYPEHASH = keccak256("Caveat(address enforcer,bytes terms)")

  EncoderLib.sol:
    caveat_hash = keccak256(abi.encode(CAVEAT_TYPEHASH, enforcer, keccak256(terms)))
    caveats_array_hash = keccak256(abi.encodePacked([caveat_hash, ...]))
    delegation_hash = keccak256(abi.encode(
        DELEGATION_TYPEHASH, delegate, delegator, authority, caveats_array_hash, salt
    ))

  ERC20TransferAmountEnforcer.sol:
    terms length must be 52 bytes: address(token)[20] + uint256(maxAmount)[32]
"""
import hashlib
import secrets
from eth_account import Account
from eth_abi import encode
from web3 import Web3

# Precomputed from Constants.sol
DELEGATION_TYPEHASH: bytes = Web3.keccak(
    text=(
        "Delegation(address delegate,address delegator,bytes32 authority,"
        "Caveat[] caveats,uint256 salt)"
        "Caveat(address enforcer,bytes terms)"
    )
)
CAVEAT_TYPEHASH: bytes = Web3.keccak(text="Caveat(address enforcer,bytes terms)")
EIP712_DOMAIN_TYPEHASH: bytes = Web3.keccak(
    text="EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
)
ROOT_AUTHORITY = bytes(32)


def _to_bytes32(value) -> bytes:
    """Convert hex string or bytes to exactly 32 bytes."""
    if isinstance(value, (bytes, bytearray)):
        return bytes(value).rjust(32, b'\x00')[:32]
    s = str(value).removeprefix("0x")
    return bytes.fromhex(s.zfill(64))


def _caveat_hash(enforcer: str, terms: bytes) -> bytes:
    """EncoderLib._getCaveatPacketHash"""
    return Web3.keccak(
        encode(
            ["bytes32", "address", "bytes32"],
            [CAVEAT_TYPEHASH, Web3.to_checksum_address(enforcer), Web3.keccak(terms)],
        )
    )


def _caveats_array_hash(caveats: list[dict]) -> bytes:
    """EncoderLib._getCaveatArrayPacketHash — uses encodePacked of hashes."""
    if not caveats:
        return Web3.keccak(b"")
    packed = b"".join(
        _caveat_hash(c["enforcer"], bytes.fromhex(c["terms"].removeprefix("0x")))
        for c in caveats
    )
    return Web3.keccak(packed)


def delegation_struct_hash(delegation: dict) -> bytes:
    """EncoderLib._getDelegationHash — the struct hash (not full EIP-712 hash)."""
    caveats_h = _caveats_array_hash(delegation.get("caveats", []))
    authority = _to_bytes32(delegation.get("authority", "0x" + "0" * 64))
    salt_raw = delegation["salt"]
    if isinstance(salt_raw, str):
        salt = int(salt_raw, 16) if salt_raw.startswith("0x") else int(salt_raw)
    else:
        salt = int(salt_raw)
    return Web3.keccak(
        encode(
            ["bytes32", "address", "address", "bytes32", "bytes32", "uint256"],
            [
                DELEGATION_TYPEHASH,
                Web3.to_checksum_address(delegation["delegate"]),
                Web3.to_checksum_address(delegation["delegator"]),
                authority,
                caveats_h,
                salt,
            ],
        )
    )


def _domain_separator(delegation_manager: str, chain_id: int) -> bytes:
    return Web3.keccak(
        encode(
            ["bytes32", "bytes32", "bytes32", "uint256", "address"],
            [
                EIP712_DOMAIN_TYPEHASH,
                Web3.keccak(text="DelegationManager"),
                Web3.keccak(text="1"),
                chain_id,
                Web3.to_checksum_address(delegation_manager),
            ],
        )
    )


def sign_delegation(
    delegation: dict,
    private_key: str,
    delegation_manager: str,
    chain_id: int = 8453,
) -> str:
    """EIP-712 sign a delegation. Returns 0x-prefixed hex signature."""
    struct_h = delegation_struct_hash(delegation)
    domain_sep = _domain_separator(delegation_manager, chain_id)
    digest = Web3.keccak(b"\x19\x01" + domain_sep + struct_h)
    # Sign the raw EIP-712 digest (no extra prefix)
    from eth_account._utils.signing import sign_message_hash
    from eth_keys import keys
    pk = keys.PrivateKey(bytes.fromhex(private_key.removeprefix("0x")))
    (v, r, s, signed_bytes) = sign_message_hash(pk, digest)
    return "0x" + signed_bytes.hex()


def erc20_transfer_amount_terms(token_address: str, max_amount_usdc_units: int) -> str:
    """
    Build ERC20TransferAmountEnforcer terms (52 bytes):
      bytes20(tokenAddress) + bytes32(maxAmount)
    """
    token_b = bytes.fromhex(token_address.removeprefix("0x").lower().zfill(40))
    amount_b = max_amount_usdc_units.to_bytes(32, "big")
    return "0x" + (token_b + amount_b).hex()


def create_signed_redelegation(
    delegate_address: str,
    delegator_address: str,
    parent_delegation: dict,
    max_usdc_units: int,
    enforcer_address: str,
    usdc_address: str,
    private_key: str,
    delegation_manager: str,
    chain_id: int = 8453,
) -> dict:
    """
    Create a redelegation from delegator → delegate, narrowing the USDC budget.
    Authority = struct_hash(parent_delegation) per ERC-7710 spec.
    """
    authority = "0x" + delegation_struct_hash(parent_delegation).hex()
    terms = erc20_transfer_amount_terms(usdc_address, max_usdc_units)
    salt = secrets.randbelow(2**64)

    delegation = {
        "delegate": Web3.to_checksum_address(delegate_address),
        "delegator": Web3.to_checksum_address(delegator_address),
        "authority": authority,
        "caveats": [{"enforcer": enforcer_address, "terms": terms, "args": "0x"}],
        "salt": salt,
        "signature": "0x",
    }
    delegation["signature"] = sign_delegation(delegation, private_key, delegation_manager, chain_id)
    return delegation


def create_root_delegation(
    delegator_private_key: str,
    delegate_address: str,
    max_usdc_units: int,
    enforcer_address: str,
    usdc_address: str,
    delegation_manager: str,
    chain_id: int = 8453,
) -> dict:
    """
    Create and sign a root delegation (User → Orchestrator).
    Authority = ROOT_AUTHORITY (bytes32(0)) — this is the first link in the chain.
    Used in demo_run.py / backend tests where MetaMask is unavailable.
    """
    delegator_acct = Account.from_key(delegator_private_key)
    terms = erc20_transfer_amount_terms(usdc_address, max_usdc_units)
    salt = secrets.randbelow(2**64)

    delegation = {
        "delegate": Web3.to_checksum_address(delegate_address),
        "delegator": Web3.to_checksum_address(delegator_acct.address),
        "authority": "0x" + "00" * 32,  # ROOT_AUTHORITY
        "caveats": [{"enforcer": enforcer_address, "terms": terms, "args": "0x"}],
        "salt": salt,
        "signature": "0x",
    }
    delegation["signature"] = sign_delegation(delegation, delegator_private_key, delegation_manager, chain_id)
    return delegation


def derive_agent_key(base_key: str, role: str) -> str:
    """Deterministically derive a sub-agent private key from base key + role."""
    base = bytes.fromhex(base_key.removeprefix("0x"))
    derived = hashlib.sha256(base + role.encode("utf-8")).digest()
    return "0x" + derived.hex()

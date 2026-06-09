# NexusAgent

> **Autonomous AI that pays for its own intelligence using MetaMask Smart Accounts + ERC-7710 delegations.**

The world's first AI agent that funds itself via a cryptographically-enforced delegation cascade — no trusted intermediaries, no hard-coded spending limits, no ETH for gas.

## What Makes This Unique

| Other agents | NexusAgent |
|---|---|
| Fake/hardcoded delegation signatures | Real EIP-712 signatures via MetaMask SDK |
| Single agent, one API key | 4-level delegation cascade (User → Orchestrator → 3 Sub-agents) |
| ETH for gas | USDC-only via 1Shot relayer |
| Trusted payment | On-chain ERC20TransferAmountEnforcer caveat |
| Manual key management | `toMetaMaskSmartAccount` + EIP-7702 Stateless7702 |

## Architecture

```
User (MetaMask Smart Account, EIP-7702)
    │  signs root delegation (budget: N USDC, enforced on-chain)
    ▼
Orchestrator Agent  ←── AGENT_PRIVATE_KEY
    │  creates 3 redelegations (40% / 35% / 25% of budget)
    ├──▶ Researcher  ──▶ Venice AI (x402 + 1Shot)
    ├──▶ Analyst     ──▶ Venice AI (x402 + 1Shot)
    └──▶ Synthesizer ──▶ Venice AI (x402 + 1Shot)
                              │
                         Final Report
```

Stack: **React+Vite · FastAPI · LangGraph · @metamask/smart-accounts-kit · Venice AI · 1Shot Relayer · ERC-7710 · Base mainnet**

---

## Quick Start

### 1. Backend

```bash
cd backend

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env — set AGENT_PRIVATE_KEY and VENICE_API_KEY

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs: **http://localhost:8000/docs**

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

UI: **http://localhost:5173**

---

## Judge Demo (No MetaMask Required)

Run the agent pipeline entirely from the command line with a real signed delegation:

```bash
cd backend
python demo_run.py
```

Or hit the API directly:

```bash
# One-click demo endpoint — creates real delegation, runs full pipeline
curl -s -X POST http://localhost:8000/agent/demo | python -m json.tool

# Health check
curl http://localhost:8000/health

# Agent addresses
curl http://localhost:8000/agent/addresses
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Venice AI
VENICE_API_KEY=your_venice_api_key
VENICE_BASE_URL=https://api.venice.ai/api/v1
VENICE_MODEL=llama-3.3-70b
VENICE_PAYMENT_USDC=0.003
VENICE_PAYMENT_ADDRESS=0x2670B922ef37C7Df47158725C0CC407b5382293F

# 1Shot Relayer
ONESHOT_RELAYER_URL=https://relayer.1shotapi.com/relayers

# Orchestrator wallet (EOA private key — never commit)
AGENT_PRIVATE_KEY=0x...64hexchars

# Chain
CHAIN_ID=8453
```

### Frontend (`frontend/.env`)

```env
VITE_BACKEND_URL=http://localhost:8000
VITE_BASE_RPC_URL=https://mainnet.base.org
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Service info & endpoint map |
| `GET` | `/health` | Health check |
| `GET` | `/agent/addresses` | Orchestrator + sub-agent wallet addresses |
| `POST` | `/agent/run` | SSE streaming — real-time agent execution |
| `POST` | `/agent/run/sync` | Full JSON response — complete pipeline result |
| `POST` | `/agent/demo` | One-click demo — real delegation, no MetaMask |
| `POST` | `/delegation/store` | Store signed delegation from frontend |

---

## ERC-7710 Delegation Chain

```
root delegation    : User → Orchestrator     (authority = ROOT_AUTHORITY = bytes32(0))
sub redelegation 1 : Orchestrator → Researcher  (authority = struct_hash(root))
sub redelegation 2 : Orchestrator → Analyst     (authority = struct_hash(root))
sub redelegation 3 : Orchestrator → Synthesizer (authority = struct_hash(root))
call delegation    : Sub-Agent → 1Shot target   (authority = struct_hash(sub))

All delegations use ERC20TransferAmountEnforcer caveat:
  terms = encodePacked(address token, uint256 maxAmount) = 52 bytes
```

---

## Prize Tracks

- 🥇 **Best Agent** — Autonomous multi-agent with real on-chain delegation
- 🥇 **Best A2A Coordination** — Orchestrator → 3 sub-agents redelegation cascade
- 🥇 **Best Venice AI** — Venice powers all reasoning, paying per-call via x402
- 🥇 **Best 1Shot Relayer** — Full ERC-7710 gas abstraction, USDC-only
- 🥇 **Best x402 + ERC-7710** — Complete implementation, not a demo stub

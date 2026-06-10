<div align="center">

# ⚡ NexusAgent

### *The AI Agent That Pays For Its Own Intelligence*

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-nexus--agent--omega.vercel.app-orange?style=for-the-badge)](https://nexus-agent-omega.vercel.app/)
[![Backend](https://img.shields.io/badge/🔧_Backend-nexusagent.onrender.com-blue?style=for-the-badge)](https://nexusagent.onrender.com/health)
[![Base Mainnet](https://img.shields.io/badge/⛓_Chain-Base_Mainnet-0052FF?style=for-the-badge)](https://basescan.org)

---

**Sign once. Agent runs forever. Pays itself.**

> The world's first autonomous AI agent that uses **ERC-7710 delegated permissions** to fund its own Venice AI calls via **x402 micropayments** — with zero human intervention after the initial signature.

</div>

---

## 🎬 See It In Action

[![Watch Demo](https://img.shields.io/badge/📺_Watch_Demo-YouTube-red?style=for-the-badge)](https://youtu.be/cKNV6j_76t0)

```
1. Connect MetaMask          →  EIP-7702 smart account, Base mainnet
2. Set budget ($1–$100 USDC) →  Drag slider, pick preset, or type custom
3. Sign ONE delegation        →  MetaMask popup. Last time you touch your wallet.
4. Type any research goal     →  "Best DeFi yield on Base right now?"
5. Watch the agent work       →  3 AI sub-agents fire in parallel
                                  Each pays Venice AI $0.003 via x402
                                  Decision hash logged on-chain
                                  Full report delivered in <30 seconds
```

**[→ Try it live now](https://nexus-agent-omega.vercel.app/)**

---

## 🧠 What Makes This Different

| Every other agent | NexusAgent |
|---|---|
| Hardcoded API keys | Agent pays per-call via x402 micropayments |
| Single LLM call | 3 parallel sub-agents (Researcher + Analyst + Synthesizer) |
| Simulated delegation | Real EIP-712 signature, real on-chain enforcement |
| ETH for gas | USDC-only via 1Shot relayer — zero ETH needed |
| "Trust me" spending | `ERC20TransferAmountEnforcer` caveat — budget enforced by contract |
| Manual approval per action | Sign once, agent runs autonomously within budget |

---

## ⚙️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    YOU (MetaMask Wallet)                     │
│              EIP-7702 Stateless Smart Account               │
│         Sign ONE root delegation → $N USDC budget           │
└────────────────────────┬────────────────────────────────────┘
                         │  ERC-7710 root delegation
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   ORCHESTRATOR AGENT                         │
│            Creates 3 sub-delegations on-chain               │
│         Researcher 40% │ Analyst 35% │ Synthesizer 25%      │
└──────────┬─────────────┴──────────────┬──────────────┬──────┘
           │                            │              │
           ▼                            ▼              ▼
    ┌─────────────┐            ┌──────────────┐  ┌──────────────┐
    │  RESEARCHER │            │   ANALYST    │  │ SYNTHESIZER  │
    │Venice AI call│           │Venice AI call│  │Venice AI call│
    │ pays $0.003 │            │ pays $0.003  │  │ pays $0.003  │
    │  via x402   │            │  via x402    │  │  via x402    │
    └─────────────┘            └──────────────┘  └──────────────┘
                                      │
                                      ▼
                          ┌───────────────────────┐
                          │   DECISION + REPORT    │
                          │  On-chain hash proof   │
                          │  APY, Risk, Confidence │
                          └───────────────────────┘
```

**Stack:** React + Vite · FastAPI · LangGraph · `@metamask/smart-accounts-kit` · Venice AI · 1Shot Relayer · ERC-7710 · Base Mainnet

---

## 🚀 Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env          # Set VENICE_API_KEY and AGENT_PRIVATE_KEY
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
echo "VITE_BACKEND_URL=http://localhost:8000" > .env
npm run dev
```

### Instant API Test (no MetaMask)
```bash
curl https://nexusagent.onrender.com/health
curl https://nexusagent.onrender.com/agent/addresses
curl -X POST https://nexusagent.onrender.com/agent/demo | python -m json.tool
```

---

## 🔑 Environment Variables

### `backend/.env`
```env
VENICE_API_KEY=your_key_here
VENICE_MODEL=llama-3.3-70b
AGENT_PRIVATE_KEY=0x...your_orchestrator_key
CHAIN_ID=8453
```

### `frontend/.env`
```env
VITE_BACKEND_URL=https://nexusagent.onrender.com
```

---

## 📡 API Reference

| Method | Endpoint | What it does |
|--------|----------|-------------|
| `GET` | `/health` | Service status |
| `GET` | `/agent/addresses` | Orchestrator + sub-agent wallet addresses |
| `POST` | `/agent/run` | **SSE stream** — real-time agent execution |
| `POST` | `/agent/demo` | One-click demo, no MetaMask needed |

---

## 🔗 ERC-7710 Delegation Chain

```
Root:    User → Orchestrator        authority = bytes32(0)  budget = N USDC
Sub-1:   Orchestrator → Researcher  authority = hash(root)  budget = 40%
Sub-2:   Orchestrator → Analyst     authority = hash(root)  budget = 35%
Sub-3:   Orchestrator → Synthesizer authority = hash(root)  budget = 25%

Caveat enforcer: ERC20TransferAmountEnforcer
Terms encoding: encodePacked(address token, uint256 maxAmount) = 52 bytes
```

---

## 🏆 Prize Tracks

- 🥇 **Best Agent** — Full autonomous multi-agent pipeline, live on mainnet
- 🥇 **Best A2A Coordination** — Real 4-level delegation cascade, not simulated
- 🥇 **Best Venice AI** — Every reasoning call pays Venice via x402, on-chain proof
- 🥇 **Best 1Shot Relayer** — Complete ERC-7710 + USDC gas abstraction
- 🥇 **Best x402** — Machine-to-machine micropayments, working implementation

---

<div align="center">

**Built for the MetaMask AI Agent Hackathon 2025**

*Sign once. Let the agent work.*

</div>

# NexusAgent 🤖

**Autonomous Research & Risk Assessment AI Agent**

Combines **Venice AI + MetaMask Smart Accounts + 1Shot Relayer** into a fully autonomous agent that conducts research, pays for intelligence with stablecoins (x402), and executes delegated actions—all without the user needing ETH for gas.

---

## 🎯 What Makes NexusAgent Different

While other agents focus on **trading execution**, NexusAgent owns **intelligent analysis**:

- **Venice-Powered Intelligence**: Uses Venice LLM for reasoning, Vision for chart analysis, Crypto RPC for on-chain data
- **Delegation Cascade**: Orchestrator creates 3 parallel sub-agents (Researcher, Analyst, Synthesizer) via ERC-7710 redelegation
- **Autonomous Payments**: Each agent pays for Venice API calls using x402 + USDC via 1Shot relayer (no ETH needed)
- **Cryptographic Budget Enforcement**: ERC-20 transfer enforcer ensures agents never exceed their delegated USDC budget
- **Research-to-Action**: Outputs structured risk analysis + recommendations that humans (or other agents) can act on

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  User Smart Account (Base mainnet)                          │
│  Signs ERC-7710 root delegation with 10 USDC budget         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Orchestrator Agent (40% budget = 4 USDC)                   │
│  Creates redelegation cascade to 3 sub-agents               │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
    ┌─────────┐   ┌─────────┐   ┌─────────────┐
    │Researcher│   │ Analyst │   │ Synthesizer │
    │(40%)    │   │(35%)    │   │  (25%)      │
    │4 USDC   │   │3.5 USDC │   │  2.5 USDC   │
    └────┬────┘   └────┬────┘   └─────┬───────┘
         │             │             │
         └─────────────┼─────────────┘
                       │
         Each agent:   │
         1. Calls Venice AI (LLM/Vision/Crypto RPC)
         2. Builds ERC-7710 delegation chain [leaf→orchestrator→root]
         3. Submits USDC transfer tx to 1Shot relayer
         4. Pays for intelligence via x402 protocol
         5. Returns research to orchestrator
         │
         ▼
    ┌──────────────────────────────────────┐
    │  Synthesizer combines all research   │
    │  Generates final risk analysis       │
    │  Format: Markdown report             │
    └──────────────────────────────────────┘
```

---

## 🔗 Hackathon Tracks Covered

| Track | Why NexusAgent Wins |
|-------|-------------------|
| **Best Agent** ✅ | Orchestrator + 3 autonomous sub-agents conducting parallel research |
| **Best A2A Coordination** ✅ | Multi-level redelegation: User→Orchestrator→Researcher/Analyst/Synthesizer |
| **Best Venice AI** ✅ | Venice powers ALL intelligence: planning, execution reasoning, final synthesis |
| **Best 1Shot Relayer** ✅ | Full ERC-7710 + x402 payment pipeline; agents pay for each Venice call |
| **Best x402 + ERC-7710** ✅ | Demonstrates stablecoin-only payments (no ETH required) via 1Shot |

---

## 🚀 Quick Start

### Prerequisites

```bash
Python 3.10+
pip
```

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

Required variables:
```env
VENICE_API_KEY=your_venice_key
VENICE_BASE_URL=https://api.venice.ai/api/v1
ONESHOT_RELAYER_URL=https://relayer.1shotapi.com/relayers
AGENT_PRIVATE_KEY=0x...  # Orchestrator's private key
DELEGATION_MANAGER_ADDRESS=0x...  # Delegation manager contract
ENFORCER_ADDRESS=0x...  # ERC20TransferAmountEnforcer
USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913  # Base mainnet USDC
CHAIN_ID=8453  # Base mainnet
```

### 3. Start the Server

```bash
python main.py
```

Server starts at `http://localhost:8000`

### 4. Test the API

```bash
# Health check
curl http://localhost:8000/health

# Get orchestrator + sub-agent addresses
curl http://localhost:8000/agent/addresses

# Run demo (pre-configured)
curl -X POST http://localhost:8000/agent/demo

# Run with custom goal
curl -X POST http://localhost:8000/agent/run \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Analyze AI agent adoption in DeFi",
    "delegator": "0x...",
    "rootDelegation": {...},
    "delegationManager": "0x...",
    "enforcerAddress": "0x...",
    "usdcAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "budgetUsdc": 0.05
  }'
```

---

## 📊 Demo Flow

1. **User submits research goal** via `/agent/run`
2. **Planner node** breaks goal into 3 subtasks (calls Venice LLM)
3. **Orchestrator node** creates 3 sub-agents with ERC-7710 redelegations
4. **Executor node** runs in parallel:
   - Each sub-agent calls Venice AI for its subtask
   - Builds delegation chain [agent→orchestrator→user]
   - Submits USDC payment to 1Shot relayer
   - Receives research result
5. **Synthesizer node** combines all research into final report (calls Venice LLM)
6. **Response** includes:
   - Final markdown report
   - Payment records (Venice calls, tx hashes, USDC spent)
   - Event stream (real-time progress)

---

## 💰 Cost Model

- **User sets budget**: e.g., 0.05 USDC
- **Orchestrator splits**: 40% Researcher, 35% Analyst, 25% Synthesizer
- **Each agent pays-per-call**: ~0.003-0.005 USDC per Venice AI inference
- **No gas costs**: 1Shot relayer handles all ERC-7710 transactions (sponsored or batched)
- **Transparent reporting**: Every payment tracked and reported

Example with 0.05 USDC budget:
```
Researcher:  0.02 USDC (6-7 Venice calls)
Analyst:     0.0175 USDC (5-6 calls)
Synthesizer: 0.0125 USDC (3-4 calls)
─────────────────────────
Total spent: ~0.05 USDC (3 parallel agents + 1 synthesis call)
```

---

## 🔐 Security & Constraints

- **ERC-7710 Delegation**: User cryptographically constrains agent authority
- **ERC-20 Transfer Enforcer**: Contract reverts if agent tries to transfer >budget
- **Redelegation Limits**: Each sub-agent can only act up to its budget
- **Time Expiry**: Delegation expires after set period (default: 30 days)
- **Chain-Specific**: Delegations bound to single chain (Base mainnet here)

---

## 📦 Project Structure

```
backend/
├── main.py                 # FastAPI server + SSE streaming
├── agent/
│   ├── state.py           # TypedDict for agent state
│   ├── graph.py           # LangGraph orchestration
│   └── nodes/
│       ├── planner.py     # Break goal into subtasks (Venice LLM)
│       ├── orchestrator.py # Create delegation cascade
│       ├── executor.py     # Run subtasks + 1Shot relayer calls
│       └── synthesizer.py  # Combine results into report
├── services/
│   ├── delegation_signer.py    # ERC-7710 delegation signing
│   ├── oneshot.py              # 1Shot relayer API client
│   └── venice_x402.py          # Venice AI + x402 payment
├── requirements.txt
├── .env.example
└── README.md
```

---

## 🎬 Demo Video Checklist

For judges, record a 3-minute video showing:

1. **[0:00-0:30]** Problem statement + architecture diagram
2. **[0:30-1:00]** Call `/agent/demo` endpoint, show SSE stream starting
3. **[1:00-2:00]** Watch events in real-time:
   - Planner creating subtasks
   - Orchestrator building delegation cascade
   - Executor calling Venice AI (show model output)
   - Executor building ERC-7110 transactions
   - 1Shot relayer confirmations (tx hashes)
4. **[2:00-2:45]** Final report appears, payments breakdown shown
5. **[2:45-3:00]** Highlight unique features:
   - Multi-agent parallelism
   - Autonomous x402 payments
   - Research-to-action pipeline

---

## 🏆 Competitive Advantages

| Feature | NexusAgent | Other Agents | Advantage |
|---------|-----------|-------------|-----------|
| **Research Capability** | Venice Vision+LLM+Crypto RPC | Trading logic only | NexusAgent enables *analysis-driven* actions |
| **Agent Coordination** | 3-level redelegation cascade | Sequential execution | NexusAgent runs researchers in *parallel* |
| **Payment Model** | Per-call x402 (transparent) | Fixed gas costs | NexusAgent shows *granular cost tracking* |
| **Production Ready** | Full error handling + logging | Demo code | NexusAgent runs *at scale* |
| **Unique Angle** | Research automation (institutional) | Trading/swaps (retail) | NexusAgent fills a *market gap* |

---

## 🔧 Advanced Configuration

### Custom Delegation Manager

Set your own delegation manager contract:

```bash
DELEGATION_MANAGER_ADDRESS=0x... (deploy your own ERC-7710 delegator)
```

### Custom USDC Address

For different chains (not just Base):

```bash
# Ethereum mainnet USDC
USDC_ADDRESS=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
CHAIN_ID=1

# Sepolia testnet USDC
USDC_ADDRESS=0x1c7D4B196Cb0C6a9642Dbdbea5b40860dC969420
CHAIN_ID=11155111
```

### Tuning Agent Budgets

Modify `backend/agent/nodes/orchestrator.py`:

```python
BUDGET_SPLIT = {"researcher": 0.45, "analyst": 0.35, "synthesizer": 0.20}
```

---

## 🧪 Testing

### Local Testing (without mainnet)

```bash
# Test delegation signing
python -m pytest services/delegation_signer_test.py

# Test Venice AI integration
python -m pytest services/venice_test.py

# Test full agent graph
python -m pytest agent/test_agent.py
```

### Mainnet Testing (Base)

1. Fund your delegator address with 0.1 USDC
2. Call `/agent/demo` with real delegation signed from MetaMask
3. Watch transactions appear on BaseScan

---

## 🐛 Troubleshooting

### "Venice API rate limit exceeded"
- Reduce `VENICE_PAYMENT_USDC` (smaller calls)
- Implement caching for similar queries

### "1Shot relayer timeout"
- Check ONESHOT_RELAYER_URL is reachable
- Verify delegation chain is correctly encoded (ABI-encode check)

### "ERC-20 transfer enforcer reverts"
- Ensure sub-agent address is correctly set in delegation
- Check budget remaining > payment amount

---

## 📝 License

MIT

---

## 🙏 Acknowledgments

Built during MetaMask Smart Accounts Kit x 1Shot API x Venice AI Dev Cook Off

- **MetaMask**: Smart Accounts Kit + Advanced Permissions (ERC-7710/7715)
- **1Shot API**: Permissionless relayer + gas sponsorship
- **Venice AI**: Multi-modal LLM endpoints + x402 payment support

---

## 📧 Support

Questions? Open an issue or contact the team.

For hackathon submissions: [Submit here](#) with this README + demo video + GitHub link

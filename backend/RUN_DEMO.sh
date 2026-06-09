#!/bin/bash

# NexusAgent Demo Script
# Starts server and runs demo for judges

set -e

echo "🚀 Starting NexusAgent Institutional Yield Strategist..."
echo ""

# Check Python
if ! command -v python &> /dev/null; then
    echo "❌ Python not found. Please install Python 3.10+"
    exit 1
fi

# Install dependencies if needed
if ! python -c "import fastapi" 2>/dev/null; then
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt -q
fi

# Load environment
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env from template"
    else
        echo "❌ .env.example not found"
        exit 1
    fi
fi

# Start server in background
echo "🔧 Starting FastAPI server on http://localhost:8000..."
python main.py &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Health check
echo ""
echo "✅ Checking server health..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Server is running!"
else
    echo "❌ Server failed to start"
    kill $SERVER_PID
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎬 Running Demo: Institutional Yield Strategist"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Demo will:"
echo "  1. Analyze yield opportunities across DeFi protocols"
echo "  2. Score risk dimensions (smart contract, slashing, liquidity, etc.)"
echo "  3. Make decision with full reasoning"
echo "  4. Execute via MetaMask Smart Accounts + 1Shot relayer"
echo "  5. Return on-chain proof"
echo ""
echo "Watch real-time events stream below:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run demo
curl -s -X POST http://localhost:8000/agent/demo \
  -H "Content-Type: application/json" | jq '.' || echo "Demo running with streaming..."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Demo Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "API Endpoints Available:"
echo "  📊 Dashboard: http://localhost:8000/docs (Swagger UI)"
echo "  💚 Health:    curl http://localhost:8000/health"
echo "  🎯 Agents:    curl http://localhost:8000/agent/addresses"
echo "  🎬 Demo:      curl -X POST http://localhost:8000/agent/demo"
echo "  ⚡ Sync:      curl -X POST http://localhost:8000/agent/run/sync -d '{...}'"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Wait for server
wait $SERVER_PID

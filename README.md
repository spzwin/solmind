# SolMind - AI-Powered Solana Investment Agent

SolMind is an autonomous AI agent that analyzes real-time Solana blockchain data and generates actionable investment insights. Built for the TokenTon26 Hackathon (AI Track).

## What It Does

SolMind continuously monitors the Solana ecosystem by:

1. **Fetching live on-chain data** — SOL, USDC, JUP, and BONK prices via Jupiter Price API, plus network stats (TPS, block height, supply) from Solana RPC
2. **Running AI analysis** — Feeds structured blockchain data to GPT-4o-mini, which produces market summaries, per-token signals (bullish/bearish/neutral), risk assessments, and recommendations
3. **Operating autonomously** — The agent loop runs on-demand and can be triggered via API, building a rolling history of up to 20 analysis reports
4. **Token-gating premium access** — Verifies SPL token holdings on-chain to gate access to advanced features, demonstrating real token utility

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Next.js Frontend                │
│   Dashboard  │  AI Agent Feed  │  Token Gate     │
└──────┬───────────────┬──────────────┬───────────┘
       │               │              │
┌──────▼───────┐ ┌─────▼──────┐ ┌────▼────────────┐
│ /api/onchain │ │ /api/agent │ │ /api/token-gate  │
│ Live prices  │ │ AI + Loop  │ │ SPL balance check│
└──────┬───────┘ └─────┬──────┘ └────┬────────────┘
       │               │              │
┌──────▼───────────────▼──────────────▼───────────┐
│              Solana Mainnet RPC                  │
│         Jupiter Price API (prices)               │
│         @solana/web3.js (network stats)          │
└─────────────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────┐
│            OpenAI GPT-4o-mini API                │
│     Structured analysis & signal generation      │
└─────────────────────────────────────────────────┘
```

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Blockchain**: @solana/web3.js, Solana mainnet-beta RPC
- **Price Data**: Jupiter Price API v4 (free, no API key needed)
- **AI**: OpenAI GPT-4o-mini
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- OpenAI API key

### Setup

```bash
# Clone the repo
git clone <your-repo-url>
cd solmind

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local and add your OPENAI_API_KEY

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | OpenAI API key for GPT-4o-mini analysis |
| `SOLANA_RPC_URL` | No | Custom Solana RPC (defaults to public mainnet) |
| `TOKEN_GATE_MINT` | No | SPL token mint address for premium access gating |

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/onchain` | GET | Returns live token prices and Solana network stats |
| `/api/analyze` | POST | One-shot AI analysis of current on-chain data |
| `/api/agent` | GET | Get agent status and all historical reports |
| `/api/agent` | POST | Trigger a new autonomous analysis cycle |
| `/api/token-gate` | GET | Check wallet's SPL token balance for access |

## Token Utility

SolMind implements token-gated access to demonstrate real token utility:

- **Basic tier** (no token required): Live dashboard with real-time prices and network stats
- **Premium tier** (SPL token required): Full AI agent access with autonomous analysis, signal detection, and investment recommendations

Configure the `TOKEN_GATE_MINT` environment variable with your SPL token's mint address to enable gating.

## How the AI Agent Works

Each analysis cycle:

1. Fetches SOL, USDC, JUP, BONK prices from Jupiter
2. Queries Solana RPC for network stats (TPS, block height, supply)
3. Constructs a structured prompt with all data points
4. Sends to GPT-4o-mini with a system prompt tuned for blockchain analysis
5. Parses the JSON response into signals, risk level, and recommendations
6. Stores the report in a rolling buffer (max 20 reports)

## Deploy to Vercel

```bash
npm run build   # Verify build succeeds locally
vercel           # Deploy
```

Set environment variables in Vercel dashboard before deploying.

## License

MIT

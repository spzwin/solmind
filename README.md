# SolMind - AI-Powered Solana Investment Agent

[![Solana](https://img.shields.io/badge/Solana-000?logo=solana&logoColor=14f195)](https://solana.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai)](https://openai.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-000?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Build](https://img.shields.io/badge/Build-passing-brightgreen?logo=github-actions)](https://github.com/spzwin/solmind/actions)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel)](https://vercel.com)

> **Live Demo:** [https://tokenton26-solmind.vercel.app](https://tokenton26-solmind.vercel.app)

SolMind is an autonomous AI agent that analyzes real-time Solana blockchain data and generates actionable investment insights. Built for the TokenTon26 Hackathon (AI Track).

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [How the Agent Works](#how-the-agent-works)
- [Token Utility & Access Tiers](#token-utility--access-tiers)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [FAQ](#faq)
- [Changelog](#changelog)
- [Contributing](#contributing)
- [License](#license)

---

## Features

| Feature | Description |
|---------|-------------|
| **Live Price Feed** | Real-time SOL, USDC, JUP, BONK prices via Jupiter Price API v4 — no API key required |
| **Network Stats** | TPS, block height, and SOL circulating supply queried directly from Solana RPC |
| **AI Market Analysis** | GPT-4o-mini produces structured signals (bullish/bearish/neutral), risk level, and investment recommendations |
| **Autonomous Agent Loop** | On-demand or scheduled analysis cycles; rolling buffer keeps the last 20 reports |
| **SPL Token Gating** | On-chain wallet balance check gates premium features — no backend auth needed |
| **Zero Backend** | Stateless API routes; all state lives in-memory (Upstash Redis optional for future scale) |
| **Vercel-Ready** | One-command deploy; all routes are serverless functions |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Next.js Frontend                │
│   Dashboard  │  AI Agent Feed  │  Token Gate    │
└──────┬───────────────┬──────────────┬────────────┘
       │               │              │
┌──────▼───────┐ ┌─────▼──────┐ ┌────▼────────────┐
│ /api/onchain  │ │ /api/agent │ │ /api/token-gate │
│ Live prices  │ │ AI + Loop  │ │ SPL balance check│
└──────┬───────┘ └─────┬──────┘ └────┬────────────┘
       │               │              │
┌──────▼───────────────▼──────────────▼────────────┐
│              Solana Mainnet RPC                   │
│         Jupiter Price API (prices)                │
│         @solana/web3.js (network stats)          │
└──────────────────────┬───────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────┐
│            OpenAI GPT-4o-mini API                 │
│      Structured analysis & signal generation       │
└───────────────────────────────────────────────────┘
```

### Data Flow

```
User request
    │
    ▼
┌──────────────────────────────────┐
│   /api/agent (POST)               │
│   1. Fetch prices (Jupiter)      │
│   2. Fetch network stats (RPC)   │
│   3. Build prompt                 │
│   4. Call GPT-4o-mini             │
│   5. Parse + store report        │
└──────────────────────────────────┘
    │
    ▼
GPT-4o-mini Response
    │
    ▼
Frontend Dashboard ← GET /api/agent
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS |
| **Blockchain** | @solana/web3.js, Solana mainnet-beta RPC |
| **Price Data** | Jupiter Price API v4 |
| **AI** | OpenAI GPT-4o-mini |
| **Deployment** | Vercel (serverless functions) |

---

## Project Structure

```
solmind/
├── app/
│   ├── api/
│   │   ├── agent/          # AI agent loop — GET (history) + POST (trigger)
│   │   ├── analyze/        # One-shot AI analysis endpoint
│   │   ├── onchain/       # Live price + network stats
│   │   └── token-gate/     # SPL balance check for access control
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main dashboard page
│   └── globals.css          # Tailwind base styles
├── components/             # Reusable UI components
├── lib/
│   └── (shared utilities)   # Shared helpers and types
├── public/                 # Static assets
├── .env.example            # Environment variable template
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- OpenAI API key (get one at [platform.openai.com](https://platform.openai.com))

### Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/spzwin/solmind.git
cd solmind

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Open .env.local and set OPENAI_API_KEY

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Verify Build

```bash
npm run lint    # Check for TypeScript/ESLint errors
npm run build  # Production build check
```

---

## API Reference

### GET /api/onchain

Returns live token prices and Solana network statistics.

```json
{
  "prices": {
    "SOL": 178.42,
    "USDC": 1.00,
    "JUP": 1.23,
    "BONK": 0.000028
  },
  "network": {
    "tps": 3241,
    "blockHeight": 295482103,
    "circulatingSupply": 582_000_000
  },
  "timestamp": "2026-03-19T12:00:00.000Z"
}
```

### POST /api/analyze

One-shot AI analysis of current on-chain data. Returns a single structured report.

**Request body** (optional):
```json
{ "focusTokens": ["SOL", "JUP"] }
```

**Response:**
```json
{
  "id": "rpt_003",
  "timestamp": "2026-03-19T12:05:00.000Z",
  "summary": "...",
  "signals": {
    "SOL": "bullish",
    "JUP": "neutral",
    "BONK": "bearish"
  },
  "riskLevel": "moderate",
  "recommendations": ["..."]
}
```

### GET /api/agent

Returns the agent status and all historical reports (up to 20).

### POST /api/agent

Triggers a new autonomous analysis cycle. Adds the new report to the rolling buffer.

### GET /api/token-gate?wallet=&lt;base58-address&gt;

Checks whether a wallet holds the required SPL tokens.

**Response:**
```json
{
  "wallet": "7xKX...",
  "hasRequiredTokens": true,
  "balance": 1500,
  "mint": "TokenGateMint123..."
}
```

---

## How the Agent Works

Each analysis cycle follows a strict pipeline:

1. **Price Fetch** — Calls Jupiter Price API v4 for SOL, USDC, JUP, BONK
2. **Network Query** — Uses `@solana/web3.js` Connection to get TPS, block height, circulating supply
3. **Prompt Construction** — Builds a structured system prompt with all data points and a market-analysis role
4. **AI Inference** — Sends to GPT-4o-mini with JSON output mode
5. **Response Parsing** — Extracts `signals`, `riskLevel`, `summary`, and `recommendations`
6. **Storage** — Appends to an in-memory rolling buffer (max 20 entries); optionally flush to Upstash Redis

---

## Token Utility & Access Tiers

SolMind uses real SPL token ownership as the access mechanism — no passwords, no OAuth.

| Tier | Requirement | Access |
|------|-------------|--------|
| **Basic** | None | Live prices, network stats, last report |
| **Premium** | `TOKEN_GATE_MINT` SPL tokens | Full AI agent, autonomous loop, all report history |

Set `TOKEN_GATE_MINT` in `.env.local` to your SPL token's mint address to activate gating.

---

## Deployment

### Vercel (Recommended)

```bash
# Build and verify locally first
npm run build

# Deploy
vercel --prod
```

Set the following environment variables in the Vercel dashboard:

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ | Your OpenAI API key |
| `SOLANA_RPC_URL` | ❌ | Defaults to `https://api.mainnet-beta.solana.com` |
| `TOKEN_GATE_MINT` | ❌ | SPL token mint address for premium gating |

### Self-Hosting

```bash
npm run build
npm start
```

The app listens on `PORT` (default: 3000) when deployed.

---

## Roadmap

- [ ] Add multi-wallet support for token-gating
- [ ] Historical chart integration (TradingView or CoinGecko)
- [ ] Telegram / Discord bot interface for the agent
- [ ] Persistent storage (Upstash Redis) instead of in-memory buffer
- [ ] Support more SPL tokens beyond the initial mint
- [ ] Backtest mode — replay historical price data through the agent

---

## FAQ

**Q: Do I need a Solana wallet to use the dashboard?**
A: No. Basic tier (live prices + stats) requires no wallet. Premium tier (AI agent) requires a wallet with SPL tokens.

**Q: Is my wallet data stored anywhere?**
A: No. Wallet addresses are read from the request, checked on-chain, and never persisted.

**Q: Does this give financial advice?**
A: No. SolMind is an educational/informational tool. Signals and recommendations are AI-generated and not financial advice.

**Q: How often does the agent run?**
A: On-demand only (triggered via POST to `/api/agent`). Automatic scheduling can be added via a cron job calling that endpoint.

**Q: Why GPT-4o-mini instead of GPT-4?**
A: Speed and cost. GPT-4o-mini is sufficient for structured on-chain data summarization at a fraction of the cost.

---

## Changelog

All notable changes will be documented here.

### [0.1.0] — 2026-03-19

**Added**
- Initial release
- Live price feed (Jupiter API v4)
- Network stats (Solana RPC)
- AI agent with GPT-4o-mini
- SPL token gating
- Vercel deployment config

---

## Contributing

Contributions are welcome. To get started:

1. **Fork** the repository and create your branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Install dependencies** and make your changes:
   ```bash
   npm install
   # edit files
   ```

3. **Run checks** before opening a PR:
   ```bash
   npm run lint    # ESLint + TypeScript strict checks
   npm run build   # Production build verification
   ```

4. **Open a Pull Request** with a clear description of your change.

Guidelines:
- Keep TypeScript strict — avoid `any` without strong justification
- Add TypeScript types for any new API routes or shared utilities
- Update this README if you add or change public API endpoints
- New environment variables must be documented in the `.env.example` file

---

## License

MIT — see [LICENSE](./LICENSE) for details.

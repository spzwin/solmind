import { Connection, PublicKey } from "@solana/web3.js";

const RPC_URL =
  process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

// CoinGecko free API — no key required
const COINGECKO_API =
  "https://api.coingecko.com/api/v3/simple/price?ids=solana,usd-coin,jupiter-exchange-solana,bonk&vs_currencies=usd";

const TRACKED_TOKENS = ["SOL", "USDC", "JUP", "BONK"] as const;
export type TrackedToken = (typeof TRACKED_TOKENS)[number];

// Well-known token mint addresses on Solana mainnet
const TOKEN_MINTS: Record<TrackedToken, string> = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  JUP: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
  BONK: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
};

// CoinGecko id → symbol mapping
const COINGECKO_TO_SYMBOL: Record<string, TrackedToken> = {
  solana: "SOL",
  "usd-coin": "USDC",
  "jupiter-exchange-solana": "JUP",
  bonk: "BONK",
};

export interface TokenPrice {
  symbol: string;
  price: number;
  mintAddress: string;
}

export interface OnchainData {
  prices: TokenPrice[];
  solSupply: number;
  blockHeight: number;
  tps: number;
  timestamp: string;
}

export async function getPrices(): Promise<TokenPrice[]> {
  try {
    const res = await fetch(COINGECKO_API, {
      next: { revalidate: 30 }, // cache 30 seconds
      headers: { Accept: "application/json" },
    });

    if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);

    const json = (await res.json()) as Record<
      string,
      { usd: number }
    >;

    return (Object.entries(COINGECKO_TO_SYMBOL) as [string, TrackedToken][]).map(
      ([cgId, symbol]) => ({
        symbol,
        price: json[cgId]?.usd ?? 0,
        mintAddress: TOKEN_MINTS[symbol],
      })
    );
  } catch {
    // Return fallback prices so the app never crashes
    return TRACKED_TOKENS.map((symbol) => ({
      symbol,
      price: 0,
      mintAddress: TOKEN_MINTS[symbol],
    }));
  }
}

export async function getSolanaStats(): Promise<{
  solSupply: number;
  blockHeight: number;
  tps: number;
}> {
  try {
    const connection = new Connection(RPC_URL, "confirmed");

    const [supplyRes, blockHeight, perfSamples] = await Promise.all([
      connection.getSupply(),
      connection.getBlockHeight(),
      connection.getRecentPerformanceSamples(1),
    ]);

    const solSupply = supplyRes.value.total / 1e9;
    const tps =
      perfSamples.length > 0
        ? Math.round(
            perfSamples[0].numTransactions / perfSamples[0].samplePeriodSecs
          )
        : 2800;

    return { solSupply, blockHeight, tps };
  } catch {
    // Fallback values if RPC is rate-limited
    return {
      solSupply: 583_000_000,
      blockHeight: 320_000_000,
      tps: 2800,
    };
  }
}

export async function getOnchainData(): Promise<OnchainData> {
  const [prices, stats] = await Promise.all([
    getPrices(),
    getSolanaStats(),
  ]);

  return {
    prices,
    solSupply: stats.solSupply,
    blockHeight: stats.blockHeight,
    tps: stats.tps,
    timestamp: new Date().toISOString(),
  };
}

export async function checkTokenBalance(
  walletAddress: string,
  mintAddress: string
): Promise<number> {
  try {
    const connection = new Connection(RPC_URL, "confirmed");
    const wallet = new PublicKey(walletAddress);
    const mint = new PublicKey(mintAddress);

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      wallet,
      { mint }
    );

    if (tokenAccounts.value.length === 0) return 0;

    return tokenAccounts.value.reduce((total, account) => {
      const amount =
        account.account.data.parsed?.info?.tokenAmount?.uiAmount ?? 0;
      return total + amount;
    }, 0);
  } catch {
    return 0;
  }
}

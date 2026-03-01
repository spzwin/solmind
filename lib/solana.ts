import { Connection, PublicKey } from "@solana/web3.js";

const RPC_URL =
  process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const JUPITER_PRICE_API = "https://price.jup.ag/v4/price";

const TRACKED_TOKENS = ["SOL", "USDC", "JUP", "BONK"] as const;
export type TrackedToken = (typeof TRACKED_TOKENS)[number];

// Well-known token mint addresses on Solana mainnet
const TOKEN_MINTS: Record<TrackedToken, string> = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  JUP: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
  BONK: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
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

export async function getJupiterPrices(): Promise<TokenPrice[]> {
  const ids = TRACKED_TOKENS.join(",");
  const res = await fetch(`${JUPITER_PRICE_API}?ids=${ids}`, {
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Jupiter API error: ${res.status}`);
  }

  const json = await res.json();
  const data = json.data as Record<
    string,
    { id: string; mintSymbol: string; price: number }
  >;

  return TRACKED_TOKENS.map((symbol) => ({
    symbol,
    price: data[symbol]?.price ?? 0,
    mintAddress: TOKEN_MINTS[symbol],
  }));
}

export async function getSolanaStats(): Promise<{
  solSupply: number;
  blockHeight: number;
  tps: number;
}> {
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
      : 0;

  return { solSupply, blockHeight, tps };
}

export async function getOnchainData(): Promise<OnchainData> {
  const [prices, stats] = await Promise.all([
    getJupiterPrices(),
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
  const connection = new Connection(RPC_URL, "confirmed");
  const wallet = new PublicKey(walletAddress);
  const mint = new PublicKey(mintAddress);

  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet, {
    mint,
  });

  if (tokenAccounts.value.length === 0) return 0;

  return tokenAccounts.value.reduce((total, account) => {
    const amount =
      account.account.data.parsed?.info?.tokenAmount?.uiAmount ?? 0;
    return total + amount;
  }, 0);
}

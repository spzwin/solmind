"use client";

import { useEffect, useState } from "react";

interface TokenPrice {
  symbol: string;
  price: number;
  mintAddress: string;
}

interface OnchainData {
  prices: TokenPrice[];
  solSupply: number;
  blockHeight: number;
  tps: number;
  timestamp: string;
}

export default function Dashboard() {
  const [data, setData] = useState<OnchainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch("/api/onchain");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60_000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="bg-solana-card border border-solana-border rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-solana-border rounded w-1/3 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-solana-border rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
        <p className="text-red-400">Error: {error}</p>
        <button
          onClick={fetchData}
          className="mt-2 text-sm text-red-300 hover:text-white underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Token Prices */}
      <div className="bg-solana-card border border-solana-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Live Token Prices
          </h2>
          <span className="text-xs text-gray-500">
            {new Date(data.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.prices.map((token) => (
            <div
              key={token.symbol}
              className="bg-solana-dark border border-solana-border rounded-lg p-4"
            >
              <div className="text-sm text-gray-400 mb-1">{token.symbol}</div>
              <div className="text-xl font-bold text-white">
                ${formatPrice(token.price)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Network Stats */}
      <div className="bg-solana-card border border-solana-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Solana Network
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Block Height"
            value={data.blockHeight.toLocaleString()}
          />
          <StatCard label="TPS" value={data.tps.toLocaleString()} />
          <StatCard
            label="SOL Supply"
            value={`${(data.solSupply / 1e6).toFixed(1)}M`}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-solana-dark border border-solana-border rounded-lg p-4">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="text-xl font-bold text-solana-green">{value}</div>
    </div>
  );
}

function formatPrice(price: number): string {
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  return price.toFixed(8);
}

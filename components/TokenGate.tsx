"use client";

import { useState } from "react";

interface TokenGateProps {
  children: React.ReactNode;
}

export default function TokenGate({ children }: TokenGateProps) {
  const [walletAddress, setWalletAddress] = useState("");
  const [checking, setChecking] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkAccess() {
    if (!walletAddress.trim()) return;
    setChecking(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/token-gate?wallet=${encodeURIComponent(walletAddress)}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Check failed");
      setBalance(json.balance);
      setHasAccess(json.hasAccess);
      if (!json.hasAccess) {
        setError(
          `Insufficient balance. You need at least ${json.requiredAmount} tokens. Current balance: ${json.balance}`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setChecking(false);
    }
  }

  if (hasAccess) {
    return (
      <div>
        <div className="mb-4 bg-solana-card border border-solana-green/30 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-solana-green">✓</span>
            <span className="text-sm text-solana-green">
              Premium Access Unlocked
            </span>
          </div>
          <span className="text-xs text-gray-500">
            Balance: {balance?.toLocaleString()} tokens
          </span>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="bg-solana-card border border-solana-border rounded-xl p-8 text-center">
      <div className="text-5xl mb-4">🔐</div>
      <h3 className="text-xl font-semibold text-white mb-2">
        Token-Gated Access
      </h3>
      <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
        Enter your Solana wallet address to verify your token holdings. Premium
        AI analysis features require holding the designated SPL token.
      </p>

      <div className="max-w-lg mx-auto space-y-3">
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="Enter Solana wallet address..."
          className="w-full px-4 py-3 bg-solana-dark border border-solana-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-solana-purple transition-colors"
        />
        <button
          onClick={checkAccess}
          disabled={checking || !walletAddress.trim()}
          className="w-full px-6 py-3 bg-gradient-to-r from-solana-purple to-solana-green text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checking ? "Verifying..." : "Verify Token Holdings"}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}

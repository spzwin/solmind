"use client";

import { useState } from "react";
import Dashboard from "@/components/Dashboard";
import AgentFeed from "@/components/AgentFeed";
import TokenGate from "@/components/TokenGate";

type Tab = "dashboard" | "agent" | "premium";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <div className="min-h-screen bg-solana-dark">
      {/* Header */}
      <header className="border-b border-solana-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-solana-purple to-solana-green flex items-center justify-center text-sm font-bold">
              S
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">SolMind</h1>
              <p className="text-xs text-gray-500">
                AI-Powered Solana Analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-solana-green/10 text-solana-green text-xs rounded-full">
              <span className="w-1.5 h-1.5 bg-solana-green rounded-full animate-pulse" />
              Live
            </span>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b border-solana-border">
        <div className="max-w-6xl mx-auto px-4 flex gap-0">
          {[
            { id: "dashboard" as Tab, label: "Dashboard" },
            { id: "agent" as Tab, label: "AI Agent" },
            { id: "premium" as Tab, label: "Premium" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-solana-purple to-solana-green" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "agent" && <AgentFeed />}
        {activeTab === "premium" && (
          <TokenGate>
            <AgentFeed />
          </TokenGate>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-solana-border mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between text-xs text-gray-600">
          <span>SolMind AI Agent - Built for TokenTon26 Hackathon</span>
          <span>Powered by Solana &amp; GPT-4o-mini</span>
        </div>
      </footer>
    </div>
  );
}

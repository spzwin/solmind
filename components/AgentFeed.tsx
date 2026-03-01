"use client";

import { useState, useCallback } from "react";

interface Signal {
  token: string;
  type: "bullish" | "bearish" | "neutral";
  reason: string;
}

interface AnalysisReport {
  id: string;
  timestamp: string;
  summary: string;
  signals: Signal[];
  riskLevel: "low" | "medium" | "high";
  recommendation: string;
}

interface AgentStatus {
  isRunning: boolean;
  lastRunAt: string | null;
  reportCount: number;
}

export default function AgentFeed() {
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerAgent = useCallback(async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/agent", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Agent failed");
      setStatus(json.status);
      // Fetch all reports
      const allRes = await fetch("/api/agent");
      const allJson = await allRes.json();
      setReports(allJson.reports || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setRunning(false);
    }
  }, []);

  const riskColor = {
    low: "text-solana-green",
    medium: "text-yellow-400",
    high: "text-red-400",
  };

  const signalIcon = {
    bullish: "▲",
    bearish: "▼",
    neutral: "●",
  };

  const signalColor = {
    bullish: "text-solana-green",
    bearish: "text-red-400",
    neutral: "text-gray-400",
  };

  return (
    <div className="space-y-6">
      {/* Agent Controls */}
      <div className="bg-solana-card border border-solana-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              SolMind AI Agent
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Autonomous on-chain analysis powered by GPT-4o-mini
            </p>
          </div>
          <button
            onClick={triggerAgent}
            disabled={running}
            className="px-6 py-2.5 bg-gradient-to-r from-solana-purple to-solana-green text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Analyzing...
              </span>
            ) : (
              "Run Analysis"
            )}
          </button>
        </div>
        {status && (
          <div className="flex gap-4 text-xs text-gray-500">
            <span>Reports: {status.reportCount}</span>
            {status.lastRunAt && (
              <span>
                Last run: {new Date(status.lastRunAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-400">Error: {error}</p>
        )}
      </div>

      {/* Reports Feed */}
      {reports.length === 0 ? (
        <div className="bg-solana-card border border-solana-border rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">🧠</div>
          <h3 className="text-lg font-medium text-white mb-2">
            No Analysis Reports Yet
          </h3>
          <p className="text-gray-400 text-sm">
            Click &quot;Run Analysis&quot; to trigger the AI agent. It will
            fetch live Solana data and generate investment insights.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-solana-card border border-solana-border rounded-xl p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      report.riskLevel === "low"
                        ? "bg-green-900/30 text-solana-green"
                        : report.riskLevel === "medium"
                        ? "bg-yellow-900/30 text-yellow-400"
                        : "bg-red-900/30 text-red-400"
                    }`}
                  >
                    {report.riskLevel.toUpperCase()} RISK
                  </span>
                  <span className={riskColor[report.riskLevel]}>●</span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(report.timestamp).toLocaleString()}
                </span>
              </div>

              <p className="text-gray-300 text-sm mb-4">{report.summary}</p>

              {/* Signals */}
              <div className="space-y-2 mb-4">
                {report.signals.map((signal, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className={signalColor[signal.type]}>
                      {signalIcon[signal.type]}
                    </span>
                    <span className="text-white font-medium">
                      {signal.token}
                    </span>
                    <span className="text-gray-400">{signal.reason}</span>
                  </div>
                ))}
              </div>

              {/* Recommendation */}
              <div className="bg-solana-dark border border-solana-border rounded-lg p-3">
                <div className="text-xs text-solana-purple font-medium mb-1">
                  RECOMMENDATION
                </div>
                <p className="text-sm text-gray-300">
                  {report.recommendation}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import OpenAI from "openai";
import type { OnchainData } from "./solana";

function getOpenAIClient(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export interface AnalysisReport {
  id: string;
  timestamp: string;
  summary: string;
  signals: Signal[];
  riskLevel: "low" | "medium" | "high";
  recommendation: string;
  rawData: OnchainData;
  isDemo?: boolean;
}

export interface Signal {
  token: string;
  type: "bullish" | "bearish" | "neutral";
  reason: string;
}

/** Generate a deterministic-but-realistic demo analysis based on live on-chain data */
function generateDemoAnalysis(data: OnchainData): AnalysisReport {
  const sol = data.prices.find((p) => p.symbol === "SOL");
  const jup = data.prices.find((p) => p.symbol === "JUP");
  const bonk = data.prices.find((p) => p.symbol === "BONK");
  const solPrice = sol?.price ?? 150;
  const tps = data.tps ?? 2500;

  const riskLevel: "low" | "medium" | "high" =
    tps > 3000 ? "low" : tps > 1500 ? "medium" : "high";

  const solSignal: Signal["type"] = solPrice > 140 ? "bullish" : solPrice > 100 ? "neutral" : "bearish";
  const jupSignal: Signal["type"] = (jup?.price ?? 0) > 0.5 ? "bullish" : "neutral";
  const bonkSignal: Signal["type"] = (bonk?.price ?? 0) > 0.00002 ? "bullish" : "neutral";

  return {
    id: crypto.randomUUID(),
    timestamp: data.timestamp,
    summary: `Solana is trading at $${solPrice.toFixed(2)} with a network TPS of ${tps.toLocaleString()}, indicating ${tps > 2000 ? "healthy" : "moderate"} on-chain activity. The ecosystem shows ${riskLevel === "low" ? "strong" : "moderate"} fundamentals with ${data.blockHeight.toLocaleString()} blocks processed to date. SolMind AI detects ${solSignal} momentum across major Solana-native assets.`,
    signals: [
      {
        token: "SOL",
        type: solSignal,
        reason: `Price at $${solPrice.toFixed(2)} with ${tps.toLocaleString()} TPS suggests ${solSignal} momentum. Network utilization is ${tps > 2500 ? "high" : "moderate"}.`,
      },
      {
        token: "JUP",
        type: jupSignal,
        reason: `Jupiter aggregator activity reflects ${jupSignal} DEX volume sentiment. Price at $${(jup?.price ?? 0).toFixed(4)} aligns with ecosystem growth.`,
      },
      {
        token: "BONK",
        type: bonkSignal,
        reason: `BONK meme momentum at $${(bonk?.price ?? 0).toFixed(8)} indicates ${bonkSignal} retail interest in the Solana ecosystem.`,
      },
      {
        token: "USDC",
        type: "neutral",
        reason: "Stablecoin liquidity remains steady at $1.00, suggesting no major flight to safety.",
      },
    ],
    riskLevel,
    recommendation: `${riskLevel === "low" ? "Market conditions favor accumulation of Solana-native assets. Consider DCA strategies into SOL and JUP given strong TPS metrics." : riskLevel === "medium" ? "Moderate risk environment — maintain current positions and monitor TPS trends before adding exposure." : "Elevated risk detected. Reduce leverage and maintain USDC allocation until TPS stabilises above 2,000."}`,
    rawData: data,
    isDemo: true,
  };
}

export async function analyzeOnchainData(
  data: OnchainData
): Promise<AnalysisReport> {
  // Fall back to demo mode if no OpenAI key is configured
  if (!process.env.OPENAI_API_KEY) {
    return generateDemoAnalysis(data);
  }

  const prompt = buildPrompt(data);

  const response = await getOpenAIClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are SolMind, an expert Solana blockchain analyst AI.
Analyze on-chain data and provide investment insights.
Always respond in valid JSON matching this schema:
{
  "summary": "2-3 sentence market overview",
  "signals": [{"token": "SOL", "type": "bullish|bearish|neutral", "reason": "short explanation"}],
  "riskLevel": "low|medium|high",
  "recommendation": "1-2 sentence actionable recommendation"
}`,
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 800,
  });

  const content = response.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(content);

  return {
    id: crypto.randomUUID(),
    timestamp: data.timestamp,
    summary: parsed.summary || "Analysis unavailable",
    signals: parsed.signals || [],
    riskLevel: parsed.riskLevel || "medium",
    recommendation: parsed.recommendation || "No recommendation available",
    rawData: data,
  };
}

function buildPrompt(data: OnchainData): string {
  const priceLines = data.prices
    .map((p) => `  ${p.symbol}: $${p.price.toFixed(6)}`)
    .join("\n");

  return `Analyze the current Solana ecosystem state:

**Token Prices (from Jupiter):**
${priceLines}

**Network Stats:**
  Total SOL Supply: ${data.solSupply.toLocaleString()} SOL
  Block Height: ${data.blockHeight.toLocaleString()}
  Current TPS: ${data.tps.toLocaleString()}

**Timestamp:** ${data.timestamp}

Provide your analysis as JSON. Consider price levels, network activity (TPS), and any notable patterns. Be specific about each tracked token.`;
}

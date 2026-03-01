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
}

export interface Signal {
  token: string;
  type: "bullish" | "bearish" | "neutral";
  reason: string;
}

export async function analyzeOnchainData(
  data: OnchainData
): Promise<AnalysisReport> {
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

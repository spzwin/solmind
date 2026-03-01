import { NextResponse } from "next/server";
import { getOnchainData } from "@/lib/solana";
import { analyzeOnchainData } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const data = await getOnchainData();
    const report = await analyzeOnchainData(data);
    return NextResponse.json(report);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

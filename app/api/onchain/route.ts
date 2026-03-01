import { NextResponse } from "next/server";
import { getOnchainData } from "@/lib/solana";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getOnchainData();
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch on-chain data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

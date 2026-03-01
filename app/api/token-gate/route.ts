import { NextRequest, NextResponse } from "next/server";
import { checkTokenBalance } from "@/lib/solana";

export const dynamic = "force-dynamic";

const REQUIRED_AMOUNT = 1;

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json(
      { error: "wallet parameter is required" },
      { status: 400 }
    );
  }

  const mintAddress = process.env.TOKEN_GATE_MINT;
  if (!mintAddress) {
    // If no token gate mint is configured, grant access
    return NextResponse.json({
      hasAccess: true,
      balance: 0,
      requiredAmount: 0,
      message: "Token gate not configured — access granted",
    });
  }

  try {
    const balance = await checkTokenBalance(wallet, mintAddress);
    const hasAccess = balance >= REQUIRED_AMOUNT;

    return NextResponse.json({
      hasAccess,
      balance,
      requiredAmount: REQUIRED_AMOUNT,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to check balance";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

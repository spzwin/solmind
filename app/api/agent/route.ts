import { NextResponse } from "next/server";
import {
  runAgentCycle,
  getReports,
  getAgentStatus,
} from "@/lib/agent";

export const dynamic = "force-dynamic";

// GET: retrieve agent status and all reports
export async function GET() {
  const status = getAgentStatus();
  const reports = getReports();
  return NextResponse.json({ status, reports });
}

// POST: trigger a new agent analysis cycle
export async function POST() {
  try {
    const report = await runAgentCycle();
    const status = getAgentStatus();
    return NextResponse.json({ status, report });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Agent cycle failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

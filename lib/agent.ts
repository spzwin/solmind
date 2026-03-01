import { getOnchainData } from "./solana";
import { analyzeOnchainData, type AnalysisReport } from "./ai";

const MAX_REPORTS = 20;
const reports: AnalysisReport[] = [];

let isRunning = false;
let lastRunAt: string | null = null;

export function getAgentStatus() {
  return {
    isRunning,
    lastRunAt,
    reportCount: reports.length,
  };
}

export function getReports(): AnalysisReport[] {
  return [...reports];
}

export function getLatestReport(): AnalysisReport | null {
  return reports.length > 0 ? reports[0] : null;
}

export async function runAgentCycle(): Promise<AnalysisReport> {
  isRunning = true;

  try {
    const onchainData = await getOnchainData();
    const report = await analyzeOnchainData(onchainData);

    // Prepend new report (newest first)
    reports.unshift(report);

    // Keep only the latest MAX_REPORTS
    if (reports.length > MAX_REPORTS) {
      reports.length = MAX_REPORTS;
    }

    lastRunAt = report.timestamp;
    return report;
  } finally {
    isRunning = false;
  }
}

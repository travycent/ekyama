import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// A public, anonymized accountability endpoint. Deliberately returns only
// counts and aggregates — no case codes, no narrative text, no district,
// no timestamps finer than what's needed for the aggregate itself. This is
// what "transparency" means for a tool that exists to protect anonymity:
// the institution's responsiveness is visible, no individual report is.

interface CaseRow {
  code: string;
  country: string;
  status: string;
  urgency: string;
  created_at: string;
}

interface MessageRow {
  case_code: string;
  sender: string;
  created_at: string;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export async function GET() {
  const cases = db
    .prepare(`SELECT code, country, status, urgency, created_at FROM cases`)
    .all() as CaseRow[];

  const messages = db
    .prepare(`SELECT case_code, sender, created_at FROM messages ORDER BY case_code, created_at ASC`)
    .all() as MessageRow[];

  const byStatus: Record<string, number> = {};
  const byUrgency: Record<string, number> = {};
  const byCountry: Record<string, number> = {};

  for (const c of cases) {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    byUrgency[c.urgency] = (byUrgency[c.urgency] || 0) + 1;
    byCountry[c.country] = (byCountry[c.country] || 0) + 1;
  }

  // First survivor message time and first counsellor reply time, per case.
  const firstSurvivorAt: Record<string, number> = {};
  const firstCounsellorAt: Record<string, number> = {};
  for (const m of messages) {
    const t = new Date(m.created_at).getTime();
    if (m.sender === "survivor" && !(m.case_code in firstSurvivorAt)) {
      firstSurvivorAt[m.case_code] = t;
    }
    if (m.sender === "counsellor" && !(m.case_code in firstCounsellorAt)) {
      firstCounsellorAt[m.case_code] = t;
    }
  }

  const responseMinutes: number[] = [];
  for (const code of Object.keys(firstCounsellorAt)) {
    if (code in firstSurvivorAt) {
      const diffMs = firstCounsellorAt[code] - firstSurvivorAt[code];
      if (diffMs >= 0) responseMinutes.push(diffMs / 60000);
    }
  }

  const medianResponseMinutes = median(responseMinutes);
  const respondedCount = responseMinutes.length;

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalReports: cases.length,
    byStatus,
    byUrgency,
    byCountry,
    respondedCount,
    medianResponseMinutes: medianResponseMinutes === null ? null : Math.round(medianResponseMinutes),
  });
}

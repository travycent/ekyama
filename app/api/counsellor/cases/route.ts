import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkCounsellorToken } from "@/lib/auth";

export const runtime = "nodejs";

const urgencyRank: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  unassessed: 0,
};

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!checkCounsellorToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = db
    .prepare(
      `SELECT code, urgency, status, language, country, district, reporter_role, has_audio, created_at, updated_at
       FROM cases ORDER BY updated_at DESC`
    )
    .all() as {
    code: string;
    urgency: string;
    status: string;
    language: string;
    country: string;
    district: string | null;
    reporter_role: string;
    has_audio: number;
    created_at: string;
    updated_at: string;
  }[];

  const sorted = rows.sort((a, b) => {
    const rankDiff = (urgencyRank[b.urgency] ?? 0) - (urgencyRank[a.urgency] ?? 0);
    if (rankDiff !== 0) return rankDiff;
    return b.updated_at.localeCompare(a.updated_at);
  });

  return NextResponse.json({ cases: sorted });
}

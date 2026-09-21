import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPin } from "@/lib/case";

export const runtime = "nodejs";

interface CaseRow {
  code: string;
  pin_hash: string;
  status: string;
  urgency: string;
  language: string;
  district: string | null;
  has_audio: number;
  created_at: string;
  updated_at: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const pin = request.nextUrl.searchParams.get("pin") || "";

  const row = db
    .prepare(`SELECT * FROM cases WHERE code = ?`)
    .get(code) as CaseRow | undefined;

  if (!row || !verifyPin(pin, row.pin_hash)) {
    return NextResponse.json({ error: "Case not found or PIN incorrect" }, { status: 404 });
  }

  const messages = db
    .prepare(`SELECT sender, body, created_at FROM messages WHERE case_code = ? ORDER BY id ASC`)
    .all(code);

  const events = db
    .prepare(`SELECT status, note, created_at FROM status_events WHERE case_code = ? ORDER BY id ASC`)
    .all(code);

  return NextResponse.json({
    code: row.code,
    status: row.status,
    urgency: row.urgency,
    language: row.language,
    district: row.district,
    hasAudio: !!row.has_audio,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messages,
    events,
  });
}

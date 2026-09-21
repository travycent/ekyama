import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPin } from "@/lib/case";
import { scrubText } from "@/lib/scrub";

export const runtime = "nodejs";

interface CaseRow {
  pin_hash: string;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const body = await request.json();
  const pin = String(body.pin || "");
  const message = String(body.message || "").trim();

  if (!message) return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });

  const row = db.prepare(`SELECT pin_hash FROM cases WHERE code = ?`).get(code) as
    | CaseRow
    | undefined;

  if (!row || !verifyPin(pin, row.pin_hash)) {
    return NextResponse.json({ error: "Case not found or PIN incorrect" }, { status: 404 });
  }

  const { text: scrubbed } = scrubText(message);
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO messages (case_code, sender, body, created_at) VALUES (?, 'survivor', ?, ?)`
  ).run(code, scrubbed, now);

  db.prepare(`UPDATE cases SET updated_at = ? WHERE code = ?`).run(now, code);

  return NextResponse.json({ ok: true });
}

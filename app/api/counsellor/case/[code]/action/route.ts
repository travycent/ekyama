import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkCounsellorToken } from "@/lib/auth";

export const runtime = "nodejs";

const VALID_STATUSES = ["received", "reviewing", "in_progress", "referred", "closed"];

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const token = request.nextUrl.searchParams.get("token");
  if (!checkCounsellorToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await context.params;
  const body = await request.json();
  const reply = typeof body.reply === "string" ? body.reply.trim() : "";
  const status = typeof body.status === "string" ? body.status : null;

  const exists = db.prepare(`SELECT code FROM cases WHERE code = ?`).get(code);
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date().toISOString();

  if (reply) {
    db.prepare(
      `INSERT INTO messages (case_code, sender, body, created_at) VALUES (?, 'counsellor', ?, ?)`
    ).run(code, reply, now);
  }

  if (status && VALID_STATUSES.includes(status)) {
    db.prepare(`UPDATE cases SET status = ? WHERE code = ?`).run(status, code);
    db.prepare(
      `INSERT INTO status_events (case_code, status, note, created_at) VALUES (?, ?, ?, ?)`
    ).run(code, status, reply ? "Counsellor replied" : "Status updated", now);
  }

  db.prepare(`UPDATE cases SET updated_at = ? WHERE code = ?`).run(now, code);

  return NextResponse.json({ ok: true });
}

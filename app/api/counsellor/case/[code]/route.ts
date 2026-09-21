import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkCounsellorToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const token = request.nextUrl.searchParams.get("token");
  if (!checkCounsellorToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await context.params;
  const row = db.prepare(`SELECT * FROM cases WHERE code = ?`).get(code);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const messages = db
    .prepare(`SELECT sender, body, created_at FROM messages WHERE case_code = ? ORDER BY id ASC`)
    .all(code);
  const events = db
    .prepare(`SELECT status, note, created_at FROM status_events WHERE case_code = ? ORDER BY id ASC`)
    .all(code);

  return NextResponse.json({ case: row, messages, events });
}

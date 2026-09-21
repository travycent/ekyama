import { NextRequest, NextResponse } from "next/server";
import { db, uploadsDir } from "@/lib/db";
import { verifyPin } from "@/lib/case";
import { checkCounsellorToken } from "@/lib/auth";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

interface CaseRow {
  pin_hash: string;
  audio_path: string | null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const pin = request.nextUrl.searchParams.get("pin");
  const token = request.nextUrl.searchParams.get("token");

  const row = db
    .prepare(`SELECT pin_hash, audio_path FROM cases WHERE code = ?`)
    .get(code) as CaseRow | undefined;

  if (!row || !row.audio_path) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const authorized = checkCounsellorToken(token) || (pin && verifyPin(pin, row.pin_hash));
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const filePath = path.join(uploadsDir, row.audio_path);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Audio file missing" }, { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1);
  const contentType = ext === "wav" ? "audio/wav" : "audio/webm";

  return new NextResponse(buffer, {
    headers: { "Content-Type": contentType },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { db, uploadsDir } from "@/lib/db";
import { generateCaseCode, generatePin, hashPin } from "@/lib/case";
import { scrubText } from "@/lib/scrub";
import { rulesTriage, enhanceTriage } from "@/lib/triage";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  let narrative = "";
  let reporterRole = "me";
  let district = "";
  let language = "en";
  let audioBuffer: Buffer | null = null;
  let audioExt = "webm";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    narrative = String(form.get("narrative") || "");
    reporterRole = String(form.get("reporterRole") || "me");
    district = String(form.get("district") || "");
    language = String(form.get("language") || "en");
    const audio = form.get("audio");
    if (audio && audio instanceof File && audio.size > 0) {
      const arrayBuffer = await audio.arrayBuffer();
      audioBuffer = Buffer.from(arrayBuffer);
      if (audio.type.includes("wav")) audioExt = "wav";
    }
  } else {
    const body = await request.json();
    narrative = String(body.narrative || "");
    reporterRole = String(body.reporterRole || "me");
    district = String(body.district || "");
    language = String(body.language || "en");
  }

  if (!narrative.trim() && !audioBuffer) {
    return NextResponse.json({ error: "Report cannot be empty" }, { status: 400 });
  }

  // Server-side scrub as a second pass (client already scrubs before send).
  const { text: scrubbed } = scrubText(narrative);

  const code = generateCaseCode();
  const pin = generatePin();
  const pinHash = hashPin(pin);
  const now = new Date().toISOString();

  let audioPath: string | null = null;
  if (audioBuffer) {
    const filename = `${code}.${audioExt}`;
    const fullPath = path.join(uploadsDir, filename);
    fs.writeFileSync(fullPath, audioBuffer);
    audioPath = filename;
  }

  const base = rulesTriage(scrubbed);
  const triage = await enhanceTriage(scrubbed, base);

  db.prepare(
    `INSERT INTO cases
      (code, pin_hash, country, language, category, urgency, status, reporter_role, narrative, district, has_audio, audio_path, triage_json, created_at, updated_at)
     VALUES (?, ?, 'UG', ?, NULL, ?, 'received', ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    code,
    pinHash,
    language,
    triage.urgency,
    reporterRole,
    scrubbed,
    district || null,
    audioBuffer ? 1 : 0,
    audioPath,
    JSON.stringify(triage),
    now,
    now
  );

  db.prepare(
    `INSERT INTO status_events (case_code, status, note, created_at) VALUES (?, 'received', 'Report submitted', ?)`
  ).run(code, now);

  if (scrubbed.trim()) {
    db.prepare(
      `INSERT INTO messages (case_code, sender, body, created_at) VALUES (?, 'survivor', ?, ?)`
    ).run(code, scrubbed, now);
  }

  return NextResponse.json({ code, pin });
}

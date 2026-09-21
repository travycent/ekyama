"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";

interface CaseDetail {
  code: string;
  status: string;
  urgency: string;
  narrative: string;
  country: string;
  district: string | null;
  reporter_role: string;
  has_audio: number;
  triage_json: string | null;
}
interface CaseMessage {
  sender: string;
  body: string;
  created_at: string;
}

const STATUS_OPTIONS = ["received", "reviewing", "in_progress", "referred", "closed"];

export default function CounsellorCaseDetail({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState("received");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/counsellor/case/${code}?token=${encodeURIComponent(token)}`);
    if (!res.ok) return;
    const data = await res.json();
    setCaseData(data.case);
    setMessages(data.messages);
    setStatus(data.case.status);
  }, [code, token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const sendReply = async (newStatus?: string) => {
    setSaving(true);
    await fetch(`/api/counsellor/case/${code}/action?token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply, status: newStatus || status }),
    });
    setReply("");
    setSaving(false);
    load();
  };

  if (!caseData) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">Loading…</main>
      </div>
    );
  }

  let triage: { flags?: string[]; summary?: string; source?: string } = {};
  try {
    triage = caseData.triage_json ? JSON.parse(caseData.triage_json) : {};
  } catch {
    triage = {};
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-mono text-xl font-bold text-violet-900">{caseData.code}</h1>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800">
            {caseData.urgency}
          </span>
        </div>

        <div className="mb-4 rounded-lg border border-neutral-200 bg-white p-4">
          <p className="mb-1 text-xs uppercase tracking-wide text-neutral-500">
            Reported for: {caseData.reporter_role} · Country: {caseData.country} · District:{" "}
            {caseData.district || "not given"}
          </p>
          <p className="whitespace-pre-wrap text-sm text-neutral-900">
            {caseData.narrative || "(no written text — see audio)"}
          </p>
          {!!caseData.has_audio && (
            <audio
              controls
              src={`/api/audio/${caseData.code}?token=${encodeURIComponent(token)}`}
              className="mt-3 w-full"
            />
          )}
        </div>

        {triage.flags && triage.flags.length > 0 && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <div className="mb-1 font-semibold">
              Triage flags ({triage.source === "rules+ai" ? "rules + AI" : "rules-based"}):
            </div>
            <div className="flex flex-wrap gap-1">
              {triage.flags.map((f, i) => (
                <span key={i} className="rounded bg-amber-100 px-2 py-0.5">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4 flex items-center gap-2">
          <label className="text-sm text-neutral-700">Status:</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              sendReply(e.target.value);
            }}
            className="rounded-md border border-neutral-300 p-1 text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                m.sender === "counsellor"
                  ? "self-end bg-violet-700 text-white"
                  : "self-start bg-neutral-100 text-neutral-900"
              }`}
            >
              {m.body}
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write a trauma-informed reply…"
            rows={3}
            className="flex-1 rounded-md border border-neutral-300 p-2 text-sm"
          />
        </div>
        <button
          onClick={() => sendReply()}
          disabled={saving || !reply.trim()}
          className="mt-2 self-start rounded-md bg-violet-800 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-900 disabled:opacity-50"
        >
          Send reply
        </button>
      </main>
    </div>
  );
}

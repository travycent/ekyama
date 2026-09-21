"use client";

import { Suspense, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import { useLang } from "@/lib/LangContext";

interface CaseMessage {
  sender: string;
  body: string;
  created_at: string;
}
interface CaseEvent {
  status: string;
  note: string | null;
  created_at: string;
}
interface CaseData {
  code: string;
  status: string;
  urgency: string;
  hasAudio: boolean;
  messages: CaseMessage[];
  events: CaseEvent[];
}

function TrackContent() {
  const { t } = useLang();
  const params = useSearchParams();

  const [code, setCode] = useState(params.get("code") || "");
  const [pin, setPin] = useState("");
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");

  const load = useCallback(async () => {
    if (!code || !pin) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/case/${encodeURIComponent(code)}?pin=${encodeURIComponent(pin)}`);
      if (!res.ok) {
        setError(t("track_code_label") + "/" + t("track_pin_label") + " incorrect.");
        setCaseData(null);
        return;
      }
      const data = await res.json();
      setCaseData(data);
    } finally {
      setLoading(false);
    }
  }, [code, pin, t]);

  const sendMessage = async () => {
    if (!draft.trim()) return;
    const res = await fetch(`/api/case/${encodeURIComponent(code)}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, message: draft }),
    });
    if (res.ok) {
      setDraft("");
      load();
    }
  };

  if (!caseData) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">
        <h1 className="text-2xl font-bold text-violet-900">{t("track_title")}</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
          className="mt-6 flex flex-col gap-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              {t("track_code_label")}
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full rounded-md border border-neutral-300 p-2 font-mono text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              {t("track_pin_label")}
            </label>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              inputMode="numeric"
              className="w-full rounded-md border border-neutral-300 p-2 font-mono text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-violet-800 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-900 disabled:opacity-50"
          >
            {t("track_open")}
          </button>
        </form>
      </main>
    );
  }

  const statusKey = `status_${caseData.status}`;

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-violet-900 font-mono">{caseData.code}</h1>
        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800">
          {t(statusKey) !== statusKey ? t(statusKey) : caseData.status}
        </span>
      </div>

      {caseData.hasAudio && (
        <audio
          controls
          src={`/api/audio/${caseData.code}?pin=${encodeURIComponent(pin)}`}
          className="mb-4 w-full"
        />
      )}

      <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4">
        {caseData.messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              m.sender === "counsellor"
                ? "self-start bg-neutral-100 text-neutral-900"
                : "self-end bg-violet-700 text-white"
            }`}
          >
            {m.body}
          </div>
        ))}
        {caseData.messages.length === 0 && (
          <p className="text-sm text-neutral-500">No messages yet.</p>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("chat_placeholder")}
          className="flex-1 rounded-md border border-neutral-300 p-2 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button
          onClick={sendMessage}
          className="rounded-md bg-violet-800 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-900"
        >
          {t("chat_send")}
        </button>
      </div>
    </main>
  );
}

export default function TrackPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Suspense fallback={null}>
        <TrackContent />
      </Suspense>
    </div>
  );
}

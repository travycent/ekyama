"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/Header";

interface CaseRow {
  code: string;
  urgency: string;
  status: string;
  language: string;
  district: string | null;
  reporter_role: string;
  has_audio: number;
  created_at: string;
  updated_at: string;
}

const urgencyColor: Record<string, string> = {
  critical: "bg-red-600 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-amber-400 text-amber-950",
  low: "bg-neutral-200 text-neutral-700",
  unassessed: "bg-neutral-100 text-neutral-500",
};

export default function CounsellorPage() {
  const [token, setToken] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  // One-time read of a saved sign-in token on mount (client-only storage).
  useEffect(() => {
    const stored = window.localStorage.getItem("ekyama_counsellor_token");
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(stored);
      setSignedIn(true);
    }
  }, []);

  const loadCases = useCallback(async (t: string) => {
    const res = await fetch(`/api/counsellor/cases?token=${encodeURIComponent(t)}`);
    if (!res.ok) {
      setError("Invalid token.");
      setSignedIn(false);
      window.localStorage.removeItem("ekyama_counsellor_token");
      return;
    }
    const data = await res.json();
    setCases(data.cases);
    setSignedIn(true);
    window.localStorage.setItem("ekyama_counsellor_token", t);
  }, []);

  // Polls the counsellor case list on an interval while signed in.
  useEffect(() => {
    if (signedIn && token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadCases(token);
      const interval = setInterval(() => loadCases(token), 8000);
      return () => clearInterval(interval);
    }
  }, [signedIn, token, loadCases]);

  if (!signedIn) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-sm flex-1 px-4 py-16">
          <h1 className="text-xl font-bold text-violet-900">Counsellor sign-in</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Demo token: <code className="bg-neutral-100 px-1">demo-counsellor</code> (or the
            value of <code className="bg-neutral-100 px-1">COUNSELLOR_TOKEN</code> if set).
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadCases(token);
            }}
            className="mt-4 flex flex-col gap-3"
          >
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Access token"
              className="rounded-md border border-neutral-300 p-2 text-sm"
            />
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button className="rounded-md bg-violet-800 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-900">
              Sign in
            </button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <h1 className="mb-4 text-xl font-bold text-violet-900">Cases ({cases.length})</h1>
        <div className="flex flex-col gap-2">
          {cases.map((c) => (
            <Link
              key={c.code}
              href={`/counsellor/${c.code}?token=${encodeURIComponent(token)}`}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 hover:border-violet-400"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    urgencyColor[c.urgency] || urgencyColor.unassessed
                  }`}
                >
                  {c.urgency}
                </span>
                <span className="font-mono text-sm">{c.code}</span>
                {c.has_audio ? <span title="Has audio">🎙️</span> : null}
                {c.district && <span className="text-xs text-neutral-500">{c.district}</span>}
              </div>
              <span className="text-xs uppercase tracking-wide text-neutral-500">{c.status}</span>
            </Link>
          ))}
          {cases.length === 0 && (
            <p className="text-sm text-neutral-500">No reports yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}

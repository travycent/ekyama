"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useLang } from "@/lib/LangContext";

interface Stats {
  generatedAt: string;
  totalReports: number;
  byStatus: Record<string, number>;
  byUrgency: Record<string, number>;
  byCountry: Record<string, number>;
  respondedCount: number;
  medianResponseMinutes: number | null;
}

const URGENCY_ORDER = ["critical", "high", "medium", "low"];
const URGENCY_COLOR: Record<string, string> = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-neutral-100 text-neutral-700",
};

function formatMinutes(mins: number | null): string {
  if (mins === null) return "—";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem === 0 ? `${hours} hr` : `${hours} hr ${rem} min`;
}

function Bar({ label, count, total, colorClass }: { label: string; count: number; total: number; colorClass: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-neutral-800">{label}</span>
        <span className="text-neutral-500">
          {count} ({pct}%)
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function StatsPage() {
  const { t } = useLang();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then(setStats)
      .catch(() => setError(true));
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold text-violet-900">{t("stats_title")}</h1>
        <p className="mt-2 text-neutral-600">{t("stats_intro")}</p>
        <div className="mt-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          {t("stats_privacy_note")}
        </div>

        {error && (
          <p className="mt-6 text-sm text-red-700">
            Could not load statistics right now. Please try again shortly.
          </p>
        )}

        {!stats && !error && (
          <p className="mt-6 text-sm text-neutral-500">Loading…</p>
        )}

        {stats && (
          <div className="mt-6 flex flex-col gap-8 pb-10">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-violet-200 bg-violet-50 p-4 text-center">
                <div className="text-3xl font-bold text-violet-900">{stats.totalReports}</div>
                <div className="mt-1 text-xs text-violet-800">{t("stats_total_reports")}</div>
              </div>
              <div className="rounded-lg border border-violet-200 bg-violet-50 p-4 text-center">
                <div className="text-3xl font-bold text-violet-900">
                  {formatMinutes(stats.medianResponseMinutes)}
                </div>
                <div className="mt-1 text-xs text-violet-800">{t("stats_median_response")}</div>
              </div>
              <div className="rounded-lg border border-violet-200 bg-violet-50 p-4 text-center">
                <div className="text-3xl font-bold text-violet-900">{stats.respondedCount}</div>
                <div className="mt-1 text-xs text-violet-800">{t("stats_responded_count")}</div>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-neutral-800">{t("stats_by_urgency")}</h2>
              <div className="flex flex-col gap-3">
                {URGENCY_ORDER.filter((u) => stats.byUrgency[u]).map((u) => (
                  <Bar
                    key={u}
                    label={u.charAt(0).toUpperCase() + u.slice(1)}
                    count={stats.byUrgency[u]}
                    total={stats.totalReports}
                    colorClass={URGENCY_COLOR[u] ?? "bg-neutral-300"}
                  />
                ))}
                {stats.totalReports === 0 && (
                  <p className="text-sm text-neutral-500">{t("stats_no_data")}</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-neutral-800">{t("stats_by_status")}</h2>
              <div className="flex flex-col gap-3">
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  <Bar
                    key={status}
                    label={t(`status_${status}`)}
                    count={count}
                    total={stats.totalReports}
                    colorClass="bg-violet-500"
                  />
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-neutral-800">{t("stats_by_country")}</h2>
              <div className="flex flex-col gap-3">
                {Object.entries(stats.byCountry).map(([country, count]) => (
                  <Bar
                    key={country}
                    label={country}
                    count={count}
                    total={stats.totalReports}
                    colorClass="bg-emerald-500"
                  />
                ))}
              </div>
            </div>

            <p className="text-xs text-neutral-400">
              {t("stats_generated_at")}: {new Date(stats.generatedAt).toLocaleString()}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

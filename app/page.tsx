"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { useLang } from "@/lib/LangContext";
import { useSimpleMode } from "@/lib/SimpleModeContext";

const SIMPLE_CARDS = [
  { href: "/report", icon: "📢", key: "cta_report" },
  { href: "/track", icon: "🔎", key: "cta_track" },
  { href: "/help", icon: "🤝", key: "cta_help" },
  { href: "/guide", icon: "❓", key: "cta_guide" },
] as const;

export default function Home() {
  const { t } = useLang();
  const { simpleMode } = useSimpleMode();

  if (simpleMode) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
          <div className="rounded-lg border-2 border-amber-400 bg-amber-50 px-4 py-4 text-center text-base font-semibold text-amber-900">
            📞 {t("disclaimer_banner")}
          </div>

          <h1 className="text-center text-4xl font-bold text-violet-900">{t("appName")}</h1>

          <div className="grid gap-4 sm:grid-cols-2">
            {SIMPLE_CARDS.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="flex flex-col items-center gap-3 rounded-2xl border-2 border-violet-200 bg-violet-50 p-8 text-center transition hover:border-violet-500 hover:bg-violet-100"
              >
                <span className="text-6xl" aria-hidden="true">
                  {card.icon}
                </span>
                <span className="text-2xl font-bold text-violet-900">{t(card.key)}</span>
              </Link>
            ))}
          </div>

          <Link
            href="/ussd-demo"
            className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-violet-300 bg-white p-6 text-center transition hover:border-violet-500"
          >
            <span className="text-4xl" aria-hidden="true">
              ☎️
            </span>
            <span className="text-xl font-bold text-violet-900">Feature phone demo</span>
          </Link>

          <div className="mt-auto flex flex-wrap items-center justify-center gap-4 border-t border-neutral-200 pt-4 text-base">
            <Link href="/lite" className="underline hover:text-neutral-700">
              {t("cta_lite")}
            </Link>
            <Link href="/stats" className="underline hover:text-neutral-700">
              {t("cta_stats")}
            </Link>
            <Link href="/counsellor" className="underline hover:text-neutral-700">
              Counsellor sign-in
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10">
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {t("disclaimer_banner")}
        </div>

        <div className="flex flex-col items-start gap-3">
          <h1 className="text-4xl font-bold tracking-tight text-violet-900">{t("appName")}</h1>
          <p className="text-lg text-neutral-700">{t("tagline")}</p>
          <p className="max-w-2xl text-neutral-600">{t("home_lead")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/report"
            className="rounded-xl border border-violet-200 bg-violet-50 p-5 transition hover:border-violet-400 hover:bg-violet-100"
          >
            <div className="text-xl font-semibold text-violet-900">{t("cta_report")}</div>
          </Link>
          <Link
            href="/track"
            className="rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-400"
          >
            <div className="text-xl font-semibold text-neutral-900">{t("cta_track")}</div>
          </Link>
          <Link
            href="/help"
            className="rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-400"
          >
            <div className="text-xl font-semibold text-neutral-900">{t("cta_help")}</div>
          </Link>
          <Link
            href="/guide"
            className="rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-400"
          >
            <div className="text-xl font-semibold text-neutral-900">{t("cta_guide")}</div>
          </Link>
        </div>

        <Link
          href="/ussd-demo"
          className="flex items-center justify-between rounded-xl border-2 border-dashed border-violet-300 bg-violet-50/60 p-5 transition hover:border-violet-500 hover:bg-violet-100"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-violet-700 px-2 py-0.5 text-xs font-bold text-white">
                DEMO
              </span>
              <span className="text-xl font-semibold text-violet-900">
                Try it as a feature phone (USSD)
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-600">
              No smartphone or data needed — see the same report flow work over a simulated USSD
              keypad session.
            </p>
          </div>
          <span className="text-2xl text-violet-500">→</span>
        </Link>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 pt-4 text-sm text-neutral-500">
          <Link href="/lite" className="underline hover:text-neutral-700">
            {t("cta_lite")}
          </Link>
          <Link href="/stats" className="underline hover:text-neutral-700">
            {t("cta_stats")}
          </Link>
          <Link href="/counsellor" className="underline hover:text-neutral-700">
            Counsellor sign-in
          </Link>
        </div>
      </main>
    </div>
  );
}

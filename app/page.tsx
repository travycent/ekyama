"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { useLang } from "@/lib/LangContext";

export default function Home() {
  const { t } = useLang();

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

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 pt-4 text-sm text-neutral-500">
          <div className="flex flex-wrap gap-4">
            <Link href="/lite" className="underline hover:text-neutral-700">
              {t("cta_lite")}
            </Link>
            <Link href="/ussd-demo" className="underline hover:text-neutral-700">
              Try it as a feature phone (USSD demo)
            </Link>
          </div>
          <Link href="/counsellor" className="underline hover:text-neutral-700">
            Counsellor sign-in
          </Link>
        </div>
      </main>
    </div>
  );
}

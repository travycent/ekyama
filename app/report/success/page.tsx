"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useLang } from "@/lib/LangContext";

function SuccessContent() {
  const { t } = useLang();
  const params = useSearchParams();
  const code = params.get("code") || "";
  const pin = params.get("pin") || "";

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 text-center">
      <div className="rounded-xl border border-green-200 bg-green-50 p-6">
        <h1 className="text-xl font-bold text-green-900">{t("report_success_title")}</h1>
        <p className="mt-2 text-sm text-green-800">{t("report_success_body")}</p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-white p-4">
            <div className="text-xs uppercase tracking-wide text-neutral-500">
              {t("case_code_label")}
            </div>
            <div className="mt-1 text-2xl font-mono font-bold text-violet-900">{code}</div>
          </div>
          <div className="rounded-lg bg-white p-4">
            <div className="text-xs uppercase tracking-wide text-neutral-500">
              {t("case_pin_label")}
            </div>
            <div className="mt-1 text-2xl font-mono font-bold text-violet-900">{pin}</div>
          </div>
        </div>

        <Link
          href={`/track?code=${code}`}
          className="mt-6 inline-block rounded-md bg-violet-800 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-900"
        >
          {t("go_to_case")}
        </Link>
      </div>
    </main>
  );
}

export default function ReportSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Suspense fallback={null}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import { useSimpleMode } from "@/lib/SimpleModeContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CountrySwitcher from "@/components/CountrySwitcher";

export default function Header() {
  const { t } = useLang();
  const { simpleMode, toggleSimpleMode } = useSimpleMode();
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-violet-800">
          {t("appName")}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={toggleSimpleMode}
            title={t("simple_mode_toggle_label")}
            aria-pressed={simpleMode}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              simpleMode
                ? "border-violet-600 bg-violet-600 text-white"
                : "border-neutral-300 bg-white text-neutral-700 hover:border-violet-400"
            }`}
          >
            <span aria-hidden="true">🔍</span>
            {simpleMode ? t("simple_mode_on") : t("simple_mode_off")}
          </button>
          <CountrySwitcher />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

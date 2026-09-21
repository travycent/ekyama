"use client";

import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CountrySwitcher from "@/components/CountrySwitcher";

export default function Header() {
  const { t } = useLang();
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-violet-800">
          {t("appName")}
        </Link>
        <div className="flex items-center gap-3">
          <CountrySwitcher />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

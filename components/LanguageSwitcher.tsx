"use client";

import { useLang } from "@/lib/LangContext";
import { languages } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as typeof lang)}
      aria-label="Language"
      className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-800"
    >
      {languages.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}

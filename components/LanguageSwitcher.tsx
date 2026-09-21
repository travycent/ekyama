"use client";

import { useEffect } from "react";
import { useLang } from "@/lib/LangContext";
import { useCountry } from "@/lib/CountryContext";
import { languages, Lang } from "@/lib/i18n";
import { getCountryPack } from "@/lib/countryPack";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const { country } = useCountry();

  const pack = getCountryPack(country);
  const available = languages.filter((l) => pack.languages.includes(l.code));

  // If the current language isn't offered by the newly-selected country's
  // pack (e.g. switching from Uganda's Luganda to Kenya), fall back to
  // English rather than silently showing an option that isn't in the list.
  useEffect(() => {
    if (!available.some((l) => l.code === lang)) {
      setLang("en");
    }
  }, [country, lang, available, setLang]);

  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as Lang)}
      aria-label="Language"
      className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-800"
    >
      {available.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}

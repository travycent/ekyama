"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { useLang } from "@/lib/LangContext";
import { useCountry } from "@/lib/CountryContext";
import { getCountryPack } from "@/lib/countryPack";

interface Match {
  kind: "legal" | "hotline" | "organization";
  title: string;
  body: string;
  sourceUrl: string | null;
  lastVerified: string;
  verified: boolean;
}

function search(query: string, lang: "en" | "lg" | "sw", country: string): Match[] {
  const pack = getCountryPack(country);
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter((w) => w.length > 2);
  if (terms.length === 0) return [];

  const matches: Match[] = [];

  for (const l of pack.legal) {
    const haystack = `${l.title.en} ${l.summary}`.toLowerCase();
    if (terms.some((term) => haystack.includes(term))) {
      matches.push({
        kind: "legal",
        title: l.title[lang] || l.title.en,
        body: l.summary + (l.penalty ? ` Penalty: ${l.penalty}` : ""),
        sourceUrl: l.sourceUrl,
        lastVerified: l.lastVerified,
        verified: l.verified,
      });
    }
  }

  for (const h of pack.hotlines) {
    const haystack = `${h.name.en} ${h.operator} ${h.notes}`.toLowerCase();
    if (terms.some((term) => haystack.includes(term))) {
      matches.push({
        kind: "hotline",
        title: `${h.name[lang] || h.name.en} — ${h.number}`,
        body: `${h.operator}. ${h.notes}`,
        sourceUrl: h.sourceUrl,
        lastVerified: h.lastVerified,
        verified: h.verified,
      });
    }
  }

  for (const o of pack.organizations) {
    const haystack = `${o.name} ${o.description}`.toLowerCase();
    if (terms.some((term) => haystack.includes(term))) {
      matches.push({
        kind: "organization",
        title: o.name,
        body: o.description,
        sourceUrl: o.sourceUrl,
        lastVerified: o.lastVerified,
        verified: o.verified,
      });
    }
  }

  return matches;
}

export default function GuidePage() {
  const { t, lang } = useLang();
  const { country } = useCountry();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Match[] | null>(null);

  const runSearch = () => {
    setResults(search(query, lang, country));
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold text-violet-900">{t("guide_title")}</h1>
        <p className="mt-2 text-neutral-600">{t("guide_intro")}</p>

        <div className="mt-4 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("guide_placeholder")}
            className="flex-1 rounded-md border border-neutral-300 p-2 text-sm"
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
          />
          <button
            onClick={runSearch}
            className="rounded-md bg-violet-800 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-900"
          >
            {t("guide_ask")}
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {results && results.length === 0 && (
            <p className="text-sm text-neutral-600">{t("guide_no_answer")}</p>
          )}
          {results?.map((m, i) => (
            <div key={i} className="rounded-lg border border-neutral-200 bg-white p-4">
              <span className="mb-1 inline-block rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">
                {m.kind}
              </span>
              <div className="font-semibold text-neutral-900">{m.title}</div>
              <p className="mt-1 text-sm text-neutral-600">{m.body}</p>
              {m.verified ? (
                <div className="mt-2 flex gap-4 text-xs text-neutral-500">
                  {m.sourceUrl && (
                    <a href={m.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
                      {t("source_label")}
                    </a>
                  )}
                  <span>
                    {t("last_verified_label")}: {m.lastVerified}
                  </span>
                </div>
              ) : (
                <span className="mt-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  {t("unverified_badge")}
                </span>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

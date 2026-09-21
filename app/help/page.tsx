"use client";

import Header from "@/components/Header";
import { useLang } from "@/lib/LangContext";
import { useCountry } from "@/lib/CountryContext";
import { getCountryPack } from "@/lib/countryPack";

function SourceBadge({
  verified,
  sourceUrl,
  lastVerified,
  sourceLabel,
  lastVerifiedLabel,
  unverifiedLabel,
}: {
  verified: boolean;
  sourceUrl: string | null;
  lastVerified: string;
  sourceLabel: string;
  lastVerifiedLabel: string;
  unverifiedLabel: string;
}) {
  if (!verified) {
    return (
      <span className="mt-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
        {unverifiedLabel}
      </span>
    );
  }
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
      {sourceUrl && (
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
          {sourceLabel}
        </a>
      )}
      <span>
        {lastVerifiedLabel}: {lastVerified}
      </span>
    </div>
  );
}

export default function HelpPage() {
  const { t, lang } = useLang();
  const { country } = useCountry();
  const pack = getCountryPack(country);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold text-violet-900">{t("help_title")}</h1>
        <p className="mt-2 text-neutral-600">{t("help_intro")}</p>

        <h2 className="mt-6 mb-2 text-lg font-semibold text-neutral-800">Hotlines</h2>
        <div className="flex flex-col gap-3">
          {pack.hotlines.map((h) => (
            <div key={h.id} className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900">
                  {h.name[lang] || h.name.en}
                </span>
                <span className="font-mono text-lg text-violet-800">{h.number}</span>
              </div>
              <p className="mt-1 text-sm text-neutral-600">{h.operator}</p>
              <p className="mt-1 text-xs text-neutral-500">{h.notes}</p>
              <SourceBadge
                verified={h.verified}
                sourceUrl={h.sourceUrl}
                lastVerified={h.lastVerified}
                sourceLabel={t("source_label")}
                lastVerifiedLabel={t("last_verified_label")}
                unverifiedLabel={t("unverified_badge")}
              />
            </div>
          ))}
        </div>

        <h2 className="mt-8 mb-2 text-lg font-semibold text-neutral-800">Organizations</h2>
        <div className="flex flex-col gap-3">
          {pack.organizations.map((o) => (
            <div key={o.id} className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-neutral-900">{o.name}</span>
                <div className="flex gap-1 text-xs">
                  {o.servesMale && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">
                      serves men
                    </span>
                  )}
                  {o.servesFemale && (
                    <span className="rounded-full bg-pink-100 px-2 py-0.5 text-pink-800">
                      serves women
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-1 text-sm text-neutral-600">{o.description}</p>
              <SourceBadge
                verified={o.verified}
                sourceUrl={o.sourceUrl}
                lastVerified={o.lastVerified}
                sourceLabel={t("source_label")}
                lastVerifiedLabel={t("last_verified_label")}
                unverifiedLabel={t("unverified_badge")}
              />
            </div>
          ))}
        </div>

        <h2 className="mt-8 mb-2 text-lg font-semibold text-neutral-800">Know your rights</h2>
        <div className="flex flex-col gap-3 pb-10">
          {pack.legal.map((l) => (
            <div key={l.id} className="rounded-lg border border-neutral-200 bg-white p-4">
              <span className="font-semibold text-neutral-900">
                {l.title[lang] || l.title.en}
              </span>
              <p className="mt-1 text-sm text-neutral-600">{l.summary}</p>
              {l.penalty && (
                <p className="mt-1 text-xs text-neutral-500">Penalty: {l.penalty}</p>
              )}
              <SourceBadge
                verified={l.verified}
                sourceUrl={l.sourceUrl}
                lastVerified={l.lastVerified}
                sourceLabel={t("source_label")}
                lastVerifiedLabel={t("last_verified_label")}
                unverifiedLabel={t("unverified_badge")}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

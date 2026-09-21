import Link from "next/link";
import { getCountryPack, listCountries } from "@/lib/countryPack";

// A deliberately plain, image-free, single-column page for low bandwidth
// or basic devices: no audio player, no language switcher, minimal
// styling — just the text someone needs and a link to the full site.
// (It still shares Next.js's small app shell with the rest of the site;
// a true zero-JS static page is on the roadmap — see the README.)
//
// Country is chosen via a plain server-rendered link (?country=KE), not
// client JS, so this page works even with scripting off or unreliable.

export default async function LitePage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  const { country: countryParam } = await searchParams;
  const country = countryParam?.toUpperCase() === "KE" ? "KE" : "UG";
  const pack = getCountryPack(country);
  const countries = listCountries();

  return (
    <div style={{ fontFamily: "sans-serif", margin: 0, padding: 12, maxWidth: 480 }}>
      <h1 style={{ fontSize: 20 }}>Ekyama — low-data mode</h1>
      <p style={{ fontSize: 14 }}>If you are in immediate danger, call 112 or 999.</p>

      <p style={{ fontSize: 13 }}>
        Country:{" "}
        {countries.map((c, i) => (
          <span key={c.code}>
            {i > 0 && " · "}
            {c.code === country ? (
              <strong>{c.name}</strong>
            ) : (
              <a href={`/lite?country=${c.code}`}>{c.name}</a>
            )}
          </span>
        ))}
      </p>

      <p>
        <a href="/report">Report what happened (text only)</a>
      </p>
      <p>
        <a href="/track">Check on a report</a>
      </p>

      <h2 style={{ fontSize: 16 }}>Hotlines</h2>
      <ul style={{ paddingLeft: 18 }}>
        {pack.hotlines.map((h) => (
          <li key={h.id} style={{ marginBottom: 8, fontSize: 14 }}>
            <strong>{h.name.en}</strong>: {h.number} — {h.operator}
          </li>
        ))}
      </ul>

      <h2 style={{ fontSize: 16 }}>Organizations</h2>
      <ul style={{ paddingLeft: 18 }}>
        {pack.organizations.map((o) => (
          <li key={o.id} style={{ marginBottom: 8, fontSize: 14 }}>
            <strong>{o.name}</strong>: {o.description}
          </li>
        ))}
      </ul>

      <p style={{ fontSize: 12, color: "#555" }}>
        <Link href="/">Go to the full site</Link>
      </p>
    </div>
  );
}

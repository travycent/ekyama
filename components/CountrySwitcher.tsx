"use client";

import { useCountry } from "@/lib/CountryContext";
import { listCountries } from "@/lib/countryPack";

export default function CountrySwitcher() {
  const { country, setCountry } = useCountry();
  const countries = listCountries();

  return (
    <select
      value={country}
      onChange={(e) => setCountry(e.target.value)}
      aria-label="Country"
      className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-800"
    >
      {countries.map((c) => (
        <option key={c.code} value={c.code}>
          {c.name}
        </option>
      ))}
    </select>
  );
}

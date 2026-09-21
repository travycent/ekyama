"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { listCountryCodes } from "@/lib/countryPack";

interface CountryContextValue {
  country: string;
  setCountry: (code: string) => void;
}

const CountryContext = createContext<CountryContextValue | null>(null);

function readStoredCountry(): string {
  if (typeof window === "undefined") return "UG";
  try {
    const stored = window.localStorage.getItem("ekyama_country");
    if (stored && listCountryCodes().includes(stored)) return stored;
  } catch {
    // ignore — private browsing etc.
  }
  return "UG";
}

export function CountryProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState<string>("UG");

  // One-time read of the visitor's saved country on mount (client-only storage).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setCountryState(readStoredCountry()), []);

  const setCountry = (code: string) => {
    setCountryState(code);
    try {
      window.localStorage.setItem("ekyama_country", code);
    } catch {
      // ignore — private browsing etc.
    }
  };

  return (
    <CountryContext.Provider value={{ country, setCountry }}>{children}</CountryContext.Provider>
  );
}

export function useCountry(): CountryContextValue {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error("useCountry must be used within CountryProvider");
  return ctx;
}

"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Lang, t as translate } from "@/lib/i18n";

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

function readStoredLang(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem("ekyama_lang");
    if (stored === "en" || stored === "lg" || stored === "sw") return stored;
  } catch {
    // ignore — private browsing etc.
  }
  return "en";
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // One-time read of the visitor's saved language preference on mount.
  // This intentionally sets state from an effect: it reconciles the
  // server-rendered default ("en") with client-only localStorage, which
  // cannot be read during SSR or in a lazy useState initializer without
  // risking a hydration mismatch.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setLangState(readStoredLang()), []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem("ekyama_lang", l);
    } catch {
      // ignore — private browsing etc.
    }
  };

  const t = (key: string) => translate(lang, key);

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}

"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface SimpleModeContextValue {
  simpleMode: boolean;
  setSimpleMode: (value: boolean) => void;
  toggleSimpleMode: () => void;
}

const SimpleModeContext = createContext<SimpleModeContextValue | null>(null);

function readStoredSimpleMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem("ekyama_simple_mode") === "1";
  } catch {
    // ignore — private browsing etc.
  }
  return false;
}

export function SimpleModeProvider({ children }: { children: ReactNode }) {
  const [simpleMode, setSimpleModeState] = useState(false);

  // One-time read of the visitor's saved preference on mount (client-only storage).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setSimpleModeState(readStoredSimpleMode()), []);

  const setSimpleMode = (value: boolean) => {
    setSimpleModeState(value);
    try {
      window.localStorage.setItem("ekyama_simple_mode", value ? "1" : "0");
    } catch {
      // ignore — private browsing etc.
    }
  };

  const toggleSimpleMode = () => setSimpleMode(!simpleMode);

  return (
    <SimpleModeContext.Provider value={{ simpleMode, setSimpleMode, toggleSimpleMode }}>
      {children}
    </SimpleModeContext.Provider>
  );
}

export function useSimpleMode(): SimpleModeContextValue {
  const ctx = useContext(SimpleModeContext);
  if (!ctx) throw new Error("useSimpleMode must be used within SimpleModeProvider");
  return ctx;
}

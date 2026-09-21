"use client";

import { useEffect } from "react";
import { useLang } from "@/lib/LangContext";

const SAFE_URL = "https://www.google.com";

function leaveNow() {
  try {
    // Replace history so back-button doesn't return to Ekyama.
    window.location.replace(SAFE_URL);
  } catch {
    window.location.href = SAFE_URL;
  }
}

export default function QuickExit() {
  const { t } = useLang();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") leaveNow();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <button
      onClick={leaveNow}
      aria-label={t("quick_exit")}
      className="fixed top-3 right-3 z-50 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
    >
      {t("quick_exit")}
    </button>
  );
}

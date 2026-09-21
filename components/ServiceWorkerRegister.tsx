"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Non-fatal: the app works fully online without it. Older/basic
        // browsers that don't support service workers just skip offline
        // caching and installability.
      });
    }
  }, []);

  return null;
}

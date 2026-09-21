import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/LangContext";
import { CountryProvider } from "@/lib/CountryContext";
import { SimpleModeProvider } from "@/lib/SimpleModeContext";
import QuickExit from "@/components/QuickExit";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

// Deliberately no next/font/google here: Ekyama is built for low-bandwidth,
// unreliable connections, so it relies on the visitor's own system fonts
// rather than fetching a web font.

export const metadata: Metadata = {
  title: "Ekyama — Speak safely. Be heard.",
  description:
    "A private, anonymous place to report abuse and get real help, for men and women.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#4c1d95",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      {/* Background/text color come from globals.css (body{}), not Tailwind
          utilities here — see the note in globals.css for why. */}
      <body className="min-h-full flex flex-col">
        <CountryProvider>
          <LangProvider>
            <SimpleModeProvider>
              <ServiceWorkerRegister />
              <QuickExit />
              {children}
            </SimpleModeProvider>
          </LangProvider>
        </CountryProvider>
      </body>
    </html>
  );
}

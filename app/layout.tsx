import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/LangContext";
import QuickExit from "@/components/QuickExit";

// Deliberately no next/font/google here: Ekyama is built for low-bandwidth,
// unreliable connections, so it relies on the visitor's own system fonts
// rather than fetching a web font.

export const metadata: Metadata = {
  title: "Ekyama — Speak safely. Be heard.",
  description:
    "A private, anonymous place to report abuse and get real help, for men and women, in Uganda.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        <LangProvider>
          <QuickExit />
          {children}
        </LangProvider>
      </body>
    </html>
  );
}

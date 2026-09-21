"use client";

import { useState } from "react";
import Link from "next/link";
import { useCountry } from "@/lib/CountryContext";
import { getCountryPack } from "@/lib/countryPack";

// A feature-phone / USSD demo simulator.
//
// About one in three phones in East Africa is still a feature phone, not
// a smartphone — the single biggest gap in this build, which is otherwise
// a web app. Standing up a real USSD short code needs a telco account,
// approval, and a permanent public server, none of which are realistic to
// get live for a hackathon submission. This page instead proves the
// ARCHITECTURE extends there: it drives the exact same /api/report and
// /api/case endpoints the web app uses, through a feature-phone-style
// keypad and a small monochrome screen, so the same case store, triage,
// and counsellor console work identically regardless of channel.
//
// What's simplified for the demo: real USSD text entry is multi-tap or
// T9 on a numeric keypad; here a single text field stands in for that, so
// the flow can be tried in a browser. Screen character limits and menu
// structure otherwise follow how a real USSD session behaves.

type Screen =
  | "dial"
  | "menu"
  | "reportCategory"
  | "reportText"
  | "reportSubmitting"
  | "reportDone"
  | "dangerConfirm"
  | "dangerDone"
  | "infoMenu"
  | "infoDetail"
  | "statusCode"
  | "statusPin"
  | "statusResult"
  | "ended"
  | "error";

const USSD_CODE = "*384*7262#";
const SCREEN_CHAR_LIMIT = 182; // roughly what a real USSD screen allows

function truncate(s: string) {
  return s.length > SCREEN_CHAR_LIMIT ? s.slice(0, SCREEN_CHAR_LIMIT - 1) + "…" : s;
}

export default function UssdDemoPage() {
  const { country } = useCountry();
  const pack = getCountryPack(country);

  const [screen, setScreen] = useState<Screen>("dial");
  const [category, setCategory] = useState<string>("");
  const [textInput, setTextInput] = useState("");
  const [caseCode, setCaseCode] = useState("");
  const [casePin, setCasePin] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [statusText, setStatusText] = useState("");
  const [infoPage, setInfoPage] = useState(0);

  const reset = () => {
    setScreen("dial");
    setCategory("");
    setTextInput("");
    setCaseCode("");
    setCasePin("");
    setCodeInput("");
    setPinInput("");
    setStatusText("");
    setInfoPage(0);
  };

  async function submitReport(narrative: string, isDanger: boolean) {
    setScreen("reportSubmitting");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          narrative,
          reporterRole: "me",
          language: "en",
          country,
        }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setCaseCode(data.code);
      setCasePin(data.pin);
      setScreen(isDanger ? "dangerDone" : "reportDone");
    } catch {
      setScreen("error");
    }
  }

  async function checkStatus() {
    setScreen("reportSubmitting");
    try {
      const res = await fetch(
        `/api/case/${encodeURIComponent(codeInput.trim().toUpperCase())}?pin=${encodeURIComponent(pinInput.trim())}`
      );
      if (!res.ok) {
        setStatusText("Case not found, or code/PIN incorrect. Reply 0 to try again.");
        setScreen("statusResult");
        return;
      }
      const data = await res.json();
      const lastMsg = data.messages?.[data.messages.length - 1];
      const lastLine = lastMsg
        ? `Last message (${lastMsg.sender}): ${lastMsg.body}`
        : "No messages yet.";
      setStatusText(`Status: ${data.status}. ${lastLine}`);
      setScreen("statusResult");
    } catch {
      setScreen("error");
    }
  }

  function handleKey(key: string) {
    if (screen === "dial" && key === "send") {
      setScreen("menu");
      return;
    }

    if (screen === "menu") {
      if (key === "1") setScreen("reportCategory");
      else if (key === "2") setScreen("dangerConfirm");
      else if (key === "3") setScreen("infoMenu");
      else if (key === "4") setScreen("statusCode");
      else if (key === "0") setScreen("ended");
      return;
    }

    if (screen === "reportCategory") {
      if (["1", "2", "3"].includes(key)) {
        const labels: Record<string, string> = {
          "1": "Rape or defilement",
          "2": "Domestic abuse",
          "3": "Other",
        };
        setCategory(labels[key]);
        setScreen("reportText");
      } else if (key === "0") {
        setScreen("menu");
      }
      return;
    }

    if (screen === "dangerConfirm") {
      if (key === "1") {
        submitReport("URGENT: I am in danger right now and need help.", true);
      } else if (key === "0") {
        setScreen("menu");
      }
      return;
    }

    if (screen === "infoMenu") {
      if (key === "1") {
        setInfoPage(0);
        setScreen("infoDetail");
      } else if (key === "0") {
        setScreen("menu");
      }
      return;
    }

    if (screen === "infoDetail") {
      if (key === "send" && infoPage < pack.hotlines.length - 1) {
        setInfoPage((p) => p + 1);
      } else if (key === "0") {
        setScreen("infoMenu");
      }
      return;
    }

    if ((screen === "reportDone" || screen === "dangerDone") && key === "0") {
      reset();
      return;
    }

    if (screen === "statusResult" && key === "0") {
      setScreen("statusCode");
      setCodeInput("");
      setPinInput("");
      return;
    }

    if (screen === "ended" && key === "send") {
      reset();
    }
  }

  const bodyText: Record<Screen, string> = {
    dial: `Dial ${USSD_CODE} to start`,
    menu: "EKYAMA\n1. Report abuse\n2. I'm in danger NOW\n3. Get help info\n4. Check my case\n0. Exit",
    reportCategory: "What happened?\n1. Rape or defilement\n2. Domestic abuse\n3. Other\n0. Back",
    reportText: `Category: ${category}\nType a short message, then press Send.`,
    reportSubmitting: "Sending your report…",
    reportDone: truncate(
      `Report received.\nCase code: ${caseCode}\nPIN: ${casePin}\nSave both — you'll need them to check your case.\n0. Menu`
    ),
    dangerConfirm: "Send an urgent alert now?\n1. Yes, send now\n0. Cancel",
    dangerDone: truncate(
      `Urgent alert sent.\nCase code: ${caseCode}  PIN: ${casePin}\nA counsellor has been notified.\n0. Menu`
    ),
    infoMenu: "Help information\n1. Hotlines\n0. Back",
    infoDetail: truncate(
      pack.hotlines[infoPage]
        ? `${pack.hotlines[infoPage].name.en}\n${pack.hotlines[infoPage].number}\n${pack.hotlines[infoPage].operator}\n\n${
            infoPage < pack.hotlines.length - 1 ? "Send=more  " : ""
          }0=Back`
        : "No info available.\n0. Back"
    ),
    statusCode: "Enter your case code, then press Send.",
    statusPin: "Enter your 4-digit PIN, then press Send.",
    statusResult: truncate(`${statusText}\n0. Check another`),
    ended: `Session ended.\nDial ${USSD_CODE} to start again.`,
    error: "Network error. This demo needs the app's own server running.\n0. Menu",
  };

  const showTextEntry = screen === "reportText" || screen === "statusCode" || screen === "statusPin";

  return (
    <div className="flex min-h-screen flex-col items-center bg-neutral-100 px-4 py-8">
      <div className="mb-4 w-full max-w-sm">
        <Link href="/" className="text-sm text-violet-700 underline">
          ← Back to the full Ekyama site
        </Link>
      </div>

      <p className="mb-4 max-w-sm text-center text-xs text-neutral-500">
        This is a local simulator, not a live telco connection — but every button press here
        calls Ekyama&apos;s real report and case-lookup APIs, so it proves the same backend works
        over USSD, not just the web app. Country: <strong>{pack.name}</strong>.
      </p>

      {/* Phone body */}
      <div className="w-full max-w-sm rounded-[2.5rem] border-8 border-neutral-800 bg-neutral-900 p-4 shadow-2xl">
        {/* Screen */}
        <div className="mb-4 min-h-[160px] rounded-md border-2 border-neutral-700 bg-[#c7d6b8] p-3 font-mono text-sm text-[#1a2b12] whitespace-pre-wrap">
          {bodyText[screen]}
        </div>

        {showTextEntry && (
          <div className="mb-3">
            <input
              autoFocus
              type={screen === "statusPin" ? "tel" : "text"}
              value={screen === "reportText" ? textInput : screen === "statusCode" ? codeInput : pinInput}
              onChange={(e) => {
                if (screen === "reportText") setTextInput(e.target.value);
                else if (screen === "statusCode") setCodeInput(e.target.value.toUpperCase());
                else setPinInput(e.target.value);
              }}
              className="w-full rounded border border-neutral-500 bg-neutral-800 px-2 py-1 font-mono text-sm text-green-400"
              placeholder="Type here…"
            />
            <p className="mt-1 text-center text-[10px] text-neutral-400">
              (Real USSD uses multi-tap keypad text entry — simplified here for the demo.)
            </p>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((k) => (
            <button
              key={k}
              onClick={() => handleKey(k)}
              className="rounded-md bg-neutral-700 py-2 text-sm font-semibold text-neutral-100 active:bg-neutral-600"
            >
              {k}
            </button>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              if (screen === "reportText") {
                if (textInput.trim()) submitReport(`${category}: ${textInput.trim()}`, false);
              } else if (screen === "statusCode") {
                if (codeInput.trim()) setScreen("statusPin");
              } else if (screen === "statusPin") {
                if (pinInput.trim()) checkStatus();
              } else {
                handleKey("send");
              }
            }}
            className="rounded-md bg-green-700 py-2 text-sm font-semibold text-white active:bg-green-600"
          >
            Send / OK
          </button>
          <button
            onClick={reset}
            className="rounded-md bg-red-800 py-2 text-sm font-semibold text-white active:bg-red-700"
          >
            End / Reset
          </button>
        </div>
      </div>
    </div>
  );
}

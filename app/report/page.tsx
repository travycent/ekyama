"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useLang } from "@/lib/LangContext";
import { useCountry } from "@/lib/CountryContext";
import { useSimpleMode } from "@/lib/SimpleModeContext";
import { scrubText } from "@/lib/scrub";
import { maskAudioBlob } from "@/lib/voiceMask";

type RecordState = "idle" | "recording" | "recorded" | "masking";

export default function ReportPage() {
  const { t, lang } = useLang();
  const { country } = useCountry();
  const { simpleMode } = useSimpleMode();
  const router = useRouter();

  const [narrative, setNarrative] = useState("");
  const [reporterRole, setReporterRole] = useState("me");
  const [district, setDistrict] = useState("");
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [maskedBlob, setMaskedBlob] = useState<Blob | null>(null);
  const [maskedUrl, setMaskedUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redactCount, setRedactCount] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleNarrativeChange = (value: string) => {
    const { text, redactions } = scrubText(value);
    setNarrative(text);
    if (redactions > 0) setRedactCount((c) => c + redactions);
  };

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        setRecordState("masking");
        try {
          const rawBlob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
          const masked = await maskAudioBlob(rawBlob);
          setMaskedBlob(masked);
          setMaskedUrl(URL.createObjectURL(masked));
          setRecordState("recorded");
        } catch {
          setError("Could not process the recording in this browser. Please try text instead.");
          setRecordState("idle");
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecordState("recording");
    } catch {
      setError("Microphone access was not granted.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const rerecord = () => {
    setMaskedBlob(null);
    setMaskedUrl(null);
    setRecordState("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!narrative.trim() && !maskedBlob) {
      setError("Please write something or record your voice.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const form = new FormData();
      form.set("narrative", narrative);
      form.set("reporterRole", reporterRole);
      form.set("district", district);
      form.set("language", lang);
      form.set("country", country);
      if (maskedBlob) form.set("audio", maskedBlob, "report.wav");

      const res = await fetch("/api/report", { method: "POST", body: form });
      if (!res.ok) throw new Error("Submission failed");
      const data = await res.json();
      router.push(`/report/success?code=${data.code}&pin=${data.pin}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className={simpleMode ? "text-3xl font-bold text-violet-900" : "text-2xl font-bold text-violet-900"}>
          {t("report_title")}
        </h1>
        <p className={simpleMode ? "mt-2 text-lg text-neutral-700" : "mt-2 text-neutral-600"}>
          {t("report_intro")}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-neutral-700">
              {t("report_role_label")}
            </legend>
            {simpleMode ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReporterRole("me")}
                  aria-pressed={reporterRole === "me"}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center ${
                    reporterRole === "me"
                      ? "border-violet-600 bg-violet-50"
                      : "border-neutral-200 bg-white"
                  }`}
                >
                  <span className="text-4xl" aria-hidden="true">🙋</span>
                  <span className="text-lg font-semibold text-neutral-900">{t("role_me")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReporterRole("someone")}
                  aria-pressed={reporterRole === "someone"}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center ${
                    reporterRole === "someone"
                      ? "border-violet-600 bg-violet-50"
                      : "border-neutral-200 bg-white"
                  }`}
                >
                  <span className="text-4xl" aria-hidden="true">🧑‍🤝‍🧑</span>
                  <span className="text-lg font-semibold text-neutral-900">{t("role_someone")}</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={reporterRole === "me"}
                    onChange={() => setReporterRole("me")}
                  />
                  {t("role_me")}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={reporterRole === "someone"}
                    onChange={() => setReporterRole("someone")}
                  />
                  {t("role_someone")}
                </label>
              </div>
            )}
          </fieldset>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              {t("report_narrative_label")}
            </label>
            <textarea
              value={narrative}
              onChange={(e) => handleNarrativeChange(e.target.value)}
              placeholder={t("report_narrative_placeholder")}
              rows={6}
              className="w-full rounded-md border border-neutral-300 p-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <p className="mt-1 text-xs text-neutral-500">{t("scrub_note")}</p>
            {redactCount > 0 && (
              <p className="mt-1 text-xs text-amber-700">
                {redactCount} item(s) automatically removed for your safety.
              </p>
            )}
          </div>

          {!simpleMode && (
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                {t("report_district_label")}
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full rounded-md border border-neutral-300 p-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          )}

          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <p className={simpleMode ? "mb-2 flex items-center gap-2 text-base font-medium text-neutral-700" : "mb-2 text-sm font-medium text-neutral-700"}>
              {simpleMode && <span aria-hidden="true">🎙️</span>}
              {t("report_audio_label")}
            </p>
            <p className="mb-3 text-xs text-neutral-500">{t("voice_masked_note")}</p>

            {recordState === "idle" && (
              <button
                type="button"
                onClick={startRecording}
                className={
                  simpleMode
                    ? "w-full rounded-xl bg-violet-700 px-4 py-5 text-lg font-bold text-white hover:bg-violet-800"
                    : "rounded-md bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800"
                }
              >
                {simpleMode ? `🎙️ ${t("record_start")}` : t("record_start")}
              </button>
            )}
            {recordState === "recording" && (
              <button
                type="button"
                onClick={stopRecording}
                className={
                  simpleMode
                    ? "w-full animate-pulse rounded-xl bg-red-600 px-4 py-5 text-lg font-bold text-white hover:bg-red-700"
                    : "animate-pulse rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                }
              >
                {simpleMode ? `⏹️ ${t("record_stop")}` : t("record_stop")}
              </button>
            )}
            {recordState === "masking" && (
              <p className="text-sm text-neutral-500">Processing…</p>
            )}
            {recordState === "recorded" && maskedUrl && (
              <div className="flex flex-col gap-2">
                <audio controls src={maskedUrl} className="w-full" />
                <button
                  type="button"
                  onClick={rerecord}
                  className="self-start text-sm text-violet-700 underline"
                >
                  {t("record_rerecord")}
                </button>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className={
              simpleMode
                ? "rounded-xl bg-violet-800 px-5 py-5 text-xl font-bold text-white hover:bg-violet-900 disabled:opacity-50"
                : "rounded-md bg-violet-800 px-5 py-3 text-base font-semibold text-white hover:bg-violet-900 disabled:opacity-50"
            }
          >
            {submitting ? t("submitting") : t("submit_report")}
          </button>
        </form>
      </main>
    </div>
  );
}

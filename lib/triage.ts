// Rules-first triage. This ALWAYS runs and produces the floor urgency.
// An optional free-tier AI call can raise the urgency or add a summary,
// but can never lower what the rules decided. If no AI key is configured,
// or the call fails, the rules-based result is used as-is — the app
// never depends on the AI being available.

export type Urgency = "critical" | "high" | "medium" | "low" | "unassessed";

export interface TriageResult {
  urgency: Urgency;
  flags: string[];
  summary: string;
  source: "rules" | "rules+ai";
}

const CRITICAL_TERMS = [
  "kill", "die", "dying", "weapon", "knife", "gun", "suicide", "bleeding",
  "unconscious", "right now", "happening now", "he is here", "she is here",
  "locked in", "can't breathe", "strangl",
];

const HIGH_TERMS = [
  "child", "defilement", "minor", "underage", "rape", "raped", "forced",
  "threatened", "pregnant", "hiv", "hospital", "injury", "injured", "today",
  "last night", "yesterday",
];

const MEDIUM_TERMS = [
  "abuse", "abused", "beaten", "hit", "hits", "hurt", "afraid", "scared",
  "controlling", "isolat", "threat",
];

function scoreText(text: string): { urgency: Urgency; flags: string[] } {
  const t = text.toLowerCase();
  const flags: string[] = [];

  const hit = (terms: string[]) => terms.filter((term) => t.includes(term));

  const critical = hit(CRITICAL_TERMS);
  const high = hit(HIGH_TERMS);
  const medium = hit(MEDIUM_TERMS);

  if (critical.length) flags.push(...critical.map((c) => `critical:${c}`));
  if (high.length) flags.push(...high.map((c) => `high:${c}`));
  if (medium.length) flags.push(...medium.map((c) => `medium:${c}`));

  let urgency: Urgency = "low";
  if (critical.length > 0) urgency = "critical";
  else if (high.length > 0) urgency = "high";
  else if (medium.length > 0) urgency = "medium";

  return { urgency, flags };
}

const URGENCY_RANK: Record<Urgency, number> = {
  unassessed: -1,
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

export function rulesTriage(narrative: string): TriageResult {
  const { urgency, flags } = scoreText(narrative || "");
  return {
    urgency,
    flags,
    summary: narrative.length > 220 ? narrative.slice(0, 220) + "…" : narrative,
    source: "rules",
  };
}

/**
 * Optional free-tier AI enhancement (Groq). Reads GROQ_API_KEY from env.
 * Never lowers the rules-based urgency; only raises it or adds a sharper
 * summary for the counsellor. Fails silently (falls back to rules) on any
 * error, missing key, or timeout, so the demo can never break on this path.
 */
export async function enhanceTriage(narrative: string, base: TriageResult): Promise<TriageResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || !narrative?.trim()) return base;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You write a short, neutral, trauma-informed one-sentence brief for a counsellor from a survivor's report. " +
              "Also classify urgency as one of: low, medium, high, critical. " +
              "Never invent details not in the text. Reply as JSON: {\"summary\": string, \"urgency\": string}.",
          },
          { role: "user", content: narrative.slice(0, 2000) },
        ],
      }),
    });
    clearTimeout(timeout);

    if (!res.ok) return base;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return base;

    const parsed = JSON.parse(content) as { summary?: string; urgency?: string };
    const aiUrgency = (parsed.urgency || "").toLowerCase() as Urgency;

    const finalUrgency =
      aiUrgency in URGENCY_RANK && URGENCY_RANK[aiUrgency] > URGENCY_RANK[base.urgency]
        ? aiUrgency
        : base.urgency;

    return {
      urgency: finalUrgency,
      flags: base.flags,
      summary: parsed.summary?.slice(0, 400) || base.summary,
      source: "rules+ai",
    };
  } catch {
    return base;
  }
}

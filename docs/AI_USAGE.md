# AI usage log — Ekyama

Built with Claude (Anthropic), via Claude Code, on 2026-09-21 for the OSF x Andela Hackathon 2026.

## What the author brought, and what Claude helped with

- **The idea, the target users (male and female survivors), and the core design decisions** (counsellor-first routing before police, no registration, browser-side voice masking, country-pack architecture) came from the author, before involving AI.
- **Naming**: the author proposed candidate names; Claude checked them against existing products/projects via web search (surfacing that "SafeVoice" and "Sauti Salama" were already in use, including by another entry in the same hackathon) and the author chose "Ekyama" (Luganda) from the remaining options.
- **Competitive analysis**: at the author's request, Claude reviewed a competing hackathon entry (`swiftkimani/sauti-salama`, a Kenya-focused USSD/SMS/voice GBV line) to identify genuine differentiation before building, rather than duplicating it.
- **Code, data compilation, and documentation** (this file included) were written by Claude, directed and reviewed by the author at each stage.

## Process, roughly in order

1. Read the hackathon brief; discussed track fit, feasibility, and scope for the build.
2. Named and scoped the product with the author; flagged risks (voice-masking isn't true anonymity, video was cut from scope, Luganda strings need native-speaker review) rather than overselling the demo.
3. Delegated a research subagent to find and cite Uganda-specific GBV hotlines, relevant Penal Code / Domestic Violence Act provisions, and organisations — instructed to explicitly mark anything it couldn't verify rather than presenting it as fact. Output was hand-checked before being transcribed into `data/countries/ug.json`.
4. Scaffolded the Next.js/TypeScript/Tailwind app; built the SQLite schema, case-code/PIN generation, the rules-based triage engine (with an optional, strictly-secondary free-tier AI enhancement path), client-side PII scrubbing, and the Web Audio API voice-masking pipeline.
5. Built all pages: home, report, case tracker + chat, counsellor console, help directory, grounded Q&A guide, low-data page, and the quick-exit control.
6. Ran the production build, then smoke-tested the real flow end-to-end via the API (submit a report → verify triage urgency and PII scrubbing → counsellor replies → survivor sees the reply → wrong PIN and wrong counsellor token both correctly rejected) before writing this documentation.
7. After the author tested the app themselves, they reported two real bugs, which Claude diagnosed and fixed with the author reviewing each fix:
   - **Voice masking wasn't audible.** The original implementation rendered the recording into an `OfflineAudioContext` at a *different* sample rate to try to shift pitch — but per the Web Audio spec, connecting a buffer to a context at a different rate makes the browser silently resample it back to the same pitch, so the "mask" had no real effect. Fixed by using `AudioBufferSourceNode.playbackRate` instead (rendered at the source's own sample rate), which does genuinely shift pitch — verified with a synthetic 440Hz test tone before and after the fix (see `lib/voiceMask.ts`).
   - **The page appeared almost black for some visitors.** Tailwind v4 compiles utility classes into a CSS cascade layer; a plain, unlayered `body { background: var(--background); }` rule in `app/globals.css` was silently overriding the `bg-neutral-50` Tailwind class on `<body>`, and a `prefers-color-scheme: dark` block in the same file made that variable resolve to near-black for anyone with a dark OS/browser theme. Fixed by removing the dark-mode override (Ekyama now uses one consistent light theme regardless of the visitor's system setting) and making `globals.css` the single source of truth for the background color, rather than splitting it between CSS and a Tailwind class on the same element.

## Where AI is used inside the product itself (not just to build it)

An **optional** triage-enhancement call (`lib/triage.ts`) can use a free-tier Groq API key, if the person running the app sets one, to sharpen the counsellor-facing summary and potentially raise (never lower) the urgency rules already assigned. It never sees a name, and its output is never shown to a survivor directly — only to the counsellor. If no key is set, or the call fails for any reason, the app silently falls back to the rules-based result, which is what ships by default and what was used for every test above.

## Second pass: strengthening the submission against the judging criteria

After the initial build worked end-to-end, the author asked directly how to make the submission more competitive against the judging criteria (Uniqueness, Scalability, AI Coding Usage, Presentation). Claude proposed four concrete options with time estimates and a recommendation, the author picked two, and Claude built them:

1. **A second, fully-populated country pack (Kenya) and a working country switcher.** Claude delegated a second research subagent (same rules: cite sources, mark anything unconfirmed as sample data) to compile Kenya's GBV helpline, police/child helplines, Sexual Offences Act and Domestic Violence Act provisions, and relevant organisations. This surfaced a genuine, useful legal contrast — Kenya's rape law is gender-neutral, Uganda's is not — which is now stated directly in the app rather than assumed. Claude then built a `CountryContext` (mirroring the existing `LangContext`), wired `/help`, `/guide`, `/lite` and the report submission to it, and narrowed the language switcher to each country pack's declared languages.
2. **PWA installability and offline caching**, using a real service worker (`public/sw.js`) — not just a manifest — that caches the informational pages (home, help, guide, lite) as the visitor browses and falls back to a static, dependency-free `offline.html` for a first-time offline visitor. It explicitly never caches anything under `/api/`, so a survivor's report or case data never sits in on-device cache storage.
3. **A local USSD/feature-phone simulator** (`/ussd-demo`) — a keypad-and-screen mockup that calls the app's real `/api/report` and `/api/case/[code]` endpoints, rather than a fake/scripted demo. Claude was explicit in the UI copy and docs that this is a local simulator, not a live telco integration, since standing up a real USSD short code needs a paid gateway account and telco approval that isn't realistic for a hackathon submission — the goal was to prove the backend is channel-agnostic, not to overclaim a production SMS/USSD channel.

All three were verified the same way as the first pass: real API/browser tests (a synthetic pitch-shift test to prove the voice-masking fix actually works; headless-browser tests driving the country switcher, the offline service-worker registration, and a full USSD session — including confirming a case submitted through the USSD simulator is a real row the counsellor console can see and reply to), not just a visual check.

## Third pass: transparency and accessibility

The author asked for two final additions, explicitly scoped as the last round before submission:

4. **A public, anonymized transparency/accountability page** (`/stats`, backed by `/api/stats`). It reads straight from the same case database everything else uses, but the API only ever returns counts and a computed median — total reports, breakdowns by status/urgency/country, and the median minutes between a survivor's first message and a counsellor's first reply. Deliberately excluded: case codes, narrative text, district, and any per-case timestamp. Verified by seeding two synthetic cases (one via the report API, one that also got a survivor message and a counsellor reply) and confirming the aggregates — including the median-response calculation — came back correct, then checking the rendered page in a headless browser.
5. **A "simple view" accessibility toggle**, aimed directly at the brief's requirement for accessibility across literacy levels. A small persisted preference (`lib/SimpleModeContext.tsx`, mirroring the existing language/country context pattern) swaps the home, report and help pages into a large-icon, minimal-text layout: big tappable cards with emoji icons instead of a paragraph of copy, icon buttons instead of radio-button labels on the report form, and direct `tel:` call cards instead of a text-heavy hotline list on the help page. It's additive — the same components, same data, same API calls, just a different rendering path — so it can't drift out of sync with the full-detail views. Verified in a headless browser: toggling it on the home page persists across navigation to `/report` and `/help`, and toggling it back off restores the original layout.

## Honesty note

This log intentionally states scope cuts and known weaknesses (see README "Known limitations") rather than presenting the demo as more complete than it is — in keeping with the project's own stated approach to trust and accuracy.

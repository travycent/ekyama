# Ekyama — "Speak safely. Be heard."

An anonymous, privacy-first reporting and support tool for survivors of rape, defilement and domestic abuse — built for **men and women alike**, since most existing tools focus on women and leave male survivors with nowhere to go. Launched for Uganda, with a second country (Kenya) already live to prove it scales.

Built for the **OSF x Andela Hackathon 2026**, track: **Safety, Reporting & Protection**.

> ⚠️ This is a hackathon proof of concept, not a live service. If you are in immediate danger in Uganda, call the police on **112 or 999**.

## The problem

Male survivors of rape, defilement and domestic abuse in Uganda are largely invisible in existing support tools, which are built around women and girls. Cultural stigma, and the fact that Uganda's rape law (Penal Code Act, s.123) applies only to female victims, mean male survivors often don't know where a report even goes, or fear that reporting a same-sex assault could expose them to prosecution under s.145. Ekyama is built so that **no one has to explain or justify who they are before they get help.**

## What it does

- **Report** what happened in text or a masked voice recording — no name, no account. You get back a **case code and a 4-digit PIN**.
- Your recording is **pitch-shifted in your own browser** before it's saved; the original audio never leaves your device.
- Text is **scanned and scrubbed** for phone numbers, emails and ID numbers before it's stored.
- **Track your case** with the code and PIN, and have a **two-way anonymous chat** with a counsellor.
- A **counsellor console** lists cases sorted by urgency, using a rules-based triage that flags danger signals (weapons, "right now", a child involved, etc.) — with an *optional* free-tier AI call that can raise the urgency further, but can never lower it, and only ever produces a brief for the counsellor, never text a survivor sees directly.
- A **help directory** of hotlines, police units and organisations, each with a source link and a "last verified" date — anything we couldn't verify tonight is labelled sample data rather than presented as fact.
- A **grounded Q&A guide** that only answers from that same verified directory and legal notes — it says "I don't have a verified answer" rather than inventing one.
- A **low-data page** (`/lite`) with no audio player, no language switcher, just the essentials, for weak connections.
- **Installs to a home screen and works offline** for the pages that matter most in an emergency — home, help directory, guide and low-data mode are cached as you browse, and a survivor with zero connection still gets the critical hotline numbers from a static fallback page (`public/offline.html`). This is a real, tested service worker (`public/sw.js`), not a manifest-only PWA — it deliberately never caches anything under `/api/` (a survivor's report, case data, chat), so nothing sensitive sits in on-device storage.
- A **feature-phone demo** (`/ussd-demo`) — a local USSD/keypad simulator that drives the *exact same* report and case-lookup APIs as the web app. It's not a live telco connection (that needs a paid gateway account we can't stand up for a hackathon submission), but it proves the backend already works channel-agnostically: the same case store, triage and counsellor console handle a report whether it came in through the web form or this simulated USSD session. Includes a "press 2 for danger now" fast path.
- A **quick-exit** button (and the Escape key) on every page, which replaces the browser history entry so the back button doesn't return to Ekyama.
- **English, Luganda and Kiswahili** throughout the main flows, narrowed automatically to whichever languages the selected country pack actually declares.
- Built **config-driven by country** (`data/countries/*.json`) — Uganda and Kenya both ship fully populated, with a country switcher in the header that changes the help directory, legal notes and available languages everywhere at once (including the low-data and USSD-demo pages). Adding a third country/track is a data file, not a rewrite, which is our answer to the scalability requirement.
- A public **transparency/accountability page** (`/stats`) — total reports, breakdown by urgency/status/country, and median time to a counsellor's first reply, computed live from real case data. No case codes, narrative text, districts or fine-grained timestamps are ever exposed — only aggregate counts, by design.
- A **simple view toggle** (the header button) that swaps the home, report and help pages into a large-icon, minimal-reading layout — tap-to-call cards for hotlines, icon buttons instead of radio labels, bigger touch targets — for people with low literacy or low digital confidence. The preference is remembered on that device.

## Why this, not another GBV app

Anonymous reporting tools already exist (including for Uganda/Kenya). What's missing is a tool that (a) explicitly serves male survivors without requiring them to out themselves or explain why they're there, (b) routes to a **human counsellor before any police step**, given the legal risk described above, and (c) treats "trustworthy information" as a first-class feature — sourced, dated, and honest about what we couldn't verify — not just a reporting form.

## Running it

```bash
git clone <this repo>
cd ekyama
npm install
npm run build
npm run start          # or: npm run dev
```

Open `http://localhost:3000`.

- **Counsellor console**: `http://localhost:3000/counsellor` — sign in with token `demo-counsellor` (or whatever you set `COUNSELLOR_TOKEN` to).
- **Low-data mode**: `http://localhost:3000/lite` (try `?country=KE` too)
- **Feature-phone / USSD demo**: `http://localhost:3000/ussd-demo`
- **Transparency stats**: `http://localhost:3000/stats`
- **Simple view**: click the "Detailed view" / "Simple view" toggle in the header to switch the home, report and help pages to a large-icon, low-literacy layout

No API keys or accounts are required. The app uses a local SQLite file (`data/ekyama.db`, created automatically, git-ignored) and stores uploaded audio in `data/uploads/` (also git-ignored). Delete both to reset to a clean demo state.

### Optional: enable AI-enhanced triage

Copy `.env.example` to `.env` and set `GROQ_API_KEY` (free tier at [console.groq.com/keys](https://console.groq.com/keys)). Without it, the rules-based triage runs alone and the app works identically — the AI call only ever raises urgency or sharpens the counsellor's summary, and every code path is designed to fail silently back to rules if the key is missing, invalid, or the API is unreachable.

## Design decisions worth knowing

- **No registration, ever.** A case code + PIN is the only credential. Losing it means losing access to that case (there is no recovery — a real deployment would need to think harder about this trade-off).
- **Voice never leaves the device unmasked.** Recording, pitch-shifting and re-encoding all happen client-side via the Web Audio API; only the masked file is uploaded.
- **AI never talks to a survivor directly.** It only ever produces a triage brief a counsellor reads. Every word a survivor sees is either their own words, or a message a counsellor typed and sent.
- **Everything works with zero AI configured.** The rules-based triage floor always runs and is what ships by default.
- **Trust is explicit.** Every directory and legal entry carries a source link and a last-verified date; unverified entries are labelled, not silently included.
- **Synthetic data only.** No real survivor data was used in building or testing this. The Uganda and Kenya data packs (`data/countries/ug.json`, `data/countries/ke.json`) were compiled from public sources — see the URLs in each file — verified on 2026-09-21.

## Known limitations (honest roadmap)

- **Luganda strings were machine-translated** and need a native-speaker review before real use; Kiswahili and English are more reliable.
- **The USSD channel is a local simulator, not a live telco connection.** `/ussd-demo` genuinely calls the real report/case APIs, proving the architecture works channel-agnostically, but wiring it to a real short code needs a telco gateway account (e.g. Africa's Talking), approval, and a permanent server — none of which are realistic to stand up for a hackathon submission. That integration is the top roadmap item.
- **The counsellor console uses a single shared demo token**, not per-counsellor accounts or audit logging — not production-safe as-is.
- **No real face-blurring or video support** — video upload was deliberately left out of scope for this proof of concept, since it re-identifies people in a way audio and text don't.
- **Legal notes are not legal advice** and should be reviewed by a lawyer before any real deployment.
- Voice masking (a pitch shift) makes a voice harder to recognise casually; it is **not a guarantee of anonymity** against determined voice analysis, and the app doesn't claim otherwise.

## Written summary and AI usage

See [`docs/WRITTEN_SUMMARY.md`](docs/WRITTEN_SUMMARY.md) and [`docs/AI_USAGE.md`](docs/AI_USAGE.md).

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS, SQLite (`better-sqlite3`) for storage, Web Audio API for on-device voice masking. No external services are required to run the demo.

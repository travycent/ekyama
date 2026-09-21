# Ekyama — "Speak safely. Be heard."

An anonymous, privacy-first reporting and support tool for survivors of rape, defilement and domestic abuse in Uganda — built for **men and women alike**, since most existing tools focus on women and leave male survivors with nowhere to go.

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
- A **quick-exit** button (and the Escape key) on every page, which replaces the browser history entry so the back button doesn't return to Ekyama.
- **English, Luganda and Kiswahili** throughout the main flows.
- Built **config-driven by country** (`data/countries/*.json`) — Uganda ships fully populated; adding a second country/track is a data file, not a rewrite, which is our answer to the scalability requirement.

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
- **Low-data mode**: `http://localhost:3000/lite`

No API keys or accounts are required. The app uses a local SQLite file (`data/ekyama.db`, created automatically, git-ignored) and stores uploaded audio in `data/uploads/` (also git-ignored). Delete both to reset to a clean demo state.

### Optional: enable AI-enhanced triage

Copy `.env.example` to `.env` and set `GROQ_API_KEY` (free tier at [console.groq.com/keys](https://console.groq.com/keys)). Without it, the rules-based triage runs alone and the app works identically — the AI call only ever raises urgency or sharpens the counsellor's summary, and every code path is designed to fail silently back to rules if the key is missing, invalid, or the API is unreachable.

## Design decisions worth knowing

- **No registration, ever.** A case code + PIN is the only credential. Losing it means losing access to that case (there is no recovery — a real deployment would need to think harder about this trade-off).
- **Voice never leaves the device unmasked.** Recording, pitch-shifting and re-encoding all happen client-side via the Web Audio API; only the masked file is uploaded.
- **AI never talks to a survivor directly.** It only ever produces a triage brief a counsellor reads. Every word a survivor sees is either their own words, or a message a counsellor typed and sent.
- **Everything works with zero AI configured.** The rules-based triage floor always runs and is what ships by default.
- **Trust is explicit.** Every directory and legal entry carries a source link and a last-verified date; unverified entries are labelled, not silently included.
- **Synthetic data only.** No real survivor data was used in building or testing this. The Uganda data pack (`data/countries/ug.json`) was compiled from public sources — see the URLs in that file — verified on 2026-09-21.

## Known limitations (honest roadmap)

- **Luganda strings were machine-translated** and need a native-speaker review before real use; Kiswahili and English are more reliable.
- **No SMS/USSD channel yet** — this is a web app (installable as a PWA on a phone home screen), which excludes people on feature phones. That's the single biggest gap versus feature-phone-based tools, and the top roadmap item.
- **The counsellor console uses a single shared demo token**, not per-counsellor accounts or audit logging — not production-safe as-is.
- **No real face-blurring or video support** — video upload was deliberately left out of scope for a 5-hour build, since it re-identifies people in a way audio and text don't.
- **Legal notes are not legal advice** and should be reviewed by a lawyer before any real deployment.
- Voice masking (a pitch shift) makes a voice harder to recognise casually; it is **not a guarantee of anonymity** against determined voice analysis, and the app doesn't claim otherwise.

## Written summary and AI usage

See [`docs/WRITTEN_SUMMARY.md`](docs/WRITTEN_SUMMARY.md) and [`docs/AI_USAGE.md`](docs/AI_USAGE.md).

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS, SQLite (`better-sqlite3`) for storage, Web Audio API for on-device voice masking. No external services are required to run the demo.

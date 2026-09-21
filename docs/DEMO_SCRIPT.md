# Demo video script — Ekyama (target: ~3 minutes)

Record with `npm run build && npm run start`, using only the synthetic examples below — never real personal data.

## 1. Cold open (15s)
- Show the home page. Read the tagline aloud: "Speak safely. Be heard."
- One line to camera: "Most reporting tools in Uganda are built around women and children. Ekyama is for men and women — because right now, male survivors often have nowhere to go."

## 2. The report flow (45s)
- Click **Report what happened**.
- Select "this happened to me."
- Type a short synthetic example, e.g.: *"My partner hit me last night and threatened me. This has happened before."*
- Point out: "No name, no account. And if I'd typed a phone number here, watch—" (type a fake number like `0772123456` into the text and show it get auto-replaced with `[phone number removed]`).
- Optionally demo voice: click **Start recording**, say a test sentence, stop, and play back the masked result — point out the pitch has shifted, and that the original audio never left the browser.
- Submit. Show the **case code and PIN** screen. "This is the only thing you need to come back — no login, no name."

## 3. Tracking + counsellor chat (40s)
- Open **Check on a report**, enter the code and PIN.
- Show the status ("received").
- Switch to the counsellor console (`/counsellor`, sign in with the demo token) in a second window/tab.
- Show the case in the list, sorted by urgency — point out the urgency badge and the triage flags panel, and say: "This came from a rules-based triage that always runs. An optional AI pass can sharpen this for the counsellor, but it never talks to the survivor directly, and it can never lower the urgency the rules already set."
- Type a short, warm counsellor reply and change status to "reviewing."
- Switch back to the survivor's tab, refresh, and show the reply appearing in the chat, and the status badge updating.

## 4. Trust and help directory (30s)
- Open **Find help near you**.
- Scroll to a hotline entry — point out the source link and "last verified" date.
- Scroll to the male-survivor-specific organisation (MOHRAU) and note: "This is one of the few organisations we could verify that explicitly names male survivors as a group they serve."
- Point out the one entry marked "sample data — not yet verified" and say why: "Where we couldn't confirm something in the time we had, we label it rather than present it as fact."

## 5. Language, low-data mode, quick exit (20s)
- Switch the language selector to Luganda or Kiswahili on the home page.
- Visit `/lite` briefly — "a stripped-down page for weak connections or basic devices."
- Tap the red **Quick exit** button (or hit Escape) — show it leaving the page immediately.

## 6. Close (10s)
- Return to the home page.
- "Ekyama: speak safely, be heard — for everyone." Fade out.

## Notes for editing
- Use only synthetic report content, never real personal stories.
- Keep the counsellor console's demo token out of frame if you don't want to show it (or change it via `.env` first).

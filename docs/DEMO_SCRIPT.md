# Demo video script — Ekyama (target: ~3.5 minutes)

Record with `npm run build && npm run start`, using only the synthetic examples below — never real personal data.

## 1. Cold open (15s)
- Show the home page. Read the tagline aloud: "Speak safely. Be heard."
- One line to camera: "Most reporting tools are built around women and children. Ekyama is for men and women — because right now, male survivors often have nowhere to go."

## 2. The report flow (45s)
- Click **Report what happened**.
- Select "this happened to me."
- Type a short synthetic example, e.g.: *"My partner hit me last night and threatened me. This has happened before."*
- Point out: "No name, no account. And if I'd typed a phone number here, watch—" (type a fake number like `0772123456` into the text and show it get auto-replaced with `[phone number removed]`).
- Optionally demo voice: click **Start recording**, say a test sentence, stop, and play back the masked result — point out the pitch has genuinely shifted, and that the original audio never left the browser.
- Submit. Show the **case code and PIN** screen. "This is the only thing you need to come back — no login, no name."

## 3. Tracking + counsellor chat (35s)
- Open **Check on a report**, enter the code and PIN.
- Show the status ("received").
- Switch to the counsellor console (`/counsellor`, sign in with the demo token) in a second window/tab.
- Show the case in the list, sorted by urgency — point out the urgency badge and the triage flags panel, and say: "This came from a rules-based triage that always runs. An optional AI pass can sharpen this for the counsellor, but it never talks to the survivor directly, and it can never lower the urgency the rules already set."
- Type a short, warm counsellor reply and change status to "reviewing."
- Switch back to the survivor's tab, refresh, and show the reply appearing in the chat, and the status badge updating.

## 4. Trust and help directory (25s)
- Open **Find help near you**.
- Scroll to a hotline entry — point out the source link and "last verified" date.
- Scroll to the male-survivor-specific organisation (MOHRAU) and note: "This is one of the few organisations we could verify that explicitly names male survivors as a group they serve."
- Point out the one entry marked "sample data — not yet verified" and say why: "Where we couldn't confirm something in the time we had, we label it rather than present it as fact."

## 5. Scalability: the country switcher (25s)
- On the header, switch the country dropdown from Uganda to Kenya.
- Show the help directory content changing live — different hotline (1195), different organisations.
- Point out the language dropdown narrowing too: "Kenya's pack only declares English and Kiswahili, so Luganda disappears automatically — this isn't hard-coded per page, it's one data file."
- Optionally open `/guide` and search "rape law" in both countries, showing Kenya's gender-neutral legal note versus Uganda's female-specific one: "That's a real, sourced legal difference the app now states directly instead of assuming one country's laws work everywhere."

## 6. Reach: the feature-phone demo (30s)
- Go to `/ussd-demo`.
- Say: "About one in three phones in the region is still a feature phone, not a smartphone. We can't stand up a live telco line for a hackathon submission, but this proves the backend doesn't care what channel a report comes through."
- Dial the code, press 2 for "I'm in danger now," confirm — show a real case code coming back in two presses.
- Cut to the counsellor console and show that case has actually appeared there, exactly like a web submission would.

## 7. Language, low-data mode, offline, quick exit (25s)
- Switch the language selector to Luganda or Kiswahili on the home page.
- Visit `/lite` briefly — "a stripped-down page for weak connections or basic devices."
- Mention (or show, if your OS supports it) installing the app to a home screen, and that the help/guide pages keep working with the network turned off, falling back to a static page with the critical hotline numbers if you've never visited before.
- Tap the red **Quick exit** button (or hit Escape) — show it leaving the page immediately.

## 8. Close (10s)
- Return to the home page.
- "Ekyama: speak safely, be heard — for everyone, wherever they are." Fade out.

## Notes for editing
- Use only synthetic report content, never real personal stories.
- Keep the counsellor console's demo token out of frame if you don't want to show it (or change it via `.env` first).
- If the full script runs long for the hackathon's video limit, section 6 (feature-phone demo) and section 5 (country switcher) are the two highest-value cuts to keep if something has to go — they're the parts a competing entry is least likely to have.

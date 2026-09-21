# Written summary — Ekyama

## Track

**Safety, Reporting & Protection**, with a cross-track touch on Transparency & Accountability: the survivor-facing case tracker gives a status trail (received → reviewing → in progress → referred → closed) so a survivor can see a report didn't disappear, and a public, anonymized `/stats` page reports total volume, urgency/status/country breakdowns and median counsellor response time — accountability for the institution behind the tool, without exposing a single case.

## The problem, specifically

Uganda's existing GBV response infrastructure and tools are built almost entirely around women and children as victims. This makes sense given the scale of the problem for women, but it leaves male survivors of rape, defilement and domestic abuse with no obvious entry point. This is compounded by law: Uganda's Penal Code Act defines rape (s.123) as an offence against a woman or girl specifically, so a male survivor cannot report a sexual assault as "rape" under that section. Same-sex sexual assault is often handled under s.145 ("carnal knowledge against the order of nature"), the same section that broadly criminalises same-sex conduct — meaning a male survivor of a same-sex assault risks the same law being turned on him. The practical effect is that many male survivors don't report at all.

Ekyama's core idea — not AI-generated, per the hackathon's rules — is a reporting tool designed from the start to serve men as well as women, that never requires a survivor to disclose who assaulted them before they can access support, and that routes every report to a **human counsellor first**, with any decision about police involvement left to the survivor.

## Users

- A male survivor of domestic abuse or sexual assault, who may not know any service exists for him, and may be afraid of not being believed or of legal exposure.
- A female survivor of domestic abuse or defilement-related concerns (e.g. reporting on behalf of a child), for whom the existing pathways are somewhat better established but still hard to navigate.
- A counsellor (in this proof of concept, a stand-in for staff at a partner organisation) who needs to triage incoming reports by urgency and respond without ever seeing the survivor's real identity unless the survivor chooses to share it in the conversation itself.

## Solution, in one paragraph

A mobile-first web app (installable to a home screen, works offline for the pages that matter most) where a survivor reports in text or a browser-masked voice recording, gets a case code and PIN with no registration, and can track status and chat with a counsellor anonymously. A rules-based triage engine — with an optional, always-secondary free-tier AI enhancement — flags urgency for the counsellor. A verified help directory (hotlines, police units, organisations) and a grounded Q&A guide answer only from sourced, dated data, never invented text. The whole system is built as a country data pack — Uganda and Kenya both ship fully populated, switchable from a single dropdown that updates the help directory, legal notes and available languages everywhere at once — so adding another country or track is a data file, not a rewrite. A local USSD/feature-phone simulator (`/ussd-demo`) drives the same report and case-lookup APIs as the web form, proving the backend already works independently of the channel it's reached through. A persisted **simple view** toggle swaps the home, report and help pages into a large-icon, minimal-reading layout for people with low literacy or low digital confidence, and a public **`/stats`** page reports aggregate volume and counsellor responsiveness with no case-level data, so trust in the tool doesn't rely on taking its operators' word for it.

## Information sources

Compiled by manual research (not AI-generated) on 2026-09-21 from public sources, cited directly in `data/countries/ug.json` and `data/countries/ke.json`:

**Uganda:**
- Uganda Police Force social channels, for the emergency line (112/999) and the GBV/child-protection toll-free line (0800 199 195) and CFPD direct lines.
- The Uganda Child Helpline (116), via the National Women's Council and UNICEF's published materials.
- The Penal Code Act (Cap. 120) provisions on rape (s.123), defilement and aggravated defilement (s.129), via the UN Women EVAW Global Database and an ICMEC compendium of Uganda child-protection legislation.
- The Domestic Violence Act, 2010, via the Uganda Legal Information Institute (ULII) and the Ministry of Gender, Labour and Social Development.
- The Human Dignity Trust's Uganda country profile, for the legal-risk note affecting male survivors of same-sex assault.
- Organisations: Uganda Police CFPU, MGLSD, MIFUMI, FIDA-Uganda, and Men of Hope Refugee Association Uganda (MOHRAU) — one of the few organisations we found that explicitly names male survivors as a served population, via an IDS research publication.

**Kenya:**
- The national 1195 GBV helpline (Healthcare Assistance Kenya, supported by UN Women/UNFPA), via UN Women Africa's published coverage and the helpline's own site.
- Kenya Police Service's emergency lines (999/112) and Childline Kenya's 116 helpline, via their official sites.
- The Sexual Offences Act, 2006 (rape, s.3; defilement, s.8), via the Kenya Law Reform Commission's published Act text and a legal-aid simplified handbook. Notably, Kenya's rape provision is **gender-neutral**, unlike Uganda's — a genuine, sourced legal contrast we surface directly in the app rather than assuming both countries work the same way.
- The Protection Against Domestic Violence Act, 2015, via Kenya Law and the Heinrich Böll Stiftung's published summary.
- Organisations: Healthcare Assistance Kenya, the Gender Violence Recovery Centre, FIDA Kenya, CREAW and COVAW.

Every entry in the app links back to its source and shows when it was last checked. Two organisations (UWONET in Uganda; FIDA Kenya and CREAW's male-survivor service scope in Kenya) are marked as unverified sample data because we could not confirm current details in the time available — we chose to label them rather than drop them or present them as verified.

## Approach to trust and accuracy

1. **No invented facts.** The help directory and the Q&A guide only ever surface pre-verified data from the country pack; the guide explicitly says "I don't have a verified answer" rather than generating one.
2. **Source + date on everything.** Every hotline, organisation and legal note carries a source URL and a "last verified" date, visible in the UI.
3. **Unverified is labelled, not hidden or faked.** Anything we couldn't confirm is shown with a visible "sample data" badge.
4. **AI is kept away from survivor-facing text.** The optional AI triage call only ever produces an internal counsellor brief, never a message a survivor reads, and a rules-based floor runs first and can never be lowered by the AI — so a false "AI says it's fine" can't suppress a real danger signal.
5. **Synthetic data only.** No real survivor data was used anywhere in building, testing, or demonstrating this project.

## How AI tools were used to build this

See `docs/AI_USAGE.md` for the full log. In summary: the product idea, target users, legal framing and design decisions are the author's own, formed before any AI assistance and stated explicitly to comply with the "don't use AI to generate the capstone idea" rule. Claude (via Claude Code) was used as a coding assistant and research assistant during the build: scaffolding the Next.js app, writing the API routes, the rules-based triage logic, the on-device voice-masking code, the i18n dictionaries, and this documentation, plus a delegated research pass to find and cite the Uganda legal/hotline data above. All AI output was reviewed, tested end-to-end (report → triage → counsellor reply → survivor sees reply, PII scrubbing, wrong-PIN/wrong-token rejection) before being included.

## Potential impact

If piloted with an organisation like MOHRAU or the Uganda Police CFPU as the receiving counsellor team, Ekyama could give male survivors — currently one of the least-served groups in Uganda's GBV response system — a low-friction, low-risk first point of contact, while giving all survivors clearer visibility into what happens after they report.

The country-pack architecture isn't just a design intention — it's demonstrated in the submitted build: Kenya is fully populated alongside Uganda, with real, sourced data, switchable from a single dropdown that updates the help directory, legal notes and available languages everywhere at once. That same architecture surfaced a genuine, useful finding: Kenya's rape law is written gender-neutrally, while Uganda's is not — a real difference male survivors in each country face, that the app now states explicitly rather than assuming one legal picture fits every country it might expand to.

On reach, the biggest gap for a web-only tool is feature phones, which are still roughly one in three devices in the region. Rather than leave that as an unaddressed roadmap bullet, the submission includes a working local USSD/keypad simulator that drives the exact same report and case-lookup APIs as the web app — the same case store, the same rules-based triage, the same counsellor console handle a report whether it arrived through a browser or a simulated USSD session. What's missing for a real deployment is a paid telco gateway account and approval process, not a rebuild of the backend.

On trust and accessibility, a tool that asks people to disclose abuse anonymously has to earn that trust without ever seeing who they are — so Ekyama makes its own responsiveness checkable (`/stats`: real counts, computed live from the case database, with nothing that could identify a report) instead of asking survivors and partner organisations to take it on faith. And a low-literacy or low-digital-confidence user is exactly the profile most at risk of being excluded by a text-heavy safety tool, which is why the simple view isn't a separate cut-down app but the same report/help/track flow rendered with large icons and minimal reading.

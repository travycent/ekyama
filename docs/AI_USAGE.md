# AI usage log — Ekyama

Built with Claude (Anthropic), via Claude Code, over roughly 5 hours on 2026-09-21 for the OSF x Andela Hackathon 2026.

## What was and wasn't AI-generated

- **The idea, the target users (male and female survivors), and the core design decisions** (counsellor-first routing before police, no registration, browser-side voice masking, country-pack architecture) came from the author, before involving AI, per the hackathon rule against AI-generated capstone ideas.
- **Naming**: the author proposed candidate names; Claude checked them against existing products/projects via web search (surfacing that "SafeVoice" and "Sauti Salama" were already in use, including by another entry in the same hackathon) and the author chose "Ekyama" (Luganda) from the remaining options.
- **Competitive analysis**: at the author's request, Claude reviewed a competing hackathon entry (`swiftkimani/sauti-salama`, a Kenya-focused USSD/SMS/voice GBV line) to identify genuine differentiation before building, rather than duplicating it.
- **Code, data compilation, and documentation** (this file included) were written by Claude, directed and reviewed by the author at each stage.

## Process, roughly in order

1. Read the hackathon brief; discussed track fit, feasibility, and scope for a ~5 hour build.
2. Named and scoped the product with the author; flagged risks (voice-masking isn't true anonymity, video was cut from scope, Luganda strings need native-speaker review) rather than overselling the demo.
3. Delegated a research subagent to find and cite Uganda-specific GBV hotlines, relevant Penal Code / Domestic Violence Act provisions, and organisations — instructed to explicitly mark anything it couldn't verify rather than presenting it as fact. Output was hand-checked before being transcribed into `data/countries/ug.json`.
4. Scaffolded the Next.js/TypeScript/Tailwind app; built the SQLite schema, case-code/PIN generation, the rules-based triage engine (with an optional, strictly-secondary free-tier AI enhancement path), client-side PII scrubbing, and the Web Audio API voice-masking pipeline.
5. Built all pages: home, report, case tracker + chat, counsellor console, help directory, grounded Q&A guide, low-data page, and the quick-exit control.
6. Ran the production build, then smoke-tested the real flow end-to-end via the API (submit a report → verify triage urgency and PII scrubbing → counsellor replies → survivor sees the reply → wrong PIN and wrong counsellor token both correctly rejected) before writing this documentation.

## Where AI is used inside the product itself (not just to build it)

An **optional** triage-enhancement call (`lib/triage.ts`) can use a free-tier Groq API key, if the person running the app sets one, to sharpen the counsellor-facing summary and potentially raise (never lower) the urgency rules already assigned. It never sees a name, and its output is never shown to a survivor directly — only to the counsellor. If no key is set, or the call fails for any reason, the app silently falls back to the rules-based result, which is what ships by default and what was used for every test above.

## Honesty note

This log intentionally states scope cuts and known weaknesses (see README "Known limitations") rather than presenting the demo as more complete than it is — in keeping with the project's own stated approach to trust and accuracy.

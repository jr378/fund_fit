@AGENTS.md

# FundFit — guide for future Claude Code sessions

> **Heads up on the stack:** This repo uses **Next.js 16 + React 19 + Tailwind v4**.
> See `AGENTS.md` (imported above) — some APIs differ from older Next.js. When in
> doubt, read the bundled docs in `node_modules/next/dist/docs/`. React 19's lint
> rules are strict: do **not** call `setState` synchronously in an effect, and do
> **not** declare components inside render.

## What FundFit is

FundFit helps small and mid-sized nonprofits **find funders worth pursuing,
translate their mission into funder-facing frames, and get application-ready
faster.** It is **not** a generic "AI grant writer." It is a funding strategy,
funder-fit, and application-readiness cockpit.

The first test case is a Common Courtesy-style mobility nonprofit (rideshare for
seniors, people with disabilities, and others who can't drive), but the app is
general enough for other nonprofits.

## Product philosophy

- Feels like a **serious nonprofit funding cockpit**, not a chatbot.
- Plain English. No overclaiming.
- **Recommends "Skip"** when an opportunity is a bad fit.
- **Every recommendation explains why.** Scoring is fully visible, never a black box.
- All AI/template output **requires human review**.
- Onboarding starts from **public-data prefill**, not a giant blank form.
- Every prefilled value is **"suggested"** with a **source type + confidence**, and
  can be accepted, edited, or removed.

## Current architecture (mock-data-only)

- **Next.js App Router** (`src/app/*`), all pages are client components because the
  whole experience is driven by local state.
- **State:** `src/components/OrgProvider.tsx` — a React context persisted to
  `localStorage` (key `fundfit:v1`). No database, no auth, no server state.
- **Domain logic:** pure, deterministic functions in `src/lib/*`. No LLM, no
  network calls. Same input → same output.
- **UI:** lightweight shadcn-style primitives in `src/components/ui.tsx`, shared
  badges in `badges.tsx`, shared widgets in `common.tsx`.

### Important files

| File | Responsibility |
|------|----------------|
| `src/lib/types.ts` | All domain types (the contract for future real data) |
| `src/lib/sampleNonprofits.ts` | Common Courtesy-style demo profile + suggested fields |
| `src/lib/mockOrgLookup.ts` | Simulated "search public data" lookup |
| `src/lib/mockDocumentExtraction.ts` | Simulated document upload → extracted facts |
| `src/lib/mockFunders.ts` | 20+ clearly-labeled sample funders |
| `src/lib/fundingFrames.ts` | Rule-based funder-facing frame generation |
| `src/lib/scoring.ts` | **Transparent funder scoring** (see below) |
| `src/lib/categories.ts` | Derives program categories from free text (keyword map) |
| `src/lib/grantAssets.ts` | Template-based reusable grant assets |
| `src/lib/readiness.ts` | Readiness evaluation + profile completeness |
| `src/lib/interview.ts` | Guided interview questions + answer → dossier mapping |
| `src/lib/pursuitBrief.ts` | Composes scoring + frames + assets into a brief |
| `src/lib/plan.ts` | 90-day plan generation |
| `src/components/OrgProvider.tsx` | App state + persistence + all mutations |

## How scoring works

`scoreFunder(profile, funder)` returns a `FunderScore` with **eight components**,
each 0–100 with a plain-English explanation:

mission · population · geography · award-size · readiness · deadline ·
relationship · repeatability

The weighted sum (weights in `WEIGHTS`) is adjusted by a **burden penalty**
(high-burden applications are penalized for low-capacity orgs), then mapped to a
recommendation: **Apply now / Cultivate first / Prepare for next cycle / Skip**.
A fundamental mission+population mismatch forces **Skip**. See
`docs/scoring-methodology.md`.

## How to run

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm run build
```

## Rules for changes

- **Do not invent real grant facts.** All funders/figures are sample data.
- **Clearly label mock data** (use the `<DemoBadge />`).
- **Keep recommendations explainable** — never hide scoring.
- **Preserve nonprofit trust and human review** — generated text is a draft.
- **Do not add paid APIs, auth, or a database** until explicitly requested. Keep
  the architecture swap-ready (see `docs/data-integrations-roadmap.md`).

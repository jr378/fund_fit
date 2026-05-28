# FundFit

**Find funders worth pursuing — and get application-ready faster.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjr378%2Ffund_fit&project-name=fundfit&repository-name=fundfit)

> One click to see it live — no env vars, database, or API keys required. The
> button clones this branch and deploys it to your own Vercel account.


FundFit helps small and mid-sized nonprofits turn their mission, programs, proof
points, and documents into a **prioritized funding pipeline**. It is **not** a
generic "AI grant writer." It is a funding strategy, funder-fit, and
application-readiness cockpit that tells a busy executive director, development
director, or board member:

- Which funders are worth pursuing?
- How should we frame our existing work for each funder?
- What materials are missing before we apply?
- What should we do this week to move funding forward?
- How do we reuse strong language across future grants?

The first test case is inspired by a Common Courtesy-style mobility nonprofit
(coordinated rides for seniors, people with disabilities, and others who can't
drive), but the app works for other nonprofits too.

> ⚠️ **This is an MVP demo built on mock data.** It does not call real funder
> databases, contains **no real grant facts**, and its suggestions are starting
> points that require human review. It is **not legal, tax, accounting, or
> guaranteed grant advice.**

---

## What is mocked

Everything that would normally hit an external service is simulated locally and
clearly labeled with a **"Demo data"** badge:

- **Public-data lookup** (`searchPublicData`) — fakes an IRS / ProPublica /
  website search.
- **Document extraction** — clicking "upload" returns canned extracted facts; no
  file is read.
- **Funders** — 20+ clearly fictional sample funders (names contain "(Sample)").
- **Funding frames & grant assets** — generated from deterministic templates and
  rules, **not** an LLM.

No database, no auth, no paid APIs, no real network calls. State lives in your
browser's `localStorage`.

## Run locally

Requires Node.js 20.9+.

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run build      # production build
```

## Test the sample nonprofit flow

1. Run the app and open the dashboard.
2. Click **Find my nonprofit**.
3. Enter `Common Courtesy` (or `ccrides.org`, `rides`, `senior transportation`,
   `mobility nonprofit`) and click **Search public data**.
4. Choose the **Common Courtesy (Sample)** result.
5. On the **Suggested Organization Dossier** screen, accept / edit / remove the
   suggested fields (note the source + confidence on each), then **Confirm and
   build my funding map**.
6. Optionally add **simulated documents** (`/documents`) and answer the
   **guided interview** (`/interview`).
7. Review the completed **Dossier**.
8. See **Funding Frames** generated from your dossier.
9. View ranked **Funder Matches** — filter by Apply now / Cultivate / Prepare /
   Skip, type, burden, and high fit.
10. Click any funder for a printable **Pursuit Brief**.
11. Generate reusable **Grant Assets**.
12. Check **Readiness** gaps and the **90-Day Plan**.

> Shortcut: **Start with sample nonprofit** on the dashboard loads the full demo
> profile directly.

## Product philosophy — why this is not just an AI grant writer

- It **prioritizes** where to spend limited time, and **recommends Skip** when a
  funder is a bad fit.
- **Every recommendation explains why.** Scoring is fully visible and editable
  (see `docs/scoring-methodology.md`) — no black box.
- Onboarding **starts with public-data prefill**, not a blank form, so a nonprofit
  isn't staring at an empty page.
- Every suggested value carries a **source type and confidence** and can be
  accepted, edited, or removed — the nonprofit stays in control.
- Generated language is a **draft that needs human review**, never an
  auto-submitted application.

## Known limitations

- All data is mock/sample; there is no real funder database or live lookup.
- Document "extraction" is canned, not parsed from real files.
- Frame and asset generation is template-based, not LLM-powered (by design — the
  architecture is built to swap an LLM in later).
- State is per-browser `localStorage` only; nothing is shared or synced.
- Scoring weights are sensible defaults, not validated against grant outcomes.

## Suggested next GitHub issues

1. Wire a real, key-less data source first (ProPublica Nonprofit Explorer) behind
   the existing `searchPublicData` interface.
2. Replace canned document extraction with real 990 XML / PDF text parsing.
3. Add an opt-in LLM drafting layer behind the `grantAssets` generator interface.
4. Add Grants.gov / Simpler Grants ingestion for real opportunities.
5. Make funding-frame and grant-asset edits persist in state.
6. Add a win/loss learning loop to tune scoring weights.
7. Add export (PDF / docx) for the pursuit brief and grant assets.
8. Add lightweight tests (Vitest) around `scoring`, `readiness`, and `fundingFrames`.

## Future integrations

Website scraping/crawling · IRS tax-exempt org data · IRS Form 990 data ·
ProPublica Nonprofit Explorer API · Grants.gov API · Simpler Grants API ·
Candid / Foundation Directory-style data (if licensed) · Census ACS · SAM.gov ·
state/local grant portals · CRM integrations · Google Drive / Dropbox document
ingestion · calendar / deadline sync · an LLM drafting layer.

See **`docs/data-integrations-roadmap.md`** for how each maps onto the current
mock interfaces.

## Future features

Real funder database · document upload & extraction · confidence-scored
organization profile · relationship graph · board-member intros · grant reporting
tracker · outcome metric tracker · funder email monitoring · collaborative
editing · grant calendar · win/loss learning loop.

## Tech stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · React 19. No database,
no auth, no paid APIs.

## Project layout

```
src/
  app/            Routes: dashboard, find, dossier, documents, interview,
                  frames, funders, funders/[id], assets, readiness, plan
  components/     OrgProvider (state), Nav, ui primitives, badges, shared widgets
  lib/            All deterministic domain logic + mock data
docs/             Product brief, scoring methodology, integrations roadmap
```

See `CLAUDE.md` for guidance aimed at future Claude Code sessions.

# FundFit — Data & Integrations Roadmap

The MVP is **mock-data-only**. This document maps each future integration onto the
**interface that already exists**, so real data can be swapped in without
reshaping the UI. The guiding rule: every external fact enters the app as a
`SuggestedField` (with `sourceType` + `confidence`) the user can accept, edit, or
remove. Nothing auto-commits.

## Swap points (already built)

| Capability | Mock today | Swap target |
|-----------|------------|-------------|
| Org search | `src/lib/mockOrgLookup.ts` → `searchPublicData()` | Return `PublicProfileResult[]` from real sources |
| Doc extraction | `src/lib/mockDocumentExtraction.ts` → `extractDocument()` | Return `DocumentExtractionResult` from a real parser |
| Funder universe | `src/lib/mockFunders.ts` | Load `Funder[]` from a real DB / API |
| Frames | `src/lib/fundingFrames.ts` | Keep rules; optionally augment with an LLM |
| Grant assets | `src/lib/grantAssets.ts` (`GENERATORS` map) | Swap any generator for an LLM call |
| Scoring | `src/lib/scoring.ts` | Keep transparent; tune weights from outcomes |

## Phased plan

### Phase 1 — Real org identity (low friction, key-less)
- **ProPublica Nonprofit Explorer API** (currently key-less) for name/EIN lookup
  and basic financials → populate `PublicProfileResult` + `SuggestedField`s with
  `sourceType: "IRS/public filing"`.
- **IRS Tax-Exempt Organization Search** data for exemption status and ruling.
- **Website crawl** of the org's own site for mission/programs →
  `sourceType: "Website"`.

### Phase 2 — Real documents
- **IRS Form 990** (XML for e-filed; PDF text extraction otherwise) → revenue,
  officers/board list, program service accomplishments.
- **Google Drive / Dropbox ingestion** so a nonprofit can connect its own docs.
- Keep every extracted fact as a reviewable `SuggestedField`.

### Phase 3 — Real opportunities
- **Grants.gov API** and the **Simpler Grants API** for federal opportunities.
- **State / local grant portals** (often bespoke scrapers).
- **Candid / Foundation Directory-style data** — only if licensed.
- **Census ACS** for community-need context; **SAM.gov** for federal eligibility.

### Phase 4 — Relationships, calendar, CRM
- **CRM integrations** (e.g. Salesforce NPSP, Bloomerang) for funder relationships
  → feed `relationshipNotes` and a future relationship graph.
- **Calendar / deadline sync** for funder deadlines and the 90-day plan.

### Phase 5 — LLM drafting layer
- Add an opt-in LLM behind the existing `grantAssets` `GENERATORS` interface and
  optionally to enrich frames. Gate behind `ANTHROPIC_API_KEY` (see `.env.example`).
- **Hard requirement:** all LLM output stays a draft with a "needs human review"
  badge, and shows which fields/proof points it used.

## Trust & safety constraints (apply to every phase)

- Never present inferred or model-generated content as fact — always tag
  `sourceType` and `confidence`.
- Never auto-submit applications or auto-contact funders.
- Keep scoring explainable; do not replace it with an opaque model.
- Do not store real secrets in the repo; use environment variables.
- Respect data licensing (especially Candid) and each source's terms of use.

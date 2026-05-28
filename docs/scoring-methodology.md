# FundFit — Scoring Methodology

Scoring lives in `src/lib/scoring.ts`. It is **deterministic and transparent**:
same inputs always produce the same output, and every number shown in the UI
comes with a plain-English explanation. There is no LLM and no hidden model.

## Components

`scoreFunder(profile, funder)` produces eight components, each scored **0–100**:

| Component | Weight | How it's computed |
|-----------|:------:|-------------------|
| **Mission fit** | 0.22 | Overlap between the org's `programCategories` and the funder's `interests`. |
| **Population fit** | 0.16 | Overlap between populations served and the funder's priority populations. |
| **Geography fit** | 0.12 | Based on funder reach (local / state / national) vs. the org's service area. |
| **Award-size fit** | 0.12 | Whether the funder's typical range overlaps a comfortable ask band (≈2–25% of the org's budget). |
| **Readiness fit** | 0.14 | Share of the funder's required documents the org already has. |
| **Deadline fit** | 0.08 | Days until the next deadline (rolling = high; passed/invite-only = low). |
| **Relationship fit** | 0.08 | Required relationship vs. what's in the org's relationship notes. |
| **Repeatability** | 0.08 | How reusable the application work is (rolling/quarterly + low burden score higher). |

Weights are defined in the `WEIGHTS` constant and are meant to be edited.

## Overall score

```
overall = round( Σ(componentScore × weight) × burdenPenalty )
```

**Burden penalty** reflects capacity reality:

- High-burden application **and** low-capacity org (no/part-time fundraiser): ×0.82
- High-burden application (other orgs): ×0.93
- Otherwise: ×1.0

The applied penalty is surfaced in the readiness component's explanation.

## Recommendation

The overall score and a few decisive signals map to one of four calls:

- **Skip** — `mission < 25` **and** `population < 25` (fundamental mismatch, no
  matter the timing), or overall `< 42`.
- **Cultivate first** — relationship likely required and not yet established, or
  the funder is invitation-only, or fit is decent but timing/relationship is weak.
- **Prepare for next cycle** — strong fit but the deadline has passed, or two or
  more required materials are missing for a high-burden application.
- **Apply now** — overall `≥ 60` and enough runway before the deadline.

Each recommendation ships with a `reason` and a concrete `nextAction`.

## Derived outputs

- **Suggested ask** — a rounded value inside the funder's range, lower for cold
  approaches, higher when a relationship exists.
- **Best frame** — the funding frame whose funder types and trigger categories
  best match this funder (see `fundingFrames.ts`).
- **Missing materials** — required documents the org has not marked available.

## Why transparency matters

Nonprofits are accountable to boards and funders. A black-box "fit score" they
can't explain is useless in a board meeting. Because every component is visible
and editable, a user can disagree, adjust, and still trust the tool.

## Tuning / future work

- Calibrate weights against real win/loss data (a future learning loop).
- Add per-funder-type weight profiles (e.g. government vs. DAF behave differently).
- Let users adjust weights in the UI and see rankings update live.

import type { NonprofitProfile, ProofPoint, Program, SuggestedField } from "./types";
import { uid } from "./formatters";
import { deriveProgramCategories } from "./categories";

/** Split a "A; B; C" suggested value into trimmed items. */
function splitList(value: string): string[] {
  return value
    .split(/;|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Apply a single accepted/edited suggested field onto a profile, returning an
 * updated copy. List-valued fields are parsed from "; "-separated strings into
 * structured records. After applying, program categories are re-derived so
 * scoring and frames stay in sync.
 */
export function applySuggestedField(profile: NonprofitProfile, field: SuggestedField): NonprofitProfile {
  const next: NonprofitProfile = { ...profile };
  const v = field.value.trim();

  switch (field.fieldName) {
    case "name":
      next.name = v;
      break;
    case "website":
      next.website = v;
      break;
    case "mission":
      next.mission = v;
      break;
    case "geography":
      next.geography = v;
      break;
    case "ein":
      next.ein = v;
      break;
    case "orgType":
      next.orgType = v as NonprofitProfile["orgType"];
      break;
    case "budgetRange":
      next.budgetRange = v as NonprofitProfile["budgetRange"];
      break;
    case "capacityConstraints":
      next.capacityConstraints = v;
      break;
    case "missionBoundaries":
      next.missionBoundaries = v;
      break;
    case "programs": {
      const programs: Program[] = splitList(v).map((name) => ({ id: uid("p"), name, description: "" }));
      // Don't clobber richer existing programs unless we have more detail.
      next.programs = programs.length ? programs : next.programs;
      break;
    }
    case "populations":
      next.populations = splitList(v);
      break;
    case "outcomes":
      next.outcomes = splitList(v);
      break;
    case "proofPoints": {
      const pps: ProofPoint[] = splitList(v).map((text) => ({ id: uid("pp"), text, source: field.sourceType }));
      // Merge, avoiding duplicates by text.
      const existing = new Set(next.proofPoints.map((p) => p.text));
      next.proofPoints = [...next.proofPoints, ...pps.filter((p) => !existing.has(p.text))];
      break;
    }
    case "currentFunders":
      next.currentFunders = splitList(v);
      break;
    case "fundingNeeds":
      next.fundingNeeds = Array.from(new Set([...next.fundingNeeds, ...splitList(v)]));
      break;
    default:
      // Unknown field: ignore safely.
      break;
  }

  next.programCategories = deriveProgramCategories(next);
  return next;
}

/** Apply many fields at once (used by "Confirm and build my funding map"). */
export function applySuggestedFields(profile: NonprofitProfile, fields: SuggestedField[]): NonprofitProfile {
  return fields
    .filter((f) => f.status === "accepted" || f.status === "edited")
    .reduce((p, f) => applySuggestedField(p, f), profile);
}

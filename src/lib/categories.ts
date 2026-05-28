import type { NonprofitProfile } from "./types";

/**
 * Derive program categories from a profile's free-text fields using a keyword
 * map. This keeps scoring + funding frames working even when a profile is built
 * by accepting suggested fields (strings) rather than the rich sample object.
 *
 * Deterministic and editable: the keyword map below is the entire "model".
 */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  transportation: ["transport", "ride", "rides", "transit", "drive", "driver", "mobility", "trip"],
  mobility: ["mobility", "ride", "transport", "door-through-door", "wheelchair"],
  aging: ["senior", "older adult", "aging", "elderly", "age in place"],
  disability: ["disab", "wheelchair", "accessible", "accessibility"],
  "healthcare access": ["medical", "health", "dialysis", "appointment", "clinic", "care", "treatment"],
  "food access": ["food", "grocery", "meal", "pantry", "nutrition", "hunger"],
  "social isolation": ["isolation", "lonel", "connection", "homebound", "social"],
  independence: ["independ", "age in place", "autonomy", "self-suffic"],
  "transportation equity": ["equity", "underserved", "left behind", "affordab", "low-income", "low income"],
  "digital inclusion": ["digital", "smartphone", "app", "phone", "internet", "no app"],
  "caregiver support": ["caregiver", "respite", "family care"],
  "public-private mobility coordination": ["coordinat", "partner transit", "first/last mile", "first mile", "last mile"],
};

export function deriveProgramCategories(profile: NonprofitProfile): string[] {
  const haystack = [
    profile.mission,
    profile.geography,
    ...profile.programs.flatMap((p) => [p.name, p.description]),
    ...profile.populations,
    ...profile.outcomes,
    ...profile.proofPoints.map((p) => p.text),
  ]
    .join(" ")
    .toLowerCase();

  const matched = Object.entries(CATEGORY_KEYWORDS)
    .filter(([, words]) => words.some((w) => haystack.includes(w)))
    .map(([cat]) => cat);

  // Preserve any categories the user added manually.
  return Array.from(new Set([...matched, ...profile.programCategories]));
}

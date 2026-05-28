import type { PublicProfileResult, SuggestedField } from "./types";
import { sampleProfile, sampleSuggestedFields } from "./sampleNonprofits";

/**
 * Mocked "search public sources and your website" lookup.
 *
 * In production this would fan out to the IRS tax-exempt org file, ProPublica
 * Nonprofit Explorer, and a website crawl. For the MVP it pattern-matches the
 * query against a small fixture set. NO external calls are made.
 */

const SAMPLE_TRIGGERS = [
  "common courtesy",
  "ccrides",
  "ccrides.org",
  "rides",
  "ride",
  "senior transportation",
  "mobility",
  "mobility nonprofit",
  "transportation",
  "00-0000000",
];

const sampleResult: PublicProfileResult = {
  id: "sample-common-courtesy",
  name: sampleProfile.name,
  website: sampleProfile.website,
  ein: sampleProfile.ein,
  location: "Greater metro region (sample)",
  summary:
    "Coordinates affordable, human-supported rides for seniors, people with disabilities, and others who cannot drive. Live phone dispatch, no app required.",
  matchConfidence: "High",
  isSample: true,
  suggestedFields: sampleSuggestedFields,
};

/** A couple of decoy near-matches so the chooser feels real. */
const decoyResults: PublicProfileResult[] = [
  {
    id: "decoy-metro-paratransit",
    name: "Metro Paratransit Friends (Sample)",
    website: "metroparatransitfriends.org",
    location: "Neighboring county (sample)",
    summary: "Volunteer driver program for medical trips. Smaller, volunteer-run, limited service days.",
    matchConfidence: "Medium",
    isSample: true,
    suggestedFields: [],
  },
  {
    id: "decoy-wheels-of-hope",
    name: "Wheels of Hope Coalition (Sample)",
    website: "wheelsofhope.example.org",
    location: "Statewide (sample)",
    summary: "Statewide advocacy coalition focused on transit policy — not a direct-service ride provider.",
    matchConfidence: "Low",
    isSample: true,
    suggestedFields: [],
  },
];

/**
 * Simulate a public-data search. Returns matching results (sample first).
 * Always resolves after a short artificial delay so the loading state shows.
 */
export async function searchPublicData(query: string): Promise<PublicProfileResult[]> {
  const q = query.trim().toLowerCase();
  await new Promise((r) => setTimeout(r, 900));

  if (!q) return [];

  const matchesSample = SAMPLE_TRIGGERS.some((t) => q.includes(t) || t.includes(q));

  if (matchesSample) {
    return [sampleResult, ...decoyResults];
  }

  // Unknown query: still let the user proceed with a "no strong match" path.
  return decoyResults;
}

/** The curated sample's suggested fields, used by the "Start with sample" button. */
export function getSampleSuggestedFields(): SuggestedField[] {
  return sampleSuggestedFields.map((f) => ({ ...f }));
}

export function getSampleResult(): PublicProfileResult {
  return sampleResult;
}

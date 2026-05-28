import type { FundingFrame, NonprofitProfile } from "./types";

/**
 * Funding frames = the same mission told in the language different funders use.
 *
 * These are generated DETERMINISTICALLY from local rules (no LLM). A frame
 * "activates" when the org's program categories or populations overlap its
 * trigger set. Confidence reflects how strong that overlap is.
 */

interface FrameTemplate {
  id: string;
  name: string;
  triggerCategories: string[];
  triggerPopulations?: string[];
  whyFits: string;
  bestFunderTypes: FundingFrame["bestFunderTypes"];
  strongestProofPoints: string[];
  possibleGap: string;
  languageSnippet: string;
}

const FRAME_TEMPLATES: FrameTemplate[] = [
  {
    id: "aging-in-place",
    name: "Aging in place",
    triggerCategories: ["aging", "independence", "mobility", "transportation"],
    triggerPopulations: ["Seniors"],
    whyFits: "Reliable rides let older adults stay independent in their own homes instead of relocating to care.",
    bestFunderTypes: ["foundation", "donor advised fund", "government grant"],
    strongestProofPoints: ["Human dispatch model — no app required", "Active, returning rider base"],
    possibleGap: "Needs outcomes that show preserved independence, not just ride counts.",
    languageSnippet:
      "Our rides help older adults remain independent and age in place — getting to appointments, groceries, and community without giving up their homes.",
  },
  {
    id: "disability-access",
    name: "Disability access",
    triggerCategories: ["disability", "mobility", "transportation", "independence"],
    triggerPopulations: ["People with disabilities"],
    whyFits: "Door-through-door, human-supported rides meet riders who can't use standard or app-based transit.",
    bestFunderTypes: ["foundation", "government grant"],
    strongestProofPoints: ["Human dispatch model — no app required", "Door-through-door assistance"],
    possibleGap: "May need to document accessibility of vehicles and driver training.",
    languageSnippet:
      "We provide accessible, human-supported transportation for people with disabilities who cannot safely use fixed-route or app-based options.",
  },
  {
    id: "healthcare-access",
    name: "Healthcare access",
    triggerCategories: ["healthcare access", "transportation", "mobility"],
    triggerPopulations: ["Medically vulnerable people"],
    whyFits: "Transportation is a top barrier to care; rides directly reduce missed and delayed appointments.",
    bestFunderTypes: ["healthcare system", "foundation", "government grant"],
    strongestProofPoints: ["Medical appointment transportation", "Reduced missed medical appointments"],
    possibleGap: "Funders will want missed-appointment / no-show reduction data.",
    languageSnippet:
      "By removing the transportation barrier, we help medically vulnerable riders keep critical appointments and avoid costly gaps in care.",
  },
  {
    id: "nemt",
    name: "Non-emergency medical transportation",
    triggerCategories: ["healthcare access", "transportation"],
    triggerPopulations: ["Medically vulnerable people"],
    whyFits: "Recurring rides to dialysis, treatment, and follow-ups are classic non-emergency medical transport.",
    bestFunderTypes: ["healthcare system", "government grant"],
    strongestProofPoints: ["Medical appointment transportation", "High annual ride volume"],
    possibleGap: "May need cost-per-ride and per-condition tracking for healthcare payers.",
    languageSnippet:
      "We provide dependable non-emergency medical transportation — including recurring trips to dialysis and treatment — for riders without other options.",
  },
  {
    id: "food-access",
    name: "Food access",
    triggerCategories: ["food access", "transportation"],
    whyFits: "Rides to groceries, food banks, and pharmacies close the gap for people who can't shop on their own.",
    bestFunderTypes: ["foundation", "government grant"],
    strongestProofPoints: ["Grocery & food access rides"],
    possibleGap: "Needs data on food-trip volume and reach into food-insecure households.",
    languageSnippet:
      "Our rides connect homebound and low-income riders to groceries, food banks, and pharmacies they otherwise couldn't reach.",
  },
  {
    id: "social-isolation",
    name: "Social isolation reduction",
    triggerCategories: ["social isolation", "aging", "independence"],
    triggerPopulations: ["Seniors"],
    whyFits: "Getting out for appointments, errands, and community combats isolation and loneliness.",
    bestFunderTypes: ["foundation", "healthcare system"],
    strongestProofPoints: ["Reduced social isolation", "Human dispatch model — no app required"],
    possibleGap: "Needs survey-based connection/loneliness outcomes, not just trips.",
    languageSnippet:
      "Each ride is also a connection — reducing isolation by helping homebound riders stay engaged in their communities.",
  },
  {
    id: "caregiver-support",
    name: "Caregiver support",
    triggerCategories: ["aging", "transportation", "social isolation"],
    triggerPopulations: ["Seniors", "Medically vulnerable people"],
    whyFits: "Reliable rides relieve family caregivers from the burden of every trip.",
    bestFunderTypes: ["foundation"],
    strongestProofPoints: ["Live phone dispatch", "Medical appointment transportation"],
    possibleGap: "Needs to capture caregiver-reported relief or hours saved.",
    languageSnippet:
      "Our service gives family caregivers reliable backup transportation, easing burnout and freeing them for other care.",
  },
  {
    id: "transportation-equity",
    name: "Transportation equity",
    triggerCategories: ["transportation equity", "transportation", "mobility"],
    triggerPopulations: ["Low-income riders", "People without reliable transportation"],
    whyFits: "We reach riders left behind by app-based and fixed-route transit, prioritizing affordability.",
    bestFunderTypes: ["foundation", "government grant", "corporate giving"],
    strongestProofPoints: ["Affordable rider copay keeps rides accessible", "Human dispatch model — no app required"],
    possibleGap: "Needs demographic/equity data on who is served.",
    languageSnippet:
      "We close mobility gaps for people priced out of or unable to use app-based transit, keeping rides affordable and human-supported.",
  },
  {
    id: "digital-inclusion",
    name: "Digital inclusion",
    triggerCategories: ["transportation", "mobility"],
    triggerPopulations: ["People with limited digital access"],
    whyFits: "A live phone-dispatch model serves people who can't or won't use smartphone apps.",
    bestFunderTypes: ["corporate giving", "foundation"],
    strongestProofPoints: ["Live phone dispatch", "Human dispatch model — no app required"],
    possibleGap: "Needs to quantify how many riders lack smartphones or data.",
    languageSnippet:
      "Our human, phone-based dispatch reaches riders excluded by app-only services — a practical answer to the digital divide.",
  },
  {
    id: "public-private-mobility",
    name: "Public-private mobility coordination",
    triggerCategories: ["transportation", "mobility", "public-private mobility coordination"],
    whyFits: "We coordinate with transit, clinics, and senior centers to fill first/last-mile and off-hours gaps.",
    bestFunderTypes: ["government grant", "foundation"],
    strongestProofPoints: ["Community partner transportation support", "Established community partners"],
    possibleGap: "Needs formal coordination agreements / MOUs to show partnership depth.",
    languageSnippet:
      "We work alongside public transit and healthcare partners to fill the first/last-mile and off-hours gaps they can't serve.",
  },
];

/** Returns confidence based on how many triggers overlap the profile. */
function overlapConfidence(matchCount: number): FundingFrame["confidence"] {
  if (matchCount >= 3) return "High";
  if (matchCount === 2) return "Medium";
  return "Low";
}

/**
 * Generate the funding frames that apply to a given profile.
 * Deterministic: same profile in → same frames out.
 */
export function generateFundingFrames(profile: NonprofitProfile): FundingFrame[] {
  const cats = new Set(profile.programCategories.map((c) => c.toLowerCase()));
  const pops = new Set(profile.populations.map((p) => p.toLowerCase()));
  const proofTexts = profile.proofPoints.map((p) => p.text);

  return FRAME_TEMPLATES.map((t) => {
    const catMatches = t.triggerCategories.filter((c) => cats.has(c.toLowerCase()));
    const popMatches = (t.triggerPopulations ?? []).filter((p) => pops.has(p.toLowerCase()));
    const total = catMatches.length + popMatches.length;

    // Only keep proof points the org actually has; fall back to template list.
    const matchedProof = t.strongestProofPoints.filter((sp) =>
      proofTexts.some((pt) => pt.toLowerCase().includes(sp.toLowerCase().split("—")[0].trim())),
    );

    const frame: FundingFrame = {
      id: t.id,
      name: t.name,
      whyFits: t.whyFits,
      bestFunderTypes: t.bestFunderTypes,
      strongestProofPoints: matchedProof.length ? matchedProof : t.strongestProofPoints,
      possibleGap: t.possibleGap,
      languageSnippet: t.languageSnippet,
      confidence: overlapConfidence(total),
      triggerCategories: t.triggerCategories,
    };
    return { frame, total };
  })
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total)
    .map((x) => x.frame);
}

export function getFrameById(profile: NonprofitProfile, id: string): FundingFrame | null {
  return generateFundingFrames(profile).find((f) => f.id === id) ?? null;
}

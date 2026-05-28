import type { NonprofitProfile, SuggestedField } from "./types";
import { emptyDocuments } from "./formatters";

/**
 * Common Courtesy-style mobility nonprofit — the curated demo organization.
 *
 * NOTE: This is SAMPLE / DEMO data. The website ccrides.org is a placeholder,
 * the metrics are illustrative, and nothing here should be treated as real
 * grant facts about any actual organization.
 */
export const SAMPLE_PROGRAM_CATEGORIES = [
  "transportation",
  "aging",
  "disability",
  "healthcare access",
  "food access",
  "social isolation",
  "mobility",
  "independence",
];

export const sampleProfile: NonprofitProfile = {
  name: "Common Courtesy (Sample)",
  website: "ccrides.org",
  ein: "00-0000000",
  mission:
    "Provide affordable, human-supported rides for seniors, people with disabilities, medically vulnerable people, and others who cannot drive or cannot easily use smartphone-based transportation.",
  geography: "Greater metro region (county-level, sample)",
  orgType: "501(c)(3) public charity",
  budgetRange: "$250K–$1M",
  fundraisingCapacity: "Part-time fundraiser",
  programs: [
    { id: "p1", name: "Subsidized rides", description: "Low-copay rides for riders who cannot otherwise afford transportation." },
    { id: "p2", name: "Live phone dispatch", description: "Human-answered dispatch line for riders with limited digital access." },
    { id: "p3", name: "Medical appointment transportation", description: "Rides to and from medical and dialysis appointments." },
    { id: "p4", name: "Grocery & food access rides", description: "Trips to grocery stores, food banks, and pharmacies." },
    { id: "p5", name: "Community partner transportation support", description: "Coordinated rides on behalf of senior centers and clinics." },
    { id: "p6", name: "Mobility support for older & disabled adults", description: "Door-through-door assistance for riders who need extra help." },
  ],
  populations: [
    "Seniors",
    "People with disabilities",
    "Low-income riders",
    "Medically vulnerable people",
    "People without reliable transportation",
    "People with limited digital access",
  ],
  outcomes: [
    "Reduced missed medical appointments",
    "Reduced social isolation",
    "Improved access to food and daily needs",
    "Preserved independence and aging in place",
  ],
  proofPoints: [
    { id: "pp1", text: "High annual ride volume", metric: "~12,000 rides/year (sample)", source: "Prior grant/document" },
    { id: "pp2", text: "Active, returning rider base", metric: "~600 active riders (sample)", source: "Website" },
    { id: "pp3", text: "Human dispatch model — no app required", source: "Website" },
    { id: "pp4", text: "Affordable rider copay keeps rides accessible", metric: "$3 average copay (sample)", source: "Inferred" },
    { id: "pp5", text: "Established community partners (senior centers, clinics)", source: "Prior grant/document" },
  ],
  currentFunders: ["Local community foundation (sample)", "Individual donors", "Civic club mini-grant (sample)"],
  pastGrantsWon: ["Community foundation operating grant — $25,000 (sample)"],
  pastGrantsLost: ["Regional health foundation — declined, cited limited outcome data (sample)"],
  relationshipNotes:
    "Board member knows a program officer at the community foundation. No current relationship with hospital community-benefit staff.",
  documents: {
    ...emptyDocuments(),
    determinationLetter: true,
    latest990: true,
    operatingBudget: true,
    boardList: true,
    testimonials: true,
  },
  capacityConstraints:
    "Only a part-time fundraiser. Limited bandwidth for high-burden federal applications. Outcome tracking is mostly ride counts today.",
  missionBoundaries:
    "Stay focused on mobility, access, independence, and human-supported transportation. Avoid launching unrelated programs just to chase funding.",
  programCategories: SAMPLE_PROGRAM_CATEGORIES,
  fundingNeeds: [
    "Subsidize more rides for low-income riders",
    "Stabilize dispatch staffing",
    "Build better outcome tracking",
  ],
};

/**
 * Suggested fields revealed when the user chooses the Common Courtesy sample in
 * the "Find my nonprofit" flow. Each carries a (mocked) source + confidence.
 */
export const sampleSuggestedFields: SuggestedField[] = [
  {
    id: "sf_name",
    fieldName: "name",
    label: "Organization name",
    value: "Common Courtesy (Sample)",
    sourceType: "IRS/public filing",
    confidence: "High",
    status: "suggested",
    explanation: "Matched to a public charity record in the (mocked) tax-exempt org file.",
  },
  {
    id: "sf_website",
    fieldName: "website",
    label: "Website",
    value: "ccrides.org",
    sourceType: "Website",
    confidence: "High",
    status: "suggested",
    explanation: "Primary domain found alongside the organization name.",
  },
  {
    id: "sf_mission",
    fieldName: "mission",
    label: "Mission statement",
    value: sampleProfile.mission,
    sourceType: "Website",
    confidence: "High",
    status: "suggested",
    explanation: "Pulled from the homepage 'About' / mission section.",
  },
  {
    id: "sf_geo",
    fieldName: "geography",
    label: "Primary geography served",
    value: "Greater metro region (county-level, sample)",
    sourceType: "Inferred",
    confidence: "Medium",
    status: "suggested",
    explanation: "Inferred from service-area language on the website; confirm the exact counties.",
  },
  {
    id: "sf_type",
    fieldName: "orgType",
    label: "Organization type",
    value: "501(c)(3) public charity",
    sourceType: "IRS/public filing",
    confidence: "High",
    status: "suggested",
    explanation: "Tax-exempt status from the (mocked) IRS record.",
  },
  {
    id: "sf_programs",
    fieldName: "programs",
    label: "Programs / services",
    value:
      "Subsidized rides; Live phone dispatch; Medical appointment transportation; Grocery & food access rides; Community partner transportation support; Mobility support for older & disabled adults",
    sourceType: "Website",
    confidence: "Medium",
    status: "suggested",
    explanation: "Program names scraped from the 'Services' page; descriptions may need editing.",
  },
  {
    id: "sf_pops",
    fieldName: "populations",
    label: "Populations served",
    value:
      "Seniors; People with disabilities; Low-income riders; Medically vulnerable people; People without reliable transportation; People with limited digital access",
    sourceType: "Website",
    confidence: "Medium",
    status: "suggested",
    explanation: "Derived from who the site says it serves.",
  },
  {
    id: "sf_outcomes",
    fieldName: "outcomes",
    label: "Key outcomes",
    value:
      "Reduced missed medical appointments; Reduced social isolation; Improved access to food and daily needs; Preserved independence",
    sourceType: "Inferred",
    confidence: "Low",
    status: "suggested",
    explanation: "Likely outcomes based on program type — confirm with your own data.",
  },
  {
    id: "sf_proof",
    fieldName: "proofPoints",
    label: "Proof points",
    value:
      "~12,000 rides/year; ~600 active riders; human dispatch model; affordable copay; established community partners (all sample figures)",
    sourceType: "Prior grant/document",
    confidence: "Medium",
    status: "suggested",
    explanation: "Pulled from a prior grant narrative; verify current numbers.",
  },
  {
    id: "sf_funders",
    fieldName: "currentFunders",
    label: "Current partners / funders",
    value: "Local community foundation (sample); Individual donors; Civic club mini-grant (sample)",
    sourceType: "Prior grant/document",
    confidence: "Low",
    status: "suggested",
    explanation: "Mentioned in prior materials; may be out of date.",
  },
  {
    id: "sf_budget",
    fieldName: "budgetRange",
    label: "Annual operating budget range",
    value: "$250K–$1M",
    sourceType: "IRS/public filing",
    confidence: "Medium",
    status: "suggested",
    explanation: "Estimated from the most recent (mocked) Form 990 total revenue.",
  },
  {
    id: "sf_gaps",
    fieldName: "capacityConstraints",
    label: "Possible gaps",
    value:
      "Needs stronger outcome data beyond ride counts; clearer cost-per-outcome metrics; more funder-specific case studies; updated partner letters.",
    sourceType: "Inferred",
    confidence: "Medium",
    status: "suggested",
    explanation: "Common gaps for transportation nonprofits at this stage — review and adjust.",
  },
];

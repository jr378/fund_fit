import type {
  Confidence,
  DocAvailabilityKey,
  DocumentAvailability,
  FunderType,
  NonprofitProfile,
} from "./types";

/** Format a whole-dollar amount as currency, no cents. */
export function currency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Format a {min,max} range as "$10,000–$50,000". */
export function currencyRange(range: { min: number; max: number }): string {
  return `${currency(range.min)}–${currency(range.max)}`;
}

/** Human label for a confidence level + a tailwind color token. */
export const confidenceMeta: Record<Confidence, { label: string; color: string }> = {
  High: { label: "High confidence", color: "emerald" },
  Medium: { label: "Medium confidence", color: "amber" },
  Low: { label: "Low confidence", color: "rose" },
};

export const funderTypeLabel: Record<FunderType, string> = {
  foundation: "Foundation",
  "corporate giving": "Corporate giving",
  "government grant": "Government grant",
  "donor advised fund": "Donor advised fund",
  "civic club": "Civic club",
  "healthcare system": "Healthcare system",
};

export const docLabels: Record<DocAvailabilityKey, string> = {
  determinationLetter: "501(c)(3) determination letter",
  latest990: "Latest IRS Form 990",
  auditedFinancials: "Audit or reviewed financials",
  operatingBudget: "Current operating budget",
  programBudget: "Program budget",
  boardList: "Board list",
  strategicPlan: "Strategic plan",
  impactReport: "Impact report",
  testimonials: "Testimonials",
  partnerLetters: "Partner letters",
  evaluationData: "Evaluation data",
};

export const allDocKeys = Object.keys(docLabels) as DocAvailabilityKey[];

export function emptyDocuments(): DocumentAvailability {
  return allDocKeys.reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {} as DocumentAvailability);
}

/** Days between today and an ISO date string (negative if past). */
export function daysUntil(iso: string | null, today: Date = new Date()): number | null {
  if (!iso) return null;
  const target = new Date(iso + "T00:00:00");
  const ms = target.getTime() - today.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** A fresh, empty profile used before any prefill. */
export function emptyProfile(): NonprofitProfile {
  return {
    name: "",
    website: "",
    ein: "",
    mission: "",
    geography: "",
    orgType: "",
    budgetRange: "unknown",
    fundraisingCapacity: "",
    programs: [],
    populations: [],
    outcomes: [],
    proofPoints: [],
    currentFunders: [],
    pastGrantsWon: [],
    pastGrantsLost: [],
    relationshipNotes: "",
    documents: emptyDocuments(),
    capacityConstraints: "",
    missionBoundaries: "",
    programCategories: [],
    fundingNeeds: [],
  };
}

/** Stable-ish id generator for client-created records. */
export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Title-case a slug or kebab string for display. */
export function titleCase(s: string): string {
  return s
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

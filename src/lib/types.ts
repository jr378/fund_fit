/**
 * FundFit core domain types.
 *
 * Everything in this MVP runs on local mock data. These types are intentionally
 * explicit so that real data sources (IRS 990, ProPublica, Grants.gov, website
 * crawling, an LLM drafting layer, etc.) can be swapped in later without
 * reshaping the UI. See docs/data-integrations-roadmap.md.
 */

// ---------------------------------------------------------------------------
// Suggested fields (the heart of the "public-data prefill" experience)
// ---------------------------------------------------------------------------

/** Where a suggested value claims to have come from. All mocked for now. */
export type SourceType =
  | "Website"
  | "IRS/public filing"
  | "Prior grant/document"
  | "Inferred"
  | "User-entered";

export type Confidence = "High" | "Medium" | "Low";

export type SuggestedFieldStatus =
  | "suggested"
  | "accepted"
  | "edited"
  | "removed";

/**
 * A single piece of suggested organization information. The user always stays
 * in control: every suggestion can be accepted, edited, or removed, and carries
 * a source + confidence so trust is never assumed.
 */
export interface SuggestedField {
  id: string;
  /** Maps to a key on NonprofitProfile (e.g. "mission", "geography"). */
  fieldName: keyof NonprofitProfile | string;
  /** Human-readable label shown in the review UI. */
  label: string;
  value: string;
  sourceType: SourceType;
  confidence: Confidence;
  status: SuggestedFieldStatus;
  /** Plain-English reason this was suggested. */
  explanation: string;
}

// ---------------------------------------------------------------------------
// Public lookup (mocked "search public sources and your website")
// ---------------------------------------------------------------------------

export interface PublicProfileResult {
  id: string;
  name: string;
  website: string;
  ein?: string;
  location: string;
  summary: string;
  /** Confidence that this search result matches the query. */
  matchConfidence: Confidence;
  /** True for the curated Common Courtesy-style demo record. */
  isSample: boolean;
  /** The suggested fields revealed once this result is chosen. */
  suggestedFields: SuggestedField[];
}

// ---------------------------------------------------------------------------
// Documents (mocked upload + extraction)
// ---------------------------------------------------------------------------

export type DocumentKind =
  | "990"
  | "annual-report"
  | "successful-grant"
  | "rejected-grant"
  | "program-budget"
  | "impact-report"
  | "testimonials"
  | "partner-letter";

export interface DocumentExtractionResult {
  id: string;
  kind: DocumentKind;
  label: string;
  /** Facts pulled from the document, surfaced as suggested fields. */
  extractedFacts: SuggestedField[];
  addedAt: string;
}

// ---------------------------------------------------------------------------
// Guided interview
// ---------------------------------------------------------------------------

export interface InterviewQuestion {
  id: string;
  prompt: string;
  helper: string;
  placeholder: string;
  /** What this answer feeds into in the dossier. */
  feeds: ("proofPoint" | "fundingNeed" | "missionBoundary" | "outcome" | "snippet")[];
}

export interface GuidedInterviewAnswer {
  questionId: string;
  answer: string;
}

// ---------------------------------------------------------------------------
// Organization dossier
// ---------------------------------------------------------------------------

export type OrgType =
  | "501(c)(3) public charity"
  | "501(c)(3) private foundation"
  | "Fiscally sponsored project"
  | "Other nonprofit";

export type FundraisingCapacity =
  | "No dedicated fundraiser"
  | "Part-time fundraiser"
  | "Full-time fundraiser"
  | "Development team";

export type BudgetRange =
  | "unknown"
  | "Under $250K"
  | "$250K–$1M"
  | "$1M–$5M"
  | "$5M–$10M"
  | "Over $10M";

export interface Program {
  id: string;
  name: string;
  description: string;
}

export interface ProofPoint {
  id: string;
  text: string;
  /** Optional metric attached to the proof point (e.g. "12,000 rides/yr"). */
  metric?: string;
  source: SourceType;
}

/** Documents an org may have on hand for applications. */
export type DocumentAvailability = Record<DocAvailabilityKey, boolean>;

export type DocAvailabilityKey =
  | "determinationLetter"
  | "latest990"
  | "auditedFinancials"
  | "operatingBudget"
  | "programBudget"
  | "boardList"
  | "strategicPlan"
  | "impactReport"
  | "testimonials"
  | "partnerLetters"
  | "evaluationData";

export interface NonprofitProfile {
  name: string;
  website: string;
  ein: string;
  mission: string;
  geography: string;
  orgType: OrgType | "";
  budgetRange: BudgetRange;
  fundraisingCapacity: FundraisingCapacity | "";
  programs: Program[];
  populations: string[];
  outcomes: string[];
  proofPoints: ProofPoint[];
  currentFunders: string[];
  pastGrantsWon: string[];
  pastGrantsLost: string[];
  relationshipNotes: string;
  documents: DocumentAvailability;
  capacityConstraints: string;
  missionBoundaries: string;
  /** Categories used by scoring; derived from programs but editable. */
  programCategories: string[];
  /** Free-form funding needs captured during the interview. */
  fundingNeeds: string[];
}

// ---------------------------------------------------------------------------
// Funding frames
// ---------------------------------------------------------------------------

export interface FundingFrame {
  id: string;
  name: string;
  whyFits: string;
  bestFunderTypes: FunderType[];
  strongestProofPoints: string[];
  possibleGap: string;
  languageSnippet: string;
  confidence: Confidence;
  /** Program categories that activate this frame. */
  triggerCategories: string[];
}

// ---------------------------------------------------------------------------
// Funders & scoring
// ---------------------------------------------------------------------------

export type FunderType =
  | "foundation"
  | "corporate giving"
  | "government grant"
  | "donor advised fund"
  | "civic club"
  | "healthcare system";

export type DeadlineType = "rolling" | "annual" | "quarterly" | "invitation only";
export type ApplicationBurden = "low" | "medium" | "high";
export type RelationshipRequired = "none" | "helpful" | "likely required";

export interface Funder {
  id: string;
  name: string;
  type: FunderType;
  geography: string;
  /** "local" | "state" | "national" reach used by geography scoring. */
  reach: "local" | "state" | "national";
  interests: string[];
  populations: string[];
  typicalGrantRange: { min: number; max: number };
  deadlineType: DeadlineType;
  /** ISO date or null for rolling/invitation. */
  nextDeadline: string | null;
  applicationBurden: ApplicationBurden;
  relationshipRequired: RelationshipRequired;
  requiredDocuments: DocAvailabilityKey[];
  notes: string;
  samplePastGrants: string[];
  website: string;
  /** True for clearly-fictional demo funders. */
  isSample: boolean;
}

export type Recommendation =
  | "Apply now"
  | "Cultivate first"
  | "Prepare for next cycle"
  | "Skip";

export interface ScoreComponent {
  key: string;
  label: string;
  /** 0–100 */
  score: number;
  /** 0–1 contribution weight toward the overall score. */
  weight: number;
  explanation: string;
}

export interface FunderScore {
  funderId: string;
  components: ScoreComponent[];
  /** 0–100 weighted overall, after burden penalty. */
  overall: number;
  recommendation: Recommendation;
  reason: string;
  suggestedAsk: number;
  bestFrameId: string | null;
  missingMaterials: DocAvailabilityKey[];
  nextAction: string;
}

// ---------------------------------------------------------------------------
// Pursuit brief
// ---------------------------------------------------------------------------

export interface PursuitBrief {
  funder: Funder;
  score: FunderScore;
  whyFits: string[];
  whyNotFits: string[];
  bestFrame: FundingFrame | null;
  suggestedAsk: number;
  programAngle: string;
  proofPointsToUse: string[];
  missingEvidence: string[];
  readinessChecklist: { label: string; done: boolean }[];
  relationshipStrategy: string;
  step7Day: string;
  step30Day: string;
  step90Day: string;
  outreachEmail: string;
  loiOutline: string[];
  reportingMetrics: string[];
}

// ---------------------------------------------------------------------------
// Grant assets
// ---------------------------------------------------------------------------

export type GrantAssetKind =
  | "summary-100"
  | "summary-250"
  | "need-statement"
  | "program-description"
  | "outcomes"
  | "budget-narrative"
  | "evaluation-plan"
  | "sustainability"
  | "partner-letter"
  | "board-intro-email"
  | "program-officer-email"
  | "loi-skeleton";

export interface GrantAsset {
  kind: GrantAssetKind;
  title: string;
  body: string;
  /** Which profile fields / proof points fed this asset. */
  fieldsUsed: string[];
}

// ---------------------------------------------------------------------------
// Readiness
// ---------------------------------------------------------------------------

export interface ReadinessCategory {
  key: string;
  label: string;
  /** 0–100 */
  score: number;
  detail: string;
}

export interface ReadinessChecklist {
  overall: number;
  categories: ReadinessCategory[];
  strengths: string[];
  gaps: string[];
  topActions: string[];
  blockHighBurden: string[];
}

// ---------------------------------------------------------------------------
// 90-day plan
// ---------------------------------------------------------------------------

export type TaskStatus = "Not started" | "In progress" | "Done";
export type TaskPriority = "High" | "Medium" | "Low";

export interface FundingTask {
  id: string;
  phase: string;
  task: string;
  owner: string;
  dueDate: string;
  priority: TaskPriority;
  relatedFunderId: string | null;
  status: TaskStatus;
}

// ---------------------------------------------------------------------------
// Profile completeness
// ---------------------------------------------------------------------------

export interface CompletenessResult {
  percent: number;
  readyForFirstMap: boolean;
  missingRequired: string[];
  mostUsefulNext: { field: string; why: string } | null;
}

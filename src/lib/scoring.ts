import type {
  BudgetRange,
  DocAvailabilityKey,
  Funder,
  FunderScore,
  FundingFrame,
  NonprofitProfile,
  Recommendation,
  ScoreComponent,
} from "./types";
import { daysUntil, docLabels } from "./formatters";
import { generateFundingFrames } from "./fundingFrames";

/**
 * Transparent funder scoring.
 *
 * Every component returns a 0–100 score AND a plain-English explanation that is
 * shown directly in the UI. Nothing is hidden. Weights are defined here and can
 * be edited freely — they are the whole "model".
 */

const WEIGHTS = {
  mission: 0.22,
  population: 0.16,
  geography: 0.12,
  award: 0.12,
  readiness: 0.14,
  deadline: 0.08,
  relationship: 0.08,
  repeatability: 0.08,
};

const BUDGET_MIDPOINT: Record<BudgetRange, number> = {
  unknown: 500_000,
  "Under $250K": 125_000,
  "$250K–$1M": 600_000,
  "$1M–$5M": 3_000_000,
  "$5M–$10M": 7_500_000,
  "Over $10M": 15_000_000,
};

const LOW_CAPACITY = new Set(["No dedicated fundraiser", "Part-time fundraiser", ""]);

function pct(part: number, whole: number): number {
  if (whole === 0) return 0;
  return Math.round((part / whole) * 100);
}

function overlap<T>(a: T[], b: T[]): T[] {
  const set = new Set(b.map((x) => String(x).toLowerCase()));
  return a.filter((x) => set.has(String(x).toLowerCase()));
}

// --- Individual component scorers --------------------------------------------

function missionFit(profile: NonprofitProfile, funder: Funder): ScoreComponent {
  const matches = overlap(profile.programCategories, funder.interests);
  const score = Math.min(100, pct(matches.length, Math.max(1, Math.min(funder.interests.length, 4))) );
  return {
    key: "mission",
    label: "Mission fit",
    score,
    weight: WEIGHTS.mission,
    explanation: matches.length
      ? `Your work overlaps the funder's interests on: ${matches.join(", ")}.`
      : "No clear overlap between your program categories and this funder's stated interests.",
  };
}

function populationFit(profile: NonprofitProfile, funder: Funder): ScoreComponent {
  const matches = overlap(profile.populations, funder.populations);
  const score = Math.min(100, pct(matches.length, Math.max(1, funder.populations.length)));
  return {
    key: "population",
    label: "Population fit",
    score,
    weight: WEIGHTS.population,
    explanation: matches.length
      ? `You serve populations this funder targets: ${matches.join(", ")}.`
      : "The populations you serve don't clearly match this funder's priority populations.",
  };
}

function geographyFit(profile: NonprofitProfile, funder: Funder): ScoreComponent {
  // National funders reach everyone; local funders only fit local orgs well.
  let score = 60;
  let explanation = "";
  switch (funder.reach) {
    case "national":
      score = 90;
      explanation = "National funder — geography is rarely a barrier.";
      break;
    case "state":
      score = 80;
      explanation = "State/regional funder — likely covers your service area; confirm eligibility.";
      break;
    case "local":
      score = 95;
      explanation = "Local funder — a strong match for a community-rooted ride program.";
      break;
  }
  if (!profile.geography) {
    score = Math.min(score, 60);
    explanation += " (Add your service area to firm this up.)";
  }
  return { key: "geography", label: "Geography fit", score, weight: WEIGHTS.geography, explanation };
}

function awardFit(profile: NonprofitProfile, funder: Funder): ScoreComponent {
  const budget = BUDGET_MIDPOINT[profile.budgetRange];
  // A comfortable ask band: 2%–25% of the org's annual budget.
  const bandLow = budget * 0.02;
  const bandHigh = budget * 0.25;
  const { min, max } = funder.typicalGrantRange;
  const overlapLow = Math.max(bandLow, min);
  const overlapHigh = Math.min(bandHigh, max);
  const hasOverlap = overlapHigh >= overlapLow;
  let score: number;
  let explanation: string;
  if (hasOverlap) {
    score = 85;
    explanation = `This funder's typical range fits a realistic ask for your size (≈2–25% of budget).`;
  } else if (min > bandHigh) {
    score = 45;
    explanation = `Typical awards may be large relative to your budget — could be hard to absorb or to compete for.`;
  } else {
    score = 55;
    explanation = `Typical awards may be small relative to your budget — fine for a quick win, less for core funding.`;
  }
  if (profile.budgetRange === "unknown") {
    score = Math.min(score, 65);
    explanation += " (Budget range is unknown — add it for a better estimate.)";
  }
  return { key: "award", label: "Award-size fit", score, weight: WEIGHTS.award, explanation };
}

function readinessFit(profile: NonprofitProfile, funder: Funder): ScoreComponent {
  const required = funder.requiredDocuments;
  const have = required.filter((k) => profile.documents[k]);
  const missing = required.filter((k) => !profile.documents[k]);
  const score = required.length ? pct(have.length, required.length) : 80;
  return {
    key: "readiness",
    label: "Readiness fit",
    score,
    weight: WEIGHTS.readiness,
    explanation: missing.length
      ? `You have ${have.length}/${required.length} required documents. Missing: ${missing.map((k) => docLabels[k]).join(", ")}.`
      : `You appear to have all ${required.length} required documents on hand.`,
  };
}

function deadlineFit(funder: Funder): ScoreComponent {
  if (funder.deadlineType === "rolling") {
    return { key: "deadline", label: "Deadline fit", score: 90, weight: WEIGHTS.deadline, explanation: "Rolling deadline — apply when you're ready." };
  }
  if (funder.deadlineType === "invitation only") {
    return { key: "deadline", label: "Deadline fit", score: 40, weight: WEIGHTS.deadline, explanation: "Invitation only — you can't apply cold; cultivation comes first." };
  }
  const days = daysUntil(funder.nextDeadline);
  if (days === null) {
    return { key: "deadline", label: "Deadline fit", score: 60, weight: WEIGHTS.deadline, explanation: "No dated deadline on file." };
  }
  if (days < 0) {
    return { key: "deadline", label: "Deadline fit", score: 25, weight: WEIGHTS.deadline, explanation: `This cycle's deadline passed ${Math.abs(days)} days ago — prepare for the next round.` };
  }
  if (days < 21) {
    return { key: "deadline", label: "Deadline fit", score: 45, weight: WEIGHTS.deadline, explanation: `Only ${days} days until the deadline — tight for a strong application.` };
  }
  if (days < 75) {
    return { key: "deadline", label: "Deadline fit", score: 95, weight: WEIGHTS.deadline, explanation: `${days} days until the deadline — enough time to apply well.` };
  }
  return { key: "deadline", label: "Deadline fit", score: 75, weight: WEIGHTS.deadline, explanation: `${days} days out — plenty of runway; queue it for the right moment.` };
}

function relationshipFit(profile: NonprofitProfile, funder: Funder): ScoreComponent {
  const hasNotes = profile.relationshipNotes.trim().length > 20;
  const mentioned = funder.name.split(" ")[0].toLowerCase();
  const noteMentions = profile.relationshipNotes.toLowerCase().includes(mentioned);
  let score: number;
  let explanation: string;
  switch (funder.relationshipRequired) {
    case "none":
      score = 90;
      explanation = "No prior relationship required — open to cold applications.";
      break;
    case "helpful":
      score = hasNotes ? 75 : 60;
      explanation = hasNotes
        ? "A relationship helps here, and you have some relationship notes to build on."
        : "A relationship helps here — worth a warm introduction before applying.";
      break;
    case "likely required":
      score = noteMentions ? 80 : 35;
      explanation = noteMentions
        ? "Relationship likely required — and your notes suggest an existing connection. Lead with it."
        : "Relationship likely required, and no existing connection on file. Cultivate before applying.";
      break;
  }
  return { key: "relationship", label: "Relationship fit", score, weight: WEIGHTS.relationship, explanation };
}

function repeatabilityFit(funder: Funder): ScoreComponent {
  let score = 50;
  const reasons: string[] = [];
  if (funder.deadlineType === "rolling" || funder.deadlineType === "quarterly") {
    score += 25;
    reasons.push("recurring/rolling deadlines make it reusable");
  }
  if (funder.applicationBurden === "low") {
    score += 20;
    reasons.push("low application burden");
  } else if (funder.applicationBurden === "high") {
    score -= 10;
    reasons.push("high burden lowers reuse value");
  }
  if (funder.relationshipRequired === "none") {
    score += 5;
  }
  score = Math.max(0, Math.min(100, score));
  return {
    key: "repeatability",
    label: "Repeatability",
    score,
    weight: WEIGHTS.repeatability,
    explanation: reasons.length
      ? `Likelihood you can reuse work here over time: ${reasons.join("; ")}.`
      : "Moderate potential to reuse application work across cycles.",
  };
}

// --- Composite ---------------------------------------------------------------

function burdenPenalty(profile: NonprofitProfile, funder: Funder): { factor: number; note: string } {
  const lowCapacity = LOW_CAPACITY.has(profile.fundraisingCapacity);
  if (funder.applicationBurden === "high" && lowCapacity) {
    return { factor: 0.82, note: "High-burden application + limited fundraising capacity (−18%)." };
  }
  if (funder.applicationBurden === "high") {
    return { factor: 0.93, note: "High-burden application (−7%)." };
  }
  return { factor: 1, note: "" };
}

function chooseBestFrame(profile: NonprofitProfile, funder: Funder): FundingFrame | null {
  const frames = generateFundingFrames(profile);
  if (!frames.length) return null;
  let best: FundingFrame | null = null;
  let bestScore = -1;
  for (const f of frames) {
    const typeMatch = f.bestFunderTypes.includes(funder.type) ? 2 : 0;
    const interestMatch = overlap(f.triggerCategories, funder.interests).length;
    const confBonus = f.confidence === "High" ? 1 : f.confidence === "Medium" ? 0.5 : 0;
    const s = typeMatch + interestMatch + confBonus;
    if (s > bestScore) {
      bestScore = s;
      best = f;
    }
  }
  return best;
}

function suggestedAsk(profile: NonprofitProfile, funder: Funder, hasRelationship: boolean): number {
  const { min, max } = funder.typicalGrantRange;
  // First approaches lean toward the lower-middle of the range; warm ones higher.
  const factor = hasRelationship ? 0.55 : 0.4;
  const raw = min + factor * (max - min);
  // Round to nearest $5,000.
  return Math.round(raw / 5000) * 5000;
}

function missingMaterials(profile: NonprofitProfile, funder: Funder): DocAvailabilityKey[] {
  return funder.requiredDocuments.filter((k) => !profile.documents[k]);
}

function decide(
  overall: number,
  components: Record<string, ScoreComponent>,
  funder: Funder,
  missing: DocAvailabilityKey[],
): { recommendation: Recommendation; reason: string; nextAction: string } {
  const deadline = components.deadline.score;
  const relationship = components.relationship;
  const days = daysUntil(funder.nextDeadline);
  const deadlinePassed = funder.deadlineType !== "rolling" && days !== null && days < 0;
  const needsRelationship =
    funder.relationshipRequired === "likely required" && relationship.score < 60;

  // Fundamental mismatch: if the funder neither funds your kind of work nor
  // your populations, no amount of timing or award fit makes it worth pursuing.
  if (components.mission.score < 25 && components.population.score < 25) {
    return {
      recommendation: "Skip",
      reason: "This funder doesn't fund your kind of work or the populations you serve. Even with good timing, it's a fundamental mismatch — skip it.",
      nextAction: "Skip. Don't spend scarce time here; focus on mission-aligned funders.",
    };
  }

  if (overall < 42) {
    return {
      recommendation: "Skip",
      reason: "Overall fit is low. Spend your limited time on stronger-fit funders instead of forcing this one.",
      nextAction: "Skip for now. Revisit only if your programs or this funder's priorities change.",
    };
  }
  if (needsRelationship || funder.deadlineType === "invitation only") {
    return {
      recommendation: "Cultivate first",
      reason: funder.deadlineType === "invitation only"
        ? "This funder is invitation only — you need a relationship before there's any door to walk through."
        : "A real relationship is likely required and you don't have one on file yet.",
      nextAction: "Identify a warm introduction (board, partner, or peer) and request an informal conversation before applying.",
    };
  }
  if (deadlinePassed) {
    return {
      recommendation: "Prepare for next cycle",
      reason: "Strong fit, but this cycle's deadline has passed.",
      nextAction: "Add the next likely deadline to your calendar and start gathering required materials now.",
    };
  }
  if (missing.length >= 2 && funder.applicationBurden === "high") {
    return {
      recommendation: "Prepare for next cycle",
      reason: `Good fit, but you're missing ${missing.length} required materials for a high-burden application.`,
      nextAction: "Close the document gaps first (see missing materials), then apply with a complete package.",
    };
  }
  if (overall >= 60 && deadline >= 45) {
    return {
      recommendation: "Apply now",
      reason: "Strong overall fit and enough runway before the deadline. This is a priority opportunity.",
      nextAction: "Start the application using the best funding frame and your strongest proof points (see the pursuit brief).",
    };
  }
  return {
    recommendation: "Cultivate first",
    reason: "Decent fit, but either the timing is tight or a warm relationship would meaningfully raise your odds.",
    nextAction: "Send a brief introduction and request a short call to test interest before investing in a full application.",
  };
}

/** Score a single funder against a profile. Fully deterministic. */
export function scoreFunder(profile: NonprofitProfile, funder: Funder): FunderScore {
  const comps: ScoreComponent[] = [
    missionFit(profile, funder),
    populationFit(profile, funder),
    geographyFit(profile, funder),
    awardFit(profile, funder),
    readinessFit(profile, funder),
    deadlineFit(funder),
    relationshipFit(profile, funder),
    repeatabilityFit(funder),
  ];
  const byKey = Object.fromEntries(comps.map((c) => [c.key, c])) as Record<string, ScoreComponent>;

  const weighted = comps.reduce((sum, c) => sum + c.score * c.weight, 0);
  const penalty = burdenPenalty(profile, funder);
  let overall = Math.round(weighted * penalty.factor);
  overall = Math.max(0, Math.min(100, overall));

  const missing = missingMaterials(profile, funder);
  const decision = decide(overall, byKey, funder, missing);
  const hasRelationship = byKey.relationship.score >= 75;

  // Surface the burden penalty in the readiness explanation if applied.
  if (penalty.note) {
    byKey.readiness.explanation += ` Note on scoring: ${penalty.note}`;
  }

  const bestFrame = chooseBestFrame(profile, funder);

  return {
    funderId: funder.id,
    components: comps,
    overall,
    recommendation: decision.recommendation,
    reason: decision.reason,
    suggestedAsk: suggestedAsk(profile, funder, hasRelationship),
    bestFrameId: bestFrame?.id ?? null,
    missingMaterials: missing,
    nextAction: decision.nextAction,
  };
}

/** Score every funder and return them ranked by overall fit (desc). */
export function scoreAllFunders(profile: NonprofitProfile, funders: Funder[]): FunderScore[] {
  return funders
    .map((f) => scoreFunder(profile, f))
    .sort((a, b) => b.overall - a.overall);
}

export { WEIGHTS };

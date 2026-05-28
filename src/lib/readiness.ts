import type { CompletenessResult, NonprofitProfile, ReadinessChecklist, ReadinessCategory } from "./types";
import { docLabels } from "./formatters";

/**
 * Funding readiness evaluation. Uses accepted dossier fields, document
 * availability (incl. simulated uploads), and interview-derived content.
 * Fully transparent: each category explains its own score.
 */

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function legalFinancial(p: NonprofitProfile): ReadinessCategory {
  const docs = ["determinationLetter", "latest990", "auditedFinancials", "operatingBudget"] as const;
  const have = docs.filter((d) => p.documents[d]);
  return {
    key: "legal",
    label: "Legal / financial documents",
    score: clamp((have.length / docs.length) * 100),
    detail: have.length === docs.length
      ? "You have the core legal and financial documents most funders ask for."
      : `Missing: ${docs.filter((d) => !p.documents[d]).map((d) => docLabels[d]).join(", ")}.`,
  };
}

function programClarity(p: NonprofitProfile): ReadinessCategory {
  const score = clamp((p.programs.length >= 3 ? 70 : p.programs.length * 20) + (p.mission ? 30 : 0));
  return {
    key: "program",
    label: "Program clarity",
    score,
    detail: p.programs.length
      ? `${p.programs.length} program(s) defined${p.mission ? " with a clear mission" : " — add a mission statement"}.`
      : "Add your programs and mission so funders understand what you do.",
  };
}

function budgetClarity(p: NonprofitProfile): ReadinessCategory {
  let score = 0;
  if (p.budgetRange !== "unknown") score += 40;
  if (p.documents.operatingBudget) score += 30;
  if (p.documents.programBudget) score += 30;
  return {
    key: "budget",
    label: "Budget clarity",
    score: clamp(score),
    detail: p.budgetRange === "unknown"
      ? "Add a budget range and upload a program budget to suggest realistic ask amounts."
      : "Budget range set" + (p.documents.programBudget ? " and a program budget is available." : " — a program budget would help."),
  };
}

function outcomeData(p: NonprofitProfile): ReadinessCategory {
  let score = p.outcomes.length * 15;
  if (p.documents.evaluationData) score += 35;
  if (p.documents.impactReport) score += 20;
  return {
    key: "outcomes",
    label: "Outcome data",
    score: clamp(score),
    detail: p.documents.evaluationData
      ? "You have evaluation data — a major advantage for competitive funders."
      : "Outcome data is the most common gap. Move beyond activity counts to results.",
  };
}

function storiesTestimonials(p: NonprofitProfile): ReadinessCategory {
  const score = (p.documents.testimonials ? 60 : 0) + Math.min(40, p.proofPoints.length * 10);
  return {
    key: "stories",
    label: "Testimonials / stories",
    score: clamp(score),
    detail: p.documents.testimonials
      ? "You have testimonials on hand — great for story-driven funders."
      : "Collect a few rider/client stories; they carry small and mid-size funders.",
  };
}

function partnerValidation(p: NonprofitProfile): ReadinessCategory {
  const score = (p.documents.partnerLetters ? 50 : 0) + Math.min(50, p.currentFunders.length * 20);
  return {
    key: "partners",
    label: "Partner validation",
    score: clamp(score),
    detail: p.documents.partnerLetters
      ? "Partner letters are available."
      : "Refresh partner letters of support — many funders ask for them.",
  };
}

function relationships(p: NonprofitProfile): ReadinessCategory {
  const len = p.relationshipNotes.trim().length;
  const score = clamp(Math.min(70, len) + (p.currentFunders.length ? 30 : 0));
  return {
    key: "relationships",
    label: "Board / funder relationships",
    score,
    detail: len > 20
      ? "You've documented some funder relationships — map them to specific funders."
      : "Document which board members and partners know which funders.",
  };
}

function reportingCapacity(p: NonprofitProfile): ReadinessCategory {
  let score = 30;
  if (p.documents.evaluationData) score += 40;
  if (p.fundraisingCapacity === "Development team") score += 30;
  else if (p.fundraisingCapacity === "Full-time fundraiser") score += 20;
  else if (p.fundraisingCapacity === "Part-time fundraiser") score += 10;
  return {
    key: "reporting",
    label: "Reporting capacity",
    score: clamp(score),
    detail: p.fundraisingCapacity && p.fundraisingCapacity !== "No dedicated fundraiser"
      ? "You have some dedicated capacity to manage grant reporting."
      : "Limited reporting capacity — favor low-burden funders until you add capacity.",
  };
}

export function evaluateReadiness(p: NonprofitProfile): ReadinessChecklist {
  const categories = [
    legalFinancial(p),
    programClarity(p),
    budgetClarity(p),
    outcomeData(p),
    storiesTestimonials(p),
    partnerValidation(p),
    relationships(p),
    reportingCapacity(p),
  ];
  const overall = clamp(categories.reduce((s, c) => s + c.score, 0) / categories.length);

  const strengths = categories.filter((c) => c.score >= 70).map((c) => c.label);
  const gaps = categories.filter((c) => c.score < 50).map((c) => c.label);

  // Highest-leverage actions: lowest-scoring categories first.
  const topActions = [...categories]
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map((c) => `${c.label}: ${c.detail}`);

  const blockHighBurden: string[] = [];
  if (outcomeData(p).score < 50) blockHighBurden.push("Strengthen outcome data beyond activity counts.");
  if (legalFinancial(p).score < 75) blockHighBurden.push("Assemble audited/reviewed financials and a current operating budget.");
  if (budgetClarity(p).score < 60) blockHighBurden.push("Prepare a detailed program budget with cost-per-outcome.");

  return { overall, categories, strengths, gaps, topActions, blockHighBurden };
}

// --- Profile completeness ----------------------------------------------------

const REQUIRED_FIELDS: { label: string; has: (p: NonprofitProfile) => boolean }[] = [
  { label: "Organization name", has: (p) => !!p.name },
  { label: "Mission", has: (p) => !!p.mission },
  { label: "Geography", has: (p) => !!p.geography },
  { label: "Programs / services", has: (p) => p.programs.length > 0 },
  { label: "Populations served", has: (p) => p.populations.length > 0 },
  { label: "Budget range (or 'unknown')", has: (p) => !!p.budgetRange },
  { label: "Documents available", has: (p) => Object.values(p.documents).some(Boolean) },
];

/** Optional fields ranked by how useful they are to add next. */
const USEFUL_NEXT: { field: string; why: string; missing: (p: NonprofitProfile) => boolean }[] = [
  {
    field: "Cost per ride / cost per participant",
    why: "This will help FundFit suggest realistic ask amounts and unlock cost-per-outcome language funders love.",
    missing: (p) => !p.documents.programBudget && !p.fundingNeeds.some((n) => /cost|per ride|per participant/i.test(n)),
  },
  {
    field: "Evaluation data",
    why: "Outcome data beyond activity counts is the single biggest unlock for competitive and high-burden funders.",
    missing: (p) => !p.documents.evaluationData,
  },
  {
    field: "Audited or reviewed financials",
    why: "Several strong-fit funders require audited financials before you can apply.",
    missing: (p) => !p.documents.auditedFinancials,
  },
  {
    field: "Funder relationship notes",
    why: "Mapping who-knows-whom turns 'invitation only' and relationship-required funders from blocked to reachable.",
    missing: (p) => p.relationshipNotes.trim().length < 20,
  },
  {
    field: "Partner letters",
    why: "Fresh letters of support strengthen applications and are quick wins to collect.",
    missing: (p) => !p.documents.partnerLetters,
  },
  {
    field: "Key outcomes",
    why: "Clear outcomes power your grant assets and readiness score.",
    missing: (p) => p.outcomes.length === 0,
  },
];

export function evaluateCompleteness(p: NonprofitProfile): CompletenessResult {
  const present = REQUIRED_FIELDS.filter((f) => f.has(p));
  const missingRequired = REQUIRED_FIELDS.filter((f) => !f.has(p)).map((f) => f.label);
  const percent = Math.round((present.length / REQUIRED_FIELDS.length) * 100);
  const readyForFirstMap = missingRequired.length === 0;
  const next = USEFUL_NEXT.find((u) => u.missing(p));
  return {
    percent,
    readyForFirstMap,
    missingRequired,
    mostUsefulNext: next ? { field: next.field, why: next.why } : null,
  };
}

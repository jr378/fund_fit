import type { DocumentExtractionResult, DocumentKind, SuggestedField } from "./types";
import { uid } from "./formatters";

/**
 * Mocked document upload + extraction.
 *
 * Clicking an "upload" button in the UI does NOT read a real file. It returns a
 * canned set of extracted facts that mirror what a real parser (990 XML,
 * PDF text extraction, an LLM extraction pass) might surface. Every fact is
 * presented as a suggested field with source "Prior grant/document".
 */

export interface DocumentOption {
  kind: DocumentKind;
  label: string;
  description: string;
}

export const DOCUMENT_OPTIONS: DocumentOption[] = [
  { kind: "990", label: "Upload latest 990", description: "Most recent IRS Form 990" },
  { kind: "annual-report", label: "Upload annual report", description: "Yearly impact / annual report" },
  { kind: "successful-grant", label: "Upload prior successful grant", description: "A grant you won" },
  { kind: "rejected-grant", label: "Upload rejected grant", description: "A grant that was declined" },
  { kind: "program-budget", label: "Upload program budget", description: "Budget for a specific program" },
  { kind: "impact-report", label: "Upload impact report", description: "Outcomes and impact summary" },
  { kind: "testimonials", label: "Upload testimonials", description: "Rider / client stories" },
  { kind: "partner-letter", label: "Upload partner letter", description: "Letter of support from a partner" },
];

function fact(
  fieldName: string,
  label: string,
  value: string,
  explanation: string,
  confidence: SuggestedField["confidence"] = "Medium",
): SuggestedField {
  return {
    id: uid("doc"),
    fieldName,
    label,
    value,
    sourceType: "Prior grant/document",
    confidence,
    status: "suggested",
    explanation,
  };
}

const EXTRACTIONS: Record<DocumentKind, () => SuggestedField[]> = {
  "990": () => [
    fact("budgetRange", "Annual revenue range", "$250K–$1M (from Part I total revenue, sample)", "Read from the 990 summary page.", "High"),
    fact("documents", "Common attachments", "Schedule O narrative; officer/board list", "990 typically includes a board list you can reuse.", "Medium"),
  ],
  "annual-report": () => [
    fact("proofPoints", "Outcome metric", "~12,000 rides delivered last year (sample)", "Headline figure from the annual report.", "Medium"),
    fact("proofPoints", "Partner names", "Senior centers, community clinics (sample)", "Partners highlighted in the report.", "Low"),
  ],
  "successful-grant": () => [
    fact("proofPoints", "Existing grant language", "\"Each ride preserves independence and reduces costly missed appointments.\" (sample)", "Strong reusable sentence from a winning application.", "High"),
    fact("outcomes", "Outcome metrics", "Reduced missed medical appointments; improved food access (sample)", "Outcomes the funder responded to.", "Medium"),
  ],
  "rejected-grant": () => [
    fact("capacityConstraints", "Gap revealed by rejection", "Reviewer noted limited outcome data beyond ride counts (sample)", "Useful signal for what to strengthen before reapplying.", "High"),
  ],
  "program-budget": () => [
    fact("fundingNeeds", "Budget categories", "Driver/dispatch labor; vehicle costs; ride subsidies; software (sample)", "Line-item categories for a budget narrative.", "Medium"),
    fact("fundingNeeds", "Cost per outcome", "Approx. $14 average cost per ride (sample)", "Helps suggest realistic ask amounts.", "Medium"),
  ],
  "impact-report": () => [
    fact("outcomes", "Outcome metrics", "85% of riders report reduced isolation (sample)", "Survey-based outcome figure.", "Medium"),
  ],
  testimonials: () => [
    fact("proofPoints", "Testimonials", "\"Without these rides I would miss dialysis.\" — rider (sample)", "Quotable rider story for narratives and letters.", "Medium"),
  ],
  "partner-letter": () => [
    fact("currentFunders", "Partner names", "Regional senior center network (sample)", "Named partner willing to provide support.", "Medium"),
  ],
};

/** Simulate uploading + extracting facts from a document of the given kind. */
export async function extractDocument(kind: DocumentKind): Promise<DocumentExtractionResult> {
  await new Promise((r) => setTimeout(r, 700));
  const option = DOCUMENT_OPTIONS.find((o) => o.kind === kind)!;
  return {
    id: uid("extract"),
    kind,
    label: option.label.replace(/^Upload /, ""),
    extractedFacts: EXTRACTIONS[kind](),
    addedAt: new Date().toISOString(),
  };
}

import type { Funder, FunderScore, FundingTask, NonprofitProfile } from "./types";
import { uid } from "./formatters";

/**
 * Generate a practical 90-day funding plan from the scored funder list and the
 * profile's gaps. Tasks are seeded deterministically; the user can then mark
 * them complete / in-progress locally (status lives in app state).
 */
export function generateFundingPlan(
  profile: NonprofitProfile,
  scores: FunderScore[],
  funders: Funder[],
): FundingTask[] {
  const byId = new Map(funders.map((f) => [f.id, f]));
  const applyNow = scores.filter((s) => s.recommendation === "Apply now").slice(0, 3);
  const cultivate = scores.filter((s) => s.recommendation === "Cultivate first").slice(0, 3);
  const prepare = scores.filter((s) => s.recommendation === "Prepare for next cycle").slice(0, 2);

  const tasks: FundingTask[] = [];
  const add = (
    phase: string,
    task: string,
    priority: FundingTask["priority"],
    relatedFunderId: string | null = null,
  ) => {
    tasks.push({
      id: uid("task"),
      phase,
      task,
      owner: "—",
      dueDate: "—",
      priority,
      relatedFunderId,
      status: "Not started",
    });
  };

  // Week 1–2: clean up dossier + gather documents.
  add("Week 1–2: Clean up & gather", "Review and confirm all suggested dossier fields (accept/edit/remove).", "High");
  const missingDocs = profile;
  if (!missingDocs.documents.evaluationData) {
    add("Week 1–2: Clean up & gather", "Start capturing one outcome metric beyond ride/activity counts.", "High");
  }
  if (!missingDocs.documents.programBudget) {
    add("Week 1–2: Clean up & gather", "Draft a program budget with cost-per-outcome.", "High");
  }
  add("Week 1–2: Clean up & gather", "Refresh the documents checklist; note what's missing for top funders.", "Medium");

  // Week 3–4: cultivate + draft reusable language.
  for (const s of cultivate) {
    const f = byId.get(s.funderId);
    if (f) add("Week 3–4: Cultivate & draft", `Request an introduction / informal conversation with ${f.name}.`, "High", f.id);
  }
  add("Week 3–4: Cultivate & draft", "Generate and lightly edit reusable grant assets (summaries, need statement, LOI).", "Medium");
  add("Week 3–4: Cultivate & draft", "Ask board members who they know among target funders.", "Medium");

  // Month 2: apply to top opportunities.
  for (const s of applyNow) {
    const f = byId.get(s.funderId);
    if (f) add("Month 2: Apply", `Apply to ${f.name} (suggested ask ~$${s.suggestedAsk.toLocaleString()}).`, "High", f.id);
  }
  if (applyNow.length === 0) {
    add("Month 2: Apply", "Apply to your highest-fit, lowest-burden opportunity once materials are ready.", "High");
  }

  // Month 3: follow up + prepare next cycle.
  add("Month 3: Follow up & prepare", "Follow up on submitted applications and log outcomes (win/loss).", "Medium");
  for (const s of prepare) {
    const f = byId.get(s.funderId);
    if (f) add("Month 3: Follow up & prepare", `Prepare materials for ${f.name}'s next cycle.`, "Medium", f.id);
  }
  add("Month 3: Follow up & prepare", "Strengthen reporting/outcome tracking for the next round of applications.", "Medium");

  return tasks;
}

export const PLAN_PHASES = [
  "Week 1–2: Clean up & gather",
  "Week 3–4: Cultivate & draft",
  "Month 2: Apply",
  "Month 3: Follow up & prepare",
];

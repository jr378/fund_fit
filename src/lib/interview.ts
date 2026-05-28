import type { GuidedInterviewAnswer, InterviewQuestion, NonprofitProfile, ProofPoint } from "./types";
import { uid } from "./formatters";

/**
 * Short guided interview. Plain-English questions whose answers are converted
 * into structured dossier content (proof points, funding needs, mission
 * boundaries, outcomes, and reusable language snippets).
 */
export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: "q-proud",
    prompt: "What are you proudest of from the past year?",
    helper: "A specific win, story, or milestone. This often becomes your strongest proof point.",
    placeholder: "e.g. We gave 12,000 rides and never turned away a dialysis patient…",
    feeds: ["proofPoint", "snippet"],
  },
  {
    id: "q-who",
    prompt: "Who do you help most directly?",
    helper: "The people who would be hurt most if you disappeared.",
    placeholder: "e.g. Homebound seniors and dialysis patients with no other way to get to care…",
    feeds: ["proofPoint", "outcome"],
  },
  {
    id: "q-25k",
    prompt: "What would $25,000 help you do?",
    helper: "A concrete, fundable use at a smaller scale.",
    placeholder: "e.g. Subsidize 1,500 additional rides for low-income riders…",
    feeds: ["fundingNeed"],
  },
  {
    id: "q-100k",
    prompt: "What would $100,000 help you do?",
    helper: "A bigger, transformational use.",
    placeholder: "e.g. Add a second dispatcher and expand to a neighboring county…",
    feeds: ["fundingNeed"],
  },
  {
    id: "q-misunderstand",
    prompt: "What do funders usually misunderstand about your work?",
    helper: "Use this to preempt objections in your applications.",
    placeholder: "e.g. They assume rideshare apps already solve this — but our riders can't use apps…",
    feeds: ["snippet"],
  },
  {
    id: "q-data",
    prompt: "What data do you already track?",
    helper: "Even simple counts matter. This shapes your outcomes and evaluation plan.",
    placeholder: "e.g. Rides per month, riders served, trip purpose, on-time rate…",
    feeds: ["outcome"],
  },
  {
    id: "q-drift",
    prompt: "What kind of funding would create mission drift?",
    helper: "Naming this protects you from chasing money that pulls you off course.",
    placeholder: "e.g. Grants that require us to launch unrelated social programs…",
    feeds: ["missionBoundary"],
  },
];

/**
 * Apply interview answers to a profile, returning an updated copy. Pure and
 * additive — it appends derived content rather than overwriting existing fields.
 */
export function applyInterviewAnswers(
  profile: NonprofitProfile,
  answers: GuidedInterviewAnswer[],
): NonprofitProfile {
  const next: NonprofitProfile = {
    ...profile,
    proofPoints: [...profile.proofPoints],
    outcomes: [...profile.outcomes],
    fundingNeeds: [...profile.fundingNeeds],
  };
  const byId = new Map(answers.map((a) => [a.questionId, a.answer.trim()]));

  const proud = byId.get("q-proud");
  if (proud) {
    const exists = next.proofPoints.some((p) => p.text === proud);
    if (!exists) {
      const pp: ProofPoint = { id: uid("pp"), text: proud, source: "User-entered" };
      next.proofPoints.push(pp);
    }
  }

  const who = byId.get("q-who");
  if (who && !next.outcomes.includes(`Serves: ${who}`)) {
    next.outcomes.push(`Serves: ${who}`);
  }

  const ask25 = byId.get("q-25k");
  if (ask25 && !next.fundingNeeds.includes(`$25K: ${ask25}`)) {
    next.fundingNeeds.push(`$25K: ${ask25}`);
  }
  const ask100 = byId.get("q-100k");
  if (ask100 && !next.fundingNeeds.includes(`$100K: ${ask100}`)) {
    next.fundingNeeds.push(`$100K: ${ask100}`);
  }

  const data = byId.get("q-data");
  if (data && !next.outcomes.includes(`Tracks: ${data}`)) {
    next.outcomes.push(`Tracks: ${data}`);
  }

  const drift = byId.get("q-drift");
  if (drift) {
    const addition = `\nAvoid: ${drift}`;
    if (!next.missionBoundaries.includes(drift)) {
      next.missionBoundaries = (next.missionBoundaries + addition).trim();
    }
  }

  return next;
}

/** Turn answers into reusable language snippets (deterministic, no LLM). */
export function interviewSnippets(answers: GuidedInterviewAnswer[]): string[] {
  const byId = new Map(answers.map((a) => [a.questionId, a.answer.trim()]));
  const out: string[] = [];
  const proud = byId.get("q-proud");
  if (proud) out.push(`Impact: ${proud}`);
  const mis = byId.get("q-misunderstand");
  if (mis) out.push(`What funders should understand: ${mis}`);
  return out.filter(Boolean);
}

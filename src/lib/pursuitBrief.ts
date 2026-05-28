import type { Funder, NonprofitProfile, PursuitBrief } from "./types";
import { scoreFunder } from "./scoring";
import { generateFundingFrames } from "./fundingFrames";
import { generateAsset } from "./grantAssets";
import { currency, docLabels, formatDate } from "./formatters";

/**
 * Build a one-page pursuit brief for a funder. Composes the scoring engine,
 * funding frames, and grant-asset templates into something an executive
 * director or board member could act on immediately. Deterministic.
 */
export function buildPursuitBrief(profile: NonprofitProfile, funder: Funder): PursuitBrief {
  const score = scoreFunder(profile, funder);
  const frames = generateFundingFrames(profile);
  const bestFrame = frames.find((f) => f.id === score.bestFrameId) ?? frames[0] ?? null;

  // Sort components to separate strengths from weaknesses.
  const sorted = [...score.components].sort((a, b) => b.score - a.score);
  const whyFits = sorted.filter((c) => c.score >= 65).map((c) => `${c.label}: ${c.explanation}`);
  const whyNotFits = sorted.filter((c) => c.score < 55).map((c) => `${c.label}: ${c.explanation}`);

  const proofPointsToUse = (bestFrame?.strongestProofPoints ?? [])
    .concat(profile.proofPoints.slice(0, 2).map((p) => (p.metric ? `${p.text} (${p.metric})` : p.text)))
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 4);

  const missingEvidence = score.missingMaterials.map((k) => docLabels[k]);

  const readinessChecklist = funder.requiredDocuments.map((k) => ({
    label: docLabels[k],
    done: profile.documents[k],
  }));

  const relationshipStrategy = (() => {
    switch (funder.relationshipRequired) {
      case "likely required":
        return "A relationship is likely required. Identify a board member, partner, or peer who can make a warm introduction. Do not lead with an application — lead with a conversation.";
      case "helpful":
        return "A warm introduction would meaningfully raise your odds. Ask your board and partners who knows someone here, and send a short intro before applying.";
      default:
        return "No relationship is required, but a brief introductory note to the program officer still helps your application stand out.";
    }
  })();

  const deadlineLabel = funder.deadlineType === "rolling"
    ? "rolling (apply when ready)"
    : funder.deadlineType === "invitation only"
      ? "invitation only"
      : formatDate(funder.nextDeadline);

  const step7Day = score.recommendation === "Apply now"
    ? `Confirm eligibility and the application format. Pull together the ${funder.requiredDocuments.length} required documents and draft the ${bestFrame ? `"${bestFrame.name}"` : ""} framing.`
    : score.recommendation === "Cultivate first"
      ? "List 2–3 possible warm introductions to this funder and send the board-intro email to start them."
      : score.recommendation === "Prepare for next cycle"
        ? `Add the next deadline (${deadlineLabel}) to your calendar and start closing the missing-materials gaps.`
        : "No action — this funder is a low fit. Reallocate this time to a higher-fit opportunity.";

  const step30Day = score.recommendation === "Apply now"
    ? `Complete a full draft using the generated grant assets. Request one partner letter and an internal review. Target an ask of ${currency(score.suggestedAsk)}.`
    : score.recommendation === "Cultivate first"
      ? "Hold an introductory call, share a one-pager, and ask what they fund and how they like to be approached."
      : "Assemble missing documents and strengthen outcome data so you're application-ready next cycle.";

  const step90Day = score.recommendation === "Apply now"
    ? "Submit, log the submission, and set a follow-up reminder. Capture reusable language for future grants."
    : "Re-score this funder after cultivation / materials work and move it into 'Apply now' if it now clears the bar.";

  const outreachEmail = generateAsset("program-officer-email", profile, bestFrame).body;
  const loi = generateAsset("loi-skeleton", profile, bestFrame).body
    .split("\n")
    .filter((l) => /^\d\./.test(l.trim()))
    .map((l) => l.trim());

  const reportingMetrics = [
    "Units of service delivered (e.g. rides) attributable to this grant",
    "Number of people served and reach into priority populations",
    bestFrame ? `Outcome aligned to "${bestFrame.name}" (e.g. ${bestFrame.possibleGap.replace(/^Needs?\s*/i, "").replace(/\.$/, "")})` : "Primary outcome metric",
    "Cost per outcome (e.g. cost per ride / per participant)",
    "A short rider/client story for the funder's report",
  ];

  const programAngle = bestFrame
    ? `Frame this as a "${bestFrame.name}" investment: ${bestFrame.languageSnippet}`
    : "Lead with your clearest program and the people it serves.";

  return {
    funder,
    score,
    whyFits: whyFits.length ? whyFits : ["This funder is a marginal fit; see the score breakdown for details."],
    whyNotFits: whyNotFits.length ? whyNotFits : ["No significant red flags in the score breakdown."],
    bestFrame,
    suggestedAsk: score.suggestedAsk,
    programAngle,
    proofPointsToUse,
    missingEvidence,
    readinessChecklist,
    relationshipStrategy,
    step7Day,
    step30Day,
    step90Day,
    outreachEmail,
    loiOutline: loi,
    reportingMetrics,
  };
}

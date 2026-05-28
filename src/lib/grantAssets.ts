import type { FundingFrame, GrantAsset, GrantAssetKind, NonprofitProfile } from "./types";

/**
 * Reusable grant assets generated from TEMPLATES + structured profile data.
 *
 * There is no LLM here. Each generator pulls specific fields and records which
 * ones it used (`fieldsUsed`) so the UI can show provenance. The architecture
 * is deliberately a map of pure functions so an LLM drafting layer can be
 * swapped in per-kind later without touching the UI. Every asset is editable
 * and carries a "needs human review" badge in the UI.
 */

function topProofPoints(profile: NonprofitProfile, n = 3): string[] {
  return profile.proofPoints.slice(0, n).map((p) => (p.metric ? `${p.text} (${p.metric})` : p.text));
}

function programList(profile: NonprofitProfile): string {
  return profile.programs.map((p) => p.name).join(", ") || "core programs";
}

function orgName(profile: NonprofitProfile): string {
  return profile.name || "Our organization";
}

type Generator = (profile: NonprofitProfile, frame: FundingFrame | null) => { body: string; fieldsUsed: string[] };

const GENERATORS: Record<GrantAssetKind, { title: string; gen: Generator }> = {
  "summary-100": {
    title: "100-word organization summary",
    gen: (p) => ({
      fieldsUsed: ["name", "mission", "populations", "proofPoints"],
      body: `${orgName(p)} ${p.mission ? `works to ${p.mission.charAt(0).toLowerCase()}${p.mission.slice(1)}` : "serves its community"} We serve ${p.populations.slice(0, 4).join(", ") || "people in need"}. ${topProofPoints(p, 2).length ? `Highlights include ${topProofPoints(p, 2).join(" and ")}.` : ""} Through ${programList(p)}, we remove practical barriers and help the people we serve stay healthy, connected, and independent.`.trim(),
    }),
  },
  "summary-250": {
    title: "250-word organization summary",
    gen: (p, frame) => ({
      fieldsUsed: ["name", "mission", "programs", "populations", "outcomes", "proofPoints", frame ? "selected frame" : ""].filter(Boolean),
      body: `${orgName(p)} ${p.mission ? `exists to ${p.mission.charAt(0).toLowerCase()}${p.mission.slice(1)}` : "serves its community."}\n\nWe primarily serve ${p.populations.join(", ") || "people in need"}, who face real barriers to ${frame ? frame.name.toLowerCase() : "essential services"}. Our programs — ${programList(p)} — meet people where they are.\n\n${topProofPoints(p).length ? `What sets us apart: ${topProofPoints(p).join("; ")}.` : ""}\n\n${p.outcomes.length ? `The outcomes we work toward include ${p.outcomes.slice(0, 4).join(", ")}.` : ""}\n\n${frame ? frame.languageSnippet : ""}\n\nWith the right partners and funding, we can sustain and expand this work for the people who depend on it.`.trim(),
    }),
  },
  "need-statement": {
    title: "Need statement",
    gen: (p, frame) => ({
      fieldsUsed: ["populations", "mission", "fundingNeeds", frame ? "selected frame" : ""].filter(Boolean),
      body: `${p.populations.slice(0, 3).join(", ") || "The people we serve"} face a persistent barrier: ${frame ? frame.whyFits.toLowerCase() : "they cannot reliably access the services they need."}\n\nWithout intervention, the result is missed appointments, deepening isolation, and lost independence — outcomes that are costlier for everyone in the long run.\n\n${p.fundingNeeds.length ? `Specifically, we need to: ${p.fundingNeeds.slice(0, 3).join("; ")}.` : ""}\n\n${orgName(p)} is positioned to meet this need because of our established programs and the trust we've built with the people we serve.`.trim(),
    }),
  },
  "program-description": {
    title: "Program description",
    gen: (p) => ({
      fieldsUsed: ["programs", "populations"],
      body: `Our work is delivered through the following programs:\n\n${p.programs.map((prog) => `• ${prog.name} — ${prog.description}`).join("\n") || "• (Add programs to your dossier to generate this section.)"}\n\nTogether, these programs serve ${p.populations.join(", ") || "the people in our community who need them most"} in a coordinated, human-centered way.`,
    }),
  },
  outcomes: {
    title: "Outcomes section",
    gen: (p) => ({
      fieldsUsed: ["outcomes", "proofPoints"],
      body: `We measure success by the difference we make in people's lives:\n\n${(p.outcomes.length ? p.outcomes : ["(Add key outcomes to your dossier.)"]).map((o) => `• ${o}`).join("\n")}\n\n${topProofPoints(p).length ? `Supporting evidence to date: ${topProofPoints(p).join("; ")}.` : ""}\n\nWe recognize the need to strengthen outcome measurement beyond activity counts, and we are committed to tracking results that matter to funders and to the people we serve.`,
    }),
  },
  "budget-narrative": {
    title: "Budget narrative starter",
    gen: (p) => ({
      fieldsUsed: ["budgetRange", "fundingNeeds", "programs"],
      body: `This request supports the direct costs of delivering ${programList(p)}.\n\nTypical budget categories include: program staff and dispatch labor, direct service/subsidy costs, vehicle or operating costs, and a reasonable share of administrative overhead.\n\n${p.fundingNeeds.length ? `Funds would specifically enable us to ${p.fundingNeeds[0].replace(/^\$\d+K:\s*/, "").toLowerCase()}.` : ""}\n\n[Replace this starter with your actual line-item budget. Funders expect specific figures; this is a structure, not final numbers.]`,
    }),
  },
  "evaluation-plan": {
    title: "Evaluation plan starter",
    gen: (p) => ({
      fieldsUsed: ["outcomes"],
      body: `We will track both activity and outcome measures:\n\n• Activity: units of service delivered (e.g. rides, sessions), number of people served, and reach into priority populations.\n• Outcomes: ${(p.outcomes.length ? p.outcomes.slice(0, 3) : ["the changes our program is designed to produce"]).join("; ")}.\n\nData will be collected through our service records and periodic short surveys of the people we serve. We will report results to funders on the agreed schedule and use findings to improve the program.\n\n[Strengthen this with baseline figures and a specific target where possible.]`,
    }),
  },
  sustainability: {
    title: "Sustainability paragraph",
    gen: (p) => ({
      fieldsUsed: ["currentFunders", "mission"],
      body: `${orgName(p)} pursues a diversified funding mix to sustain this work beyond any single grant. ${p.currentFunders.length ? `Current support includes ${p.currentFunders.slice(0, 3).join(", ")}.` : ""} We are actively building relationships with new funders, strengthening our outcome data to compete for larger awards, and cultivating individual and community support. This grant would help stabilize and grow the program while we deepen these long-term revenue sources.`,
    }),
  },
  "partner-letter": {
    title: "Partner letter template",
    gen: (p) => ({
      fieldsUsed: ["name", "programs", "populations"],
      body: `[Partner letterhead]\n\nDear [Funder name],\n\nI am writing in strong support of ${orgName(p)}'s work. As [partner role/organization], we see firsthand the need for ${programList(p)} among ${p.populations.slice(0, 2).join(" and ") || "the people we jointly serve"}.\n\n${orgName(p)} is a reliable, trusted partner. [Add a specific example of your collaboration and its impact.]\n\nWe enthusiastically support this proposal and look forward to continuing our partnership.\n\nSincerely,\n[Name, title, organization]`,
    }),
  },
  "board-intro-email": {
    title: "Board intro email",
    gen: (p) => ({
      fieldsUsed: ["name", "mission"],
      body: `Subject: Quick intro to ${orgName(p)}?\n\nHi [Board member name],\n\nI know you're connected to [funder/contact]. We're building a funding pipeline for ${orgName(p)} — ${p.mission ? p.mission.split(".")[0].toLowerCase() : "our mission-critical work"}.\n\nWould you be open to a warm introduction, or sharing a sentence about why our work matters to you? Even a short note opens doors.\n\nHappy to give you a one-paragraph blurb to forward. Thank you!\n\n[Your name]`,
    }),
  },
  "program-officer-email": {
    title: "Program officer outreach email",
    gen: (p, frame) => ({
      fieldsUsed: ["name", frame ? "selected frame" : "mission", "proofPoints"],
      body: `Subject: ${frame ? frame.name : "Introduction"} — ${orgName(p)}\n\nDear [Program Officer name],\n\nI lead ${orgName(p)}. ${frame ? frame.languageSnippet : p.mission}\n\n${topProofPoints(p, 1).length ? `For context: ${topProofPoints(p, 1)[0]}.` : ""}\n\nI'd welcome a brief call to learn whether our work aligns with your priorities before we consider an application. Would 15 minutes in the coming weeks be possible?\n\nWith appreciation,\n[Your name, title]\n[Phone] · [Email]`,
    }),
  },
  "loi-skeleton": {
    title: "LOI skeleton",
    gen: (p, frame) => ({
      fieldsUsed: ["name", "mission", "fundingNeeds", frame ? "selected frame" : ""].filter(Boolean),
      body: `LETTER OF INQUIRY — ${orgName(p)}\n\n1. Opening / connection to funder priorities\n   ${frame ? frame.languageSnippet : "[Connect our mission to the funder's stated interests.]"}\n\n2. The need\n   [1–2 sentences on the problem and who is affected.]\n\n3. Our approach\n   ${programList(p)}.\n\n4. The ask\n   ${p.fundingNeeds.length ? p.fundingNeeds[0] : "[Specific request and what it will accomplish.]"}\n\n5. Why us / evidence\n   ${topProofPoints(p, 2).join("; ") || "[Strongest proof points.]"}\n\n6. Close / next step\n   [Offer to submit a full proposal; thank the reader.]`,
    }),
  },
};

export const GRANT_ASSET_ORDER: GrantAssetKind[] = [
  "summary-100",
  "summary-250",
  "need-statement",
  "program-description",
  "outcomes",
  "budget-narrative",
  "evaluation-plan",
  "sustainability",
  "partner-letter",
  "board-intro-email",
  "program-officer-email",
  "loi-skeleton",
];

export function generateAsset(
  kind: GrantAssetKind,
  profile: NonprofitProfile,
  frame: FundingFrame | null,
): GrantAsset {
  const { title, gen } = GENERATORS[kind];
  const { body, fieldsUsed } = gen(profile, frame);
  return { kind, title, body, fieldsUsed };
}

export function generateAllAssets(profile: NonprofitProfile, frame: FundingFrame | null): GrantAsset[] {
  return GRANT_ASSET_ORDER.map((k) => generateAsset(k, profile, frame));
}

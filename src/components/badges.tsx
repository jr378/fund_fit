import type { Confidence, Recommendation, SourceType } from "@/lib/types";
import { cn } from "./ui";

function Pill({ children, className, title }: { children: React.ReactNode; className?: string; title?: string }) {
  return (
    <span
      title={title}
      className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", className)}
    >
      {children}
    </span>
  );
}

/** "Demo data" badge — used wherever values are mocked. */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <Pill className={cn("border border-amber-300 bg-amber-50 text-amber-800", className)} title="This value is sample/mock data, not real grant facts.">
      Demo data
    </Pill>
  );
}

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const map: Record<Confidence, string> = {
    High: "border border-emerald-300 bg-emerald-50 text-emerald-800",
    Medium: "border border-amber-300 bg-amber-50 text-amber-800",
    Low: "border border-rose-300 bg-rose-50 text-rose-800",
  };
  return <Pill className={map[confidence]}>{confidence} confidence</Pill>;
}

export function SourceBadge({ source }: { source: SourceType }) {
  const map: Record<SourceType, string> = {
    Website: "border border-sky-300 bg-sky-50 text-sky-800",
    "IRS/public filing": "border border-violet-300 bg-violet-50 text-violet-800",
    "Prior grant/document": "border border-indigo-300 bg-indigo-50 text-indigo-800",
    Inferred: "border border-slate-300 bg-slate-50 text-slate-700",
    "User-entered": "border border-teal-300 bg-teal-50 text-teal-800",
  };
  return <Pill className={map[source]}>{source}</Pill>;
}

export function RecommendationBadge({ recommendation, className }: { recommendation: Recommendation; className?: string }) {
  const map: Record<Recommendation, string> = {
    "Apply now": "border border-emerald-300 bg-emerald-100 text-emerald-900",
    "Cultivate first": "border border-sky-300 bg-sky-100 text-sky-900",
    "Prepare for next cycle": "border border-amber-300 bg-amber-100 text-amber-900",
    Skip: "border border-slate-300 bg-slate-100 text-slate-700",
  };
  return <Pill className={cn("px-2.5 py-1 text-xs", map[recommendation], className)}>{recommendation}</Pill>;
}

/** "Needs human review" badge for AI/template-generated content. */
export function ReviewBadge({ className }: { className?: string }) {
  return (
    <Pill className={cn("border border-rose-300 bg-rose-50 text-rose-700", className)} title="Generated from templates. Always review before sending to a funder.">
      Needs human review
    </Pill>
  );
}

/** Generic colored stat pill. */
export function StatPill({ label, tone = "slate" }: { label: string; tone?: "slate" | "emerald" | "amber" | "rose" | "teal" | "sky" }) {
  const map: Record<string, string> = {
    slate: "border border-slate-300 bg-slate-50 text-slate-700",
    emerald: "border border-emerald-300 bg-emerald-50 text-emerald-800",
    amber: "border border-amber-300 bg-amber-50 text-amber-800",
    rose: "border border-rose-300 bg-rose-50 text-rose-800",
    teal: "border border-teal-300 bg-teal-50 text-teal-800",
    sky: "border border-sky-300 bg-sky-50 text-sky-800",
  };
  return <Pill className={map[tone]}>{label}</Pill>;
}

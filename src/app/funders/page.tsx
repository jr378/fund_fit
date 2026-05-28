"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useOrg } from "@/components/OrgProvider";
import { Button, Card, CardContent, cn } from "@/components/ui";
import { PageHeader, Disclaimer, NoProfileNotice } from "@/components/common";
import { RecommendationBadge, StatPill } from "@/components/badges";
import { mockFunders } from "@/lib/mockFunders";
import { scoreAllFunders } from "@/lib/scoring";
import { generateFundingFrames } from "@/lib/fundingFrames";
import { currency, docLabels, formatDate, funderTypeLabel } from "@/lib/formatters";
import type { Funder, Recommendation } from "@/lib/types";

interface FilterDef {
  key: string;
  label: string;
  group: "rec" | "type" | "mod";
  test: (f: Funder, rec: Recommendation, overall: number) => boolean;
}

const FILTERS: FilterDef[] = [
  { key: "apply", label: "Apply now", group: "rec", test: (_f, r) => r === "Apply now" },
  { key: "cultivate", label: "Cultivate first", group: "rec", test: (_f, r) => r === "Cultivate first" },
  { key: "prepare", label: "Prepare", group: "rec", test: (_f, r) => r === "Prepare for next cycle" },
  { key: "skip", label: "Skip", group: "rec", test: (_f, r) => r === "Skip" },
  { key: "foundation", label: "Foundation", group: "type", test: (f) => f.type === "foundation" },
  { key: "government", label: "Government", group: "type", test: (f) => f.type === "government grant" },
  { key: "corporate", label: "Corporate", group: "type", test: (f) => f.type === "corporate giving" },
  { key: "healthcare", label: "Healthcare", group: "type", test: (f) => f.type === "healthcare system" },
  { key: "lowburden", label: "Low burden", group: "mod", test: (f) => f.applicationBurden === "low" },
  { key: "highfit", label: "High fit", group: "mod", test: (_f, _r, o) => o >= 65 },
];

const burdenTone: Record<string, "emerald" | "amber" | "rose"> = { low: "emerald", medium: "amber", high: "rose" };

export default function FundersPage() {
  const { profile, hasProfile } = useOrg();
  const [active, setActive] = useState<Set<string>>(new Set());

  const scores = useMemo(() => scoreAllFunders(profile, mockFunders), [profile]);
  const funderMap = useMemo(() => new Map(mockFunders.map((f) => [f.id, f])), []);
  const frames = useMemo(() => generateFundingFrames(profile), [profile]);
  const frameName = (id: string | null) => frames.find((f) => f.id === id)?.name ?? "—";

  if (!hasProfile) {
    return (
      <div className="space-y-6">
        <PageHeader title="Funder matches" />
        <NoProfileNotice feature="Funder matching" />
      </div>
    );
  }

  const toggle = (key: string) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const filtered = scores.filter((s) => {
    const funder = funderMap.get(s.funderId)!;
    const groups: FilterDef["group"][] = ["rec", "type", "mod"];
    return groups.every((g) => {
      const groupFilters = FILTERS.filter((fd) => fd.group === g && active.has(fd.key));
      if (groupFilters.length === 0) return true;
      // mod filters are AND; rec/type are OR within the group.
      if (g === "mod") return groupFilters.every((fd) => fd.test(funder, s.recommendation, s.overall));
      return groupFilters.some((fd) => fd.test(funder, s.recommendation, s.overall));
    });
  });

  const counts = (rec: Recommendation) => scores.filter((s) => s.recommendation === rec).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Funder matches"
        description="Every sample funder scored against your dossier and ranked by overall fit. Click any funder for a full pursuit brief. All funders are demo data."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["Apply now", "Cultivate first", "Prepare for next cycle", "Skip"] as Recommendation[]).map((r) => (
          <Card key={r}>
            <CardContent className="py-3">
              <div className="text-2xl font-bold text-slate-900">{counts(r)}</div>
              <div className="text-xs text-slate-500">{r}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => toggle(f.key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              active.has(f.key)
                ? "border-teal-600 bg-teal-600 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            {f.label}
          </button>
        ))}
        {active.size > 0 && (
          <button onClick={() => setActive(new Set())} className="px-2 py-1 text-xs text-slate-500 hover:underline">
            Clear filters
          </button>
        )}
      </div>

      <p className="text-sm text-slate-500">
        Showing {filtered.length} of {scores.length} funders.
      </p>

      {/* Table (desktop) */}
      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white lg:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Funder</th>
              <th className="px-4 py-3">Fit</th>
              <th className="px-4 py-3">Recommendation</th>
              <th className="px-4 py-3">Suggested ask</th>
              <th className="px-4 py-3">Best frame</th>
              <th className="px-4 py-3">Deadline</th>
              <th className="px-4 py-3">Burden</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((s) => {
              const f = funderMap.get(s.funderId)!;
              return (
                <tr key={s.funderId} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/funders/${f.id}`} className="font-medium text-slate-900 hover:text-teal-700">
                      {f.name}
                    </Link>
                    <div className="text-xs text-slate-400">{funderTypeLabel[f.type]} · {f.geography}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("font-semibold tabular-nums", s.overall >= 65 ? "text-emerald-700" : s.overall >= 45 ? "text-amber-700" : "text-slate-500")}>
                      {s.overall}
                    </span>
                  </td>
                  <td className="px-4 py-3"><RecommendationBadge recommendation={s.recommendation} /></td>
                  <td className="px-4 py-3 tabular-nums text-slate-700">{currency(s.suggestedAsk)}</td>
                  <td className="px-4 py-3 text-slate-600">{frameName(s.bestFrameId)}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {f.deadlineType === "rolling" ? "Rolling" : f.deadlineType === "invitation only" ? "Invite only" : formatDate(f.nextDeadline)}
                  </td>
                  <td className="px-4 py-3"><StatPill label={f.applicationBurden} tone={burdenTone[f.applicationBurden]} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/funders/${f.id}`} className="text-sm font-medium text-teal-700 hover:underline">Brief →</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards (mobile) */}
      <div className="space-y-3 lg:hidden">
        {filtered.map((s) => {
          const f = funderMap.get(s.funderId)!;
          return (
            <Card key={s.funderId}>
              <CardContent className="space-y-2 py-4">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/funders/${f.id}`} className="font-medium text-slate-900">{f.name}</Link>
                  <span className="text-lg font-bold tabular-nums text-slate-800">{s.overall}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <RecommendationBadge recommendation={s.recommendation} />
                  <StatPill label={`${f.applicationBurden} burden`} tone={burdenTone[f.applicationBurden]} />
                </div>
                <p className="text-sm text-slate-600">{s.reason}</p>
                <div className="text-xs text-slate-500">
                  Ask {currency(s.suggestedAsk)} · Frame: {frameName(s.bestFrameId)}
                  {s.missingMaterials.length > 0 && (
                    <> · Missing: {s.missingMaterials.map((m) => docLabels[m]).join(", ")}</>
                  )}
                </div>
                <Link href={`/funders/${f.id}`}><Button size="sm" variant="outline">View pursuit brief →</Button></Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Disclaimer />
    </div>
  );
}

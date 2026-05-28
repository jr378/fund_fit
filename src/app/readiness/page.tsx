"use client";

import { useMemo } from "react";
import { useOrg } from "@/components/OrgProvider";
import { Card, CardContent, CardHeader, CardTitle, Progress } from "@/components/ui";
import { PageHeader, Disclaimer, NoProfileNotice, OverallScore } from "@/components/common";
import { evaluateReadiness } from "@/lib/readiness";

export default function ReadinessPage() {
  const { profile, hasProfile } = useOrg();
  const readiness = useMemo(() => evaluateReadiness(profile), [profile]);

  if (!hasProfile) {
    return (
      <div className="space-y-6">
        <PageHeader title="Funding readiness" />
        <NoProfileNotice feature="The readiness check" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Funding readiness"
        description="How application-ready you are right now, by category — built from your dossier fields, document checklist, and interview answers."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Overall readiness</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <OverallScore value={readiness.overall} label="ready" />
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <p className="font-medium text-emerald-700">Strengths</p>
                <ul className="mt-1 space-y-0.5 text-slate-600">
                  {readiness.strengths.length ? readiness.strengths.map((s) => <li key={s}>✓ {s}</li>) : <li className="text-slate-400">Building strengths — keep going.</li>}
                </ul>
              </div>
              <div>
                <p className="font-medium text-rose-700">Gaps</p>
                <ul className="mt-1 space-y-0.5 text-slate-600">
                  {readiness.gaps.length ? readiness.gaps.map((g) => <li key={g}>⚠ {g}</li>) : <li className="text-slate-400">No major gaps.</li>}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Category breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {readiness.categories.map((c) => {
              const tone = c.score >= 70 ? "emerald" : c.score >= 50 ? "amber" : "rose";
              return (
                <div key={c.key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{c.label}</span>
                    <span className="tabular-nums text-slate-500">{c.score}</span>
                  </div>
                  <Progress value={c.score} tone={tone} />
                  <p className="mt-1 text-xs text-slate-500">{c.detail}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Highest-leverage next 5 actions</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-slate-600">
              {readiness.topActions.map((a, i) => (
                <li key={i} className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-800">{i + 1}</span>
                  <span>{a}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardHeader><CardTitle>Before applying to high-burden grants, fix these first</CardTitle></CardHeader>
          <CardContent>
            {readiness.blockHighBurden.length ? (
              <ul className="space-y-2 text-sm text-slate-600">
                {readiness.blockHighBurden.map((b) => <li key={b}>• {b}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-emerald-700">
                You&apos;re reasonably prepared for high-burden applications. Still confirm each funder&apos;s exact requirements.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Disclaimer />
    </div>
  );
}

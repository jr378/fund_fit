"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useOrg } from "@/components/OrgProvider";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { PageHeader, Disclaimer, NoProfileNotice, OverallScore, ScoreBar, CopyButton } from "@/components/common";
import { RecommendationBadge, StatPill, ReviewBadge, DemoBadge } from "@/components/badges";
import { mockFunders } from "@/lib/mockFunders";
import { buildPursuitBrief } from "@/lib/pursuitBrief";
import { currency, currencyRange, formatDate, funderTypeLabel } from "@/lib/formatters";

export default function PursuitBriefPage() {
  const params = useParams<{ id: string }>();
  const { profile, hasProfile } = useOrg();
  const funder = mockFunders.find((f) => f.id === params.id);

  const brief = useMemo(
    () => (funder && hasProfile ? buildPursuitBrief(profile, funder) : null),
    [funder, profile, hasProfile],
  );

  if (!funder) {
    return (
      <div className="space-y-4">
        <PageHeader title="Funder not found" />
        <Link href="/funders"><Button variant="outline">← Back to matches</Button></Link>
      </div>
    );
  }

  if (!hasProfile || !brief) {
    return (
      <div className="space-y-6">
        <PageHeader title={funder.name} />
        <NoProfileNotice feature="The pursuit brief" />
      </div>
    );
  }

  return (
    <div className="space-y-6 print-full">
      <div className="no-print flex items-center justify-between">
        <Link href="/funders"><Button variant="ghost" size="sm">← Back to matches</Button></Link>
        <Button variant="outline" size="sm" onClick={() => window.print()}>Print brief</Button>
      </div>

      <PageHeader title={funder.name} description={`${funderTypeLabel[funder.type]} · ${funder.geography}`}>
        <RecommendationBadge recommendation={brief.score.recommendation} />
        <DemoBadge />
      </PageHeader>

      {/* Summary + recommendation */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Funder summary</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>{funder.notes}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Detail label="Typical grant range" value={currencyRange(funder.typicalGrantRange)} />
              <Detail label="Deadline" value={funder.deadlineType === "rolling" ? "Rolling" : funder.deadlineType === "invitation only" ? "Invitation only" : `${formatDate(funder.nextDeadline)} (${funder.deadlineType})`} />
              <Detail label="Application burden" value={funder.applicationBurden} />
              <Detail label="Relationship" value={funder.relationshipRequired} />
              <Detail label="Populations" value={funder.populations.join(", ")} />
              <Detail label="Interests" value={funder.interests.join(", ")} />
            </div>
            <p className="text-xs text-slate-400">Sample past grants: {funder.samplePastGrants.join("; ")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Overall recommendation</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <OverallScore value={brief.score.overall} />
            <RecommendationBadge recommendation={brief.score.recommendation} />
            <p className="text-sm text-slate-600">{brief.score.reason}</p>
            <div className="rounded-lg bg-slate-50 p-3 text-sm">
              <p className="text-xs text-slate-500">Suggested ask</p>
              <p className="text-lg font-bold text-slate-900">{currency(brief.suggestedAsk)}</p>
            </div>
            <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">
              <span className="font-medium">Next action:</span> {brief.score.nextAction}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score breakdown */}
      <Section title="Why this score (fully transparent)">
        <div className="grid gap-x-8 sm:grid-cols-2">
          {brief.score.components.map((c) => (
            <ScoreBar key={c.key} component={c} />
          ))}
        </div>
      </Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Why this funder might fit">
          <ul className="space-y-2 text-sm text-slate-600">
            {brief.whyFits.map((w, i) => <li key={i}>✓ {w}</li>)}
          </ul>
        </Section>
        <Section title="Why this funder might not fit">
          <ul className="space-y-2 text-sm text-slate-600">
            {brief.whyNotFits.map((w, i) => <li key={i}>⚠ {w}</li>)}
          </ul>
        </Section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Best mission frame & program angle">
          {brief.bestFrame ? (
            <div className="space-y-2 text-sm text-slate-600">
              <StatPill label={brief.bestFrame.name} tone="teal" />
              <p>{brief.programAngle}</p>
              <p className="rounded-lg bg-slate-50 p-3 italic">“{brief.bestFrame.languageSnippet}”</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Add programs to your dossier to generate a frame.</p>
          )}
        </Section>
        <Section title="Strongest proof points to use">
          <ul className="space-y-1 text-sm text-slate-600">
            {brief.proofPointsToUse.map((p) => <li key={p}>• {p}</li>)}
            {brief.proofPointsToUse.length === 0 && <li className="text-slate-400">Add proof points to your dossier.</li>}
          </ul>
        </Section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Missing evidence / materials">
          {brief.missingEvidence.length ? (
            <ul className="space-y-1 text-sm text-slate-600">
              {brief.missingEvidence.map((m) => <li key={m}>• {m}</li>)}
            </ul>
          ) : (
            <p className="text-sm text-emerald-700">You appear to have everything this funder requires.</p>
          )}
        </Section>
        <Section title="Application readiness checklist">
          {brief.readinessChecklist.length ? (
            <ul className="space-y-1 text-sm">
              {brief.readinessChecklist.map((item) => (
                <li key={item.label} className={item.done ? "text-emerald-700" : "text-slate-500"}>
                  {item.done ? "☑" : "☐"} {item.label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No specific documents required.</p>
          )}
        </Section>
      </div>

      <Section title="Relationship strategy">
        <p className="text-sm text-slate-600">{brief.relationshipStrategy}</p>
      </Section>

      <Section title="Action timeline">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Next 7 days", value: brief.step7Day },
            { label: "Next 30 days", value: brief.step30Day },
            { label: "Next 90 days", value: brief.step90Day },
          ].map((step) => (
            <div key={step.label} className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{step.label}</p>
              <p className="mt-1 text-sm text-slate-600">{step.value}</p>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Draft outreach email</CardTitle>
            <div className="no-print flex items-center gap-2"><ReviewBadge /><CopyButton text={brief.outreachEmail} /></div>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">{brief.outreachEmail}</pre>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Draft LOI outline</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-1 text-sm text-slate-600">
              {brief.loiOutline.map((l, i) => <li key={i}>{l}</li>)}
            </ol>
          </CardContent>
        </Card>
      </div>

      <Section title="Reporting metrics to collect if funded">
        <ul className="space-y-1 text-sm text-slate-600">
          {brief.reportingMetrics.map((m) => <li key={m}>• {m}</li>)}
        </ul>
      </Section>

      <Disclaimer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="capitalize text-slate-700">{value || "—"}</p>
    </div>
  );
}

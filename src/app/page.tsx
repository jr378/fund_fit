"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOrg } from "@/components/OrgProvider";
import { Button, Card, CardContent } from "@/components/ui";
import { Disclaimer } from "@/components/common";
import { evaluateCompleteness } from "@/lib/readiness";

const VALUE_CARDS = [
  {
    title: "Prioritize funders",
    body: "Score every opportunity on mission, population, geography, award size, readiness, deadline, and relationship — then get a clear Apply / Cultivate / Prepare / Skip call with the reasoning shown.",
  },
  {
    title: "Translate your mission",
    body: "See your existing work reframed in the language different funders use — aging in place, healthcare access, transportation equity — without inventing anything new.",
  },
  {
    title: "Build reusable grant assets",
    body: "Generate summaries, need statements, LOIs, and outreach emails from your dossier, ready to edit and reuse across applications.",
  },
];

export default function DashboardPage() {
  const { loadSample, startManual, hasProfile, profile } = useOrg();
  const router = useRouter();
  const completeness = hasProfile ? evaluateCompleteness(profile) : null;

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">
          Funding strategy · funder fit · application readiness
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">FundFit</h1>
        <p className="mt-3 text-lg font-medium text-slate-700">
          Find funders worth pursuing — and get application-ready faster.
        </p>
        <p className="mt-3 max-w-2xl text-slate-500">
          FundFit helps nonprofits turn their mission, programs, proof points, and documents into a
          prioritized funding pipeline. It is not a generic AI grant writer — it is a funding cockpit
          that tells you where to spend your limited time, and explains why.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/find">
            <Button size="lg">Find my nonprofit</Button>
          </Link>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => {
              loadSample();
              router.push("/dossier");
            }}
          >
            Start with sample nonprofit
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              startManual();
              router.push("/dossier");
            }}
          >
            Create organization profile manually
          </Button>
        </div>

        {hasProfile && completeness && (
          <div className="mt-7 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <span className="font-medium text-slate-700">
              Working profile: {profile.name || "Untitled organization"}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">{completeness.percent}% complete</span>
            <span className="text-slate-400">·</span>
            {completeness.readyForFirstMap ? (
              <Link href="/funders" className="font-medium text-teal-700 hover:underline">
                Ready — view your funder matches →
              </Link>
            ) : (
              <Link href="/dossier" className="font-medium text-teal-700 hover:underline">
                Continue your dossier →
              </Link>
            )}
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {VALUE_CARDS.map((card) => (
          <Card key={card.title}>
            <CardContent className="py-5">
              <h3 className="text-base font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{card.body}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="py-5">
            <h3 className="text-base font-semibold text-slate-900">How it works</h3>
            <ol className="mt-3 space-y-2 text-sm text-slate-600">
              <li><span className="font-medium text-slate-800">1.</span> Find your org or start from the sample — we pre-fill a dossier from (mock) public data.</li>
              <li><span className="font-medium text-slate-800">2.</span> Confirm, edit, or remove each suggestion. You stay in control.</li>
              <li><span className="font-medium text-slate-800">3.</span> Get funding frames, ranked funder matches, pursuit briefs, grant assets, a readiness check, and a 90-day plan.</li>
            </ol>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <h3 className="text-base font-semibold text-slate-900">Built on trust</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Every suggestion shows its source and confidence.</li>
              <li>• We recommend <span className="font-medium">Skip</span> when a funder is a bad fit.</li>
              <li>• Scoring is fully visible and editable — no black box.</li>
              <li>• Generated text is a draft that needs human review.</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <Disclaimer />
    </div>
  );
}

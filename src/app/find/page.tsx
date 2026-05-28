"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrg } from "@/components/OrgProvider";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { PageHeader, Disclaimer } from "@/components/common";
import { ConfidenceBadge, DemoBadge } from "@/components/badges";
import { SuggestedFieldCard } from "@/components/SuggestedFieldCard";
import { searchPublicData } from "@/lib/mockOrgLookup";
import type { PublicProfileResult } from "@/lib/types";

type Phase = "search" | "results" | "review";

export default function FindPage() {
  const router = useRouter();
  const { suggested, setSuggested, setFieldStatus, confirmSuggested, loadSample } = useOrg();

  const [phase, setPhase] = useState<Phase>("search");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PublicProfileResult[]>([]);

  async function runSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setPhase("results");
    const res = await searchPublicData(query);
    setResults(res);
    setLoading(false);
  }

  function chooseResult(r: PublicProfileResult) {
    if (r.suggestedFields.length) {
      setSuggested(r.suggestedFields.map((f) => ({ ...f, status: "suggested" })));
      setPhase("review");
    } else {
      // Decoy with no prefill — let the user start manually from here.
      loadSample();
    }
  }

  const reviewable = suggested.filter((f) => f.status !== "removed");
  const accepted = suggested.filter((f) => f.status === "accepted" || f.status === "edited").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Find my nonprofit"
        description="Search public sources and your website to pre-fill a dossier. This is a demo: results are mock data, not a live lookup."
      />

      {phase === "search" && (
        <Card>
          <CardContent className="space-y-4 py-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Organization name, website, or EIN
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runSearch()}
                  placeholder='Try "Common Courtesy", "ccrides.org", or "senior transportation"'
                />
                <Button onClick={runSearch} className="sm:w-44">
                  Search public data
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-600">Sample inputs:</span>
              {["Common Courtesy", "ccrides.org", "rides", "senior transportation", "mobility nonprofit"].map((s) => (
                <button
                  key={s}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 hover:bg-slate-100"
                  onClick={() => setQuery(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "results" && (
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="flex items-center gap-3 py-8 text-slate-600">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
                Searching public sources and your website…
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  {results.length} result{results.length === 1 ? "" : "s"} found for{" "}
                  <span className="font-medium text-slate-800">“{query}”</span>
                </p>
                <Button variant="ghost" size="sm" onClick={() => setPhase("search")}>
                  ← New search
                </Button>
              </div>
              {results.map((r) => (
                <Card key={r.id}>
                  <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900">{r.name}</h3>
                        <ConfidenceBadge confidence={r.matchConfidence} />
                        {r.isSample && <DemoBadge />}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{r.summary}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {r.website} · {r.location}
                        {r.suggestedFields.length === 0 && " · limited public data"}
                      </p>
                    </div>
                    <Button onClick={() => chooseResult(r)} className="shrink-0">
                      {r.suggestedFields.length ? "Review this org" : "Start from this"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
              <p className="text-xs text-slate-400">
                Don’t see a match?{" "}
                <button className="font-medium text-teal-700 hover:underline" onClick={() => router.push("/dossier")}>
                  Create a profile manually instead.
                </button>
              </p>
            </>
          )}
        </div>
      )}

      {phase === "review" && (
        <div className="space-y-5">
          <Card className="border-teal-200 bg-teal-50/50">
            <CardContent className="py-5">
              <h2 className="text-base font-semibold text-slate-900">Suggested Organization Dossier</h2>
              <p className="mt-1 text-sm text-slate-600">
                FundFit found suggested information about your organization. Please confirm or correct
                it before we build your funding map. Everything below is{" "}
                <span className="font-medium">sample data</span> — each item shows where it came from
                and how confident we are.
              </p>
              <div className="mt-3 text-sm text-slate-500">
                {accepted} of {reviewable.length} suggestions accepted.
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3">
            {suggested.map((field) => (
              <SuggestedFieldCard
                key={field.id}
                field={field}
                onAccept={() => setFieldStatus(field.id, "accepted")}
                onEdit={(v) => setFieldStatus(field.id, "edited", v)}
                onRemove={() => setFieldStatus(field.id, "removed")}
              />
            ))}
          </div>

          <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-md">
            <Button
              size="lg"
              onClick={() => {
                confirmSuggested();
                router.push("/dossier");
              }}
            >
              Confirm and build my funding map →
            </Button>
            <Button variant="outline" onClick={() => setPhase("results")}>
              Back to results
            </Button>
            <span className="text-xs text-slate-400">
              You can keep editing everything in the dossier afterwards.
            </span>
          </div>
        </div>
      )}

      <Disclaimer />
    </div>
  );
}

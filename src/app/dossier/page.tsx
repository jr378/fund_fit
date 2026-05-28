"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOrg } from "@/components/OrgProvider";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Progress,
  Select,
  Textarea,
} from "@/components/ui";
import { PageHeader, Disclaimer, ChipEditor } from "@/components/common";
import { DemoBadge, StatPill } from "@/components/badges";
import { allDocKeys, docLabels, uid } from "@/lib/formatters";
import { evaluateCompleteness } from "@/lib/readiness";
import type {
  BudgetRange,
  FundraisingCapacity,
  NonprofitProfile,
  OrgType,
  Program,
  ProofPoint,
} from "@/lib/types";

const ORG_TYPES: OrgType[] = [
  "501(c)(3) public charity",
  "501(c)(3) private foundation",
  "Fiscally sponsored project",
  "Other nonprofit",
];
const BUDGET_RANGES: BudgetRange[] = ["unknown", "Under $250K", "$250K–$1M", "$1M–$5M", "$5M–$10M", "Over $10M"];
const CAPACITIES: FundraisingCapacity[] = [
  "No dedicated fundraiser",
  "Part-time fundraiser",
  "Full-time fundraiser",
  "Development team",
];

export default function DossierPage() {
  const router = useRouter();
  const { profile, hasProfile, loadSample, updateProfile } = useOrg();
  const completeness = evaluateCompleteness(profile);

  const set = (patch: Partial<NonprofitProfile>) => updateProfile(patch);

  // Programs --------------------------------------------------------------
  const updateProgram = (id: string, patch: Partial<Program>) =>
    set({ programs: profile.programs.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  const addProgram = () =>
    set({ programs: [...profile.programs, { id: uid("p"), name: "", description: "" }] });
  const removeProgram = (id: string) =>
    set({ programs: profile.programs.filter((p) => p.id !== id) });

  // Proof points ----------------------------------------------------------
  const updateProof = (id: string, patch: Partial<ProofPoint>) =>
    set({ proofPoints: profile.proofPoints.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  const addProof = () =>
    set({ proofPoints: [...profile.proofPoints, { id: uid("pp"), text: "", source: "User-entered" }] });
  const removeProof = (id: string) =>
    set({ proofPoints: profile.proofPoints.filter((p) => p.id !== id) });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization dossier"
        description="The single source of truth FundFit uses for scoring, frames, and assets. Fill in what you can — you don't need everything to get value."
      >
        <Button variant="outline" onClick={loadSample}>
          Load Common Courtesy-style sample
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main form ------------------------------------------------------ */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Identity</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Organization name</Label>
                <Input value={profile.name} onChange={(e) => set({ name: e.target.value })} placeholder="Your nonprofit's name" />
              </div>
              <div>
                <Label>Website</Label>
                <Input value={profile.website} onChange={(e) => set({ website: e.target.value })} placeholder="example.org" />
              </div>
              <div>
                <Label>EIN</Label>
                <Input value={profile.ein} onChange={(e) => set({ ein: e.target.value })} placeholder="00-0000000" />
              </div>
              <div>
                <Label>Primary geography served</Label>
                <Input value={profile.geography} onChange={(e) => set({ geography: e.target.value })} placeholder="County, region, or state" />
              </div>
              <div>
                <Label>Organization type</Label>
                <Select value={profile.orgType} onChange={(e) => set({ orgType: e.target.value as OrgType })}>
                  <option value="">Select…</option>
                  {ORG_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Annual operating budget range</Label>
                <Select value={profile.budgetRange} onChange={(e) => set({ budgetRange: e.target.value as BudgetRange })}>
                  {BUDGET_RANGES.map((b) => (
                    <option key={b} value={b}>{b === "unknown" ? "Unknown" : b}</option>
                  ))}
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Fundraising capacity</Label>
                <Select value={profile.fundraisingCapacity} onChange={(e) => set({ fundraisingCapacity: e.target.value as FundraisingCapacity })}>
                  <option value="">Select…</option>
                  {CAPACITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Mission statement</Label>
                <Textarea rows={3} value={profile.mission} onChange={(e) => set({ mission: e.target.value })} placeholder="What your organization exists to do." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Programs &amp; services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.programs.map((p) => (
                <div key={p.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex gap-2">
                    <Input value={p.name} onChange={(e) => updateProgram(p.id, { name: e.target.value })} placeholder="Program name" />
                    <Button variant="danger" size="sm" onClick={() => removeProgram(p.id)}>Remove</Button>
                  </div>
                  <Textarea className="mt-2" rows={2} value={p.description} onChange={(e) => updateProgram(p.id, { description: e.target.value })} placeholder="Short description (optional)" />
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addProgram}>+ Add program</Button>
              {profile.programCategories.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs text-slate-500">Derived categories (used for scoring):</span>
                  {profile.programCategories.map((c) => (
                    <StatPill key={c} label={c} tone="teal" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>People &amp; impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Populations served</Label>
                <ChipEditor items={profile.populations} onChange={(v) => set({ populations: v })} placeholder="e.g. Seniors" />
              </div>
              <div>
                <Label>Key outcomes</Label>
                <ChipEditor items={profile.outcomes} onChange={(v) => set({ outcomes: v })} placeholder="e.g. Reduced missed appointments" />
              </div>
              <div>
                <Label>Proof points</Label>
                <div className="space-y-2">
                  {profile.proofPoints.map((pp) => (
                    <div key={pp.id} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex gap-2">
                        <Input value={pp.text} onChange={(e) => updateProof(pp.id, { text: e.target.value })} placeholder="Proof point" />
                        <Button variant="danger" size="sm" onClick={() => removeProof(pp.id)}>Remove</Button>
                      </div>
                      <Input className="mt-2" value={pp.metric ?? ""} onChange={(e) => updateProof(pp.id, { metric: e.target.value })} placeholder="Metric (optional), e.g. 12,000 rides/year" />
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addProof}>+ Add proof point</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Funders &amp; relationships</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current funders</Label>
                <ChipEditor items={profile.currentFunders} onChange={(v) => set({ currentFunders: v })} placeholder="e.g. Local community foundation" />
              </div>
              <div>
                <Label>Past grants won</Label>
                <ChipEditor items={profile.pastGrantsWon} onChange={(v) => set({ pastGrantsWon: v })} placeholder="e.g. Foundation X — $25,000" />
              </div>
              <div>
                <Label>Past grants lost</Label>
                <ChipEditor items={profile.pastGrantsLost} onChange={(v) => set({ pastGrantsLost: v })} placeholder="e.g. Foundation Y — declined" />
              </div>
              <div>
                <Label>Board / relationship notes</Label>
                <Textarea rows={3} value={profile.relationshipNotes} onChange={(e) => set({ relationshipNotes: e.target.value })} placeholder="Who knows whom? Which funders do board members or partners have ties to?" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documents available</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-slate-500">
                Check the materials you already have. This drives readiness and which funders you can
                realistically apply to.{" "}
                <Link href="/documents" className="font-medium text-teal-700 hover:underline">
                  Simulate document uploads →
                </Link>
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {allDocKeys.map((key) => (
                  <label key={key} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={profile.documents[key]}
                      onChange={(e) => set({ documents: { ...profile.documents, [key]: e.target.checked } })}
                      className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-slate-700">{docLabels[key]}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Constraints &amp; boundaries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Capacity constraints</Label>
                <Textarea rows={2} value={profile.capacityConstraints} onChange={(e) => set({ capacityConstraints: e.target.value })} placeholder="What limits your ability to apply or report?" />
              </div>
              <div>
                <Label>Mission boundaries — what should this org avoid doing just to chase funding?</Label>
                <Textarea rows={2} value={profile.missionBoundaries} onChange={(e) => set({ missionBoundaries: e.target.value })} placeholder="Name the work you should stay away from, even if funded." />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar -------------------------------------------------------- */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Profile completeness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-slate-900">{completeness.percent}%</span>
                {completeness.readyForFirstMap ? (
                  <StatPill label="Ready for first map" tone="emerald" />
                ) : (
                  <StatPill label="Not ready yet" tone="amber" />
                )}
              </div>
              <Progress value={completeness.percent} tone={completeness.readyForFirstMap ? "emerald" : "amber"} />

              {completeness.missingRequired.length > 0 ? (
                <div className="text-sm">
                  <p className="font-medium text-slate-700">Still needed for a first map:</p>
                  <ul className="mt-1 space-y-1 text-slate-500">
                    {completeness.missingRequired.map((m) => (
                      <li key={m}>• {m}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-emerald-700">
                  You have enough to generate a first funding map.
                </p>
              )}

              {completeness.mostUsefulNext && (
                <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm">
                  <p className="font-medium text-teal-900">Most useful next field to add</p>
                  <p className="mt-1 text-teal-800">{completeness.mostUsefulNext.field}</p>
                  <p className="mt-1 text-xs text-teal-700">{completeness.mostUsefulNext.why}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 py-4">
              <Button
                className="w-full"
                disabled={!completeness.readyForFirstMap}
                onClick={() => router.push("/funders")}
              >
                {completeness.readyForFirstMap ? "Good enough — build my funding map" : "Add the basics first"}
              </Button>
              <Link href="/interview" className="block">
                <Button variant="outline" className="w-full">Improve this profile (guided interview)</Button>
              </Link>
              <Link href="/documents" className="block">
                <Button variant="ghost" className="w-full">Add simulated documents</Button>
              </Link>
              <p className="pt-1 text-center text-xs text-slate-400">
                You don&apos;t need a complete profile to see value.
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <DemoBadge /> All sample data — not real grant facts.
          </div>
        </div>
      </div>

      {!hasProfile && (
        <Disclaimer />
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useOrg } from "@/components/OrgProvider";
import { Button, Card, CardContent, Textarea, cn } from "@/components/ui";
import { PageHeader, Disclaimer, NoProfileNotice, CopyButton } from "@/components/common";
import { ConfidenceBadge, StatPill } from "@/components/badges";
import { generateFundingFrames } from "@/lib/fundingFrames";
import { funderTypeLabel } from "@/lib/formatters";

export default function FramesPage() {
  const { profile, hasProfile, selectFrame, selectedFrameId } = useOrg();
  const frames = useMemo(() => generateFundingFrames(profile), [profile]);

  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!hasProfile) {
    return (
      <div className="space-y-6">
        <PageHeader title="Funding frames" />
        <NoProfileNotice feature="Funding frames" />
      </div>
    );
  }

  const visible = frames.filter((f) => !removed.has(f.id));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Funding frames"
        description="The same mission, told in the language different funders use. Generated from your dossier with transparent local rules — no invented facts. Keep, edit, or remove each frame."
      />

      {visible.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-slate-500">
            No frames generated yet. Add programs and populations to your{" "}
            <Link href="/dossier" className="font-medium text-teal-700 hover:underline">dossier</Link>{" "}
            to activate frames.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((frame) => {
            const snippet = edits[frame.id] ?? frame.languageSnippet;
            const isSelected = selectedFrameId === frame.id;
            return (
              <Card key={frame.id} className={cn(isSelected && "ring-2 ring-teal-500")}>
                <CardContent className="space-y-3 py-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-slate-900">{frame.name}</h3>
                    <ConfidenceBadge confidence={frame.confidence} />
                  </div>

                  <p className="text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Why you fit:</span> {frame.whyFits}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-slate-500">Best funder types:</span>
                    {frame.bestFunderTypes.map((t) => (
                      <StatPill key={t} label={funderTypeLabel[t]} tone="sky" />
                    ))}
                  </div>

                  <div>
                    <span className="text-xs text-slate-500">Strongest proof points:</span>
                    <ul className="mt-1 space-y-0.5 text-sm text-slate-600">
                      {frame.strongestProofPoints.map((pp) => (
                        <li key={pp}>• {pp}</li>
                      ))}
                    </ul>
                  </div>

                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    <span className="font-medium">Possible gap:</span> {frame.possibleGap}
                  </p>

                  <div>
                    <span className="text-xs font-medium text-slate-500">Suggested language snippet:</span>
                    {editingId === frame.id ? (
                      <div className="mt-1 space-y-2">
                        <Textarea
                          rows={3}
                          value={snippet}
                          onChange={(e) => setEdits((prev) => ({ ...prev, [frame.id]: e.target.value }))}
                        />
                        <Button size="sm" onClick={() => setEditingId(null)}>Done</Button>
                      </div>
                    ) : (
                      <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-sm italic text-slate-700">
                        “{snippet}”
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      size="sm"
                      variant={isSelected ? "primary" : "outline"}
                      onClick={() => selectFrame(isSelected ? null : frame.id)}
                    >
                      {isSelected ? "✓ Using for assets" : "Use for grant assets"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(frame.id)}>Edit</Button>
                    <CopyButton text={snippet} />
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setRemoved((prev) => new Set(prev).add(frame.id))}
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {removed.size > 0 && (
        <button className="text-sm text-teal-700 hover:underline" onClick={() => setRemoved(new Set())}>
          Restore {removed.size} removed frame(s)
        </button>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href="/funders"><Button>See funder matches →</Button></Link>
        <Link href="/assets"><Button variant="outline">Build grant assets →</Button></Link>
      </div>

      <Disclaimer />
    </div>
  );
}

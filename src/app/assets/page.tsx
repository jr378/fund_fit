"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useOrg } from "@/components/OrgProvider";
import { Card, CardContent, CardHeader, CardTitle, Label, Select, Textarea } from "@/components/ui";
import { PageHeader, Disclaimer, NoProfileNotice, CopyButton } from "@/components/common";
import { ReviewBadge, StatPill } from "@/components/badges";
import { generateAllAssets } from "@/lib/grantAssets";
import { generateFundingFrames } from "@/lib/fundingFrames";

export default function AssetsPage() {
  const { profile, hasProfile, selectedFrameId, selectFrame } = useOrg();
  const frames = useMemo(() => generateFundingFrames(profile), [profile]);
  const frame = frames.find((f) => f.id === selectedFrameId) ?? null;

  const generated = useMemo(() => generateAllAssets(profile, frame), [profile, frame]);

  // Edits stored as overrides keyed by frame + asset kind, so changing the
  // frame naturally re-seeds from the freshly generated body (no effect needed).
  const [edits, setEdits] = useState<Record<string, string>>({});
  const keyFor = (kind: string) => `${selectedFrameId ?? "none"}:${kind}`;

  if (!hasProfile) {
    return (
      <div className="space-y-6">
        <PageHeader title="Grant assets" />
        <NoProfileNotice feature="The grant asset builder" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grant asset builder"
        description="Reusable language generated from your dossier and a chosen frame using transparent templates (no LLM yet). Edit anything; every asset needs human review before you send it."
      />

      <Card>
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="sm:w-80">
            <Label>Funding frame to emphasize</Label>
            <Select value={selectedFrameId ?? ""} onChange={(e) => selectFrame(e.target.value || null)}>
              <option value="">No specific frame (general)</option>
              {frames.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </Select>
          </div>
          <p className="text-xs text-slate-500">
            Changing the frame regenerates the drafts below.{" "}
            <Link href="/frames" className="font-medium text-teal-700 hover:underline">Manage frames →</Link>
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {generated.map((asset) => {
          const value = edits[keyFor(asset.kind)] ?? asset.body;
          return (
            <Card key={asset.kind}>
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                <CardTitle>{asset.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <ReviewBadge />
                  <CopyButton text={value} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Textarea
                  rows={Math.min(14, Math.max(4, value.split("\n").length + 1))}
                  value={value}
                  onChange={(e) => setEdits((d) => ({ ...d, [keyFor(asset.kind)]: e.target.value }))}
                  className="font-sans"
                />
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-500">Built from:</span>
                  {asset.fieldsUsed.map((f) => (
                    <StatPill key={f} label={f} tone="slate" />
                  ))}
                  <button
                    className="ml-auto text-xs text-slate-400 hover:text-teal-700 hover:underline"
                    onClick={() => setEdits((d) => {
                      const next = { ...d };
                      delete next[keyFor(asset.kind)];
                      return next;
                    })}
                  >
                    Reset to generated
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Disclaimer />
    </div>
  );
}

"use client";

import { useState } from "react";
import type { SuggestedField } from "@/lib/types";
import { Button, Textarea, cn } from "./ui";
import { ConfidenceBadge, DemoBadge, SourceBadge } from "./badges";

export function SuggestedFieldCard({
  field,
  onAccept,
  onEdit,
  onRemove,
}: {
  field: SuggestedField;
  onAccept: () => void;
  onEdit: (newValue: string) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(field.value);

  const removed = field.status === "removed";
  const accepted = field.status === "accepted";
  const edited = field.status === "edited";

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors",
        removed ? "border-slate-200 bg-slate-50 opacity-60" : "border-slate-200 bg-white",
        (accepted || edited) && "border-emerald-200 bg-emerald-50/40",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-900">{field.label}</span>
        <SourceBadge source={field.sourceType} />
        <ConfidenceBadge confidence={field.confidence} />
        <DemoBadge />
        {accepted && <span className="text-xs font-medium text-emerald-700">✓ Accepted</span>}
        {edited && <span className="text-xs font-medium text-emerald-700">✓ Edited</span>}
        {removed && <span className="text-xs font-medium text-slate-500">Removed</span>}
      </div>

      {editing ? (
        <div className="mt-3 space-y-2">
          <Textarea rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} />
          <p className="text-xs text-slate-400">
            For list fields (programs, populations, etc.), separate items with semicolons.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                onEdit(draft);
                setEditing(false);
              }}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDraft(field.value);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className={cn("mt-2 text-sm leading-relaxed", removed ? "text-slate-400 line-through" : "text-slate-700")}>
          {field.value}
        </p>
      )}

      <p className="mt-2 text-xs italic text-slate-400">Why suggested: {field.explanation}</p>

      {!editing && !removed && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant={accepted || edited ? "outline" : "primary"} onClick={onAccept}>
            {accepted || edited ? "Accepted" : "Accept"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={onRemove}>
            Remove
          </Button>
        </div>
      )}
      {removed && (
        <div className="mt-3">
          <Button size="sm" variant="ghost" onClick={onAccept}>
            Restore & accept
          </Button>
        </div>
      )}
    </div>
  );
}

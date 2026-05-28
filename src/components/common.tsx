"use client";

import Link from "next/link";
import { useState } from "react";
import { cn, Button, Progress } from "./ui";
import type { ScoreComponent } from "@/lib/types";

/** Standard page heading with optional description + actions. */
export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

/** Trust disclaimer shown across the app. */
export function Disclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500", className)}>
      <strong className="font-semibold text-slate-600">Please read:</strong> FundFit is a demo using
      sample/mock data. It does not call real funder databases and does not contain real grant facts.
      Its suggestions are starting points that require human review and are{" "}
      <strong>not legal, tax, accounting, or guaranteed grant advice.</strong> Always verify funder
      requirements directly before applying.
    </p>
  );
}

/** Shown on pages that need a profile before they're useful. */
export function NoProfileNotice({ feature }: { feature: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-slate-900">No organization profile yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        {feature} needs an organization profile. Start with the sample nonprofit or find yours to see
        this in action.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Link href="/find">
          <Button>Find my nonprofit</Button>
        </Link>
        <Link href="/dossier">
          <Button variant="outline">Go to dossier</Button>
        </Link>
      </div>
    </div>
  );
}

/** A single score row with progress bar + expandable explanation. */
export function ScoreBar({ component }: { component: ScoreComponent }) {
  const tone = component.score >= 70 ? "emerald" : component.score >= 50 ? "amber" : "rose";
  return (
    <div className="py-2">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{component.label}</span>
        <span className="tabular-nums text-slate-500">{component.score}</span>
      </div>
      <Progress value={component.score} tone={tone} />
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{component.explanation}</p>
    </div>
  );
}

/** A big overall-score dial-ish number with a bar. */
export function OverallScore({ value, label = "Overall fit" }: { value: number; label?: string }) {
  const tone = value >= 70 ? "emerald" : value >= 50 ? "amber" : "rose";
  const color = value >= 70 ? "text-emerald-700" : value >= 50 ? "text-amber-700" : "text-rose-700";
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className={cn("text-3xl font-bold tabular-nums", color)}>{value}</span>
        <span className="text-sm text-slate-500">/ 100 · {label}</span>
      </div>
      <Progress value={value} tone={tone} className="mt-2" />
    </div>
  );
}

/** Copy-to-clipboard button. */
export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard may be blocked */
        }
      }}
    >
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}

/** Editable list of comma/line items rendered as removable chips with an add box. */
export function ChipEditor({
  items,
  onChange,
  placeholder = "Add item…",
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={`${item}-${i}`} className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
            {item}
            <button
              type="button"
              className="text-slate-400 hover:text-rose-600"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              aria-label={`Remove ${item}`}
            >
              ×
            </button>
          </span>
        ))}
        {items.length === 0 && <span className="text-xs text-slate-400">None yet.</span>}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              e.preventDefault();
              onChange([...items, draft.trim()]);
              setDraft("");
            }
          }}
          placeholder={placeholder}
          className="h-9 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if (draft.trim()) {
              onChange([...items, draft.trim()]);
              setDraft("");
            }
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

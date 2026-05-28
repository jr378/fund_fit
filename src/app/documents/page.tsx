"use client";

import { useState } from "react";
import Link from "next/link";
import { useOrg } from "@/components/OrgProvider";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { PageHeader, Disclaimer } from "@/components/common";
import { SuggestedFieldCard } from "@/components/SuggestedFieldCard";
import { DemoBadge } from "@/components/badges";
import { DOCUMENT_OPTIONS, extractDocument } from "@/lib/mockDocumentExtraction";
import type { DocumentKind } from "@/lib/types";

export default function DocumentsPage() {
  const { extractions, addExtraction, acceptExtractionFact, updateExtractionFact, hasProfile } = useOrg();
  const [loadingKind, setLoadingKind] = useState<DocumentKind | null>(null);

  async function simulateUpload(kind: DocumentKind) {
    setLoadingKind(kind);
    const result = await extractDocument(kind);
    addExtraction(result);
    setLoadingKind(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Add documents to pull facts into your dossier. In this demo, clicking a button simulates extraction — no real file is read."
      >
        <Link href="/dossier">
          <Button variant="outline">Back to dossier</Button>
        </Link>
      </PageHeader>

      {!hasProfile && <Disclaimer />}

      <Card>
        <CardHeader>
          <CardTitle>Simulate a document upload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DOCUMENT_OPTIONS.map((opt) => (
              <button
                key={opt.kind}
                onClick={() => simulateUpload(opt.kind)}
                disabled={loadingKind !== null}
                className="flex flex-col items-start gap-1 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-left transition-colors hover:border-teal-400 hover:bg-teal-50/40 disabled:opacity-50"
              >
                <span className="text-sm font-semibold text-slate-800">{opt.label}</span>
                <span className="text-xs text-slate-500">{opt.description}</span>
                {loadingKind === opt.kind && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs text-teal-700">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
                    Extracting…
                  </span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {extractions.length === 0 ? (
        <p className="text-sm text-slate-500">
          No documents added yet. Click any button above to see simulated extracted facts you can
          accept into your dossier.
        </p>
      ) : (
        <div className="space-y-5">
          {extractions.map((ex) => (
            <Card key={ex.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  Extracted from: {ex.label} <DemoBadge className="ml-2 align-middle" />
                </CardTitle>
                <span className="text-xs text-slate-400">{ex.extractedFacts.length} facts</span>
              </CardHeader>
              <CardContent className="grid gap-3">
                {ex.extractedFacts.map((fact) => (
                  <SuggestedFieldCard
                    key={fact.id}
                    field={fact}
                    onAccept={() => acceptExtractionFact(ex.id, fact.id)}
                    onEdit={(v) => updateExtractionFact(ex.id, fact.id, { value: v, status: "edited" })}
                    onRemove={() => updateExtractionFact(ex.id, fact.id, { status: "removed" })}
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

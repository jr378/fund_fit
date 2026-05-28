"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrg } from "@/components/OrgProvider";
import { Button, Card, CardContent, Progress, Textarea } from "@/components/ui";
import { PageHeader, Disclaimer } from "@/components/common";
import { INTERVIEW_QUESTIONS } from "@/lib/interview";

const FEED_LABELS: Record<string, string> = {
  proofPoint: "proof point",
  fundingNeed: "funding need",
  missionBoundary: "mission boundary",
  outcome: "outcome",
  snippet: "language snippet",
};

export default function InterviewPage() {
  const router = useRouter();
  const { interviewAnswers, saveInterview, hasProfile } = useOrg();

  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(interviewAnswers.map((a) => [a.questionId, a.answer])),
  );
  const [step, setStep] = useState(0);

  const q = INTERVIEW_QUESTIONS[step];
  const total = INTERVIEW_QUESTIONS.length;
  const answeredCount = Object.values(answers).filter((a) => a.trim()).length;

  function save() {
    saveInterview(
      INTERVIEW_QUESTIONS.map((qq) => ({ questionId: qq.id, answer: answers[qq.id] ?? "" })).filter(
        (a) => a.answer.trim(),
      ),
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guided interview"
        description="A few plain-English questions. Your answers become proof points, funding needs, outcomes, mission boundaries, and reusable language in your dossier."
      />

      {!hasProfile && <Disclaimer />}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardContent className="space-y-4 py-6">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Question {step + 1} of {total}</span>
              <span>{answeredCount} answered</span>
            </div>
            <Progress value={((step + 1) / total) * 100} />

            <div>
              <h2 className="text-lg font-semibold text-slate-900">{q.prompt}</h2>
              <p className="mt-1 text-sm text-slate-500">{q.helper}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {q.feeds.map((f) => (
                  <span key={f} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-500">
                    → {FEED_LABELS[f]}
                  </span>
                ))}
              </div>
            </div>

            <Textarea
              rows={5}
              value={answers[q.id] ?? ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
              placeholder={q.placeholder}
            />

            <div className="flex items-center justify-between">
              <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
                ← Previous
              </Button>
              {step < total - 1 ? (
                <Button onClick={() => { save(); setStep((s) => s + 1); }}>Save &amp; next →</Button>
              ) : (
                <Button onClick={() => { save(); router.push("/dossier"); }}>
                  Finish &amp; update dossier
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardContent className="py-4">
              <h3 className="text-sm font-semibold text-slate-900">All questions</h3>
              <ol className="mt-2 space-y-1.5 text-sm">
                {INTERVIEW_QUESTIONS.map((qq, i) => (
                  <li key={qq.id}>
                    <button
                      className={`text-left ${i === step ? "font-medium text-teal-700" : "text-slate-500 hover:text-slate-800"}`}
                      onClick={() => setStep(i)}
                    >
                      {answers[qq.id]?.trim() ? "✓ " : "• "}
                      {qq.prompt}
                    </button>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-xs text-slate-500">
              You can skip any question. Answers are saved as you go and merged into your dossier —
              they never overwrite what you&apos;ve already entered.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

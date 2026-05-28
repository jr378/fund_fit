"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useOrg } from "@/components/OrgProvider";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, cn } from "@/components/ui";
import { PageHeader, Disclaimer, NoProfileNotice } from "@/components/common";
import { StatPill } from "@/components/badges";
import { mockFunders } from "@/lib/mockFunders";
import { scoreAllFunders } from "@/lib/scoring";
import { generateFundingPlan, PLAN_PHASES } from "@/lib/plan";
import type { FundingTask, TaskStatus } from "@/lib/types";

const STATUS: TaskStatus[] = ["Not started", "In progress", "Done"];
const priorityTone = { High: "rose", Medium: "amber", Low: "slate" } as const;

export default function PlanPage() {
  const { profile, hasProfile, tasks: savedTasks, setTasks } = useOrg();
  const funderMap = useMemo(() => new Map(mockFunders.map((f) => [f.id, f])), []);

  // Derive a default plan; show it until the user edits (which persists it).
  const generated = useMemo(
    () => generateFundingPlan(profile, scoreAllFunders(profile, mockFunders), mockFunders),
    [profile],
  );
  const tasks = savedTasks.length ? savedTasks : generated;

  const buildPlan = () =>
    setTasks(generateFundingPlan(profile, scoreAllFunders(profile, mockFunders), mockFunders));

  const update = (id: string, patch: Partial<FundingTask>) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  if (!hasProfile) {
    return (
      <div className="space-y-6">
        <PageHeader title="90-day funding plan" />
        <NoProfileNotice feature="The 90-day plan" />
      </div>
    );
  }

  const done = tasks.filter((t) => t.status === "Done").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="90-day funding plan"
        description="A practical, sequenced plan built from your top funder matches and your biggest gaps. Mark tasks complete as you go."
      >
        <Button variant="outline" onClick={buildPlan}>Regenerate plan</Button>
      </PageHeader>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 py-4 text-sm">
          <span className="font-medium text-slate-700">{done} / {tasks.length} tasks done</span>
          <div className="h-2 w-48 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${tasks.length ? (done / tasks.length) * 100 : 0}%` }} />
          </div>
          <Link href="/funders" className="ml-auto text-teal-700 hover:underline">View funder matches →</Link>
        </CardContent>
      </Card>

      {PLAN_PHASES.map((phase) => {
        const phaseTasks = tasks.filter((t) => t.phase === phase);
        if (!phaseTasks.length) return null;
        return (
          <Card key={phase}>
            <CardHeader><CardTitle>{phase}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {phaseTasks.map((t) => {
                const funder = t.relatedFunderId ? funderMap.get(t.relatedFunderId) : null;
                return (
                  <div
                    key={t.id}
                    className={cn(
                      "rounded-lg border p-3",
                      t.status === "Done" ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200",
                    )}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <p className={cn("text-sm font-medium", t.status === "Done" ? "text-slate-500 line-through" : "text-slate-800")}>
                          {t.task}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <StatPill label={`${t.priority} priority`} tone={priorityTone[t.priority]} />
                          {funder && (
                            <Link href={`/funders/${funder.id}`} className="text-xs text-teal-700 hover:underline">
                              {funder.name}
                            </Link>
                          )}
                        </div>
                      </div>
                      <Select
                        value={t.status}
                        onChange={(e) => update(t.id, { status: e.target.value as TaskStatus })}
                        className="h-9 w-full sm:w-40"
                      >
                        {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </Select>
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <div>
                        <span className="text-xs text-slate-400">Owner</span>
                        <Input
                          className="h-9"
                          value={t.owner === "—" ? "" : t.owner}
                          onChange={(e) => update(t.id, { owner: e.target.value || "—" })}
                          placeholder="Assign an owner"
                        />
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Due date</span>
                        <Input
                          className="h-9"
                          type="date"
                          value={t.dueDate === "—" ? "" : t.dueDate}
                          onChange={(e) => update(t.id, { dueDate: e.target.value || "—" })}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      <Disclaimer />
    </div>
  );
}

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  DocumentExtractionResult,
  FundingTask,
  GuidedInterviewAnswer,
  NonprofitProfile,
  SuggestedField,
  SuggestedFieldStatus,
  TaskStatus,
} from "@/lib/types";
import { emptyProfile } from "@/lib/formatters";
import { sampleProfile } from "@/lib/sampleNonprofits";
import { applySuggestedField, applySuggestedFields } from "@/lib/applyFields";
import { applyInterviewAnswers } from "@/lib/interview";
import { deriveProgramCategories } from "@/lib/categories";

const STORAGE_KEY = "fundfit:v1";

interface OrgState {
  profile: NonprofitProfile;
  /** True once the user has onboarded (sample / found / manual). */
  hasProfile: boolean;
  /** Pending suggested fields under review (the prefill experience). */
  suggested: SuggestedField[];
  interviewAnswers: GuidedInterviewAnswer[];
  extractions: DocumentExtractionResult[];
  /** Generated 90-day plan tasks (statuses are user-editable). */
  tasks: FundingTask[];
  /** Frame chosen for grant-asset generation. */
  selectedFrameId: string | null;
}

interface OrgContextValue extends OrgState {
  loadSample: () => void;
  startManual: (initial?: Partial<NonprofitProfile>) => void;
  updateProfile: (patch: Partial<NonprofitProfile>) => void;
  setSuggested: (fields: SuggestedField[]) => void;
  setFieldStatus: (id: string, status: SuggestedFieldStatus, newValue?: string) => void;
  acceptSuggested: (id: string) => void;
  confirmSuggested: () => void;
  addExtraction: (extraction: DocumentExtractionResult) => void;
  acceptExtractionFact: (extractionId: string, fieldId: string) => void;
  updateExtractionFact: (extractionId: string, fieldId: string, patch: Partial<SuggestedField>) => void;
  saveInterview: (answers: GuidedInterviewAnswer[]) => void;
  setTasks: (tasks: FundingTask[]) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  setTaskOwner: (id: string, owner: string) => void;
  setTaskDue: (id: string, dueDate: string) => void;
  selectFrame: (id: string | null) => void;
  reset: () => void;
}

const OrgContext = createContext<OrgContextValue | null>(null);

function initialState(): OrgState {
  return {
    profile: emptyProfile(),
    hasProfile: false,
    suggested: [],
    interviewAnswers: [],
    extractions: [],
    tasks: [],
    selectedFrameId: null,
  };
}

export function OrgProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OrgState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on mount. We intentionally read this
  // external store after mount (not in a useState initializer) to avoid a
  // server/client hydration mismatch.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setState(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // Persist on change (after hydration to avoid clobbering).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }, [state, hydrated]);

  const value = useMemo<OrgContextValue>(() => {
    const setProfile = (updater: (p: NonprofitProfile) => NonprofitProfile) =>
      setState((s) => ({ ...s, profile: updater(s.profile), hasProfile: true }));

    return {
      ...state,
      loadSample: () =>
        setState((s) => ({
          ...s,
          profile: { ...sampleProfile },
          hasProfile: true,
          suggested: [],
        })),
      startManual: (initial) =>
        setState((s) => {
          const profile = { ...emptyProfile(), ...initial };
          profile.programCategories = deriveProgramCategories(profile);
          return { ...s, profile, hasProfile: true, suggested: [] };
        }),
      updateProfile: (patch) =>
        setProfile((p) => {
          const next = { ...p, ...patch };
          next.programCategories = deriveProgramCategories(next);
          return next;
        }),
      setSuggested: (fields) => setState((s) => ({ ...s, suggested: fields })),
      setFieldStatus: (id, status, newValue) =>
        setState((s) => ({
          ...s,
          suggested: s.suggested.map((f) =>
            f.id === id ? { ...f, status, value: newValue ?? f.value } : f,
          ),
        })),
      acceptSuggested: (id) =>
        setState((s) => {
          const field = s.suggested.find((f) => f.id === id);
          if (!field) return s;
          const profile = applySuggestedField(s.profile, { ...field, status: "accepted" });
          return {
            ...s,
            profile,
            hasProfile: true,
            suggested: s.suggested.map((f) => (f.id === id ? { ...f, status: "accepted" } : f)),
          };
        }),
      confirmSuggested: () =>
        setState((s) => {
          // Treat any not-yet-removed field as accepted, then apply all.
          const finalized = s.suggested.map((f) =>
            f.status === "removed" ? f : { ...f, status: "accepted" as SuggestedFieldStatus },
          );
          const profile = applySuggestedFields(s.profile, finalized);
          return { ...s, profile, hasProfile: true, suggested: finalized };
        }),
      addExtraction: (extraction) =>
        setState((s) => ({ ...s, extractions: [...s.extractions, extraction] })),
      acceptExtractionFact: (extractionId, fieldId) =>
        setState((s) => {
          const extraction = s.extractions.find((e) => e.id === extractionId);
          const fact = extraction?.extractedFacts.find((f) => f.id === fieldId);
          if (!fact) return s;
          const profile = applySuggestedField(s.profile, { ...fact, status: "accepted" });
          return {
            ...s,
            profile,
            hasProfile: true,
            extractions: s.extractions.map((e) =>
              e.id === extractionId
                ? {
                    ...e,
                    extractedFacts: e.extractedFacts.map((f) =>
                      f.id === fieldId ? { ...f, status: "accepted" } : f,
                    ),
                  }
                : e,
            ),
          };
        }),
      updateExtractionFact: (extractionId, fieldId, patch) =>
        setState((s) => ({
          ...s,
          extractions: s.extractions.map((e) =>
            e.id === extractionId
              ? {
                  ...e,
                  extractedFacts: e.extractedFacts.map((f) =>
                    f.id === fieldId ? { ...f, ...patch } : f,
                  ),
                }
              : e,
          ),
        })),
      saveInterview: (answers) =>
        setState((s) => ({
          ...s,
          interviewAnswers: answers,
          profile: (() => {
            const p = applyInterviewAnswers(s.profile, answers);
            p.programCategories = deriveProgramCategories(p);
            return p;
          })(),
          hasProfile: true,
        })),
      setTasks: (tasks) => setState((s) => ({ ...s, tasks })),
      setTaskStatus: (id, status) =>
        setState((s) => ({
          ...s,
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
        })),
      setTaskOwner: (id, owner) =>
        setState((s) => ({
          ...s,
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, owner } : t)),
        })),
      setTaskDue: (id, dueDate) =>
        setState((s) => ({
          ...s,
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, dueDate } : t)),
        })),
      selectFrame: (id) => setState((s) => ({ ...s, selectedFrameId: id })),
      reset: () => setState(initialState()),
    };
  }, [state]);

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrg(): OrgContextValue {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used within OrgProvider");
  return ctx;
}

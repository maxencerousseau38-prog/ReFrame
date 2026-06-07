"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { PLANS, type PlanId, type PlanDef } from "@/lib/plan";
import { Paywall } from "./Paywall";

interface UsageState {
  plan: PlanId;
  used: number;
  month: string; // "YYYY-MM"
}

interface PlanContextValue {
  plan: PlanDef;
  used: number;
  remaining: number; // Infinity for unlimited
  mounted: boolean;
  /** True if at least one analysis remains. */
  canAnalyze: boolean;
  /** Consume one analysis. Returns false (and opens the paywall) if quota hit. */
  consume: () => boolean;
  setPlan: (id: PlanId) => void;
  /** Open the upgrade paywall, optionally with a contextual reason. */
  openPaywall: (reason?: string) => void;
}

const KEY = "valoryx.usage.v1";
const currentMonth = () => new Date().toISOString().slice(0, 7);

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UsageState>({ plan: "free", used: 0, month: currentMonth() });
  const [mounted, setMounted] = useState(false);
  const [paywall, setPaywall] = useState<{ open: boolean; reason?: string }>({ open: false });

  // Hydrate from localStorage (and reset the counter on a new month).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as UsageState;
        if (parsed.month !== currentMonth()) parsed.used = 0;
        parsed.month = currentMonth();
        setState(parsed);
      }
    } catch {
      /* ignore */
    }
    setMounted(true);
  }, []);

  const persist = useCallback((next: UsageState) => {
    setState(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const plan = PLANS[state.plan];
  const remaining = plan.quota === Infinity ? Infinity : Math.max(0, plan.quota - state.used);
  const canAnalyze = remaining > 0;

  const openPaywall = useCallback((reason?: string) => setPaywall({ open: true, reason }), []);

  const consume = useCallback((): boolean => {
    if (plan.quota === Infinity) return true;
    if (state.used >= plan.quota) {
      setPaywall({ open: true, reason: "quota" });
      return false;
    }
    persist({ ...state, used: state.used + 1 });
    return true;
  }, [plan.quota, state, persist]);

  const setPlan = useCallback(
    (id: PlanId) => {
      persist({ plan: id, used: id === state.plan ? state.used : 0, month: currentMonth() });
      setPaywall({ open: false });
    },
    [persist, state.plan, state.used],
  );

  return (
    <PlanContext.Provider
      value={{ plan, used: state.used, remaining, mounted, canAnalyze, consume, setPlan, openPaywall }}
    >
      {children}
      <Paywall
        open={paywall.open}
        reason={paywall.reason}
        currentPlan={state.plan}
        onClose={() => setPaywall({ open: false })}
        onChoose={setPlan}
      />
    </PlanContext.Provider>
  );
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used within PlanProvider");
  return ctx;
}

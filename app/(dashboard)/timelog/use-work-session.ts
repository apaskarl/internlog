"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  startTransition,
} from "react";
import {
  clearPersistedSession,
  grossSessionMs,
  loadPersistedSession,
  netWorkMs,
  persistSession,
  totalBreakMs,
  type BreakSegment,
  type WorkSessionState,
} from "@/lib/work-session";

/** Single source of truth; mount once inside `WorkSessionProvider`. */
export function useWorkSessionState() {
  const router = useRouter();
  const [state, setState] = useState<WorkSessionState>({ phase: "idle" });
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const restored = loadPersistedSession();
    if (restored) {
      startTransition(() => {
        setState(restored);
      });
    }
    startTransition(() => {
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persistSession(state);
  }, [state, hydrated]);

  const timeIn = useCallback(() => {
    setState({
      phase: "working",
      timeInMs: Date.now(),
      completedBreaks: [],
    });
  }, []);

  const startBreak = useCallback(() => {
    setState((s) => {
      if (s.phase !== "working") return s;
      return {
        phase: "on_break",
        timeInMs: s.timeInMs,
        completedBreaks: s.completedBreaks,
        breakStartMs: Date.now(),
      };
    });
  }, []);

  const resumeBreak = useCallback(() => {
    setState((s) => {
      if (s.phase !== "on_break") return s;
      const endMs = Date.now();
      const next: BreakSegment[] = [
        ...s.completedBreaks,
        { startMs: s.breakStartMs, endMs },
      ];
      return {
        phase: "working",
        timeInMs: s.timeInMs,
        completedBreaks: next,
      };
    });
  }, []);

  const timeOut = useCallback(() => {
    setState((s) => {
      const end = Date.now();
      if (s.phase === "working") {
        queueMicrotask(() => {
          router.push("/timelog");
        });
        return {
          phase: "finished",
          timeInMs: s.timeInMs,
          timeOutMs: end,
          completedBreaks: s.completedBreaks,
        };
      }
      if (s.phase === "on_break") {
        const completedBreaks: BreakSegment[] = [
          ...s.completedBreaks,
          { startMs: s.breakStartMs, endMs: end },
        ];
        queueMicrotask(() => {
          router.push("/timelog");
        });
        return {
          phase: "finished",
          timeInMs: s.timeInMs,
          timeOutMs: end,
          completedBreaks,
        };
      }
      return s;
    });
  }, [router]);

  /** After Time out, close the review dialog to resume the live timer (same time in & breaks). */
  const continueSession = useCallback(() => {
    setState((s) => {
      if (s.phase !== "finished") return s;
      return {
        phase: "working",
        timeInMs: s.timeInMs,
        completedBreaks: s.completedBreaks,
      };
    });
  }, []);

  const discardFinished = useCallback(() => {
    setState({ phase: "idle" });
    clearPersistedSession();
  }, []);

  const resetToIdle = useCallback(() => {
    setState({ phase: "idle" });
    clearPersistedSession();
  }, []);

  const derived = useMemo(() => {
    const gross = grossSessionMs(state, now);
    const brk = totalBreakMs(state, now);
    const net = netWorkMs(state, now);
    return { grossMs: gross, breakMs: brk, netMs: net, now };
  }, [state, now]);

  return {
    state,
    hydrated,
    derived,
    timeIn,
    startBreak,
    resumeBreak,
    timeOut,
    continueSession,
    discardFinished,
    resetToIdle,
  };
}

export type WorkSessionApi = ReturnType<typeof useWorkSessionState>;

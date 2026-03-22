export type BreakSegment = { startMs: number; endMs: number };

export type WorkSessionState =
  | { phase: "idle" }
  | {
      phase: "working";
      timeInMs: number;
      completedBreaks: BreakSegment[];
    }
  | {
      phase: "on_break";
      timeInMs: number;
      completedBreaks: BreakSegment[];
      breakStartMs: number;
    }
  | {
      phase: "finished";
      timeInMs: number;
      timeOutMs: number;
      completedBreaks: BreakSegment[];
    };

const STORAGE_KEY = "internlog-work-session-v1";

export type PersistedWorkSession = {
  v: 1;
  phase: "working" | "on_break" | "finished";
  timeInMs: number;
  completedBreaks: BreakSegment[];
  breakStartMs?: number;
  /** Present when phase is "finished" (session ended, not yet published/discarded). */
  timeOutMs?: number;
};

export function totalCompletedBreakMs(segments: BreakSegment[]): number {
  return segments.reduce((acc, s) => acc + Math.max(0, s.endMs - s.startMs), 0);
}

export function totalBreakMs(state: WorkSessionState, now: number): number {
  if (state.phase === "idle") return 0;
  const done = totalCompletedBreakMs(state.completedBreaks);
  if (state.phase === "on_break") {
    return done + Math.max(0, now - state.breakStartMs);
  }
  return done;
}

export function grossSessionMs(state: WorkSessionState, now: number): number {
  if (state.phase === "idle") return 0;
  const end = state.phase === "finished" ? state.timeOutMs : now;
  return Math.max(0, end - state.timeInMs);
}

export function netWorkMs(state: WorkSessionState, now: number): number {
  if (state.phase === "idle") return 0;
  return Math.max(0, grossSessionMs(state, now) - totalBreakMs(state, now));
}

export function loadPersistedSession(): WorkSessionState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as PersistedWorkSession;
    if (p?.v !== 1 || !p.timeInMs) return null;
    if (p.phase === "working") {
      return {
        phase: "working",
        timeInMs: p.timeInMs,
        completedBreaks: Array.isArray(p.completedBreaks) ? p.completedBreaks : [],
      };
    }
    if (p.phase === "on_break" && typeof p.breakStartMs === "number") {
      return {
        phase: "on_break",
        timeInMs: p.timeInMs,
        completedBreaks: Array.isArray(p.completedBreaks) ? p.completedBreaks : [],
        breakStartMs: p.breakStartMs,
      };
    }
    if (
      p.phase === "finished" &&
      typeof p.timeOutMs === "number" &&
      p.timeOutMs >= p.timeInMs
    ) {
      return {
        phase: "finished",
        timeInMs: p.timeInMs,
        timeOutMs: p.timeOutMs,
        completedBreaks: Array.isArray(p.completedBreaks) ? p.completedBreaks : [],
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function persistSession(state: WorkSessionState): void {
  if (typeof window === "undefined") return;
  if (state.phase === "working") {
    const p: PersistedWorkSession = {
      v: 1,
      phase: "working",
      timeInMs: state.timeInMs,
      completedBreaks: state.completedBreaks,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    return;
  }
  if (state.phase === "on_break") {
    const p: PersistedWorkSession = {
      v: 1,
      phase: "on_break",
      timeInMs: state.timeInMs,
      completedBreaks: state.completedBreaks,
      breakStartMs: state.breakStartMs,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    return;
  }
  if (state.phase === "finished") {
    const p: PersistedWorkSession = {
      v: 1,
      phase: "finished",
      timeInMs: state.timeInMs,
      timeOutMs: state.timeOutMs,
      completedBreaks: state.completedBreaks,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    return;
  }
  sessionStorage.removeItem(STORAGE_KEY);
}

export function clearPersistedSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

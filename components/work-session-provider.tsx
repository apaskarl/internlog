"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  useWorkSessionState,
  type WorkSessionApi,
} from "@/app/(dashboard)/timelog/use-work-session";

const WorkSessionContext = createContext<WorkSessionApi | null>(null);

export function WorkSessionProvider({ children }: { children: ReactNode }) {
  const session = useWorkSessionState();
  return (
    <WorkSessionContext.Provider value={session}>
      {children}
    </WorkSessionContext.Provider>
  );
}

export function useWorkSession(): WorkSessionApi {
  const ctx = useContext(WorkSessionContext);
  if (!ctx) {
    throw new Error("useWorkSession must be used within WorkSessionProvider");
  }
  return ctx;
}

export type { WorkSessionApi };

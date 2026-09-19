"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  ReactNode,
} from "react";
import { Role } from "./types";

const STORAGE_KEY = "hackhive:role";
const DEFAULT_ROLE: Role = "freshman";
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) listener();
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): string | null {
  return window.localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  // Same useSyncExternalStore pattern as before (not useEffect+setState —
  // this project's lint rule forbids that): React reconciles the real
  // stored value before the first paint.
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const role = (raw as Role | null) ?? DEFAULT_ROLE;

  function setRole(next: Role) {
    window.localStorage.setItem(STORAGE_KEY, next);
    emitChange();
  }

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRole must be used inside <RoleProvider>");
  }
  return ctx;
}

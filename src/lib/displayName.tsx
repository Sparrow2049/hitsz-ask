"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  ReactNode,
} from "react";

const STORAGE_KEY = "hackhive:displayName";
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

interface DisplayNameContextValue {
  // null means "no override set — fall back to the Google account name".
  displayName: string | null;
  setDisplayName: (name: string | null) => void;
}

const DisplayNameContext = createContext<DisplayNameContextValue | null>(null);

export function DisplayNameProvider({ children }: { children: ReactNode }) {
  // Same useSyncExternalStore pattern as RoleProvider (not useEffect +
  // useState — this project's lint rule forbids that): React reconciles
  // the real stored value before the first paint.
  const displayName = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  function setDisplayName(next: string | null) {
    const trimmed = next?.trim();
    if (!trimmed) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, trimmed);
    }
    emitChange();
  }

  return (
    <DisplayNameContext.Provider value={{ displayName, setDisplayName }}>
      {children}
    </DisplayNameContext.Provider>
  );
}

export function useDisplayName(): DisplayNameContextValue {
  const ctx = useContext(DisplayNameContext);
  if (!ctx) {
    throw new Error(
      "useDisplayName must be used inside <DisplayNameProvider>"
    );
  }
  return ctx;
}

"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  ReactNode,
} from "react";
import { Identity } from "./types";

const STORAGE_KEY = "hackhive:identity";
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

function parseIdentity(raw: string | null): Identity | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Identity;
  } catch {
    return null;
  }
}

interface IdentityContextValue {
  identity: Identity | null;
  setIdentity: (identity: Identity) => void;
  clearIdentity: () => void;
}

const IdentityContext = createContext<IdentityContextValue | null>(null);

export function IdentityProvider({ children }: { children: ReactNode }) {
  // Reading localStorage through useSyncExternalStore (rather than
  // useState + useEffect) means React reconciles the real stored value
  // before the first paint, instead of rendering "signed out" and then
  // flashing to the real state a tick later.
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const identity = parseIdentity(raw);

  function setIdentity(next: Identity) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    emitChange();
  }

  function clearIdentity() {
    window.localStorage.removeItem(STORAGE_KEY);
    emitChange();
  }

  return (
    <IdentityContext.Provider value={{ identity, setIdentity, clearIdentity }}>
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity(): IdentityContextValue {
  const ctx = useContext(IdentityContext);
  if (!ctx) {
    throw new Error("useIdentity must be used inside <IdentityProvider>");
  }
  return ctx;
}

"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

// The theme isn't known until the client mounts (the server can't know the
// visitor's saved preference or system setting), so this button renders
// nothing until then. useSyncExternalStore — rather than useEffect calling
// setState — means React resolves that before paint instead of rendering
// null and then flashing in the button a tick later. Same pattern used in
// lib/identity.tsx for the same underlying reason.
function subscribe() {
  return () => {};
}
function getSnapshot() {
  return true;
}
function getServerSnapshot() {
  return false;
}

export default function ThemeToggle() {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // theme can be "system" (the default) — resolvedTheme is what's actually
  // showing on screen right now, which is what the button's label and icon
  // need to reflect. Using theme here would show the wrong state for anyone
  // whose OS is set to dark mode until they click once.
  const { resolvedTheme, setTheme } = useTheme();

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-surface-raised text-text hover:bg-surface transition-colors font-medium text-sm shadow-sm"
    >
      {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
}

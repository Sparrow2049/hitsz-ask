import Link from "next/link";
import IdentityBadge from "./IdentityBadge";

export default function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-baseline gap-2 shrink-0">
          <span className="font-display text-xl text-text">Waypoint</span>
        </Link>

        <nav className="flex items-center gap-5 text-sm text-text-muted">
          <Link href="/ask" className="hover:text-text transition-colors">
            Ask a senior
          </Link>
          <Link
            href="/resources"
            className="hover:text-text transition-colors"
          >
            Resources
          </Link>
          <Link
            href="/study"
            className="hover:text-text transition-colors"
          >
            Study Buddy
          </Link>
          <Link
            href="/my-posts"
            className="hover:text-text transition-colors"
          >
            My posts
          </Link>
        </nav>

        <IdentityBadge />
      </div>
    </header>
  );
}

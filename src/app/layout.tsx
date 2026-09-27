import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { auth } from "@/lib/auth";
import { RoleProvider } from "@/lib/role";
import { DisplayNameProvider } from "@/lib/displayName";
import Header from "@/components/Header";
import ThemeToggle from "@/components/ThemeToggle";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const TITLE = "Waypoint — survive the semester";
const DESCRIPTION =
  "Ask a senior who's already taken the course. Find the notes and past papers that actually help.";

export const metadata: Metadata = {
  // Required so the auto-detected opengraph-image.tsx (and any other
  // relative URL in metadata) resolves to the real domain rather than
  // Next.js's http://localhost:3000 fallback — without this, the OG
  // image would be silently broken once deployed, pointing at localhost.
  metadataBase: new URL("https://hitszask.site"),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    siteName: "Waypoint",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Fetched here (server-side) and passed into SessionProvider so the
  // client tree has the real session on first paint instead of a
  // sign-out flash while it fetches /api/auth/session itself.
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <RoleProvider>
              <DisplayNameProvider>
                <Header />
                <main className="flex-1">{children}</main>
                <footer className="border-t border-border py-6 text-center text-xs text-text-muted">
                  <p>© {new Date().getFullYear()} Arthur. All rights reserved.</p>
                  <p className="mt-1">
                    Built with Jesselyn — thanks for the collaboration.
                  </p>
                </footer>
                <ThemeToggle />
              </DisplayNameProvider>
            </RoleProvider>
          </ThemeProvider>
        </SessionProvider>
        {/* Zero-config: only actually collects anything once deployed on
            Vercel with Analytics turned on for the project (a toggle in
            the Vercel dashboard, not something set here). No cookies, no
            PII — just page views and referrers. */}
        <Analytics />
      </body>
    </html>
  );
}

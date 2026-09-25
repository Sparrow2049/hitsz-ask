import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
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

export const metadata: Metadata = {
  title: "Waypoint — survive the semester",
  description:
    "Ask a senior who's already taken the course. Find the notes and past papers that actually help.",
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
      </body>
    </html>
  );
}

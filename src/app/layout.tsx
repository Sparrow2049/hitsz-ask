import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { IdentityProvider } from "@/lib/identity";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <IdentityProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-border py-6 text-center text-xs text-text-muted">
            <p>© {new Date().getFullYear()} Arthur. All rights reserved.</p>
            <p className="mt-1">Small thanks to Jesselyn for the collaboration.</p>
            </footer>
            <ThemeToggle />
          </IdentityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

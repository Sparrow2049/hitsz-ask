import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { IdentityProvider } from "@/lib/identity";
import Header from "@/components/Header";

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
    >
      <body className="min-h-full flex flex-col">
        <IdentityProvider>
          <Header />
          <main className="flex-1">{children}</main>
        </IdentityProvider>
      </body>
    </html>
  );
}

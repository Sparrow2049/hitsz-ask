import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Admin allowlist, configured via env var (comma-separated Google account
// emails) rather than hardcoded, so it can change without a code edit —
// same pattern as the Turso credentials. Set ADMIN_EMAILS in Vercel's
// Environment Variables.
function checkIsAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(email.toLowerCase());
}

// Stateless JWT sessions — no database adapter. We don't need Auth.js to
// own persistent user records; we only need a verified name/email on the
// session, which the API routes use to stamp who really submitted
// something (see src/app/api/resources/route.ts and friends). Role
// (freshman/sophomore/junior/senior) stays separate and self-declared —
// see src/lib/role.tsx — since Google has no way to verify that anyway.
//
// isAdmin is computed once here, server-side, against ADMIN_EMAILS (never
// exposed to the client bundle), and carried on the token/session from
// then on — both server code (auth()) and client code (useSession())
// read the same session.user.isAdmin instead of each re-deriving it.
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async jwt({ token }) {
      token.isAdmin = checkIsAdmin(token.email);
      return token;
    },
    async session({ session, token }) {
      (session.user as { isAdmin?: boolean }).isAdmin = Boolean(token.isAdmin);
      return session;
    },
  },
});

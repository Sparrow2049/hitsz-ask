import { DefaultSession } from "next-auth";

// Auth.js v5 quirk: next-auth/react's useSession() imports Session
// directly from @auth/core/types, not from the "next-auth" module
// specifier — so augmenting only "next-auth" merges for server-side
// auth() but not client-side useSession(). Both are augmented here.
declare module "next-auth" {
  interface Session {
    user: {
      isAdmin: boolean;
    } & DefaultSession["user"];
  }
  interface User {
    isAdmin?: boolean;
  }
}

declare module "@auth/core/types" {
  interface Session {
    user: {
      isAdmin: boolean;
    } & DefaultSession["user"];
  }
  interface User {
    isAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isAdmin?: boolean;
  }
}

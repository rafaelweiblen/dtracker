import NextAuth from "next-auth";
import type { Session } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { accounts, users } from "@/db/schema";
import { authConfig } from "./auth.config";
import { getBypassUserId, isAuthBypass } from "@/lib/auth-bypass";

const nextAuth = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET?.trim(),
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
  }),
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});

export const { handlers, signIn, signOut } = nextAuth;

/** Só o overload sem argumentos é usado neste projeto (RSC + route handlers). */
export async function auth(): Promise<Session | null> {
  if (isAuthBypass()) {
    const id = getBypassUserId();
    return {
      user: {
        id,
        name: "Dev (auth bypass)",
        email: "dev-bypass@local",
        image: null,
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }
  return nextAuth.auth();
}

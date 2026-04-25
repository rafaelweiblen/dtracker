import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

function envFirstTrimmed(
  ...keys: (string | undefined)[]
): string | undefined {
  for (const v of keys) {
    const t = v?.trim();
    if (t) return t;
  }
  return undefined;
}

const googleClientId = envFirstTrimmed(
  process.env.AUTH_GOOGLE_ID,
  process.env.GOOGLE_CLIENT_ID,
);
const googleClientSecret = envFirstTrimmed(
  process.env.AUTH_GOOGLE_SECRET,
  process.env.GOOGLE_CLIENT_SECRET,
);

/** Só passa credenciais definidas; `clientId: undefined` explícito quebra a inferência do Auth.js. */
const googleProviderOpts =
  googleClientId || googleClientSecret
    ? {
        ...(googleClientId ? { clientId: googleClientId } : {}),
        ...(googleClientSecret ? { clientSecret: googleClientSecret } : {}),
      }
    : {};

export const authConfig = {
  providers: [Google(googleProviderOpts)],
  session: { strategy: "jwt" },
  pages: {},
} satisfies NextAuthConfig;

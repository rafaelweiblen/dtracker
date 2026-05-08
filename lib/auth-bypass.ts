/**
 * Bypass opcional de login em desenvolvimento local.
 * Nunca ativo em produção (exige NODE_ENV === "development" e AUTH_BYPASS=true).
 */
export const DEFAULT_DEV_BYPASS_USER_ID =
  "00000000-0000-0000-0000-000000000001";

export function isAuthBypass(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.AUTH_BYPASS?.trim() === "true"
  );
}

export function getBypassUserId(): string {
  return (
    process.env.AUTH_BYPASS_USER_ID?.trim() || DEFAULT_DEV_BYPASS_USER_ID
  );
}

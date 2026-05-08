/** URL canónica do site (OG, sitemap, robots). Preferir NEXT_PUBLIC_SITE_URL em produção. */
export function getSiteBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3750";
}

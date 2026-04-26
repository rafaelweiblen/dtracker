# External Integrations

## Authentication

**Service:** Google OAuth  
**Purpose:** Sign-in with Google account — only auth provider  
**Implementation:** `auth.config.ts` → `Google(googleProviderOpts)`, `auth.ts` → `NextAuth` with `DrizzleAdapter`  
**Configuration:**
- `AUTH_GOOGLE_ID` / `GOOGLE_CLIENT_ID` (either key accepted)
- `AUTH_GOOGLE_SECRET` / `GOOGLE_CLIENT_SECRET` (either key accepted)
- `AUTH_SECRET` — JWT signing secret
- Strategy: `jwt` sessions (no DB sessions table)
**Auth adapter:** `@auth/drizzle-adapter` — persists users and accounts to Turso  
**Session:** `token.sub` mapped to `session.user.id` in `callbacks.session`  
**Route handler:** `app/api/auth/[...nextauth]/`

## Database

**Service:** Turso (managed libSQL/SQLite)  
**Purpose:** Primary data store — users, accounts, entries  
**Implementation:** `db/index.ts` → `createClient({ url, authToken })` → `drizzle(client, { schema })`  
**Configuration:**
- `TURSO_DATABASE_URL` — remote database URL (`libsql://...`)
- `TURSO_AUTH_TOKEN` — database auth token
- Falls back to `file:./local.db` (SQLite file) when env vars not set — used in local dev
**Validation:** Production (VERCEL=1) throws if env vars missing  
**Migrations:** `drizzle-kit` — `pnpm db:generate` + `pnpm db:migrate`

## Deployment

**Service:** Vercel  
**Purpose:** Hosting, serverless functions, CDN  
**Configuration:** `.vercel/project.json` — project ID `prj_KiOWh4ikTtB0Mi7gMZY5CZMrEndf`  
**Build command:** `next build --webpack` (webpack bundler, not Turbopack)  
**Deploy command:** `vercel --prod` from `app/` directory  
**Production URL:** `dtracker-six.vercel.app`

## PWA / Service Worker

**Service:** Serwist (Workbox-based)  
**Purpose:** PWA capabilities — offline support, installable  
**Implementation:** `next.config.ts` → `withSerwistInit({ swSrc: "app/sw.ts", swDest: "public/sw.js" })`  
**Disabled in development:** `disable: process.env.NODE_ENV === "development"`  
**Manifest:** `public/manifest.webmanifest`  
**Icons:** `public/icons/icon-192.png`, `public/icons/icon-512.png`

## Offline Queue

**Service:** IndexedDB (browser built-in, via `idb` library)  
**Purpose:** Store pending entries when offline; sync when reconnected  
**Implementation:** `hooks/use-sync-queue.ts`  
**DB name:** `diet-tracker`  
**Object store:** `sync-queue`  
**Schema version:** 1  
**Sync trigger:** `window "online"` event + component mount

## Background Jobs

None. No background job queue, cron jobs, or message brokers.

## Webhooks

None.

## Environment Variables Summary

| Variable | Required in prod | Purpose |
|---|---|---|
| `AUTH_SECRET` | Yes | NextAuth JWT signing |
| `AUTH_GOOGLE_ID` | Yes | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Yes | Google OAuth client secret |
| `TURSO_DATABASE_URL` | Yes | Turso DB connection URL |
| `TURSO_AUTH_TOKEN` | Yes | Turso DB auth token |

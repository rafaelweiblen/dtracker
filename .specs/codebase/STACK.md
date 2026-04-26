# Tech Stack

**Analyzed:** 2026-04-25

## Core

- Framework: Next.js 16.2.4
- Language: TypeScript 5.x
- Runtime: Node.js (Vercel serverless)
- Package manager: pnpm

## Frontend

- UI Framework: React 19.2.4
- Styling: Tailwind CSS v4 + tw-animate-css
- Component Primitives: @base-ui/react 1.4.0, shadcn 4.3.0
- Icons: lucide-react 1.8.0
- Utility: clsx 2.1.1, tailwind-merge 3.5.0, class-variance-authority 0.7.1
- State Management: React built-ins (useState, useOptimistic, useTransition)
- Form Handling: native HTML forms + React state

## Backend

- API Style: Next.js Server Actions + minimal API routes
- Database ORM: Drizzle ORM 0.45.2
- Database system: Turso (libSQL/SQLite) via @libsql/client 0.17.2
- Authentication: NextAuth 5.0.0-beta.31 + @auth/drizzle-adapter 1.11.2

## Offline / PWA

- Service Worker: Serwist 9.5.7 (@serwist/next)
- Offline Queue: idb 8.0.3 (IndexedDB wrapper)

## Testing

- Unit: Vitest 4.1.4 (node environment)
- Integration: none
- E2E: none

## External Services

- Authentication: Google OAuth (via NextAuth Google provider)
- Database hosting: Turso (managed libSQL)
- Deployment: Vercel

## Development Tools

- Build: webpack (Next.js --webpack flag)
- DB migrations: drizzle-kit 0.31.10
- Test UI: @vitest/ui 4.1.4

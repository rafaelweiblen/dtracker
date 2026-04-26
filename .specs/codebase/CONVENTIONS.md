# Code Conventions

## Naming Conventions

**Files:**  
- kebab-case for all files: `entry-form.tsx`, `use-sync-queue.ts`, `daily-log.tsx`  
- Test files co-located with source, suffixed `.test.ts`: `entries.test.ts`, `day-cell.test.ts`  
- Exception: `BottomNav.tsx` — PascalCase (one-off, inside `_components/`)

**React Components:**  
- PascalCase named exports: `EntryForm`, `DailyLog`, `StreakBar`  
- No default exports for components (except Next.js page/layout — required by framework)

**Functions/Hooks:**  
- camelCase: `getEntriesForDate`, `computeStreaks`, `useSyncQueue`, `localDateISO`  
- Hooks prefixed `use`: `useSyncQueue`  
- Server action files and functions: camelCase, verb-first: `createEntry`, `updateEntry`, `deleteEntry`, `fixEntryDates`

**Variables/Constants:**  
- camelCase: `selectedDate`, `isPending`, `isOnline`  
- ALL_CAPS for module-level constants: `MAX_RETRIES`, `MAX_DESCRIPTION`, `DB_NAME`, `STORE`  
- Type-keyed records use `Record<EntryType, ...>` with ALL_CAPS name: `PLACEHOLDER`

**Types/Interfaces:**  
- PascalCase: `Entry`, `PendingEntry`, `Streaks`, `DaySummary`, `SyncStatus`  
- Interface prefix `I` is NOT used  
- `type` preferred over `interface` for union types; `interface` used for object shapes with props (`EntryFormProps`)

## Code Organization

**Import ordering (observed):**  
1. React/Next.js built-ins  
2. Third-party packages  
3. Internal aliases (`@/...`)  
4. Relative imports (rare)  

Example from `entry-form.tsx`:
```ts
import { useState, useTransition } from "react";
import { ChevronDown, ChevronLeft, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createEntry } from "@/app/actions/entries";
import type { Entry, EntryType } from "@/db/schema";
```

**File structure within components:**  
1. `"use client"` directive (if client component)  
2. Imports  
3. Constants (MAX, PLACEHOLDER, etc.)  
4. Helper functions (pure, module-scoped)  
5. TypeScript interface for props  
6. Component function  
7. Sub-components (if any)

**Path aliases:**  
- `@/` maps to project root — used consistently everywhere

## Type Safety

**Approach:** Strict TypeScript — all functions typed, no `any`  
**DB types inferred from schema:** `typeof entries.$inferSelect` → `Entry`  
**Server Action inputs:** typed inline `{ type: EntryType; description: string; date?: string }`  
**Props interfaces:** always defined with explicit `interface XxxProps`  

**Type-only imports:**
```ts
import type { Entry, EntryType } from "@/db/schema";
import type { PendingEntry } from "@/types/offline";
```

## Error Handling

**Server Actions:** throw `Error` with Portuguese user-facing messages — callers catch in `try/catch`  
**Client error state:** `useState("")` for error string, displayed inline below form field  
**Auth guard:** `requireUserId()` pattern in every server action — throws `"Não autenticado"` if no session  
**Not-found on update/delete:** check `.returning()` length, throw `"Registro não encontrado"`

Example:
```ts
async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");
  return session.user.id;
}
```

## Comments/Documentation

**Style:** Minimal — only for non-obvious constraints or workarounds  
**Language:** Portuguese for user-facing strings; English for code comments  

Examples of actual comments:
```ts
// Auth.js requires: id, name, email, emailVerified, image
// Auth.js + @auth/drizzle-adapter: PK composta (provider, provider_account_id) — obrigatória para o adapter SQLite.
// eslint-disable-next-line camelcase  (for Auth.js required snake_case fields)
// Pure logic extracted from DayCell for testing
```

## UI / Styling Conventions

**Styling:** Tailwind CSS utility classes directly in JSX — no CSS modules  
**cn() helper:** always used when classes are conditional: `cn("base", condition && "variant")`  
**Color tokens:** semantic Tailwind tokens (`text-muted-foreground`, `bg-destructive/15`) + direct colors for branding (`text-green-600`, `text-red-500`)  
**Rounded corners:** `rounded-xl` for cards/containers, `rounded-full` for badges/pills  
**Border:** `border` (default Tailwind token) for cards  
**Spacing:** `p-4` for page padding, `gap-4`/`gap-6` for layout gaps  
**Reference:** `.specs/design/UI.md` — always consult before implementing new UI

# Project Structure

**Root:** `/Users/rafaelweiblendossantos/Dieta/app`

## Directory Tree

```
app/
├── app/                        # Next.js App Router
│   ├── (app)/                  # Authenticated layout group
│   │   ├── _components/        # Layout-scoped components
│   │   │   └── BottomNav.tsx
│   │   ├── home/page.tsx       # Daily log view
│   │   ├── calendar/page.tsx   # Monthly calendar view
│   │   ├── day/[date]/page.tsx # Past day detail view
│   │   ├── settings/page.tsx   # Profile + settings
│   │   └── layout.tsx          # App shell with BottomNav
│   ├── (public)/               # Unauthenticated layout group
│   │   └── page.tsx            # Landing / sign-in page
│   ├── actions/
│   │   └── entries.ts          # Server Actions: create/update/delete/fixDates
│   ├── api/
│   │   ├── auth/               # NextAuth route handler
│   │   └── calendar/           # Calendar API route
│   ├── globals.css
│   ├── layout.tsx              # Root layout
│   └── sw.ts                   # Service worker source
├── components/                 # Shared UI components
│   ├── ui/button.tsx           # shadcn button primitive
│   ├── bottom-sheet.tsx
│   ├── calendar-view.tsx
│   ├── daily-log.tsx           # Orchestrates entries list + FAB
│   ├── date-picker-sheet.tsx   # Calendar picker bottom sheet
│   ├── date-sync.tsx           # Client timezone correction
│   ├── day-cell.tsx            # Calendar grid cell
│   ├── edit-bottom-sheet.tsx
│   ├── entry-card.tsx          # Swipeable entry card
│   ├── entry-form.tsx          # Create entry form with date picker
│   ├── entry-section.tsx       # Grouped list by type
│   ├── fix-dates-button.tsx    # Timezone fix trigger
│   ├── log-bottom-sheet.tsx    # Type selector → entry form
│   ├── log-fab.tsx             # Floating action button
│   ├── month-grid.tsx          # Calendar month grid
│   ├── sign-out-button.tsx
│   └── streak-bar.tsx          # Exercise streak + days since escape
├── db/
│   ├── index.ts                # Drizzle client (Turso/local)
│   ├── schema.ts               # users, accounts, entries tables
│   ├── migrations/             # SQL migration files
│   └── queries/
│       └── entries.ts          # DB queries + pure compute functions
├── hooks/
│   └── use-sync-queue.ts       # IndexedDB offline queue hook
├── lib/
│   └── utils.ts                # cn() utility
├── types/
│   └── offline.ts              # PendingEntry, SyncStatus types
├── .specs/
│   ├── codebase/               # Brownfield docs (this directory)
│   └── design/
│       └── UI.md               # Visual design guidelines
└── public/
    ├── manifest.webmanifest    # PWA manifest
    ├── sw.js                   # Compiled service worker
    └── icons/                  # PWA icons
```

## Module Organization

### App Shell
**Purpose:** Global layout, auth, bottom navigation  
**Location:** `app/layout.tsx`, `app/(app)/layout.tsx`, `app/(app)/_components/`  
**Key files:** `BottomNav.tsx`, root `layout.tsx`

### Pages
**Purpose:** Server components that fetch data and compose UI  
**Location:** `app/(app)/*/page.tsx`  
**Key files:** `home/page.tsx`, `calendar/page.tsx`, `day/[date]/page.tsx`, `settings/page.tsx`

### Server Actions
**Purpose:** Mutations (create/update/delete entry, fix dates)  
**Location:** `app/actions/entries.ts`  
**Pattern:** All actions call `requireUserId()` for auth, then validate input, then mutate DB, then `revalidatePath()`

### Database Layer
**Purpose:** Schema definition, migrations, query functions  
**Location:** `db/`  
**Key files:** `schema.ts` (source of truth), `queries/entries.ts` (queries + pure helpers)

### Offline Queue
**Purpose:** Store failed/pending entries in IndexedDB, sync on reconnect  
**Location:** `hooks/use-sync-queue.ts`, `types/offline.ts`

### Components
**Purpose:** All reusable UI — both server-renderable and client-only  
**Location:** `components/`  
**Pattern:** Client components are marked `"use client"`, server components have no directive

## Where Things Live

**Entry CRUD:**
- UI: `components/entry-form.tsx`, `components/entry-card.tsx`
- Server: `app/actions/entries.ts`
- DB: `db/queries/entries.ts`

**Calendar:**
- UI: `components/calendar-view.tsx`, `components/month-grid.tsx`, `components/day-cell.tsx`
- Server: `app/(app)/calendar/page.tsx`, `app/api/calendar/`
- DB: `db/queries/entries.ts` → `getMonthSummary()`

**Streaks:**
- UI: `components/streak-bar.tsx`
- Logic: `db/queries/entries.ts` → `computeStreaks()` (pure), `getStreaks()`

**Timezone correction:**
- Client: `components/date-sync.tsx` (sets `?date=` URL param)
- Server: pages read `?date` searchParam
- Action: `app/actions/entries.ts` → `fixEntryDates()`

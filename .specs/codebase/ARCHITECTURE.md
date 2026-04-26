# Architecture

**Pattern:** Modular monolith — Next.js App Router with Server Components, Server Actions, and a client-side offline layer

## High-Level Structure

```
Browser
  ├── React Server Components (SSR data fetching)
  ├── React Client Components (interactivity, optimistic UI)
  └── Service Worker (PWA, offline)
        └── IndexedDB (offline queue)

Server (Vercel Serverless)
  ├── Next.js App Router
  │   ├── Server Actions (mutations)
  │   └── API Routes (NextAuth, calendar)
  └── Turso (libSQL/SQLite, managed cloud DB)
```

## Identified Patterns

### Server Components for Data Fetching
**Location:** `app/(app)/*/page.tsx`  
**Purpose:** Fetch data server-side, pass as props to client components  
**Implementation:** Async page components call DB queries directly (no REST API layer)  
**Example:** `app/(app)/home/page.tsx` — calls `getEntriesForDate()` and `getStreaks()` then renders `<DailyLog initialEntries={...} />`

### Server Actions for Mutations
**Location:** `app/actions/entries.ts`  
**Purpose:** All writes go through `"use server"` functions — no separate API for CRUD  
**Implementation:** Each action: (1) `requireUserId()`, (2) validate input, (3) DB mutation, (4) `revalidatePath()`  
**Example:** `createEntry({ type, description, date })` — validates, inserts, revalidates `/home` and `/calendar`

### Optimistic UI
**Location:** `components/daily-log.tsx`  
**Purpose:** Immediately show new entry while server action is in flight  
**Implementation:** `useOptimistic()` — state initialized from server props, optimistically prepends new entry  
**Example:** `addOptimistic(fakeEntry)` called synchronously before `createEntry()` resolves

### Offline Queue (IndexedDB)
**Location:** `hooks/use-sync-queue.ts`, `types/offline.ts`  
**Purpose:** Store entries when offline, sync when connection restored  
**Implementation:**  
- `enqueue()` — writes `PendingEntry` to IndexedDB with `status: "pending"`, `retries: 0`  
- `flush()` — iterates queue, calls `createEntry()`, deletes on success, increments retries on failure  
- After 3 retries → `status: "failed"` (permanent, no further attempts)  
- `window.addEventListener("online", flush)` — auto-sync on reconnect

### Timezone Correction
**Location:** `components/date-sync.tsx` → pages via `?date=` searchParam  
**Purpose:** Server runs UTC; Brazil (UTC-3) means after 21:00 local time the server date is next day  
**Implementation:**  
- `DateSync` (client component) computes local date with `localDateISO()`, compares to server date  
- If mismatch → `router.replace(?date=YYYY-MM-DD)` triggers server re-render with correct date  
- All pages read `?date` searchParam and pass it to DB queries instead of `new Date()`

### Route Groups for Layout
**Location:** `app/(app)/`, `app/(public)/`  
**Purpose:** Separate layouts for authenticated vs. public pages  
**Implementation:** `(app)/layout.tsx` includes `<BottomNav>`; `(public)/layout.tsx` is minimal

### Pure Functions for Business Logic
**Location:** `db/queries/entries.ts` — `computeStreaks()`, `computeMonthSummary()`  
**Purpose:** Testable logic decoupled from DB  
**Implementation:** Pure functions exported separately from DB queries; unit tested in `entries.test.ts`

## Data Flow

### Create Entry (online)
```
User submits form
  → EntryForm.handleSubmit()
  → createEntry({ type, description, date }) [Server Action]
  → validateDescription() + auth check
  → db.insert(entries)
  → revalidatePath("/home") + revalidatePath("/calendar")
  → onSuccess(entry) → addOptimistic(entry)
```

### Create Entry (offline)
```
User submits form (navigator.onLine === false)
  → EntryForm.handleSubmit()
  → enqueue({ id, type, description, date, createdAt }) [IndexedDB]
  → onSuccess(fakeEntry) with pendingSync: true
  → [later] window "online" event → flush() → createEntry()
```

### Home Page Load
```
Request /home?date=YYYY-MM-DD
  → auth() → redirect if unauthenticated
  → getEntriesForDate(userId, date)
  → getStreaks(userId, date)
  → SSR → HTML to browser
  → DateSync mounts → compares server date to local date
  → if mismatch: router.replace(?date=localDate) → re-render
```

### Streak Calculation
```
getStreaks(userId, today)
  → fetch all entries for user (ordered by date desc)
  → computeStreaks(rows, today)
    → exerciseStreak: count consecutive days ending today or yesterday
    → daysSinceEscape: days between last escape date and today
```

## Code Organization

**Approach:** Feature-aware layer-based — layers are `app/` (routes/actions), `components/` (UI), `db/` (data), `hooks/` (client logic), `types/` (shared types)

**Module boundaries:**
- DB queries never import from components or hooks
- Server Actions never import from client hooks
- Client components import server actions directly (Next.js handles the boundary)
- Pure business logic functions (`computeStreaks`, `computeMonthSummary`) live in `db/queries/` but have no DB dependency — exported for unit testing

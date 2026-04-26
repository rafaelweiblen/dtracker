# Codebase Concerns

**Analysis Date:** 2026-04-25

## Tech Debt

**Offline queue logic duplicated in test file:**
- Issue: `use-sync-queue.test.ts` duplicates the queue logic as standalone functions instead of testing the hook directly. If the hook changes, tests won't catch it.
- Files: `hooks/use-sync-queue.test.ts`, `hooks/use-sync-queue.ts`
- Why: `useSyncQueue` uses IndexedDB and browser APIs — hard to test without jsdom/browser env; pure function extraction was a pragmatic workaround
- Impact: Tests validate an old copy of the logic, not the hook itself. A bug in `flush()` could go undetected.
- Fix approach: Switch Vitest to `jsdom` environment and mock `idb`; or extract flush/enqueue logic to pure functions in a separate file and test those

**`createEntry` date fallback uses server UTC time:**
- Issue: `app/actions/entries.ts` line 38 — when `input.date` is absent/invalid, falls back to `now.toISOString().slice(0, 10)` (UTC). Callers now always pass `date`, but the fallback remains unsafe for users after 21:00 Brazil time.
- Files: `app/actions/entries.ts:38`
- Why: Legacy behavior before the `DateSync` timezone fix was added
- Impact: Low now (all callers pass `date`), but a future caller that omits `date` would silently save with the wrong date
- Fix approach: Remove the fallback and require `date` as a non-optional field, or document the constraint explicitly

**`DailyLog` still has `readOnly` prop wired:**
- Issue: `components/daily-log.tsx` accepts `readOnly?: boolean` and conditionally renders the FAB. This was needed for `/day/[date]` pages, but the plan was to remove it once past-date entry is supported.
- Files: `components/daily-log.tsx:17`, `app/(app)/day/[date]/page.tsx`
- Why: Feature was in progress when this was written
- Impact: The FAB is still hidden on past-day pages if `readOnly` is passed; if no one passes it, no harm done
- Fix approach: Remove the prop once past-date entry via FAB is confirmed working on `/day/[date]`

## Security Considerations

**`fixEntryDates` accepts client-supplied timezone offset without bounds:**
- Risk: `fixEntryDates(offsetMinutes)` takes an integer from the client (`new Date().getTimezoneOffset()`). A malicious user could pass extreme offsets (e.g., ±10000) to shift all their entry dates arbitrarily.
- Files: `app/actions/entries.ts:84`, `components/fix-dates-button.tsx`
- Current mitigation: Action is authenticated (`requireUserId()`); offset only affects the calling user's own data; standard timezone offsets are ±840 minutes
- Recommendations: Clamp `offsetMinutes` to `[-840, 840]` in the server action before applying

**NextAuth beta dependency:**
- Risk: `next-auth@5.0.0-beta.31` is a pre-release. Breaking changes or security patches are released without semver guarantees.
- Files: `package.json`
- Current mitigation: Version is pinned exactly (`5.0.0-beta.31`)
- Recommendations: Monitor NextAuth v5 release channel; upgrade to stable when available

## Fragile Areas

**Streak calculation depends on correct `today` being passed:**
- Files: `db/queries/entries.ts:43-79`, `app/(app)/home/page.tsx:31`
- Why fragile: `computeStreaks(rows, today)` uses string comparison (`date > today`). If `today` is not the client's local date (e.g., UTC after 21:00 Brazil), streak counts are wrong. The `DateSync` + `?date=` mechanism is the sole correction path.
- Common failures: After 21:00 Brazil time without `DateSync` firing, streak shows stale UTC-based value
- Safe modification: Always pass `today` from the page's `searchParams.date`; never call `getStreaks(userId)` without a `today` argument
- Test coverage: Pure function `computeStreaks` is unit tested; the UTC timezone failure scenario is not tested

**IndexedDB sync queue has no deduplication:**
- Files: `hooks/use-sync-queue.ts`
- Why fragile: If `enqueue()` is called twice for the same logical entry (e.g., double-tap before optimistic UI blocks the button), two entries are stored with different UUIDs. Both will sync successfully, creating duplicates in the DB.
- Common failures: Rapid form submission before `isPending` state propagates
- Safe modification: The `EntryForm` disables the submit button while `isPending`, which mitigates this in practice
- Test coverage: Not tested

## Test Coverage Gaps

**Server Actions not tested:**
- What's not tested: `createEntry`, `updateEntry`, `deleteEntry`, `fixEntryDates` in `app/actions/entries.ts`
- Risk: Validation logic (`validateDescription`), auth guard (`requireUserId`), and DB mutations untested
- Priority: High — these are the core write paths
- Difficulty: Requires mocking `auth()` (NextAuth) and Drizzle DB client, or a real test DB

**DB query functions not tested:**
- What's not tested: `getEntriesForDate`, `getMonthSummary`, `getStreaks` (the DB-calling wrappers)
- Risk: Index usage, date filtering (`like(entries.date, \`${month}%\`)`) could silently break
- Priority: Medium
- Difficulty: Requires a real or in-memory SQLite DB; no test DB setup currently exists

**React components not tested:**
- What's not tested: All UI components — rendering, swipe gesture, optimistic UI flow, offline banner
- Risk: UI regressions go undetected
- Priority: Low (acceptable for a solo/small-team project)
- Difficulty: Requires jsdom + React Testing Library or Playwright

---

_Concerns audit: 2026-04-25_  
_Update as issues are fixed or new ones discovered_

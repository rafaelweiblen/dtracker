# Testing Infrastructure

## Test Frameworks

**Unit:** Vitest 4.1.4 (node environment)  
**Integration:** none  
**E2E:** none  
**Coverage:** not configured

## Test Organization

**Location:** co-located with source files  
**Naming:** `[source-file].test.ts` — same directory as the file under test  
**Structure:** `describe` + `it` blocks, no shared test helpers

Existing test files:
- `db/queries/entries.test.ts` — pure functions: `computeMonthSummary`, `computeStreaks`
- `hooks/use-sync-queue.test.ts` — pure logic extracted from the hook
- `components/day-cell.test.ts` — pure state logic extracted from component

## Testing Patterns

### Unit Tests

**Approach:** Pure function extraction — side-effectful code (DB, IndexedDB, React) is NOT tested via mocks. Instead, the pure logic is extracted into standalone functions and tested directly.  
**Location:** co-located `.test.ts` files  

Pattern:
```ts
// entries.test.ts
import { computeStreaks } from "./entries"; // exported pure function
describe("computeStreaks", () => {
  it("counts consecutive exercise days", () => {
    const rows = [row("2025-04-20", "exercise"), row("2025-04-19", "exercise")];
    expect(computeStreaks(rows, "2025-04-20").exerciseStreak).toBe(2);
  });
});
```

```ts
// use-sync-queue.test.ts
// Pure logic duplicated in test file — the hook itself is not tested
function applyFlushSuccess(queue, id) { ... }
function applyFlushFailure(queue, id, maxRetries = 3) { ... }
```

### Integration Tests
Not present. DB operations (`getEntriesForDate`, `getStreaks`) are not tested.

### E2E Tests
Not present.

## Test Execution

**Command:** `pnpm test` → `vitest run`  
**Watch mode:** `vitest` (no `run` flag)  
**UI:** `vitest --ui` (via @vitest/ui)  
**Configuration:** `vitest.config.ts` — node environment, `@` alias mapped to project root

## Coverage Targets

**Current:** not measured  
**Goals:** not documented  
**Enforcement:** none

## Test Coverage Matrix

| Code Layer | Required Test Type | Location Pattern | Run Command |
|---|---|---|---|
| Pure query helpers (`computeStreaks`, `computeMonthSummary`) | unit | `db/queries/*.test.ts` | `pnpm test` |
| Pure component logic (`DayCell` state) | unit | `components/*.test.ts` | `pnpm test` |
| Offline queue logic | unit | `hooks/*.test.ts` | `pnpm test` |
| Server Actions (`createEntry`, etc.) | none | — | — |
| DB queries (`getEntriesForDate`, `getStreaks`) | none | — | — |
| React components (rendering, interactions) | none | — | — |
| API routes | none | — | — |
| Auth flow | none | — | — |

## Parallelism Assessment

| Test Type | Parallel-Safe? | Isolation Model | Evidence |
|---|---|---|---|
| Unit | Yes | No shared state — all pure functions, no DB | All tests operate on in-memory arrays passed as arguments |

## Gate Check Commands

| Gate Level | When to Use | Command |
|---|---|---|
| Quick | After changes to pure logic functions | `pnpm test` |
| Full | No integration/E2E available | `pnpm test` |
| Build | After phase completion | `pnpm build` |

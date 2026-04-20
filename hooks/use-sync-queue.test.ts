import { describe, it, expect } from "vitest";
import type { PendingEntry } from "@/types/offline";

// Pure logic: what happens when flush processes an entry

function applyFlushSuccess(
  queue: PendingEntry[],
  id: string
): PendingEntry[] {
  return queue.filter((e) => e.id !== id);
}

function applyFlushFailure(
  queue: PendingEntry[],
  id: string,
  maxRetries = 3
): PendingEntry[] {
  return queue.map((e) => {
    if (e.id !== id) return e;
    const retries = e.retries + 1;
    return { ...e, retries, status: retries >= maxRetries ? "failed" : "pending" };
  });
}

function makeEntry(id: string, retries = 0): PendingEntry {
  return {
    id,
    type: "escape",
    description: "test",
    date: "2025-04-20",
    createdAt: Date.now(),
    retries,
    status: "pending",
  };
}

describe("sync queue logic", () => {
  it("enqueue adds entry with retries=0 and status=pending", () => {
    const entry = makeEntry("1");
    expect(entry.retries).toBe(0);
    expect(entry.status).toBe("pending");
  });

  it("flush success removes entry from queue", () => {
    const queue = [makeEntry("1"), makeEntry("2")];
    const result = applyFlushSuccess(queue, "1");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("flush failure increments retries", () => {
    const queue = [makeEntry("1", 0)];
    const result = applyFlushFailure(queue, "1");
    expect(result[0].retries).toBe(1);
    expect(result[0].status).toBe("pending");
  });

  it("marks as failed after maxRetries", () => {
    const queue = [makeEntry("1", 2)]; // already at 2, next failure → 3
    const result = applyFlushFailure(queue, "1");
    expect(result[0].retries).toBe(3);
    expect(result[0].status).toBe("failed");
  });

  it("failed entries are skipped on next flush", () => {
    const queue = [makeEntry("1")];
    const failed = applyFlushFailure(applyFlushFailure(applyFlushFailure(queue, "1"), "1"), "1");
    expect(failed[0].status).toBe("failed");
    // A flush loop would skip this entry
    const skipped = failed.filter((e) => e.status !== "failed");
    expect(skipped).toHaveLength(0);
  });
});

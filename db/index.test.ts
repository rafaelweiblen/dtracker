import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@libsql/client", () => ({
  createClient: vi.fn(() => ({})),
}));

vi.mock("drizzle-orm/libsql", () => ({
  drizzle: vi.fn(() => ({})),
}));

describe("db/index — validação de variáveis de ambiente", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("lança erro se VERCEL=1 e TURSO_DATABASE_URL está vazio", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("TURSO_DATABASE_URL", "");
    vi.stubEnv("TURSO_AUTH_TOKEN", "some-token");

    await expect(import("@/db")).rejects.toThrow("TURSO_DATABASE_URL está vazio");
  });

  it("lança erro se VERCEL=1 e TURSO_AUTH_TOKEN está vazio", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("TURSO_DATABASE_URL", "libsql://example.turso.io");
    vi.stubEnv("TURSO_AUTH_TOKEN", "");

    await expect(import("@/db")).rejects.toThrow("TURSO_AUTH_TOKEN está vazio");
  });

  it("não lança erro quando VERCEL não está definido como '1'", async () => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("TURSO_DATABASE_URL", "");
    vi.stubEnv("TURSO_AUTH_TOKEN", "");

    await expect(import("@/db")).resolves.toBeDefined();
  });

  it("não lança erro com credenciais válidas fora do Vercel", async () => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("TURSO_DATABASE_URL", "libsql://example.turso.io");
    vi.stubEnv("TURSO_AUTH_TOKEN", "valid-token");

    await expect(import("@/db")).resolves.toBeDefined();
  });

  it("não lança erro quando VERCEL=1 e todas as credenciais estão presentes", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("TURSO_DATABASE_URL", "libsql://example.turso.io");
    vi.stubEnv("TURSO_AUTH_TOKEN", "valid-token");

    await expect(import("@/db")).resolves.toBeDefined();
  });
});

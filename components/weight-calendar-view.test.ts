import { describe, it, expect } from "vitest";
import {
  applyWeightSave,
  applyWeightDelete,
  isFutureDate,
} from "@/lib/weight-state";

// ─── applyWeightSave ──────────────────────────────────────────
describe("applyWeightSave", () => {
  it("adiciona peso em mês inexistente", () => {
    const result = applyWeightSave({}, "2026-04", "2026-04-10", 75.5);
    expect(result["2026-04"]["2026-04-10"]).toBe(75.5);
  });

  it("adiciona peso em mês já existente sem sobrescrever outras datas", () => {
    const state = { "2026-04": { "2026-04-01": 80 } };
    const result = applyWeightSave(state, "2026-04", "2026-04-10", 75.5);
    expect(result["2026-04"]["2026-04-01"]).toBe(80);
    expect(result["2026-04"]["2026-04-10"]).toBe(75.5);
  });

  it("sobrescreve peso existente na mesma data", () => {
    const state = { "2026-04": { "2026-04-10": 80 } };
    const result = applyWeightSave(state, "2026-04", "2026-04-10", 75);
    expect(result["2026-04"]["2026-04-10"]).toBe(75);
  });

  it("não muta o estado original", () => {
    const state = { "2026-04": { "2026-04-10": 80 } };
    applyWeightSave(state, "2026-04", "2026-04-10", 75);
    expect(state["2026-04"]["2026-04-10"]).toBe(80);
  });
});

// ─── applyWeightDelete ────────────────────────────────────────
describe("applyWeightDelete", () => {
  it("remove a data do mês", () => {
    const state = { "2026-04": { "2026-04-10": 75.5, "2026-04-11": 76 } };
    const result = applyWeightDelete(state, "2026-04", "2026-04-10");
    expect(result["2026-04"]["2026-04-10"]).toBeUndefined();
    expect(result["2026-04"]["2026-04-11"]).toBe(76);
  });

  it("é no-op se a data não existe no mês", () => {
    const state = { "2026-04": { "2026-04-11": 76 } };
    const result = applyWeightDelete(state, "2026-04", "2026-04-10");
    expect(result["2026-04"]).toEqual({ "2026-04-11": 76 });
  });

  it("é no-op se o mês não existe", () => {
    const state = {};
    const result = applyWeightDelete(state, "2026-04", "2026-04-10");
    expect(result["2026-04"]).toBeUndefined();
  });

  it("não muta o estado original", () => {
    const state = { "2026-04": { "2026-04-10": 75.5 } };
    applyWeightDelete(state, "2026-04", "2026-04-10");
    expect(state["2026-04"]["2026-04-10"]).toBe(75.5);
  });
});

// ─── isFutureDate ─────────────────────────────────────────────
describe("isFutureDate", () => {
  const today = "2026-04-26";

  it("data futura retorna true", () => {
    expect(isFutureDate("2026-04-27", today)).toBe(true);
  });

  it("hoje retorna false", () => {
    expect(isFutureDate("2026-04-26", today)).toBe(false);
  });

  it("data passada retorna false", () => {
    expect(isFutureDate("2026-04-25", today)).toBe(false);
  });
});

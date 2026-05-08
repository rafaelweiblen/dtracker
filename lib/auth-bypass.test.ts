import { describe, it, expect, afterEach, vi } from "vitest";
import {
  isAuthBypass,
  getBypassUserId,
  DEFAULT_DEV_BYPASS_USER_ID,
} from "@/lib/auth-bypass";

describe("auth-bypass", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("desligado fora de development", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AUTH_BYPASS", "true");
    expect(isAuthBypass()).toBe(false);
  });

  it("desligado se AUTH_BYPASS não é true", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("AUTH_BYPASS", "1");
    expect(isAuthBypass()).toBe(false);
  });

  it("ligado só com development + AUTH_BYPASS=true", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("AUTH_BYPASS", "true");
    expect(isAuthBypass()).toBe(true);
  });

  it("getBypassUserId usa default", () => {
    vi.stubEnv("AUTH_BYPASS_USER_ID", "");
    expect(getBypassUserId()).toBe(DEFAULT_DEV_BYPASS_USER_ID);
  });

  it("getBypassUserId respeita AUTH_BYPASS_USER_ID", () => {
    vi.stubEnv("AUTH_BYPASS_USER_ID", "  custom-id  ");
    expect(getBypassUserId()).toBe("custom-id");
  });
});

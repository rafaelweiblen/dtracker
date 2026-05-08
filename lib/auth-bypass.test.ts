import { describe, it, expect, afterEach } from "vitest";
import {
  isAuthBypass,
  getBypassUserId,
  DEFAULT_DEV_BYPASS_USER_ID,
} from "@/lib/auth-bypass";

describe("auth-bypass", () => {
  const origNodeEnv = process.env.NODE_ENV;
  const origBypass = process.env.AUTH_BYPASS;
  const origUserId = process.env.AUTH_BYPASS_USER_ID;

  afterEach(() => {
    process.env.NODE_ENV = origNodeEnv;
    process.env.AUTH_BYPASS = origBypass;
    process.env.AUTH_BYPASS_USER_ID = origUserId;
  });

  it("desligado fora de development", () => {
    process.env.NODE_ENV = "production";
    process.env.AUTH_BYPASS = "true";
    expect(isAuthBypass()).toBe(false);
  });

  it("desligado se AUTH_BYPASS não é true", () => {
    process.env.NODE_ENV = "development";
    process.env.AUTH_BYPASS = "1";
    expect(isAuthBypass()).toBe(false);
  });

  it("ligado só com development + AUTH_BYPASS=true", () => {
    process.env.NODE_ENV = "development";
    process.env.AUTH_BYPASS = "true";
    expect(isAuthBypass()).toBe(true);
  });

  it("getBypassUserId usa default", () => {
    delete process.env.AUTH_BYPASS_USER_ID;
    expect(getBypassUserId()).toBe(DEFAULT_DEV_BYPASS_USER_ID);
  });

  it("getBypassUserId respeita AUTH_BYPASS_USER_ID", () => {
    process.env.AUTH_BYPASS_USER_ID = "  custom-id  ";
    expect(getBypassUserId()).toBe("custom-id");
  });
});

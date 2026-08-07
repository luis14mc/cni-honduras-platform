import { describe, expect, it } from "vitest";
import { CmsApiError } from "@/src/lib/cms/api";
import {
  displayName,
  initials,
  loginErrorMessage,
  validateLogin,
} from "@/src/lib/cms/session";
import type { CmsUser } from "@/src/lib/cms/types";

function makeUser(p: Partial<CmsUser>): CmsUser {
  return {
    id: 1,
    username: "jdoe",
    email: "",
    first_name: "",
    last_name: "",
    is_superuser: false,
    is_staff: true,
    groups: [],
    permissions: [],
    ...p,
  };
}

describe("validateLogin", () => {
  it("flags empty fields", () => {
    const e = validateLogin("  ", "");
    expect(e.username).toBeDefined();
    expect(e.password).toBeDefined();
  });
  it("passes with values", () => {
    expect(validateLogin("user", "pw")).toEqual({});
  });
});

describe("loginErrorMessage", () => {
  it("maps 401 to credentials message", () => {
    expect(loginErrorMessage(new CmsApiError("x", 401))).toMatch(/incorrect/i);
  });
  it("maps 403 to no-access message", () => {
    expect(loginErrorMessage(new CmsApiError("x", 403))).toMatch(/acceso/i);
  });
  it("maps 429 to rate-limit message", () => {
    expect(loginErrorMessage(new CmsApiError("x", 429))).toMatch(/intentos/i);
  });
  it("handles non-API errors", () => {
    expect(loginErrorMessage(new Error("boom"))).toMatch(/servidor/i);
  });
});

describe("displayName", () => {
  it("prefers full name", () => {
    expect(displayName(makeUser({ first_name: "Ada", last_name: "Lovelace" }))).toBe("Ada Lovelace");
  });
  it("falls back to username", () => {
    expect(displayName(makeUser({}))).toBe("jdoe");
  });
});

describe("initials", () => {
  it("uses first+last initials", () => {
    expect(initials(makeUser({ first_name: "Ada", last_name: "Lovelace" }))).toBe("AL");
  });
  it("uses two letters of a single token", () => {
    expect(initials(makeUser({ first_name: "Ada" }))).toBe("AD");
  });
  it("falls back to username initials", () => {
    expect(initials(makeUser({ username: "root" }))).toBe("RO");
  });
});

import { describe, expect, it } from "vitest";
import { CmsApiError, classifyStatus, readCookie } from "@/src/lib/cms/api";

describe("classifyStatus", () => {
  it("maps 401 to expired session", () => {
    expect(classifyStatus(401)).toBe("expired");
  });
  it("maps 403 to unauthorized", () => {
    expect(classifyStatus(403)).toBe("unauthorized");
  });
  it("maps other statuses to generic error", () => {
    expect(classifyStatus(500)).toBe("error");
    expect(classifyStatus(0)).toBe("error");
  });
});

describe("CmsApiError", () => {
  it("derives kind from status", () => {
    expect(new CmsApiError("x", 401).kind).toBe("expired");
    expect(new CmsApiError("x", 403).kind).toBe("unauthorized");
  });
});

describe("readCookie", () => {
  it("extracts a named cookie", () => {
    expect(readCookie("csrftoken", "a=1; csrftoken=abc123; b=2")).toBe("abc123");
  });
  it("returns null when missing or empty", () => {
    expect(readCookie("csrftoken", "a=1; b=2")).toBeNull();
    expect(readCookie("csrftoken", "")).toBeNull();
  });
  it("decodes url-encoded values", () => {
    expect(readCookie("x", "x=a%20b")).toBe("a b");
  });
});

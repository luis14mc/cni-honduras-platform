import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CmsApiError,
  CMS_API_BASE,
  classifyStatus,
  clearInMemoryCsrfToken,
  cmsDelete,
  cmsPatch,
  cmsPost,
  cmsPut,
  ensureCsrfToken,
  getInMemoryCsrfToken,
  readCookie,
} from "@/src/lib/cms/api";

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

describe("in-memory CSRF token", () => {
  beforeEach(() => {
    clearInMemoryCsrfToken();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches csrfToken from JSON and stores it in memory", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ csrfToken: "token-from-json" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const token = await ensureCsrfToken();

    expect(token).toBe("token-from-json");
    expect(getInMemoryCsrfToken()).toBe("token-from-json");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(`${CMS_API_BASE}/csrf/`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
  });

  it("reuses the in-memory token without refetching", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ csrfToken: "cached-token" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await ensureCsrfToken();
    await ensureCsrfToken();

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(getInMemoryCsrfToken()).toBe("cached-token");
  });

  it("does not depend on document.cookie for CSRF", async () => {
    // Node test env has no `document`; CSRF must come from the API JSON body.
    expect(typeof document).toBe("undefined");

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ csrfToken: "json-only" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await ensureCsrfToken();

    expect(getInMemoryCsrfToken()).toBe("json-only");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("sends X-CSRFToken on login POST with credentials include", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrfToken: "abc123" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ username: "editor" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await cmsPost("/login/", { username: "editor", password: "secret" });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: "POST",
      credentials: "include",
      headers: expect.objectContaining({
        "X-CSRFToken": "abc123",
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({ username: "editor", password: "secret" }),
    });
  });

  it("refreshes the token once on CSRF 403 and retries", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrfToken: "stale" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ detail: "CSRF Failed: token incorrect." }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrfToken: "fresh" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ username: "editor" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const user = await cmsPost<{ username: string }>("/login/", {
      username: "editor",
      password: "secret",
    });

    expect(user.username).toBe("editor");
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls[3][1]?.headers).toMatchObject({
      "X-CSRFToken": "fresh",
    });
  });

  it("does not loop on repeated CSRF 403", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrfToken: "stale" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ detail: "CSRF Failed: token incorrect." }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrfToken: "fresh" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ detail: "CSRF Failed: token incorrect." }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(cmsPost("/login/", { username: "a", password: "b" })).rejects.toMatchObject({
      status: 403,
    });

    // csrf fetch + login + csrf refresh + login retry (no third retry)
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});

describe("cmsPut / cmsPatch / cmsDelete", () => {
  beforeEach(() => {
    clearInMemoryCsrfToken();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("cmsPut sends PUT with CSRF and JSON body", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrfToken: "put-token" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 1 }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await cmsPut("/news/1/", { title_es: "T" });

    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: "PUT",
      credentials: "include",
      headers: expect.objectContaining({
        "X-CSRFToken": "put-token",
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({ title_es: "T" }),
    });
  });

  it("cmsPatch sends PATCH with CSRF", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrfToken: "patch-token" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 2 }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await cmsPatch("/news/2/", { summary_es: "S" });

    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: "PATCH",
      headers: expect.objectContaining({ "X-CSRFToken": "patch-token" }),
    });
  });

  it("cmsDelete sends DELETE with CSRF and handles 204", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrfToken: "del-token" }), { status: 200 }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await cmsDelete("/news/3/");

    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: "DELETE",
      credentials: "include",
      headers: expect.objectContaining({ "X-CSRFToken": "del-token" }),
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CMS_API_BASE, clearInMemoryCsrfToken } from "@/src/lib/cms/api";
import {
  createNews,
  publishNews,
  updateNews,
} from "@/src/lib/cms/editorial/news";

describe("editorial news API", () => {
  beforeEach(() => {
    clearInMemoryCsrfToken();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("createNews sends POST with CSRF and draft status", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrfToken: "tok123" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 42, title_es: "Hola", status: "draft" }), {
          status: 201,
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const item = await createNews({ title_es: "Hola" });

    expect(item.id).toBe(42);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe(`${CMS_API_BASE}/news/`);
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: "POST",
      credentials: "include",
      headers: expect.objectContaining({
        "X-CSRFToken": "tok123",
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({ status: "draft", title_es: "Hola" }),
    });
  });

  it("updateNews sends PATCH with CSRF", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrfToken: "tok456" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 7, title_es: "Actualizado" }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await updateNews(7, { title_es: "Actualizado" });

    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: "PATCH",
      credentials: "include",
      headers: expect.objectContaining({ "X-CSRFToken": "tok456" }),
    });
  });

  it("publishNews sends POST to publish action with CSRF", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrfToken: "pubtok" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 7, status: "published" }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const published = await publishNews(7);

    expect(published.status).toBe("published");
    expect(fetchMock.mock.calls[1][0]).toBe(`${CMS_API_BASE}/news/7/publish/`);
    expect(fetchMock.mock.calls[1][1]?.headers).toMatchObject({
      "X-CSRFToken": "pubtok",
    });
  });
});

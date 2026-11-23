import { afterEach, describe, expect, it, vi } from "vitest";
import { getOpportunity, getProject, getProjects } from "./investment";

afterEach(() => vi.unstubAllGlobals());

describe("Django investment portfolio", () => {
  it("returns only the projects sent by Django for the requested language", async () => {
    const record = { slug: "district", title: "From Django", polo_slugs: ["tegucigalpa"] };
    const fetchApi = vi.fn().mockResolvedValue(Response.json({ results: [record] }));
    vi.stubGlobal("fetch", fetchApi);
    await expect(getProjects({ locale: "en" })).resolves.toEqual([record]);
    expect(new URL(fetchApi.mock.calls[0][0]).searchParams.get("lang")).toBe("en");
  });

  it("distinguishes an empty list from Django being unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(Response.json({ results: [] }))
      .mockResolvedValueOnce(Response.json({ detail: "Unavailable" }, { status: 503 })));
    await expect(getProjects({ locale: "es" })).resolves.toEqual([]);
    await expect(getProjects({ locale: "es" })).rejects.toMatchObject({ status: 503 });
  });

  it("passes through the status of a missing project or opportunity", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () =>
      Response.json({ detail: "Not found" }, { status: 404 })));
    await expect(getProject("missing", { locale: "es" })).rejects.toMatchObject({ status: 404 });
    await expect(getOpportunity("missing", { locale: "en" })).rejects.toMatchObject({ status: 404 });
  });
});

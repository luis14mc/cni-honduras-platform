import { afterEach, describe, expect, it, vi } from "vitest";
import { getAnalyticsScript, isAnalyticsPath, trackDownload, trackEvent, trackPageview } from "./analytics";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function mockTracker(pathname = "/portafolio/mapa") {
  const track = vi.fn((build: (data: object) => unknown) =>
    build({ website: "site-id", url: "/private?token=example", referrer: "https://other.test/?token=example" }));
  const dispatchEvent = vi.fn();
  vi.stubGlobal("window", { location: { pathname }, umami: { track }, dispatchEvent });
  return { track, dispatchEvent };
}

describe("analytics", () => {
  it("requires a website ID and an HTTPS script in production", () => {
    vi.stubEnv("NEXT_PUBLIC_UMAMI_WEBSITE_ID", "site-id");
    vi.stubEnv("NEXT_PUBLIC_UMAMI_SCRIPT_URL", "https://stats.example.test/script.js");
    expect(getAnalyticsScript("development")).toBeUndefined();
    expect(getAnalyticsScript("production")).toEqual({
      websiteId: "site-id", src: "https://stats.example.test/script.js",
    });
    vi.stubEnv("NEXT_PUBLIC_UMAMI_SCRIPT_URL", "http://stats.example.test/script.js");
    expect(getAnalyticsScript("production")).toBeUndefined();
  });

  it.each(["/admin", "/cms/login", "/strapi-api/content", "/api/forms", "/en/editorial-preview"])(
    "excludes %s", (path) => expect(isAnalyticsPath(path)).toBe(false),
  );

  it("does not send events on the server, without an ID, or on administration routes", () => {
    vi.stubGlobal("window", undefined);
    expect(() => trackEvent("map_filter", { filter: "reset" })).not.toThrow();
    vi.stubEnv("NEXT_PUBLIC_UMAMI_WEBSITE_ID", "");
    const { track } = mockTracker();
    trackEvent("map_filter", { filter: "reset" });
    expect(track).not.toHaveBeenCalled();
    vi.stubEnv("NEXT_PUBLIC_UMAMI_WEBSITE_ID", "site-id");
    const admin = mockTracker("/admin");
    trackEvent("map_filter", { filter: "reset" });
    trackPageview("/admin");
    expect(admin.track).not.toHaveBeenCalled();
  });

  it("keeps the resource event and strips the query and referrer from the Umami payload", () => {
    vi.stubEnv("NEXT_PUBLIC_UMAMI_WEBSITE_ID", "site-id");
    const { track, dispatchEvent } = mockTracker("/recursos/biblioteca");
    const detail = { slug: "guia", access: "gated" } as const;
    trackDownload(detail);
    expect(dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({ type: "file_download", detail }));
    expect(track.mock.results[0].value).toEqual({
      website: "site-id", url: "/recursos/biblioteca", referrer: "", name: "file_download", data: detail,
    });
  });

  it("sends manual pageviews and tolerates rejected requests", async () => {
    vi.stubEnv("NEXT_PUBLIC_UMAMI_WEBSITE_ID", "site-id");
    const { track } = mockTracker();
    trackPageview("/portafolio/mapa");
    expect(track.mock.results[0].value).toMatchObject({ url: "/portafolio/mapa", referrer: "" });
    track.mockImplementationOnce(() => Promise.reject(new Error("Offline")));
    trackEvent("map_project_open", { slug: "proyecto", kind: "project" });
    await Promise.resolve();
  });
});

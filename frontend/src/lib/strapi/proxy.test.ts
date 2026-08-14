import { describe, expect, it } from "vitest";
import {
  buildStrapiBeforeFileRewrites,
  isStrapiProxyPath,
  normalizeStrapiOrigin,
  rewriteStrapiProxyUrl,
} from "@/src/lib/strapi/proxy";

describe("normalizeStrapiOrigin", () => {
  it("returns null for empty values", () => {
    expect(normalizeStrapiOrigin(undefined)).toBeNull();
    expect(normalizeStrapiOrigin("")).toBeNull();
    expect(normalizeStrapiOrigin("   ")).toBeNull();
  });

  it("strips trailing slashes", () => {
    expect(normalizeStrapiOrigin("http://localhost:1337/")).toBe(
      "http://localhost:1337",
    );
    expect(normalizeStrapiOrigin("https://strapi.example.internal///")).toBe(
      "https://strapi.example.internal",
    );
  });
});

describe("buildStrapiBeforeFileRewrites", () => {
  it("registers nothing when STRAPI_ORIGIN is empty", () => {
    expect(buildStrapiBeforeFileRewrites("")).toEqual([]);
    expect(buildStrapiBeforeFileRewrites(undefined)).toEqual([]);
  });

  it("maps admin, strapi-api, and Strapi 5 plugin prefixes", () => {
    const rewrites = buildStrapiBeforeFileRewrites("http://localhost:1337/");
    expect(rewrites).toContainEqual({
      source: "/admin",
      destination: "http://localhost:1337/admin",
    });
    expect(rewrites).toContainEqual({
      source: "/admin/:path*",
      destination: "http://localhost:1337/admin/:path*",
    });
    expect(rewrites).toContainEqual({
      source: "/strapi-api/:path*",
      destination: "http://localhost:1337/api/:path*",
    });
    expect(rewrites).toContainEqual({
      source: "/content-manager/:path*",
      destination: "http://localhost:1337/content-manager/:path*",
    });
    expect(rewrites).toContainEqual({
      source: "/upload/:path*",
      destination: "http://localhost:1337/upload/:path*",
    });
    expect(rewrites).toContainEqual({
      source: "/i18n/:path*",
      destination: "http://localhost:1337/i18n/:path*",
    });
    expect(rewrites).toContainEqual({
      source: "/users-permissions/:path*",
      destination: "http://localhost:1337/users-permissions/:path*",
    });
    expect(rewrites.some((rule) => rule.source.startsWith("/cms"))).toBe(false);
    expect(rewrites.some((rule) => rule.source === "/api/:path*")).toBe(false);
  });
});

describe("isStrapiProxyPath", () => {
  it("matches proxied Strapi paths and ignores the Django CMS", () => {
    expect(isStrapiProxyPath("/admin")).toBe(true);
    expect(isStrapiProxyPath("/admin/auth/login")).toBe(true);
    expect(isStrapiProxyPath("/strapi-api/health")).toBe(true);
    expect(isStrapiProxyPath("/content-manager/collection-types")).toBe(true);
    expect(isStrapiProxyPath("/cms")).toBe(false);
    expect(isStrapiProxyPath("/cms/noticias")).toBe(false);
    expect(isStrapiProxyPath("/en/prensa")).toBe(false);
    expect(isStrapiProxyPath("/mapa")).toBe(false);
  });
});

describe("rewriteStrapiProxyUrl", () => {
  it("returns null without origin", () => {
    expect(rewriteStrapiProxyUrl("", "/admin")).toBeNull();
  });

  it("maps admin, REST prefix, and plugin paths", () => {
    expect(rewriteStrapiProxyUrl("http://localhost:1337/", "/admin")).toBe(
      "http://localhost:1337/admin",
    );
    expect(
      rewriteStrapiProxyUrl("http://localhost:1337", "/strapi-api/health"),
    ).toBe("http://localhost:1337/api/health");
    expect(
      rewriteStrapiProxyUrl(
        "http://localhost:1337",
        "/strapi-api/news",
        "?locale=es",
      ),
    ).toBe("http://localhost:1337/api/news?locale=es");
    expect(
      rewriteStrapiProxyUrl(
        "http://localhost:1337",
        "/content-manager/collection-types",
      ),
    ).toBe("http://localhost:1337/content-manager/collection-types");
  });
});

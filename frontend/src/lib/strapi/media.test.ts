import { describe, expect, it } from "vitest";
import { getStrapiMediaUrl } from "@/src/lib/strapi/media";

describe("getStrapiMediaUrl", () => {
  it("keeps absolute http(s) URLs including R2 public hosts", () => {
    expect(
      getStrapiMediaUrl("https://pub-example.r2.dev/news/hero.webp"),
    ).toBe("https://pub-example.r2.dev/news/hero.webp");
    expect(getStrapiMediaUrl("http://localhost:1337/uploads/a.png")).toBe(
      "http://localhost:1337/uploads/a.png",
    );
  });

  it("prefixes relative paths with NEXT_PUBLIC_STRAPI_URL", () => {
    const previous = process.env.NEXT_PUBLIC_STRAPI_URL;
    process.env.NEXT_PUBLIC_STRAPI_URL = "http://localhost:1337/";
    expect(getStrapiMediaUrl("/uploads/doc.pdf")).toBe(
      "http://localhost:1337/uploads/doc.pdf",
    );
    expect(getStrapiMediaUrl("uploads/doc.pdf")).toBe(
      "http://localhost:1337/uploads/doc.pdf",
    );
    process.env.NEXT_PUBLIC_STRAPI_URL = previous;
  });

  it("reads url from a media object", () => {
    const previous = process.env.NEXT_PUBLIC_STRAPI_URL;
    process.env.NEXT_PUBLIC_STRAPI_URL = "http://localhost:1337";
    expect(getStrapiMediaUrl({ url: "/uploads/cover.webp" })).toBe(
      "http://localhost:1337/uploads/cover.webp",
    );
    process.env.NEXT_PUBLIC_STRAPI_URL = previous;
  });

  it("keeps site-relative upload paths when STRAPI URL is a path prefix", () => {
    const previous = process.env.NEXT_PUBLIC_STRAPI_URL;
    process.env.NEXT_PUBLIC_STRAPI_URL = "/strapi-api";
    expect(getStrapiMediaUrl("/uploads/doc.pdf")).toBe("/uploads/doc.pdf");
    process.env.NEXT_PUBLIC_STRAPI_URL = previous;
  });

  it("returns null for empty input", () => {
    expect(getStrapiMediaUrl(null)).toBeNull();
    expect(getStrapiMediaUrl(undefined)).toBeNull();
    expect(getStrapiMediaUrl("")).toBeNull();
    expect(getStrapiMediaUrl("   ")).toBeNull();
    expect(getStrapiMediaUrl({ url: null })).toBeNull();
  });
});

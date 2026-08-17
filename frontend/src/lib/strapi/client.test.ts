import { describe, expect, it } from "vitest";
import { buildStrapiQuery, getStrapiBaseUrl, getStrapiServerUrl } from "@/src/lib/strapi/client";

describe("buildStrapiQuery", () => {
  it("builds locale and populate query strings", () => {
    expect(buildStrapiQuery({ locale: "es", populate: "*" })).toBe(
      "?locale=es&populate=*",
    );
    expect(buildStrapiQuery({ locale: "en", populate: "featured_image" })).toBe(
      "?locale=en&populate=featured_image",
    );
  });

  it("returns an empty string when no params are set", () => {
    expect(buildStrapiQuery({})).toBe("");
  });
});

describe("getStrapiBaseUrl", () => {
  it("keeps an absolute Strapi origin", () => {
    const previous = process.env.NEXT_PUBLIC_STRAPI_URL;
    process.env.NEXT_PUBLIC_STRAPI_URL = "http://localhost:1337/";
    expect(getStrapiBaseUrl()).toBe("http://localhost:1337");
    process.env.NEXT_PUBLIC_STRAPI_URL = previous;
  });

  it("resolves a relative /strapi-api prefix against NEXT_PUBLIC_SITE_URL on the server", () => {
    const previousUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
    const previousSite = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_STRAPI_URL = "/strapi-api";
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000/";
    expect(getStrapiBaseUrl()).toBe("http://localhost:3000/strapi-api");
    process.env.NEXT_PUBLIC_STRAPI_URL = previousUrl;
    process.env.NEXT_PUBLIC_SITE_URL = previousSite;
  });
});

describe("getStrapiServerUrl", () => {
  it("uses server-only STRAPI_URL and ignores the public proxy prefix", () => {
    const previousServer = process.env.STRAPI_URL;
    const previousPublic = process.env.NEXT_PUBLIC_STRAPI_URL;
    process.env.STRAPI_URL = "https://strapi.internal/";
    process.env.NEXT_PUBLIC_STRAPI_URL = "/strapi-api";
    expect(getStrapiServerUrl()).toBe("https://strapi.internal");
    process.env.STRAPI_URL = previousServer;
    process.env.NEXT_PUBLIC_STRAPI_URL = previousPublic;
  });
});

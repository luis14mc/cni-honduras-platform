import { describe, expect, it } from "vitest";
import { buildStrapiQuery } from "@/src/lib/strapi/client";

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

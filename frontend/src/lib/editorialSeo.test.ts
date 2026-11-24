import { describe, expect, it, vi } from "vitest";
import { buildEditorialMetadata, editorialIndex } from "@/src/lib/editorialSeo";

vi.mock("@/src/lib/strapi/editorial", () => ({
  getEditorialSeoIndex: async (_collection: string, locale: string) => locale === "es"
    ? [
      { documentId: "a", slug: "acerca", noindex: false, canonical: null },
      { documentId: "b", slug: "solo-es", noindex: false, canonical: null },
    ]
    : [
      { documentId: "a", slug: "about", noindex: false, canonical: null },
      { documentId: "b", slug: "excluded", noindex: true, canonical: null },
      { documentId: "c", slug: "duplicate", noindex: false, canonical: "/" },
    ],
}));

describe("localized editorial SEO", () => {
  it("links distinct localized slugs belonging to the same document", async () => {
    const meta = await buildEditorialMetadata({
      collection: "pages", locale: "en", slug: "about", title: "About us",
    });
    expect(meta.alternates).toEqual({
      canonical: "/en/institutional/about",
      languages: {
        es: "/institucional/acerca",
        en: "/en/institutional/about",
        "x-default": "/institucional/acerca",
      },
    });
    expect(meta.description).toBe("About us");
    expect(meta.openGraph?.images).toBeDefined();
  });

  it("excludes noindex and noncanonical entries and does not fabricate translations", async () => {
    expect((await editorialIndex("pages", "en")).map(({ slug }) => slug)).toEqual(["about"]);
    const meta = await buildEditorialMetadata({
      collection: "pages", locale: "es", slug: "solo-es", title: "Solo en español",
    });
    expect(meta.alternates?.languages).toEqual({
      es: "/institucional/solo-es",
      "x-default": "/institucional/solo-es",
    });
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { StrapiApiError } from "@/src/lib/strapi/client";
import {
  getNews,
  getNewsBySlug,
  getDocuments,
  getOpportunityBySlug,
  getSuccessStories,
  mapDocument,
  mapNews,
  mapOpportunity,
  mapSuccessStory,
  toStrapiLocale,
} from "@/src/lib/strapi/editorial";
import { getStrapiMediaUrl } from "@/src/lib/strapi/media";

const newsRaw = {
  id: 12,
  documentId: "abc",
  title: "Anuncio CNI",
  slug: "anuncio-cni",
  summary: "Resumen",
  content: [
    {
      type: "paragraph",
      children: [{ type: "text", text: "Hola Honduras" }],
    },
  ],
  featured_image: { url: "https://cdn.example/news.webp", alternativeText: "Hero" },
  published_date: "2026-08-01T12:00:00.000Z",
  category: "press_release",
  featured: true,
  seo_title: "SEO",
  seo_description: "Desc",
  locale: "es",
};

describe("toStrapiLocale", () => {
  it("maps site locales without ES↔EN fallback", () => {
    expect(toStrapiLocale("es")).toBe("es");
    expect(toStrapiLocale("en")).toBe("en");
    expect(() => toStrapiLocale("fr")).toThrow(StrapiApiError);
  });
});

describe("mapNews", () => {
  it("maps Strapi news to the public domain type", () => {
    const item = mapNews(newsRaw);
    expect(item).toMatchObject({
      id: 12,
      title: "Anuncio CNI",
      slug: "anuncio-cni",
      summary: "Resumen",
      category: "press_release",
      is_featured: true,
      published_at: "2026-08-01T12:00:00.000Z",
      seo_title: "SEO",
      seo_description: "Desc",
    });
    expect(item?.featured_image?.file).toBe("https://cdn.example/news.webp");
    expect(item?.featured_image?.file_url).toBe("https://cdn.example/news.webp");
    expect(item?.content).toContain("Hola Honduras");
    expect(item?.rich_content?.[0]?.type).toBe("paragraph");
  });

  it("returns null when slug is missing", () => {
    expect(mapNews({ ...newsRaw, slug: "" })).toBeNull();
  });
});

describe("mapDocument", () => {
  it("maps independent file and cover URLs", () => {
    const doc = mapDocument(
      {
        id: 3,
        title: "Memoria",
        slug: "memoria-2024",
        description: "Informe",
        file: { url: "https://cdn.example/es/memoria.pdf", mime: "application/pdf", size: 250 },
        cover: { url: "/uploads/cover.webp" },
        category: "institucional",
        resource_key: "memoria-anual",
        featured: true,
        document_type: "project_sheet",
        sector: "energia",
        order: 2,
        publishedAt: "2026-02-01T00:00:00.000Z",
      },
      "es",
    );
    expect(doc).toMatchObject({
      title: "Memoria",
      slug: "memoria-2024",
      category: "institucional",
      resource_key: "memoria-anual",
      is_featured: true,
      document_type: "project_sheet",
      sector: "energia",
      order: 2,
      language: "es",
      file: "https://cdn.example/es/memoria.pdf",
      file_url: "https://cdn.example/es/memoria.pdf",
      has_resource: true,
    });
    expect(doc?.cover_image?.file).toContain("cover.webp");
    expect(doc?.file_size_bytes).toBe(250 * 1024);
  });

  it("maps a missing cover and file without inventing media", () => {
    const doc = mapDocument({ id: 4, title: "Ficha", slug: "ficha", order: 0 }, "en");
    expect(doc?.language).toBe("en");
    expect(doc?.cover_image).toBeNull();
    expect(doc?.file_url).toBeNull();
    expect(doc?.has_resource).toBe(false);
  });
});

describe("mapSuccessStory", () => {
  it("maps story fields and media without inventing Django sector ids", () => {
    const story = mapSuccessStory({
      id: 9,
      title: "Caso agro",
      slug: "caso-agro",
      company_name: "Agro HN",
      summary: "Resumen caso",
      content: [{ type: "paragraph", children: [{ type: "text", text: "Cuerpo" }] }],
      logo: { url: "https://cdn.example/logo.png" },
      featured_image: { url: "https://cdn.example/cover.jpg" },
      person_photo: { url: "https://cdn.example/person.jpg" },
      person_name: "Ana",
      person_role: "CEO",
      testimonial: "Excelente acompañamiento",
      sector: "agroindustria",
      featured: true,
      publishedAt: "2026-03-01T00:00:00.000Z",
    });
    expect(story).toMatchObject({
      slug: "caso-agro",
      company_name: "Agro HN",
      is_featured: true,
      testimonial_quote: "Excelente acompañamiento",
      person_name: "Ana",
      person_role: "CEO",
    });
    expect(story?.sector).toMatchObject({ name: "agroindustria", slug: "agroindustria", id: 0 });
    expect(mapSuccessStory({ ...{
      id: 9,
      title: "Caso energia",
      slug: "caso-energia",
      sector: "Energía",
    }})?.sector?.slug).toBe("energia");
    expect(story?.featured_image?.file).toBe("https://cdn.example/cover.jpg");
    expect(story?.logo?.file).toBe("https://cdn.example/logo.png");
  });

  it("normalizes accented sector labels to slugs", () => {
    expect(mapSuccessStory({ id: 1, title: "A", slug: "a", sector: "Energía" })?.sector?.slug).toBe(
      "energia",
    );
    expect(
      mapSuccessStory({ id: 2, title: "B", slug: "b", sector: "Infraestructura Vial" })?.sector
        ?.slug,
    ).toBe("infraestructura-vial");
  });
});

describe("mapOpportunity", () => {
  it("maps public fields and never exposes internal_notes", () => {
    const opp = mapOpportunity({
      id: 4,
      title: "Parque solar",
      slug: "parque-solar",
      summary: "Teaser público",
      sector: "energia",
      code: "OPP-01",
      featured_image: { url: "https://cdn.example/opp.jpg" },
      public_metrics: [
        { id: 1, label: "MW", value: "50" },
        { id: 2, label: "Empleos", value: "120" },
        { id: 3, label: "USD", value: "10M" },
        { id: 4, label: "Plazo", value: "24m" },
        { id: 5, label: "Extra", value: "hidden" },
      ],
      contact_cta: "Solicite el teaser al CNI",
      internal_notes: "NO PUBLICAR — margen interno",
    });
    expect(opp).toMatchObject({
      title: "Parque solar",
      slug: "parque-solar",
      code: "OPP-01",
      summary: "Teaser público",
      value_proposition: "Solicite el teaser al CNI",
    });
    expect(opp?.metrics).toHaveLength(4);
    expect(opp?.metrics?.map((m) => m.label)).not.toContain("Extra");
    expect(JSON.stringify(opp)).not.toContain("internal_notes");
    expect(JSON.stringify(opp)).not.toContain("NO PUBLICAR");
    expect((opp as unknown as Record<string, unknown>).internal_notes).toBeUndefined();
  });
});

describe("getStrapiMediaUrl", () => {
  it("resolves absolute, relative and null media", () => {
    expect(getStrapiMediaUrl("https://pub.r2.dev/a.pdf")).toBe("https://pub.r2.dev/a.pdf");
    expect(getStrapiMediaUrl(null)).toBeNull();
    const previous = process.env.STRAPI_URL;
    process.env.STRAPI_URL = "https://strapi.example";
    expect(getStrapiMediaUrl("/uploads/x.png")).toBe("https://strapi.example/uploads/x.png");
    process.env.STRAPI_URL = previous;
  });
});

describe("editorial fetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("looks up news by slug with locale and populate", async () => {
    vi.stubEnv("STRAPI_URL", "https://strapi.test");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [newsRaw], meta: {} }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const article = await getNewsBySlug("es", "anuncio-cni");
    expect(article.slug).toBe("anuncio-cni");
    const url = String(fetchMock.mock.calls[0]?.[0]);
    expect(url).toContain("https://strapi.test/api/news");
    expect(url).toContain("locale=es");
    expect(url).toContain("filters%5Bslug%5D%5B%24eq%5D=anuncio-cni");
    expect(url).toContain("populate%5Bfeatured_image%5D=true");
    expect(url).not.toContain("populate=*");
    const init = fetchMock.mock.calls[0]?.[1] as { next?: { revalidate?: number } };
    expect(init.next?.revalidate).toBe(60);
  });

  it("returns empty list without treating it as an error", async () => {
    vi.stubEnv("STRAPI_URL", "https://strapi.test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [], meta: { pagination: { total: 0 } } }),
      }),
    );
    await expect(getNews("en")).resolves.toEqual([]);
  });

  it("filters portfolio documents by type, sector and locale with stable ordering", async () => {
    vi.stubEnv("STRAPI_URL", "https://strapi.test");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], meta: { pagination: { total: 0 } } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      getDocuments("en", { documentType: "opportunity_card", sector: "turismo" }),
    ).resolves.toEqual([]);
    const url = String(fetchMock.mock.calls[0]?.[0]);
    expect(url).toContain("locale=en");
    expect(url).toContain("filters%5Bdocument_type%5D%5B%24eq%5D=opportunity_card");
    expect(url).toContain("filters%5Bsector%5D%5B%24eq%5D=turismo");
    expect(url).toContain("sort%5B0%5D=order%3Aasc");
    expect(url).toContain("sort%5B1%5D=title%3Aasc");
    expect(url).toContain("populate%5Bfile%5D=true");
    expect(url).toContain("populate%5Bcover%5D=true");
  });

  it("throws on HTTP errors without leaking Django fallback", async () => {
    vi.stubEnv("STRAPI_URL", "https://strapi.test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Server Error",
      }),
    );
    await expect(getNews("es")).rejects.toMatchObject({
      name: "StrapiApiError",
      status: 500,
    });
  });

  it("throws 404 when slug is missing for the requested locale", async () => {
    vi.stubEnv("STRAPI_URL", "https://strapi.test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [], meta: {} }),
      }),
    );
    await expect(getNewsBySlug("en", "missing-slug")).rejects.toMatchObject({
      status: 404,
    });
  });

  it("filters stories by normalized sector instead of exact string equality", async () => {
    vi.stubEnv("STRAPI_URL", "https://strapi.test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [
            { id: 1, title: "Solar", slug: "solar", sector: "Energía" },
            { id: 2, title: "Cafe", slug: "cafe", sector: "Agroindustria" },
          ],
          meta: {},
        }),
      }),
    );
    const stories = await getSuccessStories("es", { sector: "energia" });
    expect(stories.map((item) => item.slug)).toEqual(["solar"]);
    const url = String(vi.mocked(fetch).mock.calls[0]?.[0]);
    expect(url).not.toContain("filters%5Bsector%5D");
  });

  it("does not send internal_notes in mapped opportunity lookups", async () => {
    vi.stubEnv("STRAPI_URL", "https://strapi.test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [
            {
              id: 1,
              title: "Opp",
              slug: "opp",
              summary: "Public",
              internal_notes: "secret",
              public_metrics: [],
            },
          ],
          meta: {},
        }),
      }),
    );
    const opp = await getOpportunityBySlug("es", "opp");
    expect(JSON.stringify(opp)).not.toContain("secret");
    expect(JSON.stringify(opp)).not.toContain("internal_notes");
  });
});

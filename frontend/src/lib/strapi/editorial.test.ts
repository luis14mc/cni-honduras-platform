import { afterEach, describe, expect, it, vi } from "vitest";
import { StrapiApiError } from "@/src/lib/strapi/client";
import {
  getBanners,
  getEditorialPreview,
  getInstitutionalPage,
  isBannerActive,
  mapBanner,
  mapInstitutionalPage,
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
  excerpt: "Resumen",
  content: [
    {
      __component: "content.paragraph",
      text: "Hola Honduras",
    },
    {
      __component: "content.heading",
      text: "Subtítulo",
      level: "h2",
    },
  ],
  cover: { url: "https://cdn.example/news.webp", alternativeText: "Hero" },
  lead_points: [{ text: "Punto 1" }, { text: "Punto 2" }],
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
    expect(item?.content).toContain("Subtítulo");
    expect(item?.rich_content?.[0]?.type).toBe("paragraph");
    expect(item?.lead_points).toEqual(["Punto 1", "Punto 2"]);
  });

  it("supports legacy summary and featured_image aliases", () => {
    const legacy = mapNews({
      id: 1,
      title: "Legacy",
      slug: "legacy",
      summary: "Resumen legacy",
      featured_image: { url: "https://cdn.example/legacy.webp" },
      content: [{ type: "paragraph", children: [{ type: "text", text: "Body" }] }],
    });
    expect(legacy?.summary).toBe("Resumen legacy");
    expect(legacy?.featured_image?.file).toBe("https://cdn.example/legacy.webp");
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

  it("maps a localized consolidated portfolio without requiring a sector", () => {
    const doc = mapDocument({
      id: 5,
      title: "Investment Opportunities Portfolio",
      slug: "investment-opportunities-portfolio",
      document_type: "opportunity_portfolio",
      order: 1,
    }, "en");
    expect(doc).toMatchObject({
      language: "en",
      document_type: "opportunity_portfolio",
      order: 1,
    });
    expect(doc?.sector).toBeUndefined();
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
    expect(url).toContain("populate%5Bcover%5D=true");
    expect(url).toContain("populate%5Blead_points%5D=true");
    expect(url).toContain("populate%5Bcontent%5D%5Bon%5D%5Bcontent.image%5D%5Bpopulate%5D=image");
    expect(url).not.toContain("populate=*");
    const init = fetchMock.mock.calls[0]?.[1] as { next?: { revalidate?: number } };
    expect(init.next?.revalidate).toBe(60);
  });

  it("reads a news preview by document ID with signed-version parameters and no cache", async () => {
    vi.stubEnv("STRAPI_URL", "https://strapi.test");
    vi.stubEnv("STRAPI_API_TOKEN", "preview-token");
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ data: newsRaw, meta: {} }));
    vi.stubGlobal("fetch", fetchMock);

    expect(await getEditorialPreview("news", "abc", "en", "draft")).toEqual(newsRaw);
    const [input, init] = fetchMock.mock.calls[0];
    const url = new URL(input);
    expect(url.pathname).toBe("/api/news/abc");
    expect(url.searchParams.get("locale")).toBe("en");
    expect(url.searchParams.get("status")).toBe("draft");
    expect(url.searchParams.get("populate[content][on][content.image][populate]")).toBe("image");
    for (const component of ["paragraph", "heading", "quote"]) {
      expect(url.searchParams.get(`populate[content][on][content.${component}][populate]`)).toBe("*");
    }
    expect(init.cache).toBe("no-store");
    expect(init.next).toBeUndefined();
    expect(init.headers.get("Authorization")).toBe("Bearer preview-token");
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

  it("populates cover only for news list requests", async () => {
    vi.stubEnv("STRAPI_URL", "https://strapi.test");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], meta: { pagination: { total: 0 } } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await getNews("es");
    const url = String(fetchMock.mock.calls[0]?.[0]);
    expect(url).toContain("populate%5Bcover%5D=true");
    expect(url).not.toContain("lead_points");
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


describe("CNI editorial content", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  const bannerRaw = {
    id: 42,
    title: "Aviso",
    placement: "site_top",
    publishedAt: "2026-11-23T00:00:00Z",
    starts_at: "2026-11-23T12:00:00Z",
    ends_at: "2026-11-24T12:00:00Z",
    priority: 5,
    image: { url: "https://cdn.example/banner.webp" },
  };

  it("preserves optional dates and image metadata and rejects unsafe CTA URLs", () => {
    const banner = mapBanner({ ...bannerRaw, link_url: "/\\external.test", link_external: true })!;
    expect(banner.link_url).toBe("");
    expect(banner.image?.file_url).toBe("https://cdn.example/banner.webp");
    expect(isBannerActive(banner, Date.parse(bannerRaw.starts_at))).toBe(true);
    expect(isBannerActive(banner, Date.parse(bannerRaw.ends_at) + 1)).toBe(false);
    expect(mapBanner({ ...bannerRaw, placement: "unsupported" })).toBeNull();
  });

  it("reads published banners in the requested locale and follows pagination", async () => {
    vi.stubEnv("STRAPI_URL", "https://cms.example");
    const active = { ...bannerRaw, starts_at: null, ends_at: null };
    const fetch = vi.fn()
      .mockResolvedValueOnce(Response.json({ data: [active, { ...bannerRaw, publishedAt: null }], meta: { pagination: { pageCount: 2 } } }))
      .mockResolvedValueOnce(Response.json({ data: [{ ...active, id: 43, starts_at: "2999-01-01T00:00:00Z" }], meta: { pagination: { pageCount: 2 } } }));
    vi.stubGlobal("fetch", fetch);

    expect((await getBanners("en", "site_top")).map(({ id }) => id)).toEqual([42]);
    const query = new URL(fetch.mock.calls[1][0]).searchParams;
    expect(query.get("status")).toBe("published");
    expect(query.get("locale")).toBe("en");
    expect(query.get("pagination[page]")).toBe("2");
  });

  it("maps a page dynamic zone and its shared SEO overrides", () => {
    const raw = { ...newsRaw, seo: { metaTitle: "Editorial SEO", noindex: true, canonical: "/institucional/acerca" } };
    expect(mapInstitutionalPage(raw)).toMatchObject({
      content: [
        { type: "paragraph", children: [{ text: "Hola Honduras" }] },
        { type: "heading", level: 2 },
      ],
      seo: { title: "Editorial SEO", noindex: true, canonical: "/institucional/acerca" },
    });
    expect(mapNews(raw)?.seo_title).toBe("Editorial SEO");
  });

  it("distinguishes a missing page from an upstream error", async () => {
    vi.stubEnv("STRAPI_URL", "https://cms.example");
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(Response.json({ data: [], meta: {} }))
      .mockResolvedValueOnce(new Response(null, { status: 503 })));
    await expect(getInstitutionalPage("es", "acerca")).rejects.toMatchObject({ status: 404 });
    await expect(getInstitutionalPage("es", "acerca")).rejects.toMatchObject({ status: 503 });
  });
});

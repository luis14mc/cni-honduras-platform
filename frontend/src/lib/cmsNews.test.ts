import { describe, expect, it, vi, beforeEach } from "vitest";
import { ApiError } from "@/src/lib/api";
import {
  buildNewsArticleMetadata,
  loadNewsArticle,
  resolveNewsArticleFetch,
} from "@/src/lib/cmsNews";
import { StrapiApiError } from "@/src/lib/strapi/client";
import { getNewsBySlug } from "@/src/lib/strapi/editorial";
import type { NewsArticle } from "@/src/types/cms";

vi.mock("@/src/lib/strapi/editorial", () => ({
  getNewsBySlug: vi.fn(),
}));

const mockArticle: NewsArticle = {
  id: 1,
  title: "Noticia de prueba",
  slug: "noticia-prueba",
  summary: "Resumen",
  content: "Contenido",
  featured_image: null,
  category: "news",
  author_name: "",
  source: "",
  external_url: "",
  is_featured: false,
  published_at: "2026-01-01T00:00:00Z",
  seo_title: "SEO title",
  seo_description: "SEO description",
};

describe("resolveNewsArticleFetch", () => {
  it("returns not_found for ApiError 404", () => {
    expect(
      resolveNewsArticleFetch(new ApiError("Not found", 404, "/cms/news/missing/")),
    ).toBe("not_found");
  });

  it("returns not_found for StrapiApiError 404", () => {
    expect(
      resolveNewsArticleFetch(new StrapiApiError("Not found", 404, "/api/news")),
    ).toBe("not_found");
  });

  it("returns error for ApiError status 0 (network)", () => {
    expect(
      resolveNewsArticleFetch(new ApiError("Network error", 0, "/cms/news/test/")),
    ).toBe("error");
  });

  it("returns error for ApiError 500", () => {
    expect(
      resolveNewsArticleFetch(new ApiError("Server error", 500, "/cms/news/test/")),
    ).toBe("error");
  });

  it("returns error for unknown failures", () => {
    expect(resolveNewsArticleFetch(new Error("unexpected"))).toBe("error");
  });
});

describe("loadNewsArticle", () => {
  beforeEach(() => {
    vi.mocked(getNewsBySlug).mockReset();
  });

  it("returns not_found for ApiError 404", async () => {
    vi.mocked(getNewsBySlug).mockRejectedValue(
      new StrapiApiError("Not found", 404, "/api/news"),
    );

    const result = await loadNewsArticle("missing", "es");
    expect(result).toEqual({ status: "not_found" });
  });

  it("returns error for network failures (status 0)", async () => {
    vi.mocked(getNewsBySlug).mockRejectedValue(
      new StrapiApiError("Failed to fetch", 0, "/api/news"),
    );

    const result = await loadNewsArticle("test", "es");
    expect(result).toEqual({ status: "error" });
  });

  it("returns error for ApiError 500", async () => {
    vi.mocked(getNewsBySlug).mockRejectedValue(
      new StrapiApiError("Internal Server Error", 500, "/api/news"),
    );

    const result = await loadNewsArticle("test", "es");
    expect(result).toEqual({ status: "error" });
  });

  it("returns article on success", async () => {
    vi.mocked(getNewsBySlug).mockResolvedValue(mockArticle);

    const result = await loadNewsArticle("noticia-prueba", "es");
    expect(result).toEqual({ status: "ok", article: mockArticle });
    expect(getNewsBySlug).toHaveBeenCalledWith("es", "noticia-prueba");
  });
});

describe("buildNewsArticleMetadata", () => {
  beforeEach(() => {
    vi.mocked(getNewsBySlug).mockReset();
  });

  it("returns empty metadata for 404", async () => {
    vi.mocked(getNewsBySlug).mockRejectedValue(
      new StrapiApiError("Not found", 404, "/api/news"),
    );

    const metadata = await buildNewsArticleMetadata("missing", "es");
    expect(metadata).toEqual({});
  });

  it("returns generic press metadata for server errors", async () => {
    vi.mocked(getNewsBySlug).mockRejectedValue(
      new StrapiApiError("Internal Server Error", 500, "/api/news"),
    );

    const metadata = await buildNewsArticleMetadata("test", "es");
    expect(metadata.title).toContain("Sala de Prensa");
    expect(metadata.description).toBeTruthy();
  });

  it("returns article SEO metadata on success", async () => {
    vi.mocked(getNewsBySlug).mockResolvedValue(mockArticle);

    const metadata = await buildNewsArticleMetadata("noticia-prueba", "es");
    expect(metadata.title).toBe("SEO title");
    expect(metadata.description).toBe("SEO description");
  });
});

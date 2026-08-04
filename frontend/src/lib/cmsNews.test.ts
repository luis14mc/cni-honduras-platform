import { describe, expect, it, vi, beforeEach } from "vitest";
import { ApiError } from "@/src/lib/api";
import {
  buildNewsArticleMetadata,
  loadNewsArticle,
  resolveNewsArticleFetch,
} from "@/src/lib/cmsNews";
import { getNewsArticle } from "@/src/services/cms";
import type { NewsArticle } from "@/src/types/cms";

vi.mock("@/src/services/cms", () => ({
  getNewsArticle: vi.fn(),
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
    vi.mocked(getNewsArticle).mockReset();
  });

  it("returns not_found for ApiError 404", async () => {
    vi.mocked(getNewsArticle).mockRejectedValue(
      new ApiError("Not found", 404, "/cms/news/missing/"),
    );

    const result = await loadNewsArticle("missing", "es");
    expect(result).toEqual({ status: "not_found" });
  });

  it("returns error for network failures (status 0)", async () => {
    vi.mocked(getNewsArticle).mockRejectedValue(
      new ApiError("Failed to fetch", 0, "/cms/news/test/"),
    );

    const result = await loadNewsArticle("test", "es");
    expect(result).toEqual({ status: "error" });
  });

  it("returns error for ApiError 500", async () => {
    vi.mocked(getNewsArticle).mockRejectedValue(
      new ApiError("Internal Server Error", 500, "/cms/news/test/"),
    );

    const result = await loadNewsArticle("test", "es");
    expect(result).toEqual({ status: "error" });
  });

  it("returns article on success", async () => {
    vi.mocked(getNewsArticle).mockResolvedValue(mockArticle);

    const result = await loadNewsArticle("noticia-prueba", "es");
    expect(result).toEqual({ status: "ok", article: mockArticle });
  });
});

describe("buildNewsArticleMetadata", () => {
  beforeEach(() => {
    vi.mocked(getNewsArticle).mockReset();
  });

  it("returns empty metadata for 404", async () => {
    vi.mocked(getNewsArticle).mockRejectedValue(
      new ApiError("Not found", 404, "/cms/news/missing/"),
    );

    const metadata = await buildNewsArticleMetadata("missing", "es");
    expect(metadata).toEqual({});
  });

  it("returns generic press metadata for server errors", async () => {
    vi.mocked(getNewsArticle).mockRejectedValue(
      new ApiError("Internal Server Error", 500, "/cms/news/test/"),
    );

    const metadata = await buildNewsArticleMetadata("test", "es");
    expect(metadata.title).toContain("Sala de Prensa");
    expect(metadata.description).toBeTruthy();
  });

  it("returns article SEO metadata on success", async () => {
    vi.mocked(getNewsArticle).mockResolvedValue(mockArticle);

    const metadata = await buildNewsArticleMetadata("noticia-prueba", "es");
    expect(metadata.title).toBe("SEO title");
    expect(metadata.description).toBe("SEO description");
  });
});

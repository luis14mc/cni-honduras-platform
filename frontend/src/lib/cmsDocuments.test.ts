import { describe, expect, it } from "vitest";
import { ApiError } from "@/src/lib/api";
import {
  documentActionLabel,
  documentLinkRel,
  documentOpenUrl,
  formatDocumentFileSize,
  isExternalDocument,
} from "@/src/lib/cmsDocuments";
import type { CmsDocument } from "@/src/types/cms";

const baseDoc: CmsDocument = {
  id: 1,
  title: "Guía",
  slug: "guia",
  file: "/media/documents/2026/01/guia.pdf",
  external_url: "",
  description: "Descripción",
  category: "institucional",
  is_featured: false,
  order: 0,
  cover_image: null,
  file_type: "pdf",
  file_size_bytes: 2048,
  published_at: "2026-01-01T00:00:00Z",
  document_date: null,
  seo_title: "",
  seo_description: "",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("documentOpenUrl", () => {
  it("prefers absolute file_url over relative file", () => {
    const doc = {
      ...baseDoc,
      file: "/media/documents/2026/01/guia.pdf",
      file_url: "https://api.example.com/media/documents/2026/01/guia.pdf",
    };
    expect(documentOpenUrl(doc)).toBe(doc.file_url);
  });

  it("resolves relative file when file_url missing", () => {
    const url = documentOpenUrl(baseDoc);
    expect(url).toBeTruthy();
    expect(url).toContain("/media/documents/2026/01/guia.pdf");
  });

  it("uses external URL when no file", () => {
    const doc = { ...baseDoc, file: "", file_url: null, external_url: "https://example.com/study.pdf" };
    expect(documentOpenUrl(doc)).toBe("https://example.com/study.pdf");
  });

  it("returns null when neither source exists", () => {
    const doc = { ...baseDoc, file: "", file_url: null, external_url: "" };
    expect(documentOpenUrl(doc)).toBeNull();
  });
});

describe("isExternalDocument", () => {
  it("detects external-only documents", () => {
    expect(isExternalDocument({ ...baseDoc, file: "", external_url: "https://example.com/x.pdf" })).toBe(true);
    expect(isExternalDocument(baseDoc)).toBe(false);
  });
});

describe("documentLinkRel", () => {
  it("uses safe rel for external links", () => {
    const external = { ...baseDoc, file: "", external_url: "https://example.com/x.pdf" };
    expect(documentLinkRel(external)).toBe("noopener noreferrer");
  });
});

describe("formatDocumentFileSize", () => {
  it("formats KB and MB", () => {
    expect(formatDocumentFileSize(2048, "es")).toBe("2 KB");
    expect(formatDocumentFileSize(2 * 1024 * 1024, "en")).toBe("2.0 MB");
  });

  it("returns empty string for missing size", () => {
    expect(formatDocumentFileSize(null, "es")).toBe("");
  });
});

describe("documentActionLabel", () => {
  it("labels external documents", () => {
    const external = { ...baseDoc, file: "", external_url: "https://example.com/x.pdf" };
    expect(documentActionLabel(external, "es")).toBe("Abrir enlace");
    expect(documentActionLabel(external, "en")).toBe("Open link");
  });

  it("labels internal files", () => {
    expect(documentActionLabel(baseDoc, "en")).toBe("Open");
  });
});

describe("ApiError classification for detail pages", () => {
  it("treats 404 as missing document", () => {
    const error = new ApiError("Not found", 404, "/cms/documents/missing/");
    expect(error instanceof ApiError && error.status === 404).toBe(true);
  });

  it("treats network errors as service failures", () => {
    const error = new ApiError("Network", 0, "/cms/documents/test/");
    expect(error.status).toBe(0);
  });

  it("treats 500 as service failures", () => {
    const error = new ApiError("Server error", 500, "/cms/documents/test/");
    expect(error.status).toBe(500);
  });
});

import { describe, expect, it } from "vitest";
import {
  isSupportedImageUrl,
  mediaOriginFromApi,
  resolveMediaFileUrl,
  SUPPORTED_IMAGE_EXTENSIONS,
} from "@/src/lib/mediaUrl";

describe("resolveMediaFileUrl", () => {
  it("returns absolute file_url unchanged", () => {
    expect(resolveMediaFileUrl("https://cdn.example.com/media/x.webp")).toBe(
      "https://cdn.example.com/media/x.webp",
    );
  });

  it("prefixes relative media paths with API origin (legacy helper)", () => {
    const resolved = resolveMediaFileUrl("/media/hero.webp");
    expect(resolved).toMatch(/\/media\/hero\.webp$/);
    expect(resolved!.startsWith("http")).toBe(true);
  });

  it("prefers file_url over relative file on assets", () => {
    expect(
      resolveMediaFileUrl({
        file_url: "https://cdn.example.com/a.webp",
        file: "/media/a.webp",
      }),
    ).toBe("https://cdn.example.com/a.webp");
  });

  it("falls back to file when file_url missing", () => {
    const resolved = resolveMediaFileUrl({ file_url: null, file: "/media/b.png" });
    expect(resolved).toMatch(/\/media\/b\.png$/);
  });

  it("returns null for empty input", () => {
    expect(resolveMediaFileUrl(null)).toBeNull();
    expect(resolveMediaFileUrl({ file_url: null, file: null })).toBeNull();
    expect(resolveMediaFileUrl("   ")).toBeNull();
  });
});

describe("isSupportedImageUrl", () => {
  it("accepts configured image extensions", () => {
    expect(SUPPORTED_IMAGE_EXTENSIONS).toEqual([
      "jpg",
      "jpeg",
      "png",
      "webp",
      "gif",
      "svg",
    ]);
    for (const ext of SUPPORTED_IMAGE_EXTENSIONS) {
      expect(isSupportedImageUrl(`https://cdn.example.com/a.${ext}`)).toBe(true);
    }
  });

  it("ignores query strings when detecting extension", () => {
    expect(isSupportedImageUrl("https://cdn.example.com/a.webp?token=1")).toBe(true);
  });

  it("rejects non-image or missing urls", () => {
    expect(isSupportedImageUrl("https://cdn.example.com/a.pdf")).toBe(false);
    expect(isSupportedImageUrl(null)).toBe(false);
  });
});

describe("mediaOriginFromApi", () => {
  it("strips /api/v1 suffix", () => {
    expect(mediaOriginFromApi()).toMatch(/localhost:8000$/);
  });
});

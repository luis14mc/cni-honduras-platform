import { describe, expect, it } from "vitest";
import { mediaOriginFromApi, resolveMediaFileUrl } from "@/src/lib/mediaUrl";

describe("resolveMediaFileUrl", () => {
  it("returns absolute URLs unchanged", () => {
    expect(resolveMediaFileUrl("https://api-test.cni.hn/media/x.webp")).toBe(
      "https://api-test.cni.hn/media/x.webp",
    );
  });

  it("prefixes relative media paths with API origin", () => {
    const resolved = resolveMediaFileUrl("/media/hero.webp");
    expect(resolved).toMatch(/\/media\/hero\.webp$/);
    expect(resolved!.startsWith("http")).toBe(true);
  });

  it("returns null for empty input", () => {
    expect(resolveMediaFileUrl(null)).toBeNull();
  });
});

describe("mediaOriginFromApi", () => {
  it("strips /api/v1 suffix", () => {
    expect(mediaOriginFromApi()).toMatch(/localhost:8000$/);
  });
});

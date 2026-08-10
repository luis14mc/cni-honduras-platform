import { describe, expect, it } from "vitest";
import { HOME_HERO_IMAGES } from "@/src/lib/homeHero";

describe("HOME_HERO_IMAGES", () => {
  it("exposes the four structural home carousel assets", () => {
    expect(HOME_HERO_IMAGES).toEqual([
      "/images/hero/home/agricultura.webp",
      "/images/hero/home/turismo.webp",
      "/images/hero/home/energia.webp",
      "/images/hero/home/logistica.webp",
    ]);
  });

  it("uses public static paths, not CMS media URLs", () => {
    for (const src of HOME_HERO_IMAGES) {
      expect(src.startsWith("/images/hero/home/")).toBe(true);
      expect(src.includes("/media/")).toBe(false);
    }
  });
});

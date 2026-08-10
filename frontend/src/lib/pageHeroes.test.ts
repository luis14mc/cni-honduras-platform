import { describe, expect, it } from "vitest";
import { HOME_HERO_IMAGES } from "@/src/lib/homeHero";
import { isCmsMediaHeroUrl, PAGE_HEROES } from "@/src/lib/pageHeroes";
import { sectorPhotoHeaders } from "@/src/lib/sectorIcons";
import type { SectorSlug } from "@/src/data/investmentSectors";

describe("architectural rule: page heroes are static", () => {
  it("home hero uses public static assets only", () => {
    expect(PAGE_HEROES.home.images).toEqual(HOME_HERO_IMAGES);
    for (const src of PAGE_HEROES.home.images) {
      expect(src.startsWith("/images/")).toBe(true);
      expect(isCmsMediaHeroUrl(src)).toBe(false);
    }
  });

  it("news / documents / casos / opportunities heroes are not CMS media URLs", () => {
    const heroes = [
      PAGE_HEROES.prensa.image,
      PAGE_HEROES.prensaArticle.image,
      PAGE_HEROES.recursos.image,
      PAGE_HEROES.casos.image,
      PAGE_HEROES.oportunidades.image,
    ];
    for (const src of heroes) {
      expect(typeof src).toBe("string");
      expect(src.length).toBeGreaterThan(0);
      expect(isCmsMediaHeroUrl(src)).toBe(false);
    }
  });

  it("sector photo headers cover all sector slugs without API fallback", () => {
    const slugs: SectorSlug[] = [
      "agroindustria",
      "manufactura",
      "turismo",
      "energia",
      "infraestructura",
      "logistica",
    ];
    for (const slug of slugs) {
      const src = sectorPhotoHeaders[slug];
      expect(src, `missing static hero for ${slug}`).toBeTruthy();
      expect(isCmsMediaHeroUrl(src)).toBe(false);
    }
  });

  it("detects CMS media URLs so regressions fail loudly", () => {
    expect(isCmsMediaHeroUrl("https://api-test.cni.hn/media/x.webp")).toBe(true);
    expect(isCmsMediaHeroUrl("/api/v1/cms/banners/?placement=home_hero")).toBe(true);
    expect(isCmsMediaHeroUrl("/images/hero/home/agricultura.webp")).toBe(false);
  });
});

/**
 * Structural page heroes — frontend only.
 *
 * Page heroes are static frontend assets and are outside CMS scope.
 * Never fetch hero backgrounds from SiteBanner, Page, MediaAsset, News,
 * Document, SuccessStory, or any CMS/API endpoint.
 *
 * CMS content (articles, documents, stories) may appear *below* the hero.
 */

import { designImages } from "@/src/lib/designAssets";
import { HOME_HERO_IMAGES } from "@/src/lib/homeHero";

export const PAGE_HEROES = {
  home: {
    source: "static-public" as const,
    images: HOME_HERO_IMAGES,
  },
  prensa: {
    source: "design-assets" as const,
    image: designImages.prensa.hero,
  },
  prensaArticle: {
    source: "design-assets" as const,
    /** Same structural hero for every article detail — not featured_image. */
    image: designImages.prensa.hero,
  },
  recursos: {
    source: "design-assets" as const,
    image: designImages.recursos.hero,
  },
  casos: {
    source: "design-assets" as const,
    image: designImages.casos.sinclairHero,
  },
  asesoria: {
    source: "design-assets" as const,
    image: designImages.cni.heroCity,
  },
  portfolio: {
    source: "design-assets" as const,
    image: designImages.portfolio.hero,
  },
} as const;

/** True if a URL looks like a CMS/media API path (must never be a page hero). */
export function isCmsMediaHeroUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return (
    url.includes("/media/") ||
    url.includes("/api/v1/cms") ||
    url.includes("cms-admin")
  );
}

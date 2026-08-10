/**
 * Structural home hero images — static assets under /public.
 * Must NOT depend on CMS SiteBanner / MediaAsset.
 */
export const HOME_HERO_IMAGES = [
  "/images/hero/home/agricultura.webp",
  "/images/hero/home/turismo.webp",
  "/images/hero/home/energia.webp",
  "/images/hero/home/logistica.webp",
] as const;

export type HomeHeroImageSrc = (typeof HOME_HERO_IMAGES)[number];

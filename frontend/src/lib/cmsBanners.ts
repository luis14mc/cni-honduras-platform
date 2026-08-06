import type { Locale } from "@/src/i18n/config";
import type { SiteBanner } from "@/src/types/cms";

/** URL del CTA: alias de API o campo legacy. */
export function bannerCtaUrl(banner: SiteBanner): string {
  return banner.cta_url || banner.link_url || "";
}

export function bannerOpensInNewTab(banner: SiteBanner): boolean {
  return banner.open_in_new_tab ?? banner.link_external;
}

export function bannerDesktopImage(banner: SiteBanner): string | null {
  return banner.image?.file ?? null;
}

export function bannerMobileImage(banner: SiteBanner): string | null {
  return banner.mobile_image?.file ?? bannerDesktopImage(banner);
}

export function bannerHasCta(banner: SiteBanner): boolean {
  const url = bannerCtaUrl(banner);
  return Boolean(url && banner.cta_label);
}

export function bannerCtaRel(banner: SiteBanner): string | undefined {
  return bannerOpensInNewTab(banner) ? "noopener noreferrer" : undefined;
}

/** Imágenes de slides del hero (solo banners con imagen de escritorio). */
export function heroSlideImages(banners: SiteBanner[]): string[] {
  return banners
    .map((banner) => bannerDesktopImage(banner))
    .filter((src): src is string => Boolean(src));
}

export function primaryHeroBanner(banners: SiteBanner[]): SiteBanner | null {
  return banners[0] ?? null;
}

export const heroFallbackLabels = {
  es: { imageAlt: "Comisión Nacional de Inversiones" },
  en: { imageAlt: "National Investment Commission" },
} as const;

export function heroImageAlt(locale: Locale, banner: SiteBanner | null): string {
  if (banner?.title) return banner.title;
  return heroFallbackLabels[locale].imageAlt;
}

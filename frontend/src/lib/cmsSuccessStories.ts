import type { Locale } from "@/src/i18n/config";
import type { SuccessStory } from "@/src/types/investment";

/** Imagen principal del caso desde CMS; null si no hay archivo. */
export function successStoryCoverImage(story: SuccessStory): string | null {
  return story.image || null;
}

/** Logo institucional del caso desde CMS. */
export function successStoryLogoImage(story: SuccessStory): string | null {
  return story.logo?.file ?? null;
}

export function successStoryDetailPath(slug: string): string {
  return `/portafolio/casos/${slug}`;
}

export function successStoryDetailHref(locale: Locale, slug: string): string {
  if (locale === "en") {
    return `/en/portfolio/success-stories/${slug}`;
  }
  return `/portafolio/casos/${slug}`;
}

export function successStoryDisplayName(story: SuccessStory): string {
  return story.testimonial_author || story.company_name || story.title;
}

export function successStoryQuote(story: SuccessStory): string {
  return story.testimonial_quote || story.summary;
}

export function formatSuccessStoryInvestment(
  locale: Locale,
  amount: string | null,
): string | null {
  if (amount == null || amount === "") return null;
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "es-HN", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function formatSuccessStoryJobs(locale: Locale, jobs: number | null): string | null {
  if (jobs == null) return null;
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "es-HN").format(jobs);
}

export function successStoryHasCover(story: SuccessStory): boolean {
  return Boolean(successStoryCoverImage(story));
}

export function successStoryHasLogo(story: SuccessStory): boolean {
  return Boolean(successStoryLogoImage(story));
}

/** Iniciales estructurales cuando no hay logo en CMS. */
export function successStoryInitials(story: SuccessStory): string {
  const source = story.company_name || story.title;
  const parts = source.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CNI";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

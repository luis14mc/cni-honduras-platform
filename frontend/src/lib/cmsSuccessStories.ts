import type { Locale } from "@/src/i18n/config";
import { resolveMediaFileUrl } from "@/src/lib/mediaUrl";
import type { SuccessStory } from "@/src/types/investment";

function mediaUrl(
  asset: { file?: string | null; file_url?: string | null } | null | undefined,
): string | null {
  if (!asset) return null;
  return resolveMediaFileUrl(asset.file_url || asset.file);
}

/**
 * Imagen principal del caso: featured_image (MediaAsset).
 * Fallback legacy `image` solo para casos antiguos sin featured_image.
 */
export function successStoryCoverImage(story: SuccessStory): string | null {
  const featured = mediaUrl(story.featured_image);
  if (featured) return featured;
  return resolveMediaFileUrl(story.image);
}

/** Logo institucional del caso (nunca featured ni person). */
export function successStoryLogoImage(story: SuccessStory): string | null {
  return mediaUrl(story.logo);
}

/** Foto de la persona / testimonio. */
export function successStoryPersonPhoto(story: SuccessStory): string | null {
  return mediaUrl(story.person_photo);
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
  return story.person_name || story.testimonial_author || story.company_name || story.title;
}

export function successStoryPersonRole(story: SuccessStory): string {
  return story.person_role || story.company_name || "";
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

export function successStoryHasPersonPhoto(story: SuccessStory): boolean {
  return Boolean(successStoryPersonPhoto(story));
}

/** Iniciales estructurales cuando no hay logo en CMS. */
export function successStoryInitials(story: SuccessStory): string {
  const source = story.company_name || story.title;
  const parts = source.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CNI";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

/** Map API story → card fields with correct media roles (no redesign). */
export function mapSuccessStoryToCard(story: SuccessStory, locale: Locale) {
  return {
    slug: story.slug,
    title: story.title,
    company: story.company_name,
    summary: story.summary,
    name: successStoryDisplayName(story),
    role: successStoryPersonRole(story),
    authorName: story.person_name || story.testimonial_author,
    authorRole: successStoryPersonRole(story),
    quote: successStoryQuote(story),
    caseTitle: story.title,
    cover: successStoryCoverImage(story),
    photo: successStoryCoverImage(story),
    personPhoto: successStoryPersonPhoto(story),
    logo: successStoryLogoImage(story),
    initials: successStoryInitials(story),
    logoAlt: story.company_name || story.title,
    sectorName: story.sector?.name ?? null,
    sectorColor: story.sector?.color_hex || null,
    country: story.country_origin || null,
    investment: formatSuccessStoryInvestment(locale, story.investment_amount),
    jobs: formatSuccessStoryJobs(locale, story.jobs_generated),
  };
}

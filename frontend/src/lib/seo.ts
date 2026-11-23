import type { Metadata } from "next";
import { isLocale, type Locale } from "@/src/i18n/config";
import { designImages } from "@/src/lib/designAssets";

const DEFAULT_OG_IMAGE = designImages.portfolio.hero;

export function siteUrl(path: string): string {
  return new URL(path, process.env.NEXT_PUBLIC_SITE_URL || "https://cni.hn").href;
}

export function alternateLanguages(paths: Partial<Record<Locale, string>>) {
  const fallback = paths.es ?? paths.en;
  return { ...paths, ...(fallback ? { "x-default": fallback } : {}) };
}

export type PageSeo = {
  /** Slug interno canónico ES (e.g. "/invertir", "/crecer", "/cni/servicios-legales"). */
  canonical: string;
  /** Mirror EN (e.g. "/en/invest"). */
  enMirror: string;
  /** Titles por locale (sin la marca; el template global la añade). */
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  keywords?: string[];
  /** Image absoluta o relativa al metadataBase. */
  ogImage?: string;
};

/** Factory para generar `generateMetadata` desde una clave de PAGE_SEO. */
export function makeGenerateMetadata(
  seo: PageSeo,
): (args: { params: Promise<{ locale: string }> }) => Promise<Metadata> {
  return async ({ params }) => {
    const { locale: raw } = await params;
    const locale: Locale = isLocale(raw) ? (raw as Locale) : "es";
    return buildMetadata(seo, locale);
  };
}

export function buildMetadata(seo: PageSeo, locale: Locale): Metadata {
  const title = seo.title[locale];
  const description = seo.description[locale];
  const canonical = locale === "es" ? seo.canonical : seo.enMirror;
  const image = seo.ogImage || DEFAULT_OG_IMAGE;
  return {
    title,
    description,
    keywords: seo.keywords,
    alternates: {
      canonical,
      languages: { es: seo.canonical, en: seo.enMirror, "x-default": seo.canonical },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function buildDetailMetadata(options: {
  locale: Locale;
  slugPath: string;
  /** Ruta canónica EN cuando difiere de `/en` + slugPath (p. ej. `/en/news/...`). */
  enMirrorPath?: string;
  title: string;
  description?: string;
  image?: string | null;
  type?: "website" | "article";
}): Metadata {
  const { locale, slugPath, enMirrorPath, title, description, image } = options;
  const esPath = slugPath.startsWith("/") ? slugPath : `/${slugPath}`;
  const enPath = enMirrorPath ?? `/en${esPath}`;
  const resolvedImage = image || DEFAULT_OG_IMAGE;

  return {
    title,
    description: description?.trim() || title,
    alternates: {
      canonical: locale === "es" ? esPath : enPath,
      languages: { es: esPath, en: enPath, "x-default": esPath },
    },
    openGraph: {
      title,
      description: description?.trim() || title,
      url: locale === "es" ? esPath : enPath,
      type: options.type ?? "article",
      images: [{ url: resolvedImage, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description: description?.trim() || title, images: [resolvedImage] },
  };
}

export type Crumb = { name: string; item: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.item,
    })),
  };
}

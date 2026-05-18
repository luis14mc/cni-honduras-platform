import type { Metadata } from "next";
import { isLocale, type Locale } from "@/src/i18n/config";

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
  return {
    title,
    description,
    keywords: seo.keywords,
    alternates: {
      canonical,
      languages: { es: seo.canonical, en: seo.enMirror },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: seo.ogImage ? [{ url: seo.ogImage, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
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

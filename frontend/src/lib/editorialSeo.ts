import type { Metadata } from "next";
import { cache } from "react";
import type { Locale } from "@/src/i18n/config";
import { alternateLanguages, buildDetailMetadata, siteUrl } from "@/src/lib/seo";
import { getEditorialSeoIndex, type EditorialSeoCollection } from "@/src/lib/strapi/editorial";

export const editorialCollections = ["pages", "news", "successStories"] as const;

const prefixes: Record<EditorialSeoCollection, Record<Locale, string>> = {
  pages: { es: "/institucional", en: "/en/institutional" },
  news: { es: "/prensa", en: "/en/news" },
  successStories: { es: "/portafolio/casos", en: "/en/portfolio/success-stories" },
};

export function editorialPath(collection: EditorialSeoCollection, locale: Locale, slug: string): string {
  return `${prefixes[collection][locale]}/${encodeURIComponent(slug)}`;
}

export const editorialIndex = cache(async (collection: EditorialSeoCollection, locale: Locale) => {
  const rows = await Promise.resolve().then(() => getEditorialSeoIndex(collection, locale)).catch(() => []);
  return rows.filter((row) => !row.noindex && (
    !row.canonical || siteUrl(row.canonical) === siteUrl(editorialPath(collection, locale, row.slug))
  ));
});

export async function editorialPaths(collection: EditorialSeoCollection, locale: Locale, slug: string) {
  const paths: Partial<Record<Locale, string>> = { [locale]: editorialPath(collection, locale, slug) };
  const other = locale === "es" ? "en" : "es";
  const [current, counterparts] = await Promise.all([
    editorialIndex(collection, locale), editorialIndex(collection, other),
  ]);
  const currentEntry = current.find((row) => row.slug === slug);
  const counterpart = currentEntry && counterparts.find((row) => row.documentId === currentEntry.documentId);
  if (counterpart) paths[other] = editorialPath(collection, other, counterpart.slug);
  return paths;
}

export async function buildEditorialMetadata(options: {
  collection: EditorialSeoCollection;
  locale: Locale;
  slug: string;
  title: string;
  description?: string;
  image?: string | null;
  canonical?: string | null;
  noindex?: boolean;
}): Promise<Metadata> {
  const { collection, locale, slug } = options;
  const paths = await editorialPaths(collection, locale, slug);
  const current = editorialPath(collection, locale, slug);
  const canonical = options.canonical || current;
  const base = buildDetailMetadata({
    ...options,
    slugPath: paths.es ?? current,
    enMirrorPath: paths.en ?? current,
    type: collection === "news" ? "article" : "website",
  });
  return {
    ...base,
    alternates: {
      canonical,
      languages: options.noindex || siteUrl(canonical) !== siteUrl(current) ? undefined : alternateLanguages(paths),
    },
    openGraph: base.openGraph ? { ...base.openGraph, url: canonical } : undefined,
    robots: options.noindex ? { index: false, follow: true, googleBot: { index: false } } : undefined,
  };
}

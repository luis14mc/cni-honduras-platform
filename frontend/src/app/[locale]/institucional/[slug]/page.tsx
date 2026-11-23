import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { InstitutionalPageContent } from "@/src/components/strapi/InstitutionalPageContent";
import { isLocale } from "@/src/i18n/config";
import { StrapiApiError } from "@/src/lib/strapi/client";
import { getInstitutionalPage } from "@/src/lib/strapi/editorial";

type Props = { params: Promise<{ locale: string; slug: string }> };

const loadPage = cache(async (locale: string, slug: string) => {
  if (!isLocale(locale)) notFound();
  try {
    return await getInstitutionalPage(locale, slug);
  } catch (error) {
    if (error instanceof StrapiApiError && error.status === 404) notFound();
    throw error;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await loadPage(locale, slug);
  const canonical = page.seo.canonical || `${locale === "en" ? "/en" : ""}/institucional/${encodeURIComponent(page.slug)}`;
  const title = page.seo.title || page.title;
  const description = page.seo.description || page.summary || undefined;
  return {
    title,
    description,
    alternates: { canonical },
    robots: page.seo.noindex ? { index: false } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      images: page.seo.image ? [page.seo.image] : undefined,
    },
  };
}

export default async function InstitutionalPage({ params }: Props) {
  const { locale, slug } = await params;
  return <InstitutionalPageContent page={await loadPage(locale, slug)} />;
}

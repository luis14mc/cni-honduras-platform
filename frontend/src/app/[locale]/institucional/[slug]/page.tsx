import { buildEditorialMetadata } from "@/src/lib/editorialSeo";
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
  if (!isLocale(locale)) notFound();
  return buildEditorialMetadata({
    collection: "pages",
    locale,
    slug: page.slug,
    title: page.seo.title || page.title,
    description: page.seo.description || page.summary,
    image: page.seo.image,
    canonical: page.seo.canonical,
    noindex: page.seo.noindex,
  });
}

export default async function InstitutionalPage({ params }: Props) {
  const { locale, slug } = await params;
  return <InstitutionalPageContent page={await loadPage(locale, slug)} />;
}

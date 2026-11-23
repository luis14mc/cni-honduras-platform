import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsArticleContent } from "@/src/components/news/NewsArticleContent";
import { SiteBannerBar } from "@/src/components/layout/SiteBannerBar";
import { InstitutionalPageContent } from "@/src/components/strapi/InstitutionalPageContent";
import { verifyEditorialPreview } from "@/src/lib/strapi/preview";
import { StrapiApiError } from "@/src/lib/strapi/client";
import { getEditorialPreview, mapBanner, mapInstitutionalPage, mapNews } from "@/src/lib/strapi/editorial";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditorialPreview({ params, searchParams }: Props) {
  const { locale } = await params;
  const preview = verifyEditorialPreview(locale, await searchParams);
  if (!preview) notFound();
  const { collection, documentId, status } = preview;

  let raw: unknown;
  try {
    raw = await getEditorialPreview(collection, documentId, preview.locale, status);
  } catch (error) {
    if (error instanceof StrapiApiError && error.status === 404) notFound();
    throw error;
  }
  if (collection === "banners") {
    const banner = mapBanner(raw);
    if (!banner) notFound();
    return <SiteBannerBar locale={preview.locale} banners={[{ ...banner, dismissible: false }]} />;
  }
  if (collection === "news") {
    const article = mapNews(raw);
    if (!article) notFound();
    return <NewsArticleContent article={article} locale={preview.locale} />;
  }
  const page = mapInstitutionalPage(raw);
  if (!page) notFound();
  return <InstitutionalPageContent page={page} />;
}

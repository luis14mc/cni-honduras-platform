import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/src/i18n/config";
import { buildMetadata } from "@/src/lib/seo";
import { ResourcesCategoryView } from "@/src/components/cni/ResourcesCategoryView";
import { getDocuments } from "@/src/services/cms";
import type { CmsDocument } from "@/src/types/cms";
import {
  getAllResourceCategorySlugs,
  getResourceCategoryMeta,
} from "@/src/data/resourceCategoryMeta";

export function generateStaticParams() {
  return getAllResourceCategorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? (raw as Locale) : "es";
  const category = getResourceCategoryMeta(slug);
  if (!category) return {};
  return buildMetadata(category.seo, locale);
}

export default async function RecursoCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const category = getResourceCategoryMeta(slug);
  if (!category) notFound();

  let documents: CmsDocument[] = [];
  try {
    documents = await getDocuments({ category: category.slug, locale });
  } catch {
    documents = [];
  }

  return (
    <ResourcesCategoryView locale={locale} category={category} documents={documents} />
  );
}

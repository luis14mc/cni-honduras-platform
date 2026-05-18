import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/src/i18n/config";
import { buildMetadata } from "@/src/lib/seo";
import { ResourcesCategoryView } from "@/src/components/cni/ResourcesCategoryView";
import {
  getAllResourceCategorySlugs,
  getResourceCategory,
} from "@/src/data/resourceCategories";

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
  const category = getResourceCategory(slug);
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
  const category = getResourceCategory(slug);
  if (!category) notFound();

  return <ResourcesCategoryView locale={raw as Locale} category={category} />;
}

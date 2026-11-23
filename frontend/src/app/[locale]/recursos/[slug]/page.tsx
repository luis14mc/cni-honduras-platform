import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { isLocale, type Locale } from "@/src/i18n/config";
import { buildMetadata } from "@/src/lib/seo";
import { ResourcesCategoryView } from "@/src/components/cni/ResourcesCategoryView";
import { getDocuments, getResourceCategories } from "@/src/lib/strapi/editorial";
import type { CmsDocument, ResourceCategory } from "@/src/types/cms";
import { getResourceCategoryMeta, strapiCategoryMeta } from "@/src/data/resourceCategoryMeta";
import { loadAsyncData } from "@/src/lib/asyncData";

const loadCategory = cache(async (locale: Locale, slug: string) => {
  const categories = await loadAsyncData(() => getResourceCategories(locale), [] as ResourceCategory[]);
  const legacy = getResourceCategoryMeta(slug);
  const legacyMirror = locale === "en" ? legacy?.seo.enMirror.split("/").at(-1) : undefined;
  const category = categories.data.find((item) => item.slug === slug || item.slug === legacyMirror);
  const meta = category ? strapiCategoryMeta(category) : legacy;
  if (meta && category && legacy) {
    meta.seo.canonical = legacy.seo.canonical;
    meta.seo.enMirror = legacy.seo.enMirror;
  }
  return {
    status: categories.status,
    category,
    meta,
  };
});

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const { meta } = await loadCategory(locale, slug);
  return meta ? buildMetadata(meta.seo, locale) : {};
}

export default async function RecursoCategoryPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const { category, meta, status } = await loadCategory(locale, slug);
  if (!meta && status === "error") {
    return <p role="alert" className="mx-auto my-12 max-w-prose px-6 text-red-800">
      {locale === "es" ? "No pudimos cargar las categorías." : "We could not load the categories."}
    </p>;
  }
  if (!meta) notFound();

  const result = await loadAsyncData(async () => {
    const options = {
      category: getResourceCategoryMeta(slug)?.slug,
      resourceCategoryId: category?.documentId,
    };
    const other = locale === "es" ? "en" : "es";
    const [primary, secondary] = await Promise.all([
      getDocuments(locale, options),
      getDocuments(other, options),
    ]);
    return [...primary, ...secondary];
  }, [] as CmsDocument[]);

  return <ResourcesCategoryView locale={locale} category={meta} documents={result.data} loadStatus={result.status} />;
}

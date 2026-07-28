import { notFound } from "next/navigation";
import { FacilidadesMigratoriasPageView } from "@/src/components/cni/FacilidadesMigratoriasPageView";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["facilidades-migratorias"]);

export default async function FacilidadesMigratoriasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  return <FacilidadesMigratoriasPageView locale={raw as Locale} />;
}

import { notFound } from "next/navigation";
import { AsesoriaPageView } from "@/src/components/cni/AsesoriaPageView";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO.asesoria);

export default async function AsesoriaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  return <AsesoriaPageView locale={raw as Locale} />;
}

import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { CniDataPageView } from "@/src/components/cni/CniDataPageView";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["cni-inteligencia-datos"]);

export default async function InteligenciaDatosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  return <CniDataPageView locale={raw as Locale} />;
}

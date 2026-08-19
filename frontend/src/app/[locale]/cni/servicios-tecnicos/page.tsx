import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { CniTechnicalPageView } from "@/src/components/cni/CniTechnicalPageView";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["cni-servicios-tecnicos"]);

export default async function ServiciosTecnicosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  return <CniTechnicalPageView locale={raw as Locale} />;
}

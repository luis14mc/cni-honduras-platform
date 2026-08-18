import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { CniLegalPageView } from "@/src/components/cni/CniLegalPageView";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["cni-servicios-legales"]);

export default async function ServiciosLegalesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  return <CniLegalPageView locale={raw as Locale} />;
}

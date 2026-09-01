import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { PortafolioPageView } from "@/src/components/cni/PortafolioPageView";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO.portafolio);

export default async function PortafolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  return <PortafolioPageView locale={locale} />;
}

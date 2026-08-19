import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { VivirPageView } from "@/src/components/cni/VivirPageView";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO.vivir);

export default async function VivirPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  return <VivirPageView locale={raw as Locale} />;
}

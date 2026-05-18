import { notFound } from "next/navigation";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { isSectorSlug } from "@/src/data/investmentSectors";
import { SectorDetailView } from "@/src/components/cni/SectorDetailView";

export function generateStaticParams() {
  return (["agroindustria", "manufactura", "turismo", "energia", "infraestructura"] as const).map((slug) => ({
    slug,
  }));
}

export default async function SectorPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw) || !isSectorSlug(slug)) notFound();
  return <SectorDetailView locale={raw as Locale} slug={slug} />;
}

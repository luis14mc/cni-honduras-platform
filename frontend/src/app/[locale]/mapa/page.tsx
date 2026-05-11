import { notFound } from "next/navigation";
import { MapaPageClient } from "@/src/components/map/MapaPageClient";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";

export default async function MapaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  return <MapaPageClient locale={raw as Locale} />;
}

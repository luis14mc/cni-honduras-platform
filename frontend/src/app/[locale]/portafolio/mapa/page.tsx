import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { HondurasMapDashboardEmbed } from "@/src/components/map/HondurasMapDashboardEmbed";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["portafolio-mapa"]);

const copy = {
  es: {
    title: "Mapa Interactivo de Inversión",
  },
  en: {
    title: "Interactive Investment Map",
  },
} as const;

export default async function MapaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = copy[locale];

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#252A58] text-white">
      <h1 className="sr-only">{c.title}</h1>
      <main className="relative flex min-h-[720px] w-full items-center justify-center bg-[#252A58] px-4 pb-10 pt-32 sm:px-6 lg:px-8">
        <div className="relative mx-auto flex w-full max-w-[1500px] items-center justify-center">
          <HondurasMapDashboardEmbed />
        </div>
      </main>
    </div>
  );
}

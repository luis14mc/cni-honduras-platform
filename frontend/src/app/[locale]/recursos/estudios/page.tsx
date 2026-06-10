import { notFound } from "next/navigation";
import { EstudiosPageView } from "@/src/components/cni/EstudiosPageView";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";

export const generateMetadata = makeGenerateMetadata({
  canonical: "/recursos/estudios",
  enMirror: "/en/resources/studies",
  title: {
    es: "Estudios Estratégicos | CNI Honduras",
    en: "Strategic Studies | CNI Honduras",
  },
  description: {
    es: "Estudios sectoriales para impulsar nuevas oportunidades de inversión.",
    en: "Sector studies to boost new investment opportunities.",
  },
});

export default async function EstudiosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <EstudiosPageView locale={locale as Locale} />;
}

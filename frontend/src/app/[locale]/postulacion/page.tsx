import { notFound } from "next/navigation";
import { PostulacionPageView } from "@/src/components/cni/PostulacionPageView";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";

export const generateMetadata = makeGenerateMetadata({
  canonical: "/postulacion",
  enMirror: "/en/application",
  title: {
    es: "Postulación de Proyectos | CNI Honduras",
    en: "Project Application | CNI Honduras",
  },
  description: {
    es: "Postule su proyecto de inversión ante el CNI para recibir acompañamiento institucional.",
    en: "Submit your investment project to CNI for institutional support.",
  },
});

export default async function PostulacionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <PostulacionPageView locale={locale as Locale} />;
}

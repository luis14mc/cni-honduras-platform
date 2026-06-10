import { notFound } from "next/navigation";
import { PostulacionPageView } from "@/src/components/cni/PostulacionPageView";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";

export const generateMetadata = makeGenerateMetadata({
  canonical: "/postulacion-de-proyectos",
  enMirror: "/en/postulacion-de-proyectos",
  title: {
    es: "Postulación de Proyectos | CNI Honduras",
    en: "Project Submission | CNI Honduras",
  },
  description: {
    es: "Un proyecto de inversión es una iniciativa lista para desarrollarse. Postula tu proyecto en el CNI.",
    en: "An investment project is a ready-to-develop initiative. Submit your project to the CNI.",
  },
});

export default async function PostulacionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <PostulacionPageView locale={locale as Locale} />;
}

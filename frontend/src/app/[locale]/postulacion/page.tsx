import { notFound } from "next/navigation";
import { PostulacionPageView } from "@/src/components/cni/PostulacionPageView";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { getSectors } from "@/src/services/investment";
import type { Sector } from "@/src/types/investment";
import { loadAsyncData } from "@/src/lib/asyncData";
import { postulacionPageCopy } from "@/src/i18n/copy/postulacionPage";

export const generateMetadata = makeGenerateMetadata({
  canonical: "/postula-tu-proyecto",
  enMirror: "/en/submit-your-project",
  title: {
    es: postulacionPageCopy.es.metadata.title,
    en: postulacionPageCopy.en.metadata.title,
  },
  description: {
    es: postulacionPageCopy.es.metadata.description,
    en: postulacionPageCopy.en.metadata.description,
  },
});

export default async function PostulacionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const result = await loadAsyncData(() => getSectors({ locale: locale as Locale }), [] as Sector[]);
  const sectors = [...result.data]
    .filter((sector) => sector.is_active)
    .sort((a, b) => a.order - b.order)
    .map((sector) => ({ slug: sector.slug, name: sector.name }));

  return (
    <PostulacionPageView
      locale={locale as Locale}
      sectors={sectors}
      sectorsStatus={result.status}
    />
  );
}

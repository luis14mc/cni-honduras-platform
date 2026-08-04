import { notFound } from "next/navigation";
import { PostulacionPageView } from "@/src/components/cni/PostulacionPageView";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { getSectors } from "@/src/services/investment";
import type { Sector } from "@/src/types/investment";
import { loadAsyncData } from "@/src/lib/asyncData";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["postulacion-de-proyectos"]);

export default async function PostulacionDeProyectosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
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

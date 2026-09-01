import { notFound } from "next/navigation";
import { PortfolioSectorPage } from "@/src/components/cni/PortfolioSectorPage";
import { isLocale, type Locale } from "@/src/i18n/config";
import { loadAsyncData } from "@/src/lib/asyncData";
import { getDocuments } from "@/src/lib/strapi/editorial";
import type { CmsDocument } from "@/src/types/cms";

export default async function OpportunityCardsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const documents = await loadAsyncData(
    () => getDocuments(locale, { documentType: "opportunity_card" }),
    [] as CmsDocument[],
  );
  return <PortfolioSectorPage locale={locale} type="opportunities" documents={documents} />;
}

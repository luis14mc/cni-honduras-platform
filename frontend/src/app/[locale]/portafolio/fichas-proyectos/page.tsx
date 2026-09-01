import { notFound } from "next/navigation";
import { PortfolioSectorPage } from "@/src/components/cni/PortfolioSectorPage";
import { isLocale, type Locale } from "@/src/i18n/config";

export default async function ProjectSheetsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  return <PortfolioSectorPage locale={raw as Locale} type="sheets" />;
}

import { notFound } from "next/navigation";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import {
  getSectorBySlug,
  isSectorSlug,
  mergeSectorWithApi,
  SECTOR_SLUGS,
} from "@/src/data/investmentSectors";
import {
  getOpportunitiesBySector,
  getProjectsBySector,
  getSector,
  getSuccessStoriesBySector,
} from "@/src/services/investment";
import { SectorDetailView } from "@/src/components/cni/SectorDetailView";
import type { InvestmentOpportunity, InvestmentProject, SuccessStory } from "@/src/types/investment";
import Link from "next/link";
import { resolveHref } from "@/src/i18n/path";

export function generateStaticParams() {
  return SECTOR_SLUGS.map((slug) => ({ slug }));
}

export default async function SectorPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw) || !isSectorSlug(slug)) notFound();

  const locale = raw as Locale;
  const fallback = getSectorBySlug(locale, slug);
  if (!fallback) notFound();

  let sector = fallback;
  let apiOk = false;
  try {
    const apiSector = await getSector(slug, { locale });
    sector = mergeSectorWithApi(fallback, apiSector);
    apiOk = true;
  } catch {
    apiOk = false;
  }

  if (!apiOk) {
    const L = (p: string) => resolveHref(locale, p);
    return (
      <div className="-mt-28 flex flex-1 flex-col items-center justify-center bg-[#f8f9ff] px-8 py-40">
        <div
          role="alert"
          className="max-w-xl rounded-xl border border-red-200 bg-white p-10 text-center shadow-md"
        >
          <p className="text-lg font-medium text-red-800">
            {locale === "es"
              ? "No pudimos cargar este sector desde el CMS. Intente de nuevo más tarde."
              : "We could not load this sector from the CMS. Please try again later."}
          </p>
          <Link
            href={L("/invertir/sectores")}
            className="mt-6 inline-block font-bold text-[#252A58] underline"
          >
            {locale === "es" ? "Volver a sectores" : "Back to sectors"}
          </Link>
        </div>
      </div>
    );
  }

  let opportunities: InvestmentOpportunity[] = [];
  try {
    opportunities = await getOpportunitiesBySector(slug);
  } catch {
    opportunities = [];
  }

  let projects: InvestmentProject[] = [];
  try {
    projects = await getProjectsBySector(slug);
  } catch {
    projects = [];
  }

  let successStories: SuccessStory[] = [];
  try {
    successStories = await getSuccessStoriesBySector(slug, { locale });
  } catch {
    successStories = [];
  }

  return (
    <SectorDetailView
      locale={locale}
      slug={slug}
      sector={sector}
      opportunities={opportunities}
      projects={projects}
      successStories={successStories}
    />
  );
}

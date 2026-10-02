import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "@/src/components/cni/PageHero";
import { PortfolioCatalogFilters } from "@/src/components/cni/PortfolioCatalogFilters";
import { PortfolioDocumentCard } from "@/src/components/cni/PortfolioDocumentCard";
import { PortfolioItemCard } from "@/src/components/cni/PortfolioItemCard";
import { SectorIcon } from "@/src/components/cni/SectorIcon";
import { getSectorBySlug, isSectorSlug } from "@/src/data/investmentSectors";
import type { Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import { portfolioCatalogCopy } from "@/src/i18n/copy/portfolioCatalog";
import type { AsyncData } from "@/src/lib/asyncData";
import { designImages } from "@/src/lib/designAssets";
import {
  filterPortfolioItems,
  groupPortfolioItemsBySector,
  matchDocumentByCode,
  uniquePhases,
  PORTFOLIO_CATALOG_SECTORS,
  type PortfolioCatalogItem,
  type PortfolioFilters,
} from "@/src/lib/portfolioCatalog";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";
import type { CmsDocument } from "@/src/types/cms";
import { getPortfolioSectionCopy, portfolioDocumentsForSector } from "@/src/components/cni/PortfolioSectorPage";

type Props = {
  locale: Locale;
  type: "sheets" | "opportunities";
  items: AsyncData<PortfolioCatalogItem[]>;
  documents: AsyncData<CmsDocument[]>;
  filters: PortfolioFilters;
};

export function PortfolioCatalogPage({ locale, type, items, documents, filters }: Props) {
  const c = {
    es: {
      back: "Volver al portafolio",
      eyebrow: "Portafolio de Inversiones",
      description: "Seleccione un sector de inversión para consultar sus recursos disponibles.",
    },
    en: {
      back: "Back to portfolio",
      eyebrow: "Investment Portfolio",
      description: "Select an investment sector to view its available resources.",
    },
  }[locale];
  const section = getPortfolioSectionCopy(locale, type);
  const catalog = portfolioCatalogCopy[locale];
  const filtered = items.status === "ok" ? filterPortfolioItems(items.data, filters) : [];
  const itemGroups = groupPortfolioItemsBySector(filtered);
  const docs = documents.status === "ok" ? documents.data : [];
  const groupedSlugs = new Set(itemGroups.map((group) => group.sectorSlug));
  const pdfOnlySectors =
    type === "sheets" && items.status === "ok" && !filters.fase
      ? PORTFOLIO_CATALOG_SECTORS.filter((slug) => {
          if (filters.sector && filters.sector !== slug) return false;
          return !groupedSlugs.has(slug) && portfolioDocumentsForSector(docs, type, slug).length > 0;
        }).map((sectorSlug) => ({ sectorSlug, items: [] as PortfolioCatalogItem[] }))
      : [];
  const groups = [...itemGroups, ...pdfOnlySectors];
  const phases = items.status === "ok" ? uniquePhases(items.data) : [];
  const showGlobalEmpty = items.status === "ok" && groups.length === 0;
  const extraCards =
    type === "opportunities"
      ? docs.filter((document) => document.document_type === "opportunity_card" && document.file_url)
      : [];

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9ff]">
      <PageHero
        eyebrow={c.eyebrow}
        title={section.title}
        description={c.description}
        imageSrc={designImages.portfolio.hero}
        imageAlt=""
        heightClass="min-h-[480px] pt-28 md:min-h-[560px]"
        imageClassName="absolute inset-0 object-cover opacity-40"
        overlayClassName="bg-gradient-to-r from-[#000a1e]/90 via-[#000a1e]/70 to-[#000a1e]/35"
      >
        <Link
          href={withLocale(locale, "/portafolio")}
          className="inline-flex items-center gap-2 font-headline text-xs font-bold uppercase tracking-[0.16em] text-white underline-offset-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {c.back}
        </Link>
      </PageHero>

      <section className={cn("bg-[#f8f9ff]", layout.section)} aria-label={section.title}>
        <div className={cn(layout.container, "space-y-8")}>
          <PortfolioCatalogFilters locale={locale} sector={filters.sector} fase={filters.fase} phases={phases} />

          {items.status === "error" ? (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-800">
              {catalog.error}
            </p>
          ) : showGlobalEmpty ? (
            <p className="rounded-xl border border-dashed border-cni-primary/15 bg-white px-6 py-12 text-center text-sm text-[#0E7A7C]">
              {catalog.empty}
            </p>
          ) : (
            groups.map((group) => {
              if (!isSectorSlug(group.sectorSlug)) return null;
              const sectorSlug = group.sectorSlug;
              const sector = getSectorBySlug(locale, sectorSlug);
              if (!sector) return null;
              const sectorDocuments = portfolioDocumentsForSector(docs, type, sectorSlug);
              return (
                <section
                  key={sectorSlug}
                  className="rounded-xl border border-cni-primary/10 bg-white p-6 shadow-sm sm:p-8"
                  aria-labelledby={`portfolio-sector-${sectorSlug}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#eaf7f0]" aria-hidden>
                      <SectorIcon slug={sectorSlug} size={34} />
                    </span>
                    <h2 id={`portfolio-sector-${sectorSlug}`} className={t.h3}>
                      {sector.name}
                    </h2>
                  </div>
                  <div className="my-6 h-px bg-cni-primary/10" />
                  {group.items.length > 0 ? (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {group.items.map((item) => (
                        <PortfolioItemCard
                          key={`${item.kind}-${item.slug}`}
                          locale={locale}
                          item={item}
                          pdfUrl={
                            type === "opportunities"
                              ? matchDocumentByCode(docs, item.code)?.file_url || null
                              : null
                          }
                        />
                      ))}
                    </div>
                  ) : null}
                  {type === "sheets" && sectorDocuments.length > 0 ? (
                    <div className="mt-8">
                      <h3 className="mb-4 font-headline text-sm font-bold uppercase tracking-[0.16em] text-[#168654]">
                        {catalog.downloadable}
                      </h3>
                      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {sectorDocuments.map((document) => (
                          <PortfolioDocumentCard
                            key={`${document.id}-${document.slug}`}
                            document={document}
                            label={sector.name}
                            downloadLabel={catalog.download}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </section>
              );
            })
          )}

          {type === "opportunities" && extraCards.length > 0 ? (
            <section className="rounded-xl border border-cni-primary/10 bg-white p-6 shadow-sm sm:p-8">
              <p className="mb-2 font-headline text-[11px] font-bold uppercase tracking-[0.22em] text-[#32B372]">
                {catalog.cardsEyebrow}
              </p>
              <h2 className="mb-8 font-display text-3xl font-extrabold text-cni-primary">{catalog.cardsTitle}</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {extraCards.map((document) => (
                  <PortfolioDocumentCard
                    key={`${document.id}-${document.slug}`}
                    document={document}
                    label={document.sector || catalog.cardsEyebrow}
                    downloadLabel={catalog.download}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  );
}

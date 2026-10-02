"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import { portfolioCatalogCopy } from "@/src/i18n/copy/portfolioCatalog";
import {
  applyUnifiedFilters,
  PORTFOLIO_CATALOG_SECTORS,
  serializeUnifiedFilters,
  type PortfolioCatalogItem,
  type UnifiedPortfolioFilters,
  type UnifiedPortfolioTab,
} from "@/src/lib/portfolioCatalog";
import { getSectorDisplayName } from "@/src/data/investmentSectors";
import { PortfolioDocumentCard } from "@/src/components/cni/PortfolioDocumentCard";
import { PortfolioItemCard } from "@/src/components/cni/PortfolioItemCard";
import type { CmsDocument } from "@/src/types/cms";
import { cn } from "@/src/lib/utils";

type Props = {
  locale: Locale;
  projects: PortfolioCatalogItem[];
  opportunities: PortfolioCatalogItem[];
  documents: CmsDocument[];
  initialFilters: UnifiedPortfolioFilters;
  documentTypeForTab: Record<UnifiedPortfolioTab, string>;
};

export function PortfolioCatalogClient({
  locale,
  projects,
  opportunities,
  documents,
  initialFilters,
  documentTypeForTab,
}: Props) {
  const t = portfolioCatalogCopy[locale];
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filtersState, setFiltersState] = useState<UnifiedPortfolioFilters>(initialFilters);

  const searchParamsKey = searchParams.toString();
  const syncedFilters = useMemo<UnifiedPortfolioFilters>(
    () => ({
      tipo: searchParams.get("tipo") === "oportunidades" ? "oportunidades" : "proyectos",
      sector: searchParams.get("sector"),
      fase: searchParams.get("fase"),
      q: searchParams.get("q") ?? "",
      orden: searchParams.get("orden") === "name" ? "name" : "amount",
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParamsKey],
  );
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFiltersState((prev) => {
      if (
        prev.tipo === syncedFilters.tipo &&
        prev.sector === syncedFilters.sector &&
        prev.fase === syncedFilters.fase &&
        prev.q === syncedFilters.q &&
        prev.orden === syncedFilters.orden
      ) {
        return prev;
      }
      return syncedFilters;
    });
  }, [syncedFilters]);

  const pushFilters = useCallback(
    (next: UnifiedPortfolioFilters) => {
      const qs = serializeUnifiedFilters(next);
      const path = withLocale(locale, "/portafolio");
      router.replace(qs ? `${path}?${qs}` : path, { scroll: false });
    },
    [locale, router],
  );

  const update = useCallback(
    (patch: Partial<UnifiedPortfolioFilters>) => {
      const next = { ...filtersState, ...patch };
      setFiltersState(next);
      pushFilters(next);
    },
    [filtersState, pushFilters],
  );

  const allItems = useMemo(() => [...projects, ...opportunities], [projects, opportunities]);
  const filteredItems = useMemo(
    () => applyUnifiedFilters(allItems, filtersState.tipo, filtersState),
    [allItems, filtersState],
  );

  const docType = documentTypeForTab[filtersState.tipo];
  const tabDocuments = documents.filter((doc) => doc.document_type === docType && doc.file_url);
  const searchPlaceholder =
    filtersState.tipo === "oportunidades" ? t.searchPlaceholderOpportunities : t.searchPlaceholder;

  return (
    <div className="bg-[#f5f7fb]">
      <div className="mx-auto w-[92%] max-w-[1500px] px-0 pb-24 pt-14">
        <div className="mb-7 flex flex-col items-stretch justify-between gap-6 lg:flex-row lg:items-center">
          <div
            className="flex flex-col rounded-[14px] border border-[#e4e8ef] bg-white p-1.5 sm:flex-row"
            role="tablist"
            aria-label={t.typeTabs}
          >
            <TabButton
              active={filtersState.tipo === "proyectos"}
              onClick={() => update({ tipo: "proyectos", sector: null })}
            >
              {t.projectsTab}
            </TabButton>
            <TabButton
              active={filtersState.tipo === "oportunidades"}
              onClick={() => update({ tipo: "oportunidades", sector: null })}
            >
              {t.opportunitiesTab}
            </TabButton>
          </div>

          <label className="w-full lg:w-min lg:min-w-[280px] lg:max-w-[380px]">
            <span className="sr-only">{t.searchLabel}</span>
            <input
              type="search"
              value={filtersState.q}
              onChange={(event) => update({ q: event.target.value })}
              placeholder={searchPlaceholder}
              aria-label={t.searchLabel}
              className="w-full rounded-xl border border-[#e4e8ef] bg-white px-4 py-3.5 font-body text-sm text-[#252A58] outline-none transition placeholder:text-[#667085] focus:border-[#334E88] focus:shadow-[0_0_0_3px_rgba(51,78,136,0.12)]"
            />
          </label>
        </div>

        <div className="mb-10 flex flex-wrap gap-2.5" role="group" aria-label={t.allSectors}>
          <SectorChip active={!filtersState.sector} onClick={() => update({ sector: null })}>
            {t.allSectors}
          </SectorChip>
          {PORTFOLIO_CATALOG_SECTORS.map((slug) => (
            <SectorChip
              key={slug}
              active={filtersState.sector === slug}
              onClick={() => update({ sector: filtersState.sector === slug ? null : slug })}
            >
              {getSectorDisplayName(locale, slug)}
            </SectorChip>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="font-body text-lg text-[#667085]">{t.noResults}</p>
            <button
              type="button"
              onClick={() =>
                pushFilters({
                  tipo: filtersState.tipo,
                  sector: null,
                  fase: null,
                  q: "",
                  orden: "amount",
                })
              }
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#334E88] px-5 py-3 font-body text-sm font-extrabold text-white transition hover:bg-[#252A58] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#32B372]"
            >
              {t.clearFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-7 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <PortfolioItemCard key={`${item.kind}-${item.slug}`} locale={locale} item={item} />
            ))}
          </div>
        )}

        {tabDocuments.length > 0 ? (
          <section className="mt-16 rounded-[18px] border border-[#e4e8ef] bg-white p-6 shadow-sm sm:p-8">
            <p className="mb-2 font-headline text-[11px] font-bold uppercase tracking-[0.22em] text-[#32B372]">
              {t.cardsEyebrow}
            </p>
            <h2 className="mb-6 font-display text-2xl font-extrabold text-[#252A58] md:text-3xl">
              {t.cardsTitle}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tabDocuments.map((document) => (
                <PortfolioDocumentCard
                  key={`${document.id}-${document.slug}`}
                  document={document}
                  label={document.sector || t.cardsEyebrow}
                  downloadLabel={t.download}
                />
              ))}
            </div>
          </section>
        ) : null}

        <SecondaryCards locale={locale} />
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-[10px] px-5 py-3.5 text-left font-body text-sm font-bold text-[#252A58] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7BF06] sm:text-center",
        active ? "bg-[#334E88] text-white" : "bg-transparent hover:bg-[rgba(51,78,136,0.08)]",
      )}
    >
      {children}
    </button>
  );
}

function SectorChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-2.5 font-body text-[13px] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#32B372]",
        active
          ? "border-[#252A58] bg-[#252A58] text-white"
          : "border-[#e4e8ef] bg-white text-[#252A58] hover:border-[#d5dbea] hover:bg-[#f4f6fb]",
      )}
    >
      {children}
    </button>
  );
}

function SecondaryCards({ locale }: { locale: Locale }) {
  const t = portfolioCatalogCopy[locale];
  return (
    <section className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label={t.sectorsLabel}>
      <SecondaryCard
        locale={locale}
        href="/portafolio/mapa"
        title={locale === "es" ? "Mapa de inversión" : "Investment map"}
        description={
          locale === "es"
            ? "Visualice la cartera geográficamente con clusters sectoriales."
            : "Visualize the portfolio geographically with sector clusters."
        }
      />
      <SecondaryCard
        locale={locale}
        href="/portafolio/casos"
        title={locale === "es" ? "Casos de éxito" : "Success stories"}
        description={
          locale === "es"
            ? "Corporaciones multinacionales que han expandido en Honduras."
            : "Multinational corporations expanding in Honduras."
        }
      />
      <SecondaryCard
        locale={locale}
        href="/postula-tu-proyecto"
        title={locale === "es" ? "Postula tu proyecto" : "Submit your project"}
        description={
          locale === "es"
            ? "Sume su proyecto al Portafolio Oficial del CNI."
            : "Add your project to the official CNI portfolio."
        }
      />
    </section>
  );
}

function SecondaryCard({
  locale,
  href,
  title,
  description,
}: {
  locale: Locale;
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={withLocale(locale, href)}
      className="group flex h-full flex-col rounded-[18px] border border-[#e4e8ef] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[rgba(51,78,136,0.18)] hover:shadow-[0_20px_45px_rgba(37,42,88,0.11)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#32B372]"
    >
      <h3 className="font-display text-lg font-extrabold text-[#252A58] group-hover:text-[#334E88]">
        {title}
      </h3>
      <p className="mt-3 font-body text-sm leading-relaxed text-[#667085]">{description}</p>
    </Link>
  );
}

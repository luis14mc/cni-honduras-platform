"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
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
import { getSectorBySlug, getSectorDisplayName } from "@/src/data/investmentSectors";
import { PortfolioDocumentCard } from "@/src/components/cni/PortfolioDocumentCard";
import { PortfolioItemCard } from "@/src/components/cni/PortfolioItemCard";
import type { CmsDocument } from "@/src/types/cms";
import { cn } from "@/src/lib/utils";

type Props = {
  locale: Locale;
  projects: PortfolioCatalogItem[];
  opportunities: PortfolioCatalogItem[];
  documents: CmsDocument[];
  errors: Record<UnifiedPortfolioTab, boolean>;
  initialFilters: UnifiedPortfolioFilters;
  documentTypeForTab: Record<UnifiedPortfolioTab, string>;
};

export function PortfolioCatalogClient({
  locale,
  projects,
  opportunities,
  documents,
  errors,
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
  const sectorCounts = new Map<string, number>();
  const allSectorResults = applyUnifiedFilters(allItems, filtersState.tipo, { ...filtersState, sector: null });
  for (const item of allSectorResults) {
    sectorCounts.set(item.sectorSlug, (sectorCounts.get(item.sectorSlug) ?? 0) + 1);
  }
  const resultLabel = filtersState.tipo === "proyectos"
    ? (locale === "es" ? (filteredItems.length === 1 ? "proyecto" : "proyectos") : (filteredItems.length === 1 ? "project" : "projects"))
    : (filteredItems.length === 1 ? "Opportunity Card" : "Opportunity Cards");

  return (
    <div className="bg-[#f5f7fb]">
      <div className="mx-auto w-[92%] max-w-[1500px] pb-24 pt-5 sm:pt-8">
        <div className="mb-4 rounded-xl border border-[#dce3ee] bg-white p-2.5 shadow-sm lg:sticky lg:top-[calc(var(--cni-navbar-height,var(--cni-header-height))+0.5rem)] lg:z-30 lg:p-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div
              className="grid grid-cols-2 gap-1 rounded-lg bg-[#edf2fb] p-1 lg:flex"
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

            <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap lg:min-w-0 lg:flex-1 lg:justify-end">
              <label className="relative min-w-0 flex-1 lg:max-w-[380px]">
                <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#4c5567]" />
                <span className="sr-only">{t.searchLabel}</span>
                <input
                  type="search"
                  value={filtersState.q}
                  onChange={(event) => update({ q: event.target.value })}
                  placeholder={searchPlaceholder}
                  aria-label={t.searchLabel}
                  className="min-h-11 w-full rounded-lg border border-[#cbd5e4] bg-white py-2 pl-9 pr-3 text-sm text-[#252a58] placeholder:text-[#4c5567] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#334e88]"
                />
              </label>
              {!errors[filtersState.tipo] && (
                <p aria-live="polite" className="shrink-0 text-xs font-bold text-[#334e88]">
                  {filteredItems.length} {resultLabel}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto px-1 py-1 sm:flex-wrap sm:overflow-visible" role="group" aria-label={t.allSectors}>
          <SectorChip active={!filtersState.sector} onClick={() => update({ sector: null })}>
            {t.allSectors} · {allSectorResults.length}
          </SectorChip>
          {PORTFOLIO_CATALOG_SECTORS.map((slug) => (
            <SectorChip
              key={slug}
              active={filtersState.sector === slug}
              color={getSectorBySlug(locale, slug)?.color_hex}
              onClick={() => update({ sector: filtersState.sector === slug ? null : slug })}
            >
              {getSectorDisplayName(locale, slug)} · {sectorCounts.get(slug) ?? 0}
            </SectorChip>
          ))}
        </div>

        {errors[filtersState.tipo] ? (
          <p role="alert" className="px-5 py-16 text-center text-red-800">{t.error}</p>
        ) : filteredItems.length === 0 ? (
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
          <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {filteredItems.map((item) => (
              <PortfolioItemCard
                key={`${item.kind}-${item.slug}`}
                locale={locale}
                item={item}
              />
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
                <PortfolioDocumentCard locale={locale}
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
        "min-h-11 rounded-md px-2 py-2 text-center text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#13704d] sm:px-4",
        active ? "bg-[#252a58] text-white" : "text-[#252a58] hover:bg-white",
      )}
    >
      {children}
    </button>
  );
}

function SectorChip({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean;
  color?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-2 text-xs font-bold transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#13704d]",
        active
          ? "border-[#252A58] bg-[#252A58] text-white"
          : "border-[#e4e8ef] bg-white text-[#252A58] hover:border-[#d5dbea] hover:bg-[#f4f6fb]",
      )}
    >
      {color && <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />}
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

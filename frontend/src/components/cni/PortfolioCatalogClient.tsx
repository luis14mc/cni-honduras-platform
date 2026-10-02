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
  countBySector,
  PORTFOLIO_CATALOG_SECTORS,
  serializeUnifiedFilters,
  slugifyPhase,
  uniquePhases,
  type PortfolioCatalogItem,
  type UnifiedPortfolioFilters,
  type UnifiedPortfolioSort,
  type UnifiedPortfolioTab,
} from "@/src/lib/portfolioCatalog";
import { getSectorDisplayName } from "@/src/data/investmentSectors";
import { PortfolioDocumentCard } from "@/src/components/cni/PortfolioDocumentCard";
import { PortfolioItemCard } from "@/src/components/cni/PortfolioItemCard";
import { SectorIcon } from "@/src/components/cni/SectorIcon";
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

  // Sincroniza el estado con la URL si cambia externamente (botón atrás/adelante).
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
  const activeTabItems = useMemo(
    () => (filtersState.tipo === "proyectos" ? projects : opportunities),
    [filtersState.tipo, projects, opportunities],
  );
  const sectorCountsByTab = useMemo(
    () => ({
      proyectos: countBySector(projects),
      oportunidades: countBySector(opportunities),
    }),
    [projects],
  );

  const filteredItems = useMemo(
    () => applyUnifiedFilters(allItems, filtersState.tipo, filtersState),
    [allItems, filtersState],
  );
  const phases = useMemo(() => uniquePhases(activeTabItems), [activeTabItems]);

  const tabProjectsCount = projects.length;
  const tabOppsCount = opportunities.length;
  const activeSectorCount =
    filtersState.tipo === "proyectos"
      ? sectorCountsByTab.proyectos[filtersState.sector ?? ""] ?? 0
      : sectorCountsByTab.oportunidades[filtersState.sector ?? ""] ?? 0;

  const docType = documentTypeForTab[filtersState.tipo];
  const tabDocuments = documents.filter((doc) => doc.document_type === docType && doc.file_url);

  return (
    <div className="bg-[#f8f9ff]">
      <div className="sticky top-24 z-40 border-b border-cni-primary/10 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto max-w-screen-2xl px-4 py-4 md:px-10">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Tipo">
              <TabButton
                active={filtersState.tipo === "proyectos"}
                onClick={() => update({ tipo: "proyectos" })}
                count={tabProjectsCount}
                locale={locale}
                kind="proyectos"
              >
                {t.projectsTab}
              </TabButton>
              <TabButton
                active={filtersState.tipo === "oportunidades"}
                onClick={() => update({ tipo: "oportunidades" })}
                count={tabOppsCount}
                locale={locale}
                kind="oportunidades"
              >
                {t.opportunitiesTab}
              </TabButton>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2" role="group" aria-label={t.allSectors}>
                <SectorChip
                  active={!filtersState.sector}
                  disabled={false}
                  onClick={() => update({ sector: null })}
                >
                  {t.allSectors}
                </SectorChip>
                {PORTFOLIO_CATALOG_SECTORS.map((slug) => {
                  const count =
                    filtersState.tipo === "proyectos"
                      ? sectorCountsByTab.proyectos[slug] ?? 0
                      : sectorCountsByTab.oportunidades[slug] ?? 0;
                  const label = getSectorDisplayName(locale, slug);
                  const display = `${label} (${count})`;
                  return (
                    <SectorChip
                      key={slug}
                      active={filtersState.sector === slug}
                      disabled={count === 0}
                      onClick={() => update({ sector: filtersState.sector === slug ? null : slug })}
                    >
                      <span className="inline-flex items-center gap-2">
                        <SectorIcon slug={slug} size={18} />
                        {display}
                      </span>
                    </SectorChip>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {phases.length > 0 ? (
                  <label className="flex items-center gap-2 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-cni-primary/60">
                    {t.phase}
                    <select
                      className="rounded-lg border border-cni-primary/15 bg-white px-3 py-2 font-body text-sm font-normal normal-case tracking-normal text-cni-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#32B372]"
                      value={filtersState.fase ?? ""}
                      onChange={(event) => update({ fase: event.target.value || null })}
                    >
                      <option value="">{t.allPhases}</option>
                      {phases.map((phase) => (
                        <option key={phase} value={slugifyPhase(phase)}>
                          {phase}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                <label className="flex items-center gap-2 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-cni-primary/60">
                  {t.sortBy}
                  <select
                    className="rounded-lg border border-cni-primary/15 bg-white px-3 py-2 font-body text-sm font-normal normal-case tracking-normal text-cni-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#32B372]"
                    value={filtersState.orden}
                    onChange={(event) =>
                      update({ orden: event.target.value as UnifiedPortfolioSort })
                    }
                  >
                    <option value="amount">{t.sortAmount}</option>
                    <option value="name">{t.sortName}</option>
                  </select>
                </label>

                <label className="relative flex items-center font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-cni-primary/60">
                  <Search className="pointer-events-none absolute left-3 h-4 w-4 text-cni-primary/45" aria-hidden />
                  <input
                    type="search"
                    value={filtersState.q}
                    onChange={(event) => update({ q: event.target.value })}
                    placeholder={t.searchPlaceholder}
                    aria-label={t.searchLabel}
                    className="w-full min-w-[14rem] rounded-lg border border-cni-primary/15 bg-white py-2 pl-9 pr-3 font-body text-sm font-normal normal-case tracking-normal text-cni-primary placeholder:text-cni-primary/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#32B372]"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-screen-2xl px-4 py-10 md:px-10 md:py-14">
        <p className="font-body text-sm text-cni-primary/65" role="status">
          {t.showing(filteredItems.length, filtersState.tipo === "proyectos" ? "projects" : "opportunities", filtersState.sector)}
          {filtersState.sector && activeSectorCount === 0 ? " · 0" : ""}
        </p>

        {filteredItems.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-cni-primary/15 bg-white px-6 py-12 text-center">
            <p className="font-body text-sm text-[#0E7A7C]">{t.noResults}</p>
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
              className="mt-4 inline-flex items-center justify-center rounded-md bg-cni-primary px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#0E7A7C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#32B372]"
            >
              {t.clearFilters}
            </button>
          </div>
        ) : filtersState.sector ? (
          <CatalogGrid locale={locale} items={filteredItems} />
        ) : (
          <div className="mt-6 space-y-12">
            {PORTFOLIO_CATALOG_SECTORS.filter((slug) =>
              filteredItems.some((item) => item.sectorSlug === slug),
            ).map((slug) => {
              const sectorItems = filteredItems.filter((item) => item.sectorSlug === slug);
              if (sectorItems.length === 0) return null;
              return (
                <section key={slug} aria-labelledby={`catalog-sector-${slug}`}>
                  <h3
                    id={`catalog-sector-${slug}`}
                    className="flex items-center gap-3 font-headline text-sm font-bold uppercase tracking-[0.18em] text-cni-primary"
                  >
                    <SectorIcon slug={slug} size={28} />
                    {getSectorDisplayName(locale, slug)}
                    <span className="font-body text-xs font-normal normal-case tracking-normal text-cni-primary/55">
                      ({sectorItems.length})
                    </span>
                  </h3>
                  <div className="mt-4">
                    <CatalogGrid locale={locale} items={sectorItems} />
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {tabDocuments.length > 0 ? (
          <section className="mt-16 rounded-xl border border-cni-primary/10 bg-white p-6 shadow-sm sm:p-8">
            <p className="mb-2 font-headline text-[11px] font-bold uppercase tracking-[0.22em] text-[#32B372]">
              {t.cardsEyebrow}
            </p>
            <h2 className="mb-6 font-display text-2xl font-extrabold text-cni-primary md:text-3xl">
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
      </section>
    </div>
  );
}

function CatalogGrid({ locale, items }: { locale: Locale; items: PortfolioCatalogItem[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <PortfolioItemCard key={`${item.kind}-${item.slug}`} locale={locale} item={item} />
      ))}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  count,
  children,
  locale,
  kind,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
  locale: Locale;
  kind: UnifiedPortfolioTab;
}) {
  const showingKind = kind === "proyectos" ? "projects" : "opportunities";
  const label = portfolioCatalogCopy[locale].showing(count, showingKind);
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 font-headline text-[11px] font-bold uppercase tracking-[0.14em] transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#32B372]",
        active
          ? "bg-cni-primary text-white"
          : "bg-white text-cni-primary ring-1 ring-cni-primary/15 hover:bg-[#eaf7f0]",
      )}
    >
      {children}
      <span
        className={cn(
          "inline-flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 text-[10px]",
          active ? "bg-white/15 text-white" : "bg-cni-primary/10 text-cni-primary",
        )}
      >
        {label}
      </span>
    </button>
  );
}

function SectorChip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 font-headline text-[11px] font-bold uppercase tracking-[0.14em] transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#32B372]",
        active
          ? "bg-cni-primary text-white"
          : "bg-white text-cni-primary ring-1 ring-cni-primary/15 hover:bg-[#eaf7f0]",
        disabled && "cursor-not-allowed opacity-40 hover:bg-white",
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
        title={locale === "es" ? "Mapa de Inversión" : "Investment Map"}
        description={
          locale === "es"
            ? "Visualice la cartera geográficamente con clusters sectoriales."
            : "Visualize the portfolio geographically with sector clusters."
        }
      />
      <SecondaryCard
        locale={locale}
        href="/portafolio/casos"
        title={locale === "es" ? "Casos de Éxito" : "Success Stories"}
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
      className="group flex h-full flex-col rounded-xl border border-cni-primary/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#32B372]/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#32B372]"
    >
      <h3 className="font-display text-lg font-extrabold text-cni-primary group-hover:text-[#0E7A7C]">
        {title}
      </h3>
      <p className="mt-3 font-body text-sm leading-relaxed text-cni-primary/70">{description}</p>
    </Link>
  );
}
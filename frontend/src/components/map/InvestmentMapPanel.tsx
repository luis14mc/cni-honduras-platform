"use client";

import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import type { InvestmentMapCopy } from "@/src/i18n/copy/investmentMap";
import type {
  DepartmentProperties,
  MapDepartmentSummary,
  MapInvestmentProject,
  MapKindFilter,
  MunicipalityProperties,
  InfrastructureFeature,
  PortCategory,
  RoadCorridorFeature,
  TerritorialRegionFeature,
} from "@/src/lib/types/investment-map";
import {
  formatMapInvestment,
  formatMapJobs,
  localizeInfrastructure,
} from "@/src/lib/types/investment-map";

const PROJECT_COLOR = "#32B372";
const OPPORTUNITY_COLOR = "#F7BF06";

type Props = {
  locale: Locale;
  copy: InvestmentMapCopy;
  department: DepartmentProperties | null;
  municipality: MunicipalityProperties | null;
  project: MapInvestmentProject | null;
  infrastructure: InfrastructureFeature | null;
  summary: MapDepartmentSummary | undefined;
  projects: MapInvestmentProject[];
  projectsLoading: boolean;
  projectsError: boolean;
  municipalitiesLoading: boolean;
  municipalitiesError: boolean;
  municipalitiesEmpty: boolean;
  onClearDepartment: () => void;
  onClearMunicipality: () => void;
  onClearProject: () => void;
  onClearInfrastructure: () => void;
  onSelectProject: (project: MapInvestmentProject) => void;
  regionMode?: boolean;
  region?: TerritorialRegionFeature | null;
  onClearRegion?: () => void;
  road?: RoadCorridorFeature | null;
  onClearRoad?: () => void;
  kindFilter: MapKindFilter;
  onKindFilterChange: (kind: MapKindFilter) => void;
  onHoverProject: (id: number | null) => void;
  listPlace: string;
  clusterActive: boolean;
  onClearCluster: () => void;
};

export function InvestmentMapPanel({
  locale,
  copy,
  department,
  municipality,
  project,
  infrastructure,
  summary,
  projects,
  projectsLoading,
  projectsError,
  municipalitiesLoading,
  municipalitiesError,
  municipalitiesEmpty,
  onClearDepartment,
  onClearMunicipality,
  onClearProject,
  onClearInfrastructure,
  onSelectProject,
  regionMode = false,
  region = null,
  onClearRegion,
  road = null,
  onClearRoad,
  kindFilter,
  onKindFilterChange,
  onHoverProject,
  listPlace,
  clusterActive,
  onClearCluster,
}: Props) {
  if (road) {
    const details = road.properties;
    const sourceUrl = getSafeSourceUrl(details.source_url);
    return (
      <aside className="rounded-[1.5rem] border border-white/10 bg-[#24436B] p-5 text-white shadow-xl sm:p-6" aria-live="polite" aria-label={`${copy.selectedRoad}: ${details.name}`}>
        <div className="flex items-start justify-between gap-3">
          <div><p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-[#8DC046]">{copy.selectedRoad}</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight">{details.name}</h2>{details.is_strategic ? <p className="mt-2 inline-flex rounded-full bg-[#F7BF06]/15 px-3 py-1 text-xs font-bold text-[#F7BF06]">{copy.strategicCorridor}</p> : null}</div>
          <button type="button" onClick={onClearRoad} className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold transition hover:border-[#8DC046] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7BF06]">{copy.clearRoad}</button>
        </div>
        <dl className="mt-7 space-y-3 text-sm">
          <DetailRow label={copy.roadRef} value={details.ref || "—"} />
          <DetailRow label={copy.roadClass} value={copy.roadClasses[details.road_class] ?? details.road_class} />
          <DetailRow label={copy.roadLength} value={details.length_km ? `${details.length_km} km` : "—"} />
          <DetailRow label={copy.source} value={details.source_name || "—"} />
        </dl>
        {details.description ? <p className="mt-5 text-sm leading-6 text-[#d5e3ff]">{details.description}</p> : null}
        {sourceUrl ? <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex rounded-lg border border-[#8DC046]/50 px-4 py-2 text-sm font-bold text-[#d8ef9f] transition hover:bg-[#35A963]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7BF06]">{copy.viewSource}</a> : null}
      </aside>
    );
  }

  if (infrastructure) {
    const details = infrastructure.properties;
    const sourceUrl = getSafeSourceUrl(details.source_url);
    const localized = localizeInfrastructure(details, locale);
    const category = details.details?.category;
    const isPort = details.infrastructure_type === "port";
    return (
      <aside className="rounded-[1.5rem] border border-white/10 bg-[#24436B] p-5 text-white shadow-xl sm:p-6" aria-live="polite" aria-label={`${copy.selectedInfrastructure}: ${localized.name}`}>
        <div className="flex items-start justify-between gap-3">
          <div><p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-[#8DC046]">{copy.selectedInfrastructure}</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight">{localized.name}</h2></div>
          <button type="button" onClick={onClearInfrastructure} className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold transition hover:border-[#8DC046] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7BF06]">{copy.clearInfrastructure}</button>
        </div>
        <dl className="mt-7 space-y-3 text-sm">
          <DetailRow label={copy.infrastructureType} value={isPort ? copy.ports : copy.airports} />
          {isPort ? <DetailRow label={copy.infrastructureCategory} value={(category && copy.portCategories[category as PortCategory]) || category || "—"} /> : null}
          {isPort ? <DetailRow label={copy.infrastructureCoast} value={localized.coast || "—"} /> : null}
          <DetailRow label={copy.selectedDepartment} value={details.department?.name ?? "—"} />
          <DetailRow label={copy.selectedMunicipality} value={details.municipality?.name ?? "—"} />
          <DetailRow label={copy.operator} value={details.operator || "—"} />
          <DetailRow label={copy.status} value={copy.statusLabels[details.status] ?? (details.status || "—")} />
          <DetailRow label={copy.source} value={localized.sourceName || "—"} />
        </dl>
        {localized.description ? <p className="mt-5 text-sm leading-6 text-[#d5e3ff]"><span className="sr-only">{copy.infrastructureDescription}: </span>{localized.description}</p> : null}
        {details.details?.coords_verified === false ? <p className="mt-3 text-xs italic text-[#d5e3ff]/75">{copy.approximateLocation}</p> : null}
        {sourceUrl ? <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex rounded-lg border border-[#8DC046]/50 px-4 py-2 text-sm font-bold text-[#d8ef9f] transition hover:bg-[#35A963]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7BF06]">{copy.viewSource}</a> : null}
      </aside>
    );
  }

  if (project) {
    const isOpportunity = (project.kind ?? "project") === "opportunity";
    const sheetHref = withLocale(
      locale,
      isOpportunity ? `/portafolio/oportunidades/${project.slug}` : `/portafolio/fichas-proyectos/${project.slug}`,
    );
    return (
      <aside className="flex max-h-[min(70vh,600px)] flex-col overflow-y-auto rounded-[1.5rem] border border-white/10 bg-[#24436B] p-5 text-white shadow-xl sm:p-6 lg:max-h-[600px]" aria-live="polite" aria-label={`${isOpportunity ? copy.selectedOpportunity : copy.selectedProject}: ${project.title}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-[#8DC046]">{isOpportunity ? copy.selectedOpportunity : copy.selectedProject}</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight">{project.title}</h2>
            {project.code ? <p className="mt-1 text-xs font-semibold text-[#d5e3ff]/75">{project.code}</p> : null}
          </div>
          <button type="button" onClick={onClearProject} className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold transition hover:border-[#8DC046] hover:text-[#d8ef9f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7BF06]">
            {copy.backToList}
          </button>
        </div>
        <dl className="mt-7 space-y-3 text-sm">
          <DetailRow label={copy.activeSectors} value={project.sector.name} />
          <DetailRow label={copy.selectedDepartment} value={project.department?.name ?? department?.name ?? "—"} />
          <DetailRow label={copy.selectedMunicipality} value={project.municipality?.name ?? municipality?.name ?? "—"} />
          <DetailRow label={copy.stageLabel} value={copy.stage[project.stage] ?? project.stage} />
          <DetailRow label={copy.investment} value={project.amountText || formatMapInvestment(project.investment_amount, locale)} />
          <DetailRow label={copy.jobs} value={formatMapJobs(project.estimated_jobs, locale)} />
        </dl>
        <Link
          href={sheetHref}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#F7BF06] px-4 py-2 text-sm font-bold text-[#001a33] transition hover:bg-[#ffe08a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7BF06]"
        >
          {copy.viewFullSheet}
        </Link>
      </aside>
    );
  }

  const hasActivity = Boolean(summary && summary.projects_count + summary.opportunities_count > 0);
  const emptyMessage = municipality
    ? copy.noGeolocatedProjectsMunicipality
    : department
      ? copy.noSheetsInView
      : region
        ? copy.noProjectsInRegion
        : copy.noSheetsInView;

  return (
    <aside className="flex max-h-[min(70vh,600px)] flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#24436B] p-5 text-white shadow-xl sm:p-6 lg:h-[600px] lg:max-h-[600px]" aria-live="polite">
      {regionMode && region ? (
        <div className="mb-4 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-[#8DC046]">{copy.selectedRegion}</p>
              <h2 className="mt-2 flex items-center gap-2 text-2xl font-extrabold tracking-tight"><span aria-hidden="true" className="h-4 w-4 shrink-0 rounded-sm border border-white/70" style={{ backgroundColor: region.properties.color }} />{region.properties.name}</h2>
            </div>
            <button type="button" onClick={onClearRegion} className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold transition hover:border-[#8DC046] hover:text-[#d8ef9f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7BF06]">
              {copy.clearRegion}
            </button>
          </div>
        </div>
      ) : department ? (
        <div className="mb-4 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-[#8DC046]">{copy.selectedDepartment}</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight">{department.name}</h2>
              {municipality ? (
                <div className="mt-3 flex items-start justify-between gap-3 rounded-xl border border-[#8DC046]/30 bg-[#35A963]/10 p-3">
                  <div>
                    <p className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-[#8DC046]">{copy.selectedMunicipality}</p>
                    <p className="mt-1 text-lg font-bold">{municipality.name}</p>
                  </div>
                  <button type="button" onClick={onClearMunicipality} className="rounded-lg border border-white/20 px-2.5 py-1.5 text-[11px] font-bold transition hover:border-[#8DC046] hover:text-[#d8ef9f]">
                    {copy.clearMunicipality}
                  </button>
                </div>
              ) : null}
            </div>
            <button type="button" onClick={onClearDepartment} className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold transition hover:border-[#8DC046] hover:text-[#d8ef9f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7BF06]">
              {copy.clear}
            </button>
          </div>
          {summary && hasActivity ? (
            <dl className="mt-4 grid grid-cols-2 gap-2">
              <PanelHint label={copy.projects} value={String(summary.projects_count)} />
              <PanelHint label={copy.opportunities} value={String(summary.opportunities_count)} />
            </dl>
          ) : null}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0">
          <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-[#8DC046]">{copy.panelEyebrow}</p>
          <h2 className="mt-2 text-xl font-extrabold tracking-tight">{copy.listTitle}</h2>
          <p className="mt-1 text-sm font-semibold text-[#d5e3ff]/80">{copy.listCountLabel(projects.length, listPlace)}</p>
          {clusterActive ? (
            <button type="button" onClick={onClearCluster} className="mt-2 text-xs font-bold text-[#F7BF06] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F7BF06]">
              {copy.showAllSheets}
            </button>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label={copy.listTitle}>
            {([
              ["all", copy.tabAll],
              ["project", copy.tabProjects],
              ["opportunity", copy.tabOpportunities],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={kindFilter === value}
                onClick={() => onKindFilterChange(value)}
                className={`min-h-9 rounded-full border px-3 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7BF06] ${kindFilter === value ? "border-[#F7BF06] bg-[#F7BF06] text-[#001a33]" : "border-white/20 bg-[#001a33]/40 text-white hover:border-[#8DC046]"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {municipalitiesLoading ? <p className="mt-3 shrink-0 text-sm text-[#d5e3ff]/70">{copy.loadingMunicipalities}</p> : null}
        {municipalitiesError ? <p role="alert" className="mt-3 shrink-0 rounded-lg border border-red-200/20 bg-red-950/25 p-3 text-sm text-red-100">{copy.municipalitiesError}</p> : null}
        {!municipalitiesLoading && !municipalitiesError && municipalitiesEmpty ? (
          <p className="mt-3 shrink-0 text-xs text-[#d5e3ff]/65">{copy.noMunicipalities}</p>
        ) : null}
        <ProjectList
          locale={locale}
          copy={copy}
          projects={projects}
          loading={projectsLoading}
          error={projectsError}
          emptyMessage={emptyMessage}
          onSelectProject={onSelectProject}
          onHoverProject={onHoverProject}
        />
      </div>
    </aside>
  );
}

function ProjectList({
  locale,
  copy,
  projects,
  loading,
  error,
  emptyMessage,
  onSelectProject,
  onHoverProject,
}: {
  locale: Locale;
  copy: InvestmentMapCopy;
  projects: MapInvestmentProject[];
  loading: boolean;
  error: boolean;
  emptyMessage: string;
  onSelectProject: (project: MapInvestmentProject) => void;
  onHoverProject: (id: number | null) => void;
}) {
  return (
    <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
      {loading ? <p className="text-sm text-[#d5e3ff]/70">{copy.loadingProjects}</p> : null}
      {error ? <p role="alert" className="rounded-lg border border-red-200/20 bg-red-950/25 p-3 text-sm text-red-100">{copy.projectsError}</p> : null}
      {!loading && !error && projects.length === 0 ? (
        <p className="text-sm text-[#d5e3ff]/70">{emptyMessage}</p>
      ) : null}
      <ul className="space-y-2">
        {projects.map((item) => {
          const kind = item.kind ?? "project";
          const amount = item.amountText || formatMapInvestment(item.investment_amount, locale);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelectProject(item)}
                onMouseEnter={() => onHoverProject(item.id)}
                onMouseLeave={() => onHoverProject(null)}
                onFocus={() => onHoverProject(item.id)}
                onBlur={() => onHoverProject(null)}
                className="flex min-h-11 w-full gap-3 rounded-xl border border-white/10 bg-[#252A58]/55 p-3 text-left transition hover:border-[#F7BF06]/60 hover:bg-[#252A58]/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7BF06]"
              >
                <SheetThumb item={item} />
                <span className="min-w-0 flex-1">
                  <span className="block font-bold leading-snug">{item.title}</span>
                  {item.code ? <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-wide text-[#d5e3ff]/70">{item.code}</span> : null}
                  <span className="mt-1 block text-xs text-[#d5e3ff]/75">
                    {item.sector.name}
                    {amount ? ` · ${amount}` : ""}
                    {item.municipality?.name || item.locationText ? ` · ${item.municipality?.name || item.locationText}` : ""}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="mt-1 h-3 w-3 shrink-0 rounded-full border border-white"
                  style={{ backgroundColor: kind === "opportunity" ? OPPORTUNITY_COLOR : PROJECT_COLOR }}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SheetThumb({ item }: { item: MapInvestmentProject }) {
  const kind = item.kind ?? "project";
  return (
    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#001a33]">
      {item.coverImageUrl ? (
        <Image src={item.coverImageUrl} alt="" width={48} height={48} className="h-12 w-12 object-cover" />
      ) : (
        <span
          className="block h-full w-full"
          style={{ backgroundColor: kind === "opportunity" ? OPPORTUNITY_COLOR : PROJECT_COLOR }}
        />
      )}
    </span>
  );
}

function getSafeSourceUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function PanelHint({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return <div className={`rounded-xl border border-white/10 bg-[#252A58]/60 p-3 ${wide ? "col-span-2" : ""}`}><dt className="font-headline text-[10px] font-bold uppercase tracking-[0.14em] text-[#b6c2d3]">{label}</dt><dd className="mt-1 text-lg font-extrabold">{value}</dd></div>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#252A58]/55 px-4 py-3">
      <dt className="font-headline text-[10px] font-bold uppercase tracking-[0.14em] text-[#b6c2d3]">{label}</dt>
      <dd className="mt-1 font-semibold text-[#f4f7ff]">{value}</dd>
    </div>
  );
}

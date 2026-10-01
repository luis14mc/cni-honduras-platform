"use client";

import type { Locale } from "@/src/i18n/config";
import type { InvestmentMapCopy } from "@/src/i18n/copy/investmentMap";
import type {
  DepartmentProperties,
  MapDepartmentSummary,
  MapInvestmentProject,
  MunicipalityProperties,
  InfrastructureFeature,
  TerritorialRegionFeature,
} from "@/src/lib/types/investment-map";
import { formatMapInvestment, formatMapJobs, getProjectsInvestmentTotal } from "@/src/lib/types/investment-map";

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
}: Props) {
  if (infrastructure) {
    const details = infrastructure.properties;
    const sourceUrl = getSafeSourceUrl(details.source_url);
    return (
      <aside className="rounded-[1.5rem] border border-white/10 bg-[#24436B] p-5 text-white shadow-xl sm:p-6" aria-live="polite" aria-label={`${copy.selectedInfrastructure}: ${details.name}`}>
        <div className="flex items-start justify-between gap-3">
          <div><p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-[#8DC046]">{copy.selectedInfrastructure}</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight">{details.name}</h2></div>
          <button type="button" onClick={onClearInfrastructure} className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold transition hover:border-[#8DC046] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7BF06]">{copy.clearInfrastructure}</button>
        </div>
        <dl className="mt-7 space-y-3 text-sm">
          <DetailRow label={copy.infrastructureType} value={details.infrastructure_type === "airport" ? copy.airports : copy.ports} />
          <DetailRow label={copy.selectedDepartment} value={details.department?.name ?? "—"} />
          <DetailRow label={copy.selectedMunicipality} value={details.municipality?.name ?? "—"} />
          <DetailRow label={copy.operator} value={details.operator || "—"} />
          <DetailRow label={copy.status} value={details.status || "—"} />
          <DetailRow label={copy.source} value={details.source_name || "—"} />
        </dl>
        {sourceUrl ? <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex rounded-lg border border-[#8DC046]/50 px-4 py-2 text-sm font-bold text-[#d8ef9f] transition hover:bg-[#35A963]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7BF06]">{copy.viewSource}</a> : null}
      </aside>
    );
  }

  if (project) {
    return (
      <aside className="rounded-[1.5rem] border border-white/10 bg-[#24436B] p-5 text-white shadow-xl sm:p-6" aria-live="polite" aria-label={`${copy.selectedProject}: ${project.title}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-[#8DC046]">{copy.selectedProject}</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight">{project.title}</h2>
          </div>
          <button type="button" onClick={onClearProject} className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold transition hover:border-[#8DC046] hover:text-[#d8ef9f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7BF06]">
            {copy.clearProject}
          </button>
        </div>
        <dl className="mt-7 space-y-3 text-sm">
          <DetailRow label={copy.activeSectors} value={project.sector.name} />
          <DetailRow label={copy.selectedDepartment} value={project.department?.name ?? department?.name ?? "—"} />
          <DetailRow label={copy.selectedMunicipality} value={project.municipality?.name ?? municipality?.name ?? "—"} />
          <DetailRow label={copy.stageLabel} value={copy.stage[project.stage] ?? project.stage} />
          <DetailRow label={copy.investment} value={formatMapInvestment(project.investment_amount, locale)} />
          <DetailRow label={copy.jobs} value={formatMapJobs(project.estimated_jobs, locale)} />
        </dl>
      </aside>
    );
  }

  if (regionMode && region) {
    const { properties } = region;
    const total = getProjectsInvestmentTotal(projects);
    const subregions = properties.extra.subregiones ?? [];
    return (
      <aside className="rounded-[1.5rem] border border-white/10 bg-[#24436B] p-5 text-white shadow-xl sm:p-6" aria-live="polite" aria-label={`${copy.selectedRegion}: ${properties.name}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-[#8DC046]">{copy.selectedRegion}</p>
            <h2 className="mt-2 flex items-center gap-2 text-3xl font-extrabold tracking-tight"><span aria-hidden="true" className="h-4 w-4 shrink-0 rounded-sm border border-white/70" style={{ backgroundColor: properties.color }} />{properties.name}</h2>
          </div>
          <button type="button" onClick={onClearRegion} className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold transition hover:border-[#8DC046] hover:text-[#d8ef9f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7BF06]">
            {copy.clearRegion}
          </button>
        </div>
        <dl className="mt-7 grid grid-cols-2 gap-3">
          <PanelHint label={copy.regionCode} value={properties.code} />
          <PanelHint label={copy.regionLevelLabel} value={copy.regionLevelNames[properties.level]} />
          <PanelHint label={copy.regionProjects} value={projectsLoading ? "…" : String(projects.length)} wide={total == null} />
          {total != null ? <PanelHint label={copy.investment} value={formatMapInvestment(String(total), locale)} /> : null}
          {properties.level === "polo" && properties.extra.tipo ? <PanelHint label={copy.poloType} value={copy.poloTypes[properties.extra.tipo] ?? properties.extra.tipo} wide /> : null}
          {properties.level === "polo" && subregions.length ? <PanelHint label={copy.regionLevels.sub} value={subregions.join(", ")} wide /> : null}
        </dl>
        {properties.extra.approximate ? <p className="mt-3 text-xs italic text-[#d5e3ff]/70">{copy.approximateBoundary}</p> : null}
        <div className="mt-8 border-t border-white/10 pt-6">
          <h3 className="text-lg font-bold">{copy.geolocatedProjects}</h3>
          <ProjectList locale={locale} copy={copy} projects={projects} loading={projectsLoading} error={projectsError} emptyMessage={copy.noProjectsInRegion} onSelectProject={onSelectProject} />
        </div>
      </aside>
    );
  }

  if (regionMode || !department) {
    return (
      <aside className="flex min-h-[360px] flex-col justify-center rounded-[1.5rem] border border-white/10 bg-[#24436B] p-6 text-white shadow-xl lg:min-h-0" aria-live="polite">
        <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-[#8DC046]">{copy.panelEyebrow}</p>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight">{regionMode ? copy.selectRegion : copy.selectDepartment}</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
          <PanelHint label={copy.projects} value={regionMode && !projectsLoading ? String(projects.length) : "—"} />
          <PanelHint label={copy.opportunities} value="—" />
        </div>
      </aside>
    );
  }

  const hasActivity = Boolean(summary && summary.projects_count + summary.opportunities_count > 0);
  const emptyProjectsMessage = municipality
    ? copy.noGeolocatedProjectsMunicipality
    : copy.noGeolocatedProjectsDepartment;

  return (
    <aside className="rounded-[1.5rem] border border-white/10 bg-[#24436B] p-5 text-white shadow-xl sm:p-6" aria-live="polite" aria-label={`${copy.selectedDepartment}: ${department.name}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-[#8DC046]">{copy.selectedDepartment}</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">{department.name}</h2>
          {municipality ? (
            <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-[#8DC046]/30 bg-[#35A963]/10 p-3">
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

      {!summary || !hasActivity ? (
        <p className="mt-8 rounded-xl border border-white/10 bg-[#252A58]/60 p-4 text-sm leading-relaxed text-[#d5e3ff]">{summary ? copy.noResults : copy.noSummary}</p>
      ) : (
        <>
          <dl className="mt-7 grid grid-cols-2 gap-3">
            <PanelHint label={copy.projects} value={String(summary.projects_count)} />
            <PanelHint label={copy.opportunities} value={String(summary.opportunities_count)} />
            <PanelHint label={copy.investment} value={formatMapInvestment(summary.total_investment, locale)} wide />
            <PanelHint label={copy.jobs} value={formatMapJobs(summary.estimated_jobs, locale)} wide />
          </dl>
          {summary.sectors.length > 0 ? (
            <div className="mt-7">
              <p className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-[#b6c2d3]">{copy.activeSectors}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {summary.sectors.map((sector) => <li key={sector.slug} className="rounded-full border border-[#8DC046]/40 bg-[#35A963]/15 px-3 py-1.5 text-xs font-semibold text-[#d8ef9f]">{sector.name}</li>)}
              </ul>
            </div>
          ) : null}
        </>
      )}

      <div className="mt-8 border-t border-white/10 pt-6">
        <h3 className="text-lg font-bold">{copy.geolocatedProjects}</h3>
        {municipalitiesLoading ? <p className="mt-4 text-sm text-[#d5e3ff]/70">{copy.loadingMunicipalities}</p> : null}
        {municipalitiesError ? <p role="alert" className="mt-4 rounded-lg border border-red-200/20 bg-red-950/25 p-3 text-sm text-red-100">{copy.municipalitiesError}</p> : null}
        {!municipalitiesLoading && !municipalitiesError && municipalitiesEmpty ? (
          <p className="mt-3 text-xs text-[#d5e3ff]/65">{copy.noMunicipalities}</p>
        ) : null}
        <ProjectList locale={locale} copy={copy} projects={projects} loading={projectsLoading} error={projectsError} emptyMessage={emptyProjectsMessage} onSelectProject={onSelectProject} />
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
}: {
  locale: Locale;
  copy: InvestmentMapCopy;
  projects: MapInvestmentProject[];
  loading: boolean;
  error: boolean;
  emptyMessage: string;
  onSelectProject: (project: MapInvestmentProject) => void;
}) {
  return (
    <>
      {loading ? <p className="mt-4 text-sm text-[#d5e3ff]/70">{copy.loadingProjects}</p> : null}
      {error ? <p role="alert" className="mt-4 rounded-lg border border-red-200/20 bg-red-950/25 p-3 text-sm text-red-100">{copy.projectsError}</p> : null}
      {!loading && !error && projects.length === 0 ? (
        <p className="mt-4 text-sm text-[#d5e3ff]/70">{emptyMessage}</p>
      ) : null}
      <ul className="mt-4 space-y-3">
        {projects.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelectProject(item)}
              className="min-h-11 w-full rounded-xl border border-white/10 bg-[#252A58]/55 p-4 text-left transition hover:border-[#8DC046]/50 hover:bg-[#252A58]/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7BF06]"
            >
              <p className="font-bold leading-snug">{item.title}</p>
              <p className="mt-1 text-xs text-[#d5e3ff]/75">{item.sector.name} · {copy.stage[item.stage] ?? item.stage}</p>
              <p className="mt-3 text-xs text-[#d5e3ff]/80">{formatMapInvestment(item.investment_amount, locale)} · {formatMapJobs(item.estimated_jobs, locale)} {copy.jobs.toLowerCase()}</p>
            </button>
          </li>
        ))}
      </ul>
    </>
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

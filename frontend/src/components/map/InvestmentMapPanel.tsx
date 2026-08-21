"use client";

import type { Locale } from "@/src/i18n/config";
import type { InvestmentMapCopy } from "@/src/i18n/copy/investmentMap";
import type { InvestmentProject } from "@/src/types/investment";
import type { DepartmentProperties, MapDepartmentSummary } from "@/src/lib/types/investment-map";
import { formatMapInvestment, formatMapJobs } from "@/src/lib/types/investment-map";

type Props = {
  locale: Locale;
  copy: InvestmentMapCopy;
  department: DepartmentProperties | null;
  summary: MapDepartmentSummary | undefined;
  projects: InvestmentProject[];
  projectsLoading: boolean;
  projectsError: boolean;
  onClear: () => void;
};

export function InvestmentMapPanel({
  locale,
  copy,
  department,
  summary,
  projects,
  projectsLoading,
  projectsError,
  onClear,
}: Props) {
  if (!department) {
    return (
      <aside className="flex min-h-[360px] flex-col justify-center rounded-[1.5rem] border border-white/10 bg-[#24436B] p-6 text-white shadow-xl lg:min-h-0" aria-live="polite">
        <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-[#8DC046]">CNI · Honduras</p>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight">{copy.selectDepartment}</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
          <PanelHint label={copy.projects} value="—" />
          <PanelHint label={copy.opportunities} value="—" />
        </div>
      </aside>
    );
  }

  const hasActivity = Boolean(summary && summary.projects_count + summary.opportunities_count > 0);
  return (
    <aside className="rounded-[1.5rem] border border-white/10 bg-[#24436B] p-5 text-white shadow-xl sm:p-6" aria-live="polite" aria-label={`${copy.selectedDepartment}: ${department.name}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-[#8DC046]">{copy.selectedDepartment}</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">{department.name}</h2>
        </div>
        <button type="button" onClick={onClear} className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold transition hover:border-[#8DC046] hover:text-[#d8ef9f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7BF06]">
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
        <h3 className="text-lg font-bold">{copy.projectList}</h3>
        {projectsLoading ? <p className="mt-4 text-sm text-[#d5e3ff]/70">{copy.loadingProjects}</p> : null}
        {projectsError ? <p className="mt-4 rounded-lg border border-red-200/20 bg-red-950/25 p-3 text-sm text-red-100">{copy.projectsError}</p> : null}
        {!projectsLoading && !projectsError && projects.length === 0 ? <p className="mt-4 text-sm text-[#d5e3ff]/70">{copy.noProjects}</p> : null}
        <ul className="mt-4 space-y-3">
          {projects.slice(0, 5).map((project) => (
            <li key={project.id} className="rounded-xl border border-white/10 bg-[#252A58]/55 p-4">
              <p className="font-bold leading-snug">{project.title}</p>
              <p className="mt-1 text-xs text-[#d5e3ff]/75">{project.sector.name} · {copy.stage[project.project_stage] ?? project.project_stage}</p>
              <p className="mt-3 text-xs text-[#d5e3ff]/80">{formatMapInvestment(project.investment_amount, locale)} · {formatMapJobs(project.estimated_jobs, locale)} {copy.jobs.toLowerCase()}</p>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function PanelHint({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return <div className={`rounded-xl border border-white/10 bg-[#252A58]/60 p-3 ${wide ? "col-span-2" : ""}`}><dt className="font-headline text-[10px] font-bold uppercase tracking-[0.14em] text-[#b6c2d3]">{label}</dt><dd className="mt-1 text-lg font-extrabold">{value}</dd></div>;
}

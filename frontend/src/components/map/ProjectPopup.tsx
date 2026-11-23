import Link from "next/link";
import type { Locale } from "@/src/i18n/config";
import type { InvestmentMapCopy } from "@/src/i18n/copy/investmentMap";
import { withLocale } from "@/src/i18n/path";
import {
  formatMapInvestment,
  formatMapJobs,
  type DepartmentProperties,
  type MapInvestmentProject,
  type MunicipalityProperties,
} from "@/src/lib/types/investment-map";

type Props = {
  locale: Locale;
  copy: InvestmentMapCopy;
  project: MapInvestmentProject;
  department: DepartmentProperties | null;
  municipality: MunicipalityProperties | null;
  onClearProject: () => void;
};

export function ProjectPopup({ locale, copy, project, department, municipality, onClearProject }: Props) {
  const isOpportunity = (project.kind ?? "project") === "opportunity";
  const isCase = project.kind === "case";
  const itemLabel = isCase ? copy.tabCases : isOpportunity ? copy.selectedOpportunity : copy.selectedProject;
  const sheetHref = withLocale(
    locale,
    isCase ? `/portafolio/casos/${project.slug}` : isOpportunity ? `/portafolio/oportunidades/${project.slug}` : `/portafolio/fichas-proyectos/${project.slug}`,
  );
  return (
    <aside className="flex max-h-[min(70vh,600px)] flex-col overflow-y-auto rounded-[1.5rem] border border-white/10 bg-[#24436B] p-5 text-white shadow-xl sm:p-6 lg:max-h-[600px]" aria-live="polite" aria-label={`${itemLabel}: ${project.title}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-[#8DC046]">{itemLabel}</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight">{project.title}</h2>
          {project.code ? <p className="mt-1 text-xs font-semibold text-[#d5e3ff]/75">{project.code}</p> : null}
        </div>
        <button type="button" onClick={onClearProject} className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold transition hover:border-[#8DC046] hover:text-[#d8ef9f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7BF06]">
          {copy.backToList}
        </button>
      </div>
      <dl className="mt-7 space-y-3 text-sm">
        <DetailRow label={copy.activeSectors} value={project.sector?.name ?? "—"} />
        <DetailRow label={copy.selectedDepartment} value={project.department?.name ?? department?.name ?? "—"} />
        <DetailRow label={copy.selectedMunicipality} value={project.municipality?.name ?? municipality?.name ?? "—"} />
        <DetailRow label={copy.stageLabel} value={copy.stage[project.stage] ?? (project.stage || "—")} />
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

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#252A58]/55 px-4 py-3">
      <dt className="font-headline text-[10px] font-bold uppercase tracking-[0.14em] text-[#b6c2d3]">{label}</dt>
      <dd className="mt-1 font-semibold text-[#f4f7ff]">{value}</dd>
    </div>
  );
}

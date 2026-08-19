import type { Locale } from "@/src/i18n/config";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";
import type { InvestmentProject, ProjectStage } from "@/src/types/investment";
import type { AsyncData } from "@/src/lib/asyncData";
import { sectorTemplateChrome } from "@/src/data/sectorPageContent";

const PROJECT_STAGE_LABELS: Record<Locale, Record<ProjectStage, string>> = {
  es: {
    promotion: "Promoción",
    announced: "Anunciado",
    startup: "Inicio",
    implementing: "En implementación",
    stalled: "Detenido",
    finished: "Finalizado",
    cancelled: "Cancelado",
  },
  en: {
    promotion: "Promotion",
    announced: "Announced",
    startup: "Startup",
    implementing: "Implementing",
    stalled: "Stalled",
    finished: "Finished",
    cancelled: "Cancelled",
  },
};

type Props = {
  locale: Locale;
  result: AsyncData<InvestmentProject[]>;
};

export function SectorProjects({ locale, result }: Props) {
  const copy = sectorTemplateChrome[locale];
  const items = result.data;
  const isError = result.status === "error";

  return (
    <section className={cn("bg-white", layout.section)}>
      <div className={layout.container}>
        <header className="mb-12 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className={t.eyebrow}>{copy.projectsEyebrow}</p>
            <h2 className={cn("mt-3", t.h2)}>{copy.projectsTitle}</h2>
            <div className={cn("mt-4", t.sectionRule)} />
            <p className={cn("mt-6", t.lead)}>{copy.projectsLead}</p>
          </div>
          {!isError && items.length > 0 ? (
            <span className="al-sector-pill inline-flex items-center gap-2 self-start rounded-full px-4 py-2 font-headline text-[10px] font-bold uppercase tracking-[0.18em] md:self-end">
              {items.length}
            </span>
          ) : null}
        </header>

        {isError ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-800">
            {copy.projectsError}
          </p>
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-cni-primary/10 bg-[#f8f9ff] px-6 py-10 text-center text-sm text-[#0E7A7C]">
            {copy.projectsEmpty}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((project, index) => (
              <article
                key={project.slug}
                className="al-sector-data-card group flex flex-col rounded-xl border border-cni-primary/8 bg-[#f8f9ff] p-7 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <span className="al-sector-pill inline-flex items-center rounded-full px-3 py-1 font-headline text-[10px] font-bold uppercase tracking-[0.18em]">
                    {PROJECT_STAGE_LABELS[locale][project.project_stage] ?? project.project_stage}
                  </span>
                  <span className="font-headline text-[9px] font-bold uppercase tracking-[0.2em] text-cni-on-surface-variant/55">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-extrabold leading-snug text-cni-primary">
                  {project.title}
                </h3>
                <p className="mt-3 line-clamp-4 flex-1 font-body text-sm leading-relaxed text-[#0E7A7C]">
                  {project.summary || project.description}
                </p>
                <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-cni-primary/8 pt-5">
                  {project.investment_amount ? (
                    <div>
                      <dt className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-cni-on-surface-variant/60">
                        CAPEX
                      </dt>
                      <dd className="mt-1 font-display text-sm font-extrabold text-cni-primary">
                        {project.investment_amount}
                      </dd>
                    </div>
                  ) : null}
                  {project.estimated_jobs !== null ? (
                    <div>
                      <dt className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-cni-on-surface-variant/60">
                        {locale === "es" ? "Empleos" : "Jobs"}
                      </dt>
                      <dd className="mt-1 font-display text-sm font-extrabold text-cni-primary">
                        {project.estimated_jobs}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

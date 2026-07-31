import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, TrendingUp, MapPin, Briefcase, Globe2 } from "lucide-react";
import type { CSSProperties } from "react";
import { SectorIcon } from "@/src/components/cni/SectorIcon";
import { sectorPhotoHeaders, SECTOR_ICON_SIZE } from "@/src/lib/sectorIcons";
import type { Locale } from "@/src/i18n/config";
import type { SectorCopy, SectorSlug } from "@/src/data/investmentSectors";
import { getSectorPageExtra } from "@/src/i18n/copy/sectorDetailPage";
import { invertirPageCopy, SECTOR_ACCENTS } from "@/src/i18n/copy/invertirPage";
import { withLocale, getSectorHref } from "@/src/i18n/path";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";
import type {
  InvestmentOpportunity,
  InvestmentProject,
  ProjectStage,
  SuccessStory,
} from "@/src/types/investment";

type Props = {
  locale: Locale;
  slug: SectorSlug;
  sector: SectorCopy;
  opportunities?: InvestmentOpportunity[];
  projects?: InvestmentProject[];
  successStories?: SuccessStory[];
};

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

function formatProjectStage(locale: Locale, stage: ProjectStage): string {
  return PROJECT_STAGE_LABELS[locale][stage] ?? stage;
}

export function SectorDetailView({
  locale,
  slug,
  sector,
  opportunities = [],
  projects = [],
  successStories = [],
}: Props) {
  const x = getSectorPageExtra(slug, locale);
  const inv = invertirPageCopy[locale];
  const L = (path: string) => withLocale(locale, path);
  const hasOpportunities = opportunities.length > 0;
  const hasProjects = projects.length > 0;
  const hasSuccessStories = successStories.length > 0;

  const palette = SECTOR_ACCENTS[slug] ?? SECTOR_ACCENTS.agroindustria;
  const photoSrc = sectorPhotoHeaders[slug] ?? sector.image;
  const sectorStyle: CSSProperties & Record<string, string> = {
    "--sector-accent": palette.accent,
    "--sector-soft": palette.soft,
    "--sector-border": palette.border,
  };

  const otherSectors = (Object.keys(SECTOR_ACCENTS) as SectorSlug[]).filter((s) => s !== slug);

  return (
    <div className={cn("flex flex-1 flex-col bg-[#f8f9ff]", "al-sector-detail")} style={sectorStyle}>
      {/* 1. Hero — 100vh con imagen full-bleed y acentos per-sector */}
      <header className="al-sector-hero relative -mt-28 flex min-h-screen items-center overflow-hidden bg-cni-primary pt-32 md:pt-28">
        <div className="absolute inset-0">
          <Image
            src={photoSrc}
            alt={sector.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-[0.78]"
          />
          {/* Capa base navy fuerte */}
          <div className="absolute inset-0 bg-[#1a1f3d]/65" />
          <div className="absolute inset-0 al-sector-hero-overlay" />
          <div className="al-sector-hero-mesh pointer-events-none absolute inset-0 opacity-30" aria-hidden />
          {/* Viñeta inferior */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e22]/55 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 w-full py-16 md:py-20">
          <div className={layout.container}>
            <Link
              href={L("/invertir/sectores")}
              className="al-sector-back-link mb-8 inline-flex items-center gap-2 font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 transition hover:text-white md:mb-12"
            >
              <ArrowRight className="h-3.5 w-3.5 rotate-180" />
              {x.backToSectors}
            </Link>

            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-7">
                <div className="mb-6 flex items-center gap-4">
                  <span
                    className="al-sector-icon-frame flex h-16 w-16 items-center justify-center rounded-2xl backdrop-blur-md md:h-20 md:w-20"
                    aria-hidden
                  >
                    <SectorIcon slug={slug} size={56} className="text-white" />
                  </span>
                  <span className="al-sector-eyebrow inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-headline text-[10px] font-bold uppercase tracking-[0.22em] backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {x.heroBadge}
                  </span>
                </div>

                <h1
                  className="max-w-4xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4.25rem]"
                  style={{ textShadow: "0 2px 24px rgba(0, 0, 0, 0.55)" }}
                >
                  {x.heroTitleBefore}{" "}
                  <span className="al-sector-accent-text">{x.heroTitleAccent}</span>
                  {x.heroTitleAfter ? ` ${x.heroTitleAfter}` : ""}
                </h1>

                <p
                  className="mt-6 max-w-2xl font-body text-base font-light leading-relaxed text-white/90 md:text-lg"
                  style={{ textShadow: "0 1px 12px rgba(0, 0, 0, 0.45)" }}
                >
                  {sector.short}
                </p>

                <div className="mt-10 flex flex-wrap gap-4">
                  <Link
                    href={L("/asesoria")}
                    className="al-sector-cta-primary inline-flex items-center gap-2 rounded-lg px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.16em] transition"
                  >
                    {inv.ctaAdvisor}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={L("/recursos")}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur transition hover:bg-white/20"
                  >
                    {inv.ctaGuide}
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-5">
                {x.stats.map((s, i) => (
                  <div
                    key={s.label}
                    className="al-sector-stat rounded-xl border border-white/15 bg-[#252A58]/45 p-5 backdrop-blur-md"
                  >
                    <p className="font-headline text-[9px] font-bold uppercase tracking-[0.22em] text-white/65">
                      0{i + 1} · {s.label}
                    </p>
                    <p className="mt-2 font-display text-2xl font-extrabold leading-tight text-white md:text-3xl">
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Soberanía sectorial — la ventaja institucional */}
      <section className={cn("bg-white", layout.section)}>
        <div className={layout.container}>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <p className={t.eyebrow}>{inv.stickySector} · 01</p>
              <h2 className={cn("mt-3", t.h2)}>
                {x.valueTitle}
              </h2>
              <div className={cn("mt-4", t.sectionRule)} />
              <p className={cn("mt-6", t.lead)}>{x.valueLead}</p>

              <div className="al-sector-quick-stats mt-10 grid grid-cols-2 gap-3">
                <div className="al-sector-quick-stat rounded-xl border p-4">
                  <Globe2 className="h-4 w-4 al-sector-accent-text" />
                  <p className="mt-2 font-headline text-[9px] font-bold uppercase tracking-[0.2em] al-sector-accent-text">
                    {locale === "es" ? "Encaje legal" : "Legal fit"}
                  </p>
                  <p className="mt-1 font-display text-sm font-extrabold text-cni-primary">
                    LPPI · ZOLI
                  </p>
                </div>
                <div className="al-sector-quick-stat rounded-xl border p-4">
                  <Briefcase className="h-4 w-4 al-sector-accent-text" />
                  <p className="mt-2 font-headline text-[9px] font-bold uppercase tracking-[0.2em] al-sector-accent-text">
                    {locale === "es" ? "Acompañamiento" : "Support"}
                  </p>
                  <p className="mt-1 font-display text-sm font-extrabold text-cni-primary">
                    {locale === "es" ? "CNI 360°" : "CNI 360°"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:col-span-8">
              {x.advantages.map((a, i) => (
                <article
                  key={a.title}
                  className={cn(
                    "al-sector-advantage group rounded-2xl bg-[#f8f9ff] p-7 shadow-sm transition-shadow hover:shadow-xl",
                    a.wide && "md:col-span-2",
                  )}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className="al-sector-advantage-num flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-lg font-extrabold"
                      aria-hidden
                    >
                      0{i + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-extrabold leading-tight text-cni-primary md:text-xl">
                        {a.title}
                      </h3>
                      <p className="mt-3 font-body text-sm leading-relaxed text-[#0E7A7C] md:text-base">
                        {a.text}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Análisis de mercado — panorama del sector */}
      <section className={cn("bg-[#eff4ff]", layout.section, "border-y border-cni-primary/5")}>
        <div className={layout.container}>
          <header className="mb-12 max-w-3xl md:mb-16">
            <p className={t.eyebrow}>{x.analysisEyebrow}</p>
            <h2 className={cn("mt-3", t.h2)}>{x.analysisTitle}</h2>
            <div className={cn("mt-4", t.sectionRule)} />
            <p className={cn("mt-6", t.lead)}>{x.analysisIntro}</p>
          </header>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-14">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl lg:col-span-5">
              <Image
                src={photoSrc}
                alt={sector.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="al-sector-image-overlay absolute inset-0" />
              <span
                className="al-sector-corner-tag absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-cni-primary shadow-sm"
              >
                <MapPin className="h-3.5 w-3.5 al-sector-accent-text" />
                {locale === "es" ? "Panorama nacional" : "National outlook"}
              </span>
            </div>

            <div className="lg:col-span-7">
              <p className="font-body text-base leading-relaxed text-[#0E7A7C] md:text-lg">
                {sector.fullText}
              </p>

              <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {sector.highlights.map((h, i) => (
                  <div
                    key={h}
                    className="al-sector-highlight group flex items-start gap-3 rounded-xl border border-cni-primary/8 bg-white px-5 py-4 shadow-sm transition-colors hover:border-[color:var(--sector-border)]"
                  >
                    <span
                      className="al-sector-highlight-icon mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      aria-hidden
                    >
                      <Check className="h-3.5 w-3.5 text-white" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-headline text-[9px] font-bold uppercase tracking-[0.2em] text-cni-on-surface-variant/60">
                        {inv.cardStatsLabel} 0{i + 1}
                      </p>
                      <p className="mt-1 font-headline text-sm font-bold text-cni-primary">{h}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href={getSectorHref(locale, slug)}
                  className="al-sector-cta-primary inline-flex items-center gap-2 rounded-lg px-7 py-3.5 font-headline text-[11px] font-bold uppercase tracking-[0.16em] transition"
                >
                  {locale === "es" ? "Descargar ficha técnica" : "Download technical brief"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={L("/portafolio")}
                  className="inline-flex items-center gap-2 rounded-lg border border-cni-primary/15 bg-white px-7 py-3.5 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-cni-primary transition hover:border-[color:var(--sector-accent)]"
                >
                  {locale === "es" ? "Ver portafolio" : "View portfolio"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {hasOpportunities && (
        <section className={cn("bg-white", layout.section)}>
          <div className={layout.container}>
            <header className="mb-12 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className={t.eyebrow}>
                  {locale === "es" ? "Cartera de inversión" : "Investment pipeline"}
                </p>
                <h2 className={cn("mt-3", t.h2)}>
                  {locale === "es" ? "Oportunidades relacionadas" : "Related opportunities"}
                </h2>
                <div className={cn("mt-4", t.sectionRule)} />
                <p className={cn("mt-6", t.lead)}>
                  {locale === "es"
                    ? "Oportunidades públicas actualmente asociadas a este sector estratégico."
                    : "Public opportunities currently associated with this strategic sector."}
                </p>
              </div>
              <span className="al-sector-pill inline-flex items-center gap-2 self-start rounded-full px-4 py-2 font-headline text-[10px] font-bold uppercase tracking-[0.18em] md:self-end">
                <TrendingUp className="h-3.5 w-3.5" />
                {opportunities.length} {locale === "es" ? "Activas" : "Active"}
              </span>
            </header>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {opportunities.map((opportunity, i) => (
                <article
                  key={opportunity.slug}
                  className="al-sector-data-card group flex flex-col rounded-xl border border-cni-primary/8 bg-[#f8f9ff] p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <span className="al-sector-pill inline-flex items-center rounded-full px-3 py-1 font-headline text-[10px] font-bold uppercase tracking-[0.18em]">
                      {opportunity.status}
                    </span>
                    <span className="font-headline text-[9px] font-bold uppercase tracking-[0.2em] text-cni-on-surface-variant/55">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-extrabold leading-snug text-cni-primary">
                    {opportunity.title}
                  </h3>
                  <p className="mt-3 line-clamp-4 flex-1 font-body text-sm leading-relaxed text-[#0E7A7C]">
                    {opportunity.summary || opportunity.description}
                  </p>
                  <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-cni-primary/8 pt-5">
                    {opportunity.estimated_investment && (
                      <div>
                        <dt className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-cni-on-surface-variant/60">
                          {locale === "es" ? "Inversión" : "Investment"}
                        </dt>
                        <dd className="mt-1 font-display text-sm font-extrabold text-cni-primary">
                          {opportunity.estimated_investment}
                        </dd>
                      </div>
                    )}
                    {opportunity.estimated_jobs !== null && (
                      <div>
                        <dt className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-cni-on-surface-variant/60">
                          {locale === "es" ? "Empleos" : "Jobs"}
                        </dt>
                        <dd className="mt-1 font-display text-sm font-extrabold text-cni-primary">
                          {opportunity.estimated_jobs}
                        </dd>
                      </div>
                    )}
                  </dl>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {hasProjects && (
        <section className={cn("bg-[#eff4ff]", layout.section)}>
          <div className={layout.container}>
            <header className="mb-12 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className={t.eyebrow}>
                  {locale === "es" ? "Portafolio activo" : "Active portfolio"}
                </p>
                <h2 className={cn("mt-3", t.h2)}>
                  {locale === "es" ? "Proyectos en curso" : "Projects in progress"}
                </h2>
                <div className={cn("mt-4", t.sectionRule)} />
                <p className={cn("mt-6", t.lead)}>
                  {locale === "es"
                    ? "Proyectos de inversión públicos actualmente asociados a este sector estratégico."
                    : "Public investment projects currently associated with this strategic sector."}
                </p>
              </div>
              <span className="al-sector-pill inline-flex items-center gap-2 self-start rounded-full px-4 py-2 font-headline text-[10px] font-bold uppercase tracking-[0.18em] md:self-end">
                {projects.length} {locale === "es" ? "Registrados" : "Registered"}
              </span>
            </header>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, i) => (
                <article
                  key={project.slug}
                  className="al-sector-data-card group flex flex-col rounded-xl border border-cni-primary/8 bg-white p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <span className="al-sector-pill inline-flex items-center rounded-full px-3 py-1 font-headline text-[10px] font-bold uppercase tracking-[0.18em]">
                      {formatProjectStage(locale, project.project_stage)}
                    </span>
                    <span className="font-headline text-[9px] font-bold uppercase tracking-[0.2em] text-cni-on-surface-variant/55">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-extrabold leading-snug text-cni-primary">
                    {project.title}
                  </h3>
                  <p className="mt-3 line-clamp-4 flex-1 font-body text-sm leading-relaxed text-[#0E7A7C]">
                    {project.summary || project.description}
                  </p>
                  <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-cni-primary/8 pt-5">
                    {project.investment_amount && (
                      <div>
                        <dt className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-cni-on-surface-variant/60">
                          {locale === "es" ? "CAPEX" : "CAPEX"}
                        </dt>
                        <dd className="mt-1 font-display text-sm font-extrabold text-cni-primary">
                          {project.investment_amount}
                        </dd>
                      </div>
                    )}
                    {project.estimated_jobs !== null && (
                      <div>
                        <dt className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-cni-on-surface-variant/60">
                          {locale === "es" ? "Empleos" : "Jobs"}
                        </dt>
                        <dd className="mt-1 font-display text-sm font-extrabold text-cni-primary">
                          {project.estimated_jobs}
                        </dd>
                      </div>
                    )}
                  </dl>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {hasSuccessStories && (
        <section className={cn("bg-white", layout.section)}>
          <div className={layout.container}>
            <header className="mb-12 md:mb-14">
              <p className={t.eyebrow}>
                {locale === "es" ? "Resultados de inversión" : "Investor outcomes"}
              </p>
              <h2 className={cn("mt-3", t.h2)}>
                {locale === "es" ? "Casos de éxito relacionados" : "Related success stories"}
              </h2>
              <div className={cn("mt-4", t.sectionRule)} />
              <p className={cn("mt-6 max-w-2xl", t.lead)}>
                {locale === "es"
                  ? "Empresas e inversiones vinculadas a este sector estratégico."
                  : "Companies and investments connected to this strategic sector."}
              </p>
            </header>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {successStories.map((story, i) => (
                <article
                  key={story.slug}
                  className="al-sector-data-card group flex flex-col rounded-xl border border-cni-primary/8 bg-[#f8f9ff] p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  {story.company_name && (
                    <p className="al-sector-pill inline-flex w-fit items-center rounded-full px-3 py-1 font-headline text-[10px] font-bold uppercase tracking-[0.18em]">
                      {story.company_name}
                    </p>
                  )}
                  <h3 className="mt-5 font-display text-lg font-extrabold leading-snug text-cni-primary">
                    {story.title}
                  </h3>
                  <p className="mt-3 line-clamp-4 flex-1 font-body text-sm leading-relaxed text-[#0E7A7C]">
                    {story.summary}
                  </p>
                  <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-cni-primary/8 pt-5">
                    {story.country_origin && (
                      <div>
                        <dt className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-cni-on-surface-variant/60">
                          {locale === "es" ? "Origen" : "Origin"}
                        </dt>
                        <dd className="mt-1 font-display text-sm font-extrabold text-cni-primary">
                          {story.country_origin}
                        </dd>
                      </div>
                    )}
                    {story.investment_amount && (
                      <div>
                        <dt className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-cni-on-surface-variant/60">
                          {locale === "es" ? "Inversión" : "Investment"}
                        </dt>
                        <dd className="mt-1 font-display text-sm font-extrabold text-cni-primary">
                          {story.investment_amount}
                        </dd>
                      </div>
                    )}
                    {story.jobs_generated !== null && (
                      <div className="col-span-2">
                        <dt className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-cni-on-surface-variant/60">
                          {locale === "es" ? "Empleos generados" : "Jobs generated"}
                        </dt>
                        <dd className="mt-1 font-display text-base font-extrabold text-cni-primary">
                          {story.jobs_generated}
                        </dd>
                      </div>
                    )}
                  </dl>
                  <span className="mt-4 font-headline text-[9px] font-bold uppercase tracking-[0.2em] text-cni-on-surface-variant/55">
                    {locale === "es" ? `Caso 0${i + 1}` : `Case 0${i + 1}`}
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Otros sectores — exploración */}
      <section className={cn("bg-[#f8f9ff] py-16 md:py-20", "border-t border-cni-primary/8")}>
        <div className={layout.container}>
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className={t.eyebrow}>
                {locale === "es" ? "Sigue explorando" : "Keep exploring"}
              </p>
              <h2 className={cn("mt-3", t.h2)}>
                {locale === "es" ? "Otros sectores estratégicos" : "Other strategic sectors"}
              </h2>
              <div className={cn("mt-4", t.sectionRule)} />
            </div>
            <Link
              href={L("/invertir/sectores")}
              className="inline-flex items-center gap-2 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-cni-primary transition hover:text-[color:var(--sector-accent)]"
            >
              {locale === "es" ? "Catálogo completo" : "Full catalog"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {otherSectors.map((otherSlug) => {
              const otherPalette = SECTOR_ACCENTS[otherSlug];
              return (
                <Link
                  key={otherSlug}
                  href={getSectorHref(locale, otherSlug)}
                  className="al-sector-pill-card group flex items-center gap-3 rounded-xl border border-cni-primary/8 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={
                    {
                      "--sector-accent": otherPalette.accent,
                      "--sector-soft": otherPalette.soft,
                      "--sector-border": otherPalette.border,
                    } as CSSProperties
                  }
                >
                  <span
                    className="al-sector-mini-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    aria-hidden
                  >
                    <SectorIcon slug={otherSlug} size={SECTOR_ICON_SIZE.sidebar} />
                  </span>
                  <span className="min-w-0 font-headline text-xs font-bold leading-tight text-cni-primary">
                    {locale === "es"
                      ? {
                          agroindustria: "Agroindustria",
                          manufactura: "Manufactura",
                          turismo: "Turismo",
                          energia: "Energía",
                          infraestructura: "Infraestructura",
                          logistica: "Logística y Transporte",
                        }[otherSlug]
                      : {
                          agroindustria: "Agroindustry",
                          manufactura: "Manufacturing",
                          turismo: "Tourism",
                          energia: "Energy",
                          infraestructura: "Infrastructure",
                          logistica: "Logistics and Transport",
                        }[otherSlug]}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="al-sector-cta-final relative overflow-hidden bg-[#252A58] py-20 text-white md:py-24">
        <div className="site-footer-mesh pointer-events-none absolute inset-0 opacity-[0.22]" aria-hidden />
        <div className={cn(layout.container, "relative z-10")}>
          <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className={t.eyebrowOnDark}>{locale === "es" ? "Acompañamiento CNI" : "CNI support"}</p>
              <h2 className={cn("mt-3", t.h2OnDark)}>{inv.ctaTitle}</h2>
              <p className={cn("mt-4 text-white/75", t.lead)}>{inv.ctaBody}</p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href={L("/asesoria")}
                className={cn(
                  "al-sector-cta-primary inline-flex items-center justify-center gap-2 rounded-lg px-10 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.16em] transition",
                )}
              >
                {inv.ctaAdvisory}
              </Link>
              <Link
                href={L("/recursos")}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-10 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-white/10"
              >
                {inv.ctaGuide}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
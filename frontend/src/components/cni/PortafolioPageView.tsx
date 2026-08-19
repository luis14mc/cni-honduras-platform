import Image from "next/image";
import Link from "next/link";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { PortafolioCatalog } from "@/src/components/cni/PortafolioCatalog";
import { designImages } from "@/src/lib/designAssets";
import {
  getSectors as getStaticSectors,
  isSectorSlug,
  type SectorSlug,
} from "@/src/data/investmentSectors";
import type { Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";
import type { AsyncData } from "@/src/lib/asyncData";
import type {
  InvestmentOpportunity,
  InvestmentProject,
  Sector,
} from "@/src/types/investment";

const copy = {
  es: {
    titleA: "Portafolio de",
    titleB: "inversión",
    description:
      "Proyectos y oportunidades estratégicas en los corredores de desarrollo de Honduras, evaluados para crecimiento sostenible.",
    heroCatalog: "Ver catálogo",
    heroMap: "Mapa de inversiones",
    heroSubmit: "Postular un proyecto",
    catalogEyebrow: "Catálogo institucional",
    catalogTitle: "Oportunidades y proyectos",
    catalogLead:
      "Filtre por tipo y sector. Vacío no es error: si no hay fichas, el catálogo está en actualización.",
    viewCases: "Casos de éxito",
    ctaEyebrow: "Acompañamiento CNI",
    ctaTitle1: "Estructure su entrada",
    ctaTitle2: "con respaldo institucional",
    ctaDesc:
      "Asesoría técnica, marco legal y seguimiento para inversionistas que evalúan o postulan proyectos en Honduras.",
    ctaPrimary: "Contactar al CNI",
    ctaSecondary: "Postular proyecto",
    ctaResources: "Recursos",
  },
  en: {
    titleA: "Investment",
    titleB: "portfolio",
    description:
      "Strategic projects and opportunities in Honduras’s development corridors, evaluated for sustainable growth.",
    heroCatalog: "View catalog",
    heroMap: "Investment map",
    heroSubmit: "Submit a project",
    catalogEyebrow: "Institutional catalog",
    catalogTitle: "Opportunities and projects",
    catalogLead:
      "Filter by type and sector. Empty is not an error: if no records appear, the catalog is being updated.",
    viewCases: "Success stories",
    ctaEyebrow: "CNI support",
    ctaTitle1: "Structure your entry",
    ctaTitle2: "with institutional backing",
    ctaDesc:
      "Technical advice, legal framing and follow-up for investors evaluating or submitting projects in Honduras.",
    ctaPrimary: "Contact CNI",
    ctaSecondary: "Submit a project",
    ctaResources: "Resources",
  },
} as const;

type Props = {
  locale: Locale;
  projects: AsyncData<InvestmentProject[]>;
  opportunities: AsyncData<InvestmentOpportunity[]>;
  sectors: AsyncData<Sector[]>;
};

function sectorNav(locale: Locale, apiSectors: Sector[]): { slug: SectorSlug; label: string }[] {
  const staticList = getStaticSectors(locale);
  const labels = new Map(
    apiSectors
      .filter((s): s is Sector & { slug: SectorSlug } => isSectorSlug(s.slug))
      .map((s) => [s.slug, s.name] as const),
  );
  return staticList
    .filter((s): s is typeof s & { slug: SectorSlug } => isSectorSlug(s.slug))
    .map((s) => ({ slug: s.slug, label: labels.get(s.slug) || s.name }));
}

export function PortafolioPageView({ locale, projects, opportunities, sectors }: Props) {
  const c = copy[locale];
  const L = (path: string) => withLocale(locale, path);
  const navSectors = sectorNav(locale, sectors.data);

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9fa]">
      <header className="relative flex min-h-screen items-center overflow-hidden bg-[#000a1e] pt-32 pb-24 text-white">
        <div className="absolute inset-0">
          <Image
            src={designImages.portfolio.hero}
            alt={locale === "es" ? "Portafolio de inversión" : "Investment portfolio"}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-[0.42]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#000a1e]/70 via-[#000a1e]/35 to-transparent" />
          <div className="site-footer-mesh pointer-events-none absolute inset-0 opacity-[0.16]" aria-hidden />
        </div>
        <div className={cn("relative z-10 w-full", layout.container)}>
          <div className="max-w-3xl">
            <h1 className={cn("text-white", t.heroTitle)}>
              {c.titleA} <span className="text-[#32B372]">{c.titleB}</span>
            </h1>
            <p className={cn("mt-6 max-w-2xl text-white/80", t.heroLead)}>{c.description}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#catalogo"
                className="rounded bg-[#32B372] px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#000a1e]"
              >
                {c.heroCatalog}
              </a>
              <Link
                href={L("/portafolio/mapa")}
                className="rounded border border-white px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#000a1e]"
              >
                {c.heroMap}
              </Link>
              <Link
                href={L("/portafolio/postulacion")}
                className="rounded border border-white px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#000a1e]"
              >
                {c.heroSubmit}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section id="catalogo" className={cn("bg-white", layout.section)}>
        <div className={layout.container}>
          <div className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className={t.eyebrow}>{c.catalogEyebrow}</p>
              <h2 className={cn("mt-3", t.h2)}>{c.catalogTitle}</h2>
              <div className={cn("mt-4", t.sectionRule)} />
              <p className={cn("mt-6", t.lead)}>{c.catalogLead}</p>
            </div>
            <Link
              href={L("/portafolio/casos")}
              className="inline-flex items-center gap-2 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-[#32B372] transition hover:text-cni-primary"
            >
              {c.viewCases}
            </Link>
          </div>
          <PortafolioCatalog
            locale={locale}
            sectors={navSectors}
            projects={projects}
            opportunities={opportunities}
          />
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#000a1e] py-24 text-white">
        <div className="site-footer-mesh pointer-events-none absolute inset-0 opacity-[0.16]" aria-hidden />
        <div className={cn("relative z-10", layout.container)}>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <p className={t.eyebrowOnDark}>{c.ctaEyebrow}</p>
              <h2 className={cn("mt-3 text-white", t.h2OnDark)}>
                {c.ctaTitle1} <span className="text-[#32B372]">{c.ctaTitle2}</span>
              </h2>
              <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-white/80">{c.ctaDesc}</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href={L("/contacto")}
                  className="rounded bg-[#32B372] px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#000a1e]"
                >
                  {c.ctaPrimary}
                </Link>
                <Link
                  href={L("/portafolio/postulacion")}
                  className="rounded border border-white px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#000a1e]"
                >
                  {c.ctaSecondary}
                </Link>
                <Link
                  href={L("/recursos")}
                  className="rounded border border-white/40 px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-white/80 transition hover:border-white hover:text-white"
                >
                  {c.ctaResources}
                </Link>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <MaterialIcon name="verified_user" className="text-5xl text-[#32B372]" />
              <p className="mt-4 font-display text-xl font-extrabold text-white">
                {locale === "es" ? "Asesoría sin costo" : "No-cost advisory"}
              </p>
              <p className="mt-2 font-body text-sm leading-relaxed text-white/70">
                {locale === "es"
                  ? "El CNI acompaña la evaluación, la instalación y el aftercare. No sustituye la decisión de inversión."
                  : "CNI supports evaluation, setup and aftercare. It does not replace the investment decision."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

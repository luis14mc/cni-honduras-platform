import Image from "next/image";
import Link from "next/link";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { CasosCatalog } from "@/src/components/cni/CasosCatalog";
import { PAGE_HEROES } from "@/src/lib/pageHeroes";
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
import type { SuccessStory } from "@/src/types/investment";

const copy = {
  es: {
    titleA: "Casos de",
    titleB: "éxito",
    description:
      "Empresas que instalaron y escalaron operaciones en Honduras con acompañamiento del CNI.",
    heroCatalog: "Ver casos",
    heroPortfolio: "Portafolio",
    heroContact: "Contactar al CNI",
    catalogEyebrow: "Catálogo institucional",
    catalogTitle: "Historias publicadas",
    catalogLead:
      "Filtre por sector. Vacío no es error: si no hay casos, el listado está en actualización.",
    ctaEyebrow: "Acompañamiento CNI",
    ctaTitle1: "Construya su propio",
    ctaTitle2: "caso de éxito",
    ctaDesc: "Asesoría gratuita para evaluar, instalar y dar seguimiento a su inversión en Honduras.",
    ctaPrimary: "Contactar al CNI",
    ctaSecondary: "Postular proyecto",
  },
  en: {
    titleA: "Success",
    titleB: "stories",
    description: "Companies that set up and scaled operations in Honduras with CNI support.",
    heroCatalog: "View stories",
    heroPortfolio: "Portfolio",
    heroContact: "Contact CNI",
    catalogEyebrow: "Institutional catalog",
    catalogTitle: "Published stories",
    catalogLead: "Filter by sector. Empty is not an error: if no stories appear, the list is being updated.",
    ctaEyebrow: "CNI support",
    ctaTitle1: "Build your own",
    ctaTitle2: "success story",
    ctaDesc: "No-cost advisory to evaluate, set up and follow your investment in Honduras.",
    ctaPrimary: "Contact CNI",
    ctaSecondary: "Submit a project",
  },
} as const;

type Props = {
  locale: Locale;
  stories: AsyncData<SuccessStory[]>;
};

function sectorOptions(locale: Locale): { slug: SectorSlug; label: string }[] {
  return getStaticSectors(locale)
    .filter((s): s is typeof s & { slug: SectorSlug } => isSectorSlug(s.slug))
    .map((s) => ({ slug: s.slug, label: s.name }));
}

export function CasosPageView({ locale, stories }: Props) {
  const c = copy[locale];
  const L = (path: string) => withLocale(locale, path);

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9fa]">
      <header className="relative flex min-h-screen items-center overflow-hidden bg-[#000a1e] pt-32 pb-24 text-white">
        <div className="absolute inset-0">
          <Image
            src={PAGE_HEROES.casos.image}
            alt={locale === "es" ? "Casos de éxito" : "Success stories"}
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
                href={L("/portafolio")}
                className="rounded border border-white px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#000a1e]"
              >
                {c.heroPortfolio}
              </Link>
              <Link
                href={L("/contacto")}
                className="rounded border border-white px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#000a1e]"
              >
                {c.heroContact}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section id="catalogo" className={cn("bg-white", layout.section)}>
        <div className={layout.container}>
          <div className="mb-10 max-w-2xl">
            <p className={t.eyebrow}>{c.catalogEyebrow}</p>
            <h2 className={cn("mt-3", t.h2)}>{c.catalogTitle}</h2>
            <div className={cn("mt-4", t.sectionRule)} />
            <p className={cn("mt-6", t.lead)}>{c.catalogLead}</p>
          </div>
          <CasosCatalog locale={locale} sectors={sectorOptions(locale)} stories={stories} />
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

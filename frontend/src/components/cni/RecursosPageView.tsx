import Link from "next/link";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { BrandPageHero, brandHeroCta } from "@/src/components/cni/BrandPageHero";
import { DownloadablePortfolios } from "@/src/components/cni/DownloadablePortfolios";
import { resourceCategoryHref } from "@/src/data/resourceCategoryMeta";
import { designImages } from "@/src/lib/designAssets";
import type { Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";
import type { AsyncData } from "@/src/lib/asyncData";
import type { CmsDocument, ResourceCategory } from "@/src/types/cms";

const copy = {
  es: {
    titleA: "Librería de",
    titleB: "recursos",
    description:
      "Guías, estudios y documentos del CNI para apoyar el aterrizaje de capital en Honduras.",
    heroImageAlt: "Centro de recursos CNI",
    heroCats: "Ver categorías",
    heroDocs: "Portafolios descargables",
    heroContact: "Contactar al CNI",
    catsEyebrow: "Navegación",
    catsTitle: "Categorías",
    categoriesEmpty: "Aún no hay categorías publicadas.",
    categoriesError: "No pudimos cargar las categorías. Intente de nuevo más tarde.",

    ctaEyebrow: "Acompañamiento CNI",
    ctaTitle1: "¿Necesita asesoría",
    ctaTitle2: "técnica?",
    ctaDesc: "El CNI brinda asistencia técnica y legal sin costo. No sustituye la decisión de inversión.",
    ctaPrimary: "Contactar al CNI",
    ctaSecondary: "Agendar reunión",
  },
  en: {
    titleA: "Resource",
    titleB: "library",
    description: "CNI guides, studies and documents to support capital landing in Honduras.",
    heroImageAlt: "CNI resource center",
    heroCats: "View categories",
    heroDocs: "Downloadable portfolios",
    heroContact: "Contact CNI",
    catsEyebrow: "Navigation",
    catsTitle: "Categories",
    categoriesEmpty: "There are no published categories yet.",
    categoriesError: "We could not load the categories. Try again later.",

    ctaEyebrow: "CNI support",
    ctaTitle1: "Need technical",
    ctaTitle2: "advice?",
    ctaDesc: "CNI provides technical and legal assistance at no cost. It does not replace the investment decision.",
    ctaPrimary: "Contact CNI",
    ctaSecondary: "Schedule a meeting",
  },
} as const;

type Props = {
  locale: Locale;
  categories: AsyncData<ResourceCategory[]>;
  sectorPortfolios: AsyncData<CmsDocument[]>;
  opportunityPortfolios: AsyncData<CmsDocument[]>;
};

export function RecursosPageView({ locale, categories, sectorPortfolios, opportunityPortfolios }: Props) {
  const c = copy[locale];
  const L = (path: string) => withLocale(locale, path);

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9fa]">
      <BrandPageHero
        title={
          <>
            {c.titleA} <span className="text-[#32B372]">{c.titleB}</span>
          </>
        }
        description={c.description}
        imageSrc={designImages.recursos.hero}
        imageAlt={c.heroImageAlt}
      >
        <a href="#categorias" className={brandHeroCta(true)}>
          {c.heroCats}
        </a>
        <a href="#documentos" className={brandHeroCta(false)}>
          {c.heroDocs}
        </a>
        <Link href={L("/contacto")} className={brandHeroCta(false)}>
          {c.heroContact}
        </Link>
      </BrandPageHero>

      <section id="categorias" className={cn("bg-white", layout.section)}>
        <div className={layout.container}>
          <p className={t.eyebrow}>{c.catsEyebrow}</p>
          <h2 className={cn("mt-3", t.h2)}>{c.catsTitle}</h2>
          <div className={cn("mt-4", t.sectionRule)} />
          {categories.status === "error" ? (
            <p role="alert" className="mt-6 text-red-800">{c.categoriesError}</p>
          ) : categories.data.length === 0 ? (
            <p className="mt-6 text-cni-primary">{c.categoriesEmpty}</p>
          ) : null}
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {categories.data.map((cat) => (
              <Link
                key={cat.documentId}
                href={resourceCategoryHref(cat.slug, locale)}
                className="group flex h-full flex-col rounded-xl border border-[#c5c6cd]/30 bg-[#f8f9fa] p-8 transition hover:-translate-y-1"
              >
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#32B372]/10 text-[#32B372]">
                  <MaterialIcon name="folder_open" className="text-[22px]" />
                </span>
                <h3 className={t.h3Card}>{cat.title}</h3>
                <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-[#44474d]">{cat.description}</p>
                <span className="mt-6 font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-[#32B372]">
                  {locale === "es" ? "Abrir" : "Open"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <DownloadablePortfolios locale={locale} sectorPortfolios={sectorPortfolios} opportunityPortfolios={opportunityPortfolios} />

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
                <Link href={L("/contacto")} className={brandHeroCta(true)}>
                  {c.ctaPrimary}
                </Link>
                <Link href={L("/asesoria")} className={brandHeroCta(false)}>
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

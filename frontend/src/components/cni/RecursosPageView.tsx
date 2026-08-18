import Link from "next/link";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { BrandPageHero, brandHeroCta } from "@/src/components/cni/BrandPageHero";
import { RecursosDocsCatalog } from "@/src/components/cni/RecursosDocsCatalog";
import { designImages } from "@/src/lib/designAssets";
import type { Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";
import type { AsyncData } from "@/src/lib/asyncData";
import type { CmsDocument } from "@/src/types/cms";

const copy = {
  es: {
    titleA: "Librería de",
    titleB: "recursos",
    description:
      "Guías, estudios y documentos del CNI para apoyar el aterrizaje de capital en Honduras.",
    heroImageAlt: "Centro de recursos CNI",
    heroCats: "Ver categorías",
    heroDocs: "Documentos destacados",
    heroContact: "Contactar al CNI",
    catsEyebrow: "Navegación",
    catsTitle: "Categorías",
    catsLead: "Repositorio institucional y accesos al portafolio, oportunidades y marco legal.",
    categories: [
      { icon: "account_balance", title: "Institucionales", text: "Memorias y documentos oficiales del CNI.", href: "/recursos/institucional" },
      { icon: "construction", title: "Técnicos", text: "Guías y manuales para el aterrizaje de capital.", href: "/recursos/tecnicos" },
      { icon: "article", title: "Biblioteca", text: "Formularios, plantillas y consulta general.", href: "/recursos/biblioteca" },
      { icon: "analytics", title: "Estudios", text: "Análisis sectoriales y de mercado.", href: "/recursos/estudios" },
      { icon: "folder_managed", title: "Portafolio", text: "Proyectos y oportunidades públicas.", href: "/portafolio" },
      { icon: "gavel", title: "Marco legal", text: "LPPI, ZOLI y servicios jurídicos del CNI.", href: "/cni/servicios-legales" },
    ],
    docsEyebrow: "Actualizados",
    docsTitle: "Documentos destacados",
    docsLead: "Publicados en el CMS. Vacío no es error: si no hay fichas, el catálogo está en actualización.",
    viewAll: "Ver institucionales",
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
    heroDocs: "Featured documents",
    heroContact: "Contact CNI",
    catsEyebrow: "Navigation",
    catsTitle: "Categories",
    catsLead: "Institutional repository plus portfolio, opportunities and legal framework.",
    categories: [
      { icon: "account_balance", title: "Institutional", text: "CNI reports and official documents.", href: "/recursos/institucional" },
      { icon: "construction", title: "Technical", text: "Guides and manuals for capital landing.", href: "/recursos/tecnicos" },
      { icon: "article", title: "Library", text: "Forms, templates and general reference.", href: "/recursos/biblioteca" },
      { icon: "analytics", title: "Studies", text: "Sector and market analysis.", href: "/recursos/estudios" },
      { icon: "folder_managed", title: "Portfolio", text: "Public projects and opportunities.", href: "/portafolio" },
      { icon: "gavel", title: "Legal framework", text: "LPPI, ZOLI and CNI legal services.", href: "/cni/servicios-legales" },
    ],
    docsEyebrow: "Updated",
    docsTitle: "Featured documents",
    docsLead: "Published in the CMS. Empty is not an error: if no records appear, the catalog is being updated.",
    viewAll: "View institutional",
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
  documents: AsyncData<CmsDocument[]>;
};

export function RecursosPageView({ locale, documents }: Props) {
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
          <p className={cn("mt-6 max-w-2xl", t.lead)}>{c.catsLead}</p>
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {c.categories.map((cat) => (
              <Link
                key={cat.href}
                href={L(cat.href)}
                className="group flex h-full flex-col rounded-xl border border-[#c5c6cd]/30 bg-[#f8f9fa] p-8 transition hover:-translate-y-1"
              >
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#32B372]/10 text-[#32B372]">
                  <MaterialIcon name={cat.icon} className="text-[22px]" />
                </span>
                <h3 className={t.h3Card}>{cat.title}</h3>
                <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-[#44474d]">{cat.text}</p>
                <span className="mt-6 font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-[#32B372]">
                  {locale === "es" ? "Abrir" : "Open"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="documentos" className={cn("bg-[#f3f4f5]", layout.section)}>
        <div className={layout.container}>
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className={t.eyebrow}>{c.docsEyebrow}</p>
              <h2 className={cn("mt-3", t.h2)}>{c.docsTitle}</h2>
              <div className={cn("mt-4", t.sectionRule)} />
              <p className={cn("mt-6", t.lead)}>{c.docsLead}</p>
            </div>
            <Link
              href={L("/recursos/institucional")}
              className="font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-[#32B372]"
            >
              {c.viewAll}
            </Link>
          </div>
          <RecursosDocsCatalog locale={locale} documents={documents} />
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

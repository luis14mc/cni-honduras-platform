import Image from "next/image";
import Link from "next/link";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { BrandPageHero, brandHeroCta } from "@/src/components/cni/BrandPageHero";
import { designImages } from "@/src/lib/designAssets";
import type { Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";

const copy = {
  es: {
    titleA: "Servicios",
    titleB: "técnicos",
    description:
      "Apoyo en el ciclo de vida del proyecto: perfil, permisos, promoción y red institucional.",
    heroExplore: "Ver servicios",
    heroContact: "Comenzar asesoría",
    portfolioEyebrow: "Portafolio",
    portfolioTitle: "Qué cubre el servicio",
    services: [
      { icon: "account_tree", title: "Perfil del proyecto", text: "Estructuración de objetivos, alcances y necesidades técnicas.", href: "/contacto" },
      { icon: "payments", title: "Asesoría económico-financiera", text: "Rentabilidad, incentivos fiscales y beneficios soberanos.", href: "/contacto" },
      { icon: "gavel", title: "Trámites y regulaciones", text: "Normativa nacional y procesos administrativos requeridos.", href: "/tramites" },
      { icon: "campaign", title: "Promoción de proyectos", text: "Incorporación al portafolio para captación de capital.", href: "/portafolio" },
      { icon: "hub", title: "Red de contactos", text: "Acceso a stakeholders y acompañamiento de networking.", href: "/contacto" },
    ],
    docsEyebrow: "Documentación",
    docsTitle: "Guía de asistencia técnica",
    docsLead: "Consulte los recursos publicados. Vacío no es error: si no hay archivo, el catálogo está en actualización.",
    docsCta: "Ir a recursos",
    ctaEyebrow: "Acompañamiento CNI",
    ctaTitle1: "Acelere su proceso",
    ctaTitle2: "en Honduras",
    ctaText: "Especialistas del CNI para convertir objetivos en operación.",
    ctaButton: "Contactar al CNI",
  },
  en: {
    titleA: "Technical",
    titleB: "services",
    description: "Support across the project life cycle: profile, permits, promotion and institutional network.",
    heroExplore: "View services",
    heroContact: "Begin advisory",
    portfolioEyebrow: "Portfolio",
    portfolioTitle: "What the service covers",
    services: [
      { icon: "account_tree", title: "Project profile", text: "Structure objectives, scope and technical needs.", href: "/contacto" },
      { icon: "payments", title: "Economic-financial advisory", text: "Returns, tax incentives and sovereign benefits.", href: "/contacto" },
      { icon: "gavel", title: "Procedures and regulations", text: "National rules and required administrative processes.", href: "/tramites" },
      { icon: "campaign", title: "Project promotion", text: "Inclusion in the portfolio to raise capital.", href: "/portafolio" },
      { icon: "hub", title: "Contact network", text: "Access to stakeholders and networking support.", href: "/contacto" },
    ],
    docsEyebrow: "Documentation",
    docsTitle: "Technical assistance guide",
    docsLead: "See published resources. Empty is not an error: if no file appears, the catalog is being updated.",
    docsCta: "Go to resources",
    ctaEyebrow: "CNI support",
    ctaTitle1: "Accelerate your process",
    ctaTitle2: "in Honduras",
    ctaText: "CNI specialists to turn objectives into operations.",
    ctaButton: "Contact CNI",
  },
} as const;

export function CniTechnicalPageView({ locale }: { locale: Locale }) {
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
        imageSrc={designImages.servicios.technical}
        imageAlt={c.titleB}
      >
        <a href="#servicios" className={brandHeroCta(true)}>
          {c.heroExplore}
        </a>
        <Link href={L("/contacto")} className={brandHeroCta(false)}>
          {c.heroContact}
        </Link>
      </BrandPageHero>

      <section id="servicios" className={cn("bg-white", layout.section)}>
        <div className={layout.container}>
          <p className={t.eyebrow}>{c.portfolioEyebrow}</p>
          <h2 className={cn("mt-3", t.h2)}>{c.portfolioTitle}</h2>
          <div className={cn("mt-4", t.sectionRule)} />
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {c.services.map((item) => (
              <article key={item.title} className="flex h-full flex-col rounded-xl border border-[#c5c6cd]/30 bg-[#f8f9fa] p-8">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#32B372]/10 text-[#32B372]">
                  <MaterialIcon name={item.icon} className="text-[22px]" />
                </span>
                <h3 className={t.h3Card}>{item.title}</h3>
                <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-[#44474d]">{item.text}</p>
                <Link
                  href={L(item.href)}
                  className="mt-6 font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-[#32B372]"
                >
                  {locale === "es" ? "Continuar" : "Continue"}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={cn("bg-[#f3f4f5]", layout.section)}>
        <div className={layout.container}>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div className="relative min-h-[260px] overflow-hidden rounded-xl">
              <Image src={designImages.servicios.technicalDoc} alt="" fill sizes="50vw" className="object-cover" unoptimized />
            </div>
            <div>
              <p className={t.eyebrow}>{c.docsEyebrow}</p>
              <h2 className={cn("mt-3", t.h2)}>{c.docsTitle}</h2>
              <div className={cn("mt-4", t.sectionRule)} />
              <p className={cn("mt-6", t.lead)}>{c.docsLead}</p>
              <Link
                href={L("/recursos")}
                className="mt-8 inline-flex rounded bg-[#000a1e] px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#32B372]"
              >
                {c.docsCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#000a1e] py-24 text-white">
        <div className="site-footer-mesh pointer-events-none absolute inset-0 opacity-[0.16]" aria-hidden />
        <div className={cn("relative z-10", layout.container)}>
          <p className={t.eyebrowOnDark}>{c.ctaEyebrow}</p>
          <h2 className={cn("mt-3 max-w-3xl text-white", t.h2OnDark)}>
            {c.ctaTitle1} <span className="text-[#32B372]">{c.ctaTitle2}</span>
          </h2>
          <p className="mt-6 max-w-xl font-body text-lg text-white/80">{c.ctaText}</p>
          <Link href={L("/contacto")} className={cn("mt-10 inline-flex", brandHeroCta(true))}>
            {c.ctaButton}
          </Link>
        </div>
      </section>
    </div>
  );
}

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
    titleB: "legales",
    description:
      "Acompañamos la Ruta de Inversión con un marco legal sólido para el desarrollo de proyectos en Honduras.",
    heroExplore: "Ver servicios",
    heroContact: "Contactar al CNI",
    introEyebrow: "Seguridad jurídica",
    introTitle: "Orientación continua en cada fase",
    intro1:
      "El CNI ofrece servicios legales para apoyar al inversionista en el establecimiento. El objetivo es facilitar el desarrollo de proyectos con asesoría continua.",
    intro2:
      "Apoyo legal y asistencia en trámites administrativos para que el capital opere con protección institucional.",
    portfolioEyebrow: "Portafolio",
    portfolioTitle: "Qué cubre el servicio",
    services: [
      { icon: "business_center", title: "Constitución de empresas", text: "Formación de sociedades y estructura corporativa para iniciar operaciones." },
      { icon: "gavel", title: "Marco legal vigente", text: "Normativa nacional y beneficios fiscales según el rubro." },
      { icon: "timeline", title: "Instalación y desarrollo", text: "Acompañamiento en pre-inversión, inversión y post-inversión." },
      { icon: "troubleshoot", title: "Solución de obstáculos", text: "Barreras de tramitología con coordinación legal e institucional." },
    ],
    lppiEyebrow: "LPPI",
    lppiTitle: "Beneficios de la Ley de Promoción y Protección de Inversiones",
    lppiLead: "Decreto 51-2011. Mecanismos de facilitación y seguridad jurídica.",
    mechanisms: [
      { n: "01", title: "Gestión de beneficios fiscales", text: "Gastos preoperativos y depreciación acelerada en regiones de interés prioritario." },
      { n: "02", title: "Proyectos de interés nacional", text: "Fast track vía Consejo de Ministros y certificado de viabilidad que consolida permisos." },
      { n: "03", title: "Régimen preventivo de conflictos", text: "Protección sobre inmuebles destinados a la inversión frente a reclamaciones sin posesión." },
      { n: "04", title: "Garantía para bienes en litigio", text: "Continuidad operativa en proyectos sobre inmuebles en proceso reivindicatorio." },
    ],
    docsEyebrow: "Documentación",
    docsTitle: "Guías y compendio legal",
    docsLead: "Consulte los recursos publicados por el CNI. Si no hay un archivo, el catálogo está en actualización.",
    docsCta: "Ir a recursos",
    zonesEyebrow: "Regímenes",
    zonesTitle: "Zonas especiales",
    zonesLead: "Incentivos para competitividad exportadora y empleo.",
    zoli: {
      tag: "ZOLI",
      title: "Zonas libres",
      text: "Exoneraciones de ISV, ISR y tributos municipales para industria, comercio y servicios.",
      items: ["Reexportación libre de impuestos", "Exoneración de Impuesto sobre la Renta", "Crédito fiscal por instalación"],
    },
    rit: {
      tag: "RIT",
      title: "Importación temporal",
      text: "Ingreso de materias primas y maquinaria con suspensión de derechos aduaneros para fomentar exportaciones.",
      items: ["Suspensión de derechos aduaneros", "Exoneración ISR por 10 años en exportación", "Aplicable a insumos y muestras"],
    },
    tramites: "Ver trámites",
    ctaEyebrow: "Acompañamiento CNI",
    ctaTitle1: "Acelere su proceso",
    ctaTitle2: "de inversión",
    ctaText: "Asistencia legal personalizada y gratuita para su proyecto.",
    ctaButton: "Contactar al CNI",
  },
  en: {
    titleA: "Legal",
    titleB: "services",
    description: "We support the Investment Route with a solid legal framework for projects in Honduras.",
    heroExplore: "View services",
    heroContact: "Contact CNI",
    introEyebrow: "Legal security",
    introTitle: "Guidance at every phase",
    intro1:
      "CNI offers legal services to support investors during establishment, with continuous advice for project development.",
    intro2: "Legal support and assistance with administrative procedures so capital operates with institutional protection.",
    portfolioEyebrow: "Portfolio",
    portfolioTitle: "What the service covers",
    services: [
      { icon: "business_center", title: "Company incorporation", text: "Company formation and corporate structure to start operations." },
      { icon: "gavel", title: "Current legal framework", text: "National rules and tax benefits by sector." },
      { icon: "timeline", title: "Setup and development", text: "Support across pre-investment, investment and post-investment." },
      { icon: "troubleshoot", title: "Obstacle resolution", text: "Administrative bottlenecks with legal and institutional coordination." },
    ],
    lppiEyebrow: "LPPI",
    lppiTitle: "Benefits of the Investment Promotion and Protection Law",
    lppiLead: "Decree 51-2011. Facilitation and legal-security mechanisms.",
    mechanisms: [
      { n: "01", title: "Tax-benefit management", text: "Pre-operating expenses and accelerated depreciation in priority regions." },
      { n: "02", title: "National-interest projects", text: "Fast track via the Council of Ministers and a viability certificate that consolidates permits." },
      { n: "03", title: "Preventive conflict regime", text: "Protection of real estate intended for investment against claims without possession." },
      { n: "04", title: "Guarantee for property in litigation", text: "Operational continuity for projects on properties under vindication proceedings." },
    ],
    docsEyebrow: "Documentation",
    docsTitle: "Guides and legal compendium",
    docsLead: "See resources published by CNI. If a file is missing, the catalog is being updated.",
    docsCta: "Go to resources",
    zonesEyebrow: "Regimes",
    zonesTitle: "Special zones",
    zonesLead: "Incentives for export competitiveness and jobs.",
    zoli: {
      tag: "ZOLI",
      title: "Free zones",
      text: "ISV, income-tax and municipal exemptions for industry, trade and services.",
      items: ["Tax-free re-export", "Income-tax exemption", "Tax credit for setup costs"],
    },
    rit: {
      tag: "RIT",
      title: "Temporary import",
      text: "Entry of raw materials and machinery with customs-duty suspension to support exports.",
      items: ["Suspension of customs duties", "10-year income-tax exemption on exports", "Applies to inputs and samples"],
    },
    tramites: "View procedures",
    ctaEyebrow: "CNI support",
    ctaTitle1: "Accelerate your",
    ctaTitle2: "investment process",
    ctaText: "Personalized, free legal assistance for your project.",
    ctaButton: "Contact CNI",
  },
} as const;

export function CniLegalPageView({ locale }: { locale: Locale }) {
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
        imageSrc={designImages.servicios.legal}
        imageAlt={c.titleB}
      >
        <a href="#servicios" className={brandHeroCta(true)}>
          {c.heroExplore}
        </a>
        <Link href={L("/contacto")} className={brandHeroCta(false)}>
          {c.heroContact}
        </Link>
      </BrandPageHero>

      <section className={cn("bg-white", layout.section)}>
        <div className={layout.container}>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className={t.eyebrow}>{c.introEyebrow}</p>
              <h2 className={cn("mt-3", t.h2)}>{c.introTitle}</h2>
              <div className={cn("mt-4", t.sectionRule)} />
              <p className={cn("mt-6", t.lead)}>{c.intro1}</p>
              <p className={cn("mt-4", t.lead)}>{c.intro2}</p>
            </div>
            <div className="relative min-h-[260px] overflow-hidden rounded-xl lg:col-span-5">
              <Image src={designImages.servicios.legalHandshake} alt="" fill sizes="40vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section id="servicios" className={cn("bg-[#f3f4f5]", layout.section)}>
        <div className={layout.container}>
          <p className={t.eyebrow}>{c.portfolioEyebrow}</p>
          <h2 className={cn("mt-3", t.h2)}>{c.portfolioTitle}</h2>
          <div className={cn("mt-4", t.sectionRule)} />
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
            {c.services.map((item) => (
              <article key={item.title} className="rounded-xl border border-[#c5c6cd]/30 bg-white p-8">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#32B372]/10 text-[#32B372]">
                  <MaterialIcon name={item.icon} className="text-[22px]" />
                </span>
                <h3 className={t.h3Card}>{item.title}</h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-[#44474d]">{item.text}</p>
                <div className="mt-6 h-1 w-16 bg-[#32B372]" aria-hidden />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={cn("bg-white", layout.section)}>
        <div className={layout.container}>
          <p className={t.eyebrow}>{c.lppiEyebrow}</p>
          <h2 className={cn("mt-3", t.h2)}>{c.lppiTitle}</h2>
          <div className={cn("mt-4", t.sectionRule)} />
          <p className={cn("mt-6 max-w-2xl", t.lead)}>{c.lppiLead}</p>
          <div className="mt-10 divide-y divide-cni-primary/10 overflow-hidden rounded-2xl border border-cni-primary/10 bg-[#f8f9ff]">
            {c.mechanisms.map((item) => (
              <div key={item.n} className="grid grid-cols-1 gap-3 px-6 py-6 md:grid-cols-12 md:items-start md:px-8">
                <span className="font-headline text-[11px] font-bold tracking-[0.18em] text-[#32B372] md:col-span-1">
                  {item.n}
                </span>
                <div className="md:col-span-11">
                  <h3 className="font-display text-lg font-extrabold text-cni-primary">{item.title}</h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-[#44474d]">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={cn("bg-[#f3f4f5]", layout.section)}>
        <div className={layout.container}>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
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
            <div className="relative min-h-[240px] overflow-hidden rounded-xl">
              <Image src={designImages.servicios.legalDocs} alt="" fill sizes="50vw" className="object-cover" unoptimized />
            </div>
          </div>
        </div>
      </section>

      <section className={cn("bg-white", layout.section)}>
        <div className={layout.container}>
          <p className={t.eyebrow}>{c.zonesEyebrow}</p>
          <h2 className={cn("mt-3", t.h2)}>{c.zonesTitle}</h2>
          <div className={cn("mt-4", t.sectionRule)} />
          <p className={cn("mt-6 max-w-2xl", t.lead)}>{c.zonesLead}</p>
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
            {[c.zoli, c.rit].map((zone) => (
              <article key={zone.tag} className="rounded-xl border border-[#c5c6cd]/30 bg-[#f8f9fa] p-8">
                <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-[#32B372]">{zone.tag}</p>
                <h3 className={cn("mt-3", t.h3Card)}>{zone.title}</h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-[#44474d]">{zone.text}</p>
                <ul className="mt-5 space-y-2">
                  {zone.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 font-body text-sm text-[#44474d]">
                      <MaterialIcon name="check_circle" className="mt-0.5 text-[16px] text-[#32B372]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={L("/tramites")}
                  className="mt-6 inline-flex font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-[#32B372]"
                >
                  {c.tramites}
                </Link>
              </article>
            ))}
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

import Link from "next/link";
import Script from "next/script";
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
    titleB: "estratégicos",
    description:
      "Acompañamiento integral, gratuito y confidencial para activar, escalar y proteger su capital en Honduras.",
    heroImageAlt: "Torre institucional del CNI en Tegucigalpa",
    heroPillars: "Ver pilares",
    heroContact: "Solicitar asesoría",
    pillarsEyebrow: "CNI",
    pillarsTitle: "Tres pilares de servicio",
    pillarsLead: "Legal, técnico e inteligencia de datos, en una sola ventanilla institucional.",
    explore: "Explorar",
    pillars: [
      {
        icon: "policy",
        title: "Servicios legales",
        href: "/cni/servicios-legales",
        text: "Asesoría sobre LPPI, regímenes aduaneros especiales y estructuración fiscal.",
        bullets: ["Marco LPPI y regímenes especiales", "ZOLI y zonas francas", "Due diligence fiscal"],
      },
      {
        icon: "engineering",
        title: "Servicios técnicos",
        href: "/cni/servicios-tecnicos",
        text: "Permisos, aduanas, licencias sanitarias y gestión interinstitucional.",
        bullets: ["Permisos ambientales", "Trámites aduaneros y sanitarios", "Gestión interinstitucional"],
      },
      {
        icon: "analytics",
        title: "Inteligencia de datos",
        href: "/cni/inteligencia-de-datos",
        text: "Pre-factibilidad, matrices de costos y reportes de mercado a medida.",
        bullets: ["Estudios de pre-factibilidad", "Matrices de costos", "Reportes sectoriales"],
      },
    ],
    ctaEyebrow: "Acompañamiento CNI",
    ctaTitle1: "Active el respaldo",
    ctaTitle2: "institucional",
    ctaText: "Asesoría gratuita con un oficial de inversión del CNI.",
    ctaButton: "Contactar al CNI",
  },
  en: {
    titleA: "Strategic",
    titleB: "services",
    description:
      "Comprehensive, free and confidential support to launch, scale and protect your capital in Honduras.",
    heroImageAlt: "CNI institutional tower in Tegucigalpa",
    heroPillars: "View pillars",
    heroContact: "Request advisory",
    pillarsEyebrow: "CNI",
    pillarsTitle: "Three service pillars",
    pillarsLead: "Legal, technical and data intelligence in a single institutional window.",
    explore: "Explore",
    pillars: [
      {
        icon: "policy",
        title: "Legal services",
        href: "/cni/servicios-legales",
        text: "Advisory on LPPI, special customs regimes and tax structuring.",
        bullets: ["LPPI framework", "Free-trade zones (ZOLI)", "Tax due diligence"],
      },
      {
        icon: "engineering",
        title: "Technical services",
        href: "/cni/servicios-tecnicos",
        text: "Permits, customs, sanitary licenses and inter-institutional management.",
        bullets: ["Environmental permits", "Customs and sanitary procedures", "Inter-institutional management"],
      },
      {
        icon: "analytics",
        title: "Data intelligence",
        href: "/cni/inteligencia-de-datos",
        text: "Pre-feasibility, cost matrices and tailored market reports.",
        bullets: ["Pre-feasibility studies", "Cost matrices", "Sector reports"],
      },
    ],
    ctaEyebrow: "CNI support",
    ctaTitle1: "Activate institutional",
    ctaTitle2: "backing",
    ctaText: "Free consultation with a CNI investment officer.",
    ctaButton: "Contact CNI",
  },
} as const;

export function CniHubPageView({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const L = (path: string) => withLocale(locale, path);
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: locale === "es" ? "Inicio" : "Home", item: L("/") },
      { "@type": "ListItem", position: 2, name: "CNI", item: L("/cni") },
    ],
  };

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9fa]">
      <Script id="breadcrumb-cni" type="application/ld+json">
        {JSON.stringify(breadcrumb)}
      </Script>
      <BrandPageHero
        title={
          <>
            {c.titleA} <span className="text-[#32B372]">{c.titleB}</span>
          </>
        }
        description={c.description}
        imageSrc={designImages.cni.heroCity}
        imageAlt={c.heroImageAlt}
      >
        <a href="#pilares" className={brandHeroCta(true)}>
          {c.heroPillars}
        </a>
        <Link href={L("/contacto")} className={brandHeroCta(false)}>
          {c.heroContact}
        </Link>
      </BrandPageHero>

      <section id="pilares" className={cn("bg-white", layout.section)}>
        <div className={layout.container}>
          <p className={t.eyebrow}>{c.pillarsEyebrow}</p>
          <h2 className={cn("mt-3", t.h2)}>{c.pillarsTitle}</h2>
          <div className={cn("mt-4", t.sectionRule)} />
          <p className={cn("mt-6 max-w-2xl", t.lead)}>{c.pillarsLead}</p>
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {c.pillars.map((pillar) => (
              <article
                key={pillar.href}
                className="flex h-full flex-col rounded-xl border border-[#c5c6cd]/30 bg-[#f8f9fa] p-8 transition hover:-translate-y-1"
              >
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#32B372]/10 text-[#32B372]">
                  <MaterialIcon name={pillar.icon} className="text-[22px]" />
                </span>
                <h3 className={t.h3Card}>{pillar.title}</h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-[#44474d]">{pillar.text}</p>
                <ul className="mt-5 space-y-2">
                  {pillar.bullets.map((item) => (
                    <li key={item} className="flex items-start gap-2 font-body text-sm text-[#44474d]">
                      <MaterialIcon name="check_circle" className="mt-0.5 text-[16px] text-[#32B372]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={L(pillar.href)}
                  className="mt-6 inline-flex items-center gap-2 font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-[#32B372]"
                >
                  {c.explore}
                </Link>
                <div className="mt-auto pt-6 h-1 w-16 bg-[#32B372]" aria-hidden />
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

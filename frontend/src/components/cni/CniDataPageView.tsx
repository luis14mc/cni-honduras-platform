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
    titleA: "Inteligencia",
    titleB: "de datos",
    description:
      "Información crítica convertida en conocimiento accionable para decisiones de inversión.",
    heroExplore: "Ver metodología",
    heroResources: "Recursos",
    methodEyebrow: "Metodología",
    methodTitle: "Condiciones macroeconómicas",
    cards: [
      { n: "01", title: "Ecosistema nacional", items: ["Indicadores demográficos", "Indicadores económicos", "Indicadores sociales"] },
      { n: "02", title: "Comercio y turismo", items: ["Comercio exterior", "Sectores y empresas", "Tendencias turísticas"] },
      { n: "03", title: "Inversión y competitividad", items: ["IED", "Tratados y convenios", "Infraestructura y logística"] },
    ],
    keyEyebrow: "Provisión",
    keyTitle: "Información clave",
    keyLead: "Recursos para exportadores, inversionistas y gremios.",
    keyItems: [
      { icon: "groups", title: "Contactos de inversionistas", text: "Red de contactos y gremios." },
      { icon: "monitoring", title: "Estadística de producción", text: "Producción y exportación." },
      { icon: "gavel", title: "Normativas", text: "Marcos regulatorios vigentes." },
      { icon: "newspaper", title: "Boletines", text: "Tendencias y reportes económicos." },
      { icon: "account_tree", title: "Sectores priorizados", text: "Oportunidades estratégicas." },
    ],
    ctaEyebrow: "Acompañamiento CNI",
    ctaTitle1: "Guía de inteligencia",
    ctaTitle2: "comercial",
    ctaText: "Consulte metodologías y fuentes en recursos. Si no hay documento, el catálogo está en actualización.",
    ctaButton: "Ir a recursos",
    ctaContact: "Contactar al CNI",
  },
  en: {
    titleA: "Data",
    titleB: "intelligence",
    description: "Critical information turned into actionable knowledge for investment decisions.",
    heroExplore: "View methodology",
    heroResources: "Resources",
    methodEyebrow: "Methodology",
    methodTitle: "Macroeconomic conditions",
    cards: [
      { n: "01", title: "National ecosystem", items: ["Demographic indicators", "Economic indicators", "Social indicators"] },
      { n: "02", title: "Trade and tourism", items: ["Foreign trade", "Sectors and companies", "Tourism trends"] },
      { n: "03", title: "Investment and competitiveness", items: ["FDI", "Treaties and agreements", "Infrastructure and logistics"] },
    ],
    keyEyebrow: "Provision",
    keyTitle: "Key information",
    keyLead: "Resources for exporters, investors and associations.",
    keyItems: [
      { icon: "groups", title: "Investor contacts", text: "Network of contacts and associations." },
      { icon: "monitoring", title: "Production statistics", text: "Production and exports." },
      { icon: "gavel", title: "Regulations", text: "Current regulatory frameworks." },
      { icon: "newspaper", title: "Bulletins", text: "Trends and economic reports." },
      { icon: "account_tree", title: "Priority sectors", text: "Strategic opportunities." },
    ],
    ctaEyebrow: "CNI support",
    ctaTitle1: "Commercial intelligence",
    ctaTitle2: "guide",
    ctaText: "See methodologies and sources in resources. If no file appears, the catalog is being updated.",
    ctaButton: "Go to resources",
    ctaContact: "Contact CNI",
  },
} as const;

export function CniDataPageView({ locale }: { locale: Locale }) {
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
        imageSrc={designImages.servicios.dataMap}
        imageAlt={c.titleB}
      >
        <a href="#metodologia" className={brandHeroCta(true)}>
          {c.heroExplore}
        </a>
        <Link href={L("/recursos")} className={brandHeroCta(false)}>
          {c.heroResources}
        </Link>
      </BrandPageHero>

      <section id="metodologia" className={cn("bg-white", layout.section)}>
        <div className={layout.container}>
          <p className={t.eyebrow}>{c.methodEyebrow}</p>
          <h2 className={cn("mt-3", t.h2)}>{c.methodTitle}</h2>
          <div className={cn("mt-4", t.sectionRule)} />
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {c.cards.map((card) => (
              <article key={card.n} className="rounded-xl border border-[#c5c6cd]/30 bg-[#f8f9fa] p-8">
                <p className="font-headline text-[11px] font-bold tracking-[0.18em] text-[#32B372]">{card.n}</p>
                <h3 className={cn("mt-3", t.h3Card)}>{card.title}</h3>
                <ul className="mt-5 space-y-2">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 font-body text-sm text-[#44474d]">
                      <MaterialIcon name="check_circle" className="mt-0.5 text-[16px] text-[#32B372]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={cn("bg-[#f3f4f5]", layout.section)}>
        <div className={layout.container}>
          <p className={t.eyebrow}>{c.keyEyebrow}</p>
          <h2 className={cn("mt-3", t.h2)}>{c.keyTitle}</h2>
          <div className={cn("mt-4", t.sectionRule)} />
          <p className={cn("mt-6 max-w-2xl", t.lead)}>{c.keyLead}</p>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {c.keyItems.map((item) => (
              <article key={item.title} className="rounded-xl border border-[#c5c6cd]/30 bg-white p-6">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#32B372]/10 text-[#32B372]">
                  <MaterialIcon name={item.icon} className="text-[20px]" />
                </span>
                <h3 className="font-display text-sm font-extrabold text-cni-primary">{item.title}</h3>
                <p className="mt-2 font-body text-sm text-[#44474d]">{item.text}</p>
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
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={L("/recursos")} className={brandHeroCta(true)}>
              {c.ctaButton}
            </Link>
            <Link href={L("/contacto")} className={brandHeroCta(false)}>
              {c.ctaContact}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

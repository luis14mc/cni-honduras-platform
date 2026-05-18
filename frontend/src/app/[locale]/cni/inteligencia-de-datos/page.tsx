import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isLocale, type Locale } from "@/src/i18n/config";
import { designImages } from "@/src/lib/designAssets";
import { resolveHref } from "@/src/i18n/path";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["cni-inteligencia-datos"]);

const copy = {
  es: {
    titleA: "Inteligencia",
    titleB: "de Datos",
    description:
      "Nuestro enfoque estratégico y analítico proporciona acceso directo a información crítica, transformando datos complejos en conocimiento accionable para la toma de decisiones empresariales.",
    primaryCta: "Explorar Estadísticas",
    secondaryCta: "Ver Informes Anuales",
    sectionEyebrow: "Metodología de Análisis",
    sectionTitle: "Condiciones Macroeconómicas",
    cards: [
      {
        n: "01",
        title: "Inteligencia del Ecosistema Nacional",
        items: ["Indicadores Demográficos", "Indicadores Económicos", "Indicadores Sociales"],
        border: "border-[#000a1e]",
      },
      {
        n: "02",
        title: "Inteligencia Comercial y Turística",
        items: ["Comercio Exterior", "Sectores y Empresas", "Tendencias Turísticas"],
        border: "border-[#3a5f94]",
      },
      {
        n: "03",
        title: "Inversión y Competitividad",
        items: ["Inversión Extranjera (IED)", "Tratados y Convenios", "Infraestructura y Logística"],
        border: "border-[#e9c176]",
      },
    ],
    keyTitle: "Provisión de Información Clave",
    keySub: "Acceso centralizado a recursos estratégicos para exportadores, inversionistas y gremios nacionales e internacionales.",
    keyItems: [
      { icon: "groups", title: "Contactos de Inversionistas", text: "Red estratégica de contactos clave y gremios." },
      { icon: "monitoring", title: "Estadística de Producción", text: "Datos precisos sobre producción y exportación." },
      { icon: "gavel", title: "Normativas", text: "Políticas regulatorias y marcos legales actualizados." },
      { icon: "newspaper", title: "Boletines", text: "Tendencias globales y reportes económicos." },
      { icon: "account_tree", title: "Sectores Priorizados", text: "Oportunidades en áreas estratégicas nacionales." },
    ],
    downloadTitle: "Guía Oficial de Inteligencia Comercial",
    downloadText: "Obtenga el documento completo con metodologías, fuentes y el ecosistema detallado de servicios de inteligencia del CNI.",
    downloadButton: "Click para descargar",
  },
  en: {
    titleA: "Data",
    titleB: "Intelligence",
    description:
      "Our strategic and analytical approach provides direct access to critical information, transforming complex data into actionable knowledge for business decision-making.",
    primaryCta: "Explore Statistics",
    secondaryCta: "View Annual Reports",
    sectionEyebrow: "Analysis Methodology",
    sectionTitle: "Macroeconomic Conditions",
    cards: [
      { n: "01", title: "National Ecosystem Intelligence", items: ["Demographic Indicators", "Economic Indicators", "Social Indicators"], border: "border-[#000a1e]" },
      { n: "02", title: "Commercial and Tourism Intelligence", items: ["Foreign Trade", "Sectors and Companies", "Tourism Trends"], border: "border-[#3a5f94]" },
      { n: "03", title: "Investment and Competitiveness", items: ["Foreign Investment (FDI)", "Treaties and Agreements", "Infrastructure and Logistics"], border: "border-[#e9c176]" },
    ],
    keyTitle: "Provision of Key Information",
    keySub: "Centralized access to strategic resources for exporters, investors and national and international guilds.",
    keyItems: [
      { icon: "groups", title: "Investor Contacts", text: "Strategic network of key contacts and guilds." },
      { icon: "monitoring", title: "Production Statistics", text: "Accurate data on production and export." },
      { icon: "gavel", title: "Regulations", text: "Updated regulatory policies and legal frameworks." },
      { icon: "newspaper", title: "Bulletins", text: "Global trends and economic reports." },
      { icon: "account_tree", title: "Priority Sectors", text: "Opportunities in strategic national areas." },
    ],
    downloadTitle: "Official Commercial Intelligence Guide",
    downloadText: "Obtain the complete document with methodologies, sources and the detailed ecosystem of CNI intelligence services.",
    downloadButton: "Click to download",
  },
} as const;

export default async function InteligenciaDatosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = copy[locale];
  const L = (p: string) => resolveHref(locale, p);

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9fa]">
      <section className="relative w-full overflow-hidden px-8 py-24 md:py-32">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#000a1e] via-[#002147] to-[#3a5f94] opacity-95" />
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-20">
          <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,_rgba(174,199,246,0.1)_0%,_transparent_50%)]" />
        </div>
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
          <div>
            <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">
              {c.titleA} <br />
              <span className="text-[#e9c176]">{c.titleB}</span>
            </h1>
            <p className="mb-10 max-w-xl text-lg leading-relaxed text-[#d6e3ff]/80 md:text-xl">{c.description}</p>
            <div className="flex flex-wrap gap-4">
              <Link href={L("/recursos")} className="rounded-md bg-[#e9c176] px-8 py-4 text-sm font-bold text-[#110a00] transition-all hover:scale-105 active:scale-95">
                {c.primaryCta}
              </Link>
              <Link
                href={L("/recursos")}
                className="rounded-md border border-[#d6e3ff]/20 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                {c.secondaryCta}
              </Link>
            </div>
          </div>
          <div className="relative hidden md:block">
            <Image
              src={designImages.servicios.dataMap}
              alt="Regional intelligence map"
              width={700}
              height={500}
              className="rounded-xl opacity-90 shadow-2xl grayscale contrast-125 transition-all duration-700 hover:grayscale-0"
              unoptimized
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-8 py-24">
        <div className="mb-16">
          <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-[#3a5f94]">{c.sectionEyebrow}</span>
          <h2 className="text-4xl font-extrabold tracking-tighter text-[#000a1e]">{c.sectionTitle}</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {c.cards.map((card) => (
            <div key={card.n} className={`group rounded-xl border-t-4 bg-white p-10 shadow-[0_20px_40px_rgba(0,10,30,0.04)] ${card.border}`}>
              <div className="mb-8 text-6xl font-black text-[#000a1e]/5 transition-colors duration-500 group-hover:text-[#e9c176]">{card.n}</div>
              <h3 className="mb-6 text-xl font-bold text-[#000a1e]">{card.title}</h3>
              <ul className="space-y-4">
                {card.items.map((it) => (
                  <li key={it} className="flex items-center gap-3 font-medium text-[#44474e]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#3a5f94]" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f3f4f5] px-8 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-extrabold tracking-tighter text-[#000a1e] md:text-4xl">{c.keyTitle}</h2>
            <p className="mx-auto max-w-2xl text-[#44474e]">{c.keySub}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {c.keyItems.map((it) => (
              <div key={it.title} className="group rounded-lg bg-white p-8 shadow-[0_20px_40px_rgba(0,10,30,0.04)] transition-all hover:-translate-y-1">
                <MaterialIcon name={it.icon} className="mb-6 block text-4xl text-[#3a5f94] transition-transform group-hover:scale-110" />
                <h4 className="mb-2 text-sm font-bold text-[#000a1e]">{it.title}</h4>
                <p className="text-xs leading-relaxed text-[#44474e]">{it.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-24">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl bg-[#000a1e] p-12 text-center">
          <div className="absolute -mr-32 -mt-32 right-0 top-0 h-64 w-64 rounded-full bg-[#3a5f94]/10 blur-3xl" />
          <div className="absolute -mb-32 -ml-32 bottom-0 left-0 h-64 w-64 rounded-full bg-[#e9c176]/5 blur-3xl" />
          <h2 className="mb-6 text-3xl font-bold text-white">{c.downloadTitle}</h2>
          <p className="mb-10 text-lg text-[#d6e3ff]/70">{c.downloadText}</p>
          <a href="#" className="mx-auto flex w-fit items-center gap-3 rounded-md bg-white px-10 py-4 text-sm font-extrabold text-[#000a1e] transition-all hover:bg-[#e9c176] active:scale-95">
            <MaterialIcon name="download" />
            {c.downloadButton}
          </a>
        </div>
      </section>
    </div>
  );
}

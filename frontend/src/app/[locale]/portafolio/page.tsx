import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isLocale, type Locale } from "@/src/i18n/config";
import { designImages } from "@/src/lib/designAssets";
import { resolveHref } from "@/src/i18n/path";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO.portafolio);

const copy = {
  es: {
    eyebrow: "Portal de Inversión",
    titleA: "Portafolio de Inversión",
    titleB: "Soberana",
    description:
      "Acceda a una selección curada de proyectos estratégicos en los corredores de desarrollo primarios de Honduras. Cada activo es meticulosamente evaluado para el crecimiento sostenible y la alineación soberana.",
    sectorsTitle: "Sectores Estratégicos",
    sectorsSubtitle: "Plan Nacional de Desarrollo",
    sectors: [
      { icon: "agriculture", label: "Agroindustria", active: true },
      { icon: "beach_access", label: "Turismo", active: false },
      { icon: "bolt", label: "Energía", active: false },
      { icon: "factory", label: "Manufactura", active: false },
      { icon: "architecture", label: "Infraestructura", active: false },
    ],
    requestProspect: "Solicitar Prospecto",
    support: "Soporte",
    policies: "Políticas",
    catalogYear: "Catálogo 2024",
    catalogTitle: "Oportunidades Actuales",
    sortByValue: "Ordenar por Valor",
    capex: "CAPEX",
    opex: "OPEX",
    total: "TOTAL",
    state: "Estado",
    roi: "Retorno (ROI)",
    phase: "Fase",
    impact: "Impacto",
    term: "Plazo",
    location: "Ubicación",
    niche: "Nicho",
    projects: [
      { icon: "medical_services", status: "Buscando Socios", statusType: "gold", title: "Sunset Woods", sub: "Turismo Médico", desc: "Desarrollo de un retiro médico premium enfocado en cuidados post-operatorios y bienestar en un entorno de tierras altas exuberantes.", a: ["CAPEX", "USD 3.7M"], b: ["OPEX", "USD 0.8M"], c: ["TOTAL", "USD 4.5M"] },
      { icon: "landscape", status: "Estructuración", statusType: "neutral", title: "Pandora Laguna", sub: "Turismo / Avatar", desc: "Proyecto de hospitalidad inmersiva que integra experiencias avanzadas de RV/RA con eco-alojamientos de lujo a la orilla del lago.", a: ["CAPEX", "USD 12M"], b: ["Estado", "Factibilidad"], c: ["Retorno (ROI)", "Alto"] },
      { icon: "precision_manufacturing", status: "Planificación", statusType: "gold", title: "Quintara 5 Hub", sub: "Logística", desc: "Un centro neurálgico industrial y logístico masivo diseñado para aprovechar el posicionamiento estratégico del Corredor Interoceánico.", a: ["CAPEX", "USD 100M"], b: ["Fase", "Primaria"], c: ["Retorno (ROI)", "14.5%"] },
      { icon: "solar_power", status: "Búsqueda Activa", statusType: "neutral", title: "Energía para la Educación", sub: "Energía", desc: "Alianza público-privada para instalar redes de energía renovable en clústeres educativos regionales para operaciones sostenibles.", a: ["CAPEX", "USD 14.2M"], b: ["Impacto", "Social"], c: ["Plazo", "12 Años"] },
      { icon: "potted_plant", status: "Listo", statusType: "neutral", title: "Kokiyá", sub: "Turismo / Té", desc: "Plantación de té boutique de gran altitud combinada con alojamiento de lujo y circuitos de agroturismo educativo.", a: ["CAPEX", "USD 6M"], b: ["Ubicación", "Tierras Altas"], c: ["Nicho", "Agro"] },
    ],
    ctaTitle1: "Navegue por el Paisaje de",
    ctaTitle2: "Inversión Soberana",
    ctaDesc: "Nuestros asesores especializados están listos para brindar apoyo técnico a medida, marcos legales y garantías soberanas para su próximo movimiento estratégico en Honduras.",
    ctaPrimary: "Solicitar Consulta Privada",
    ctaSecondary: "Descargar Guía Legal",
    secureTitle: "Asistencia Segura",
    secureText: "Apoyo profesional complementario para inversores institucionales y gestores de patrimonio.",
  },
  en: {
    eyebrow: "Investment Portal",
    titleA: "Sovereign",
    titleB: "Investment Portfolio",
    description:
      "Access a curated selection of strategic projects in Honduras's primary development corridors. Each asset is meticulously evaluated for sustainable growth and sovereign alignment.",
    sectorsTitle: "Strategic Sectors",
    sectorsSubtitle: "National Development Plan",
    sectors: [
      { icon: "agriculture", label: "Agribusiness", active: true },
      { icon: "beach_access", label: "Tourism", active: false },
      { icon: "bolt", label: "Energy", active: false },
      { icon: "factory", label: "Manufacturing", active: false },
      { icon: "architecture", label: "Infrastructure", active: false },
    ],
    requestProspect: "Request Prospectus",
    support: "Support",
    policies: "Policies",
    catalogYear: "Catalog 2024",
    catalogTitle: "Current Opportunities",
    sortByValue: "Sort by Value",
    capex: "CAPEX",
    opex: "OPEX",
    total: "TOTAL",
    state: "State",
    roi: "Return (ROI)",
    phase: "Phase",
    impact: "Impact",
    term: "Term",
    location: "Location",
    niche: "Niche",
    projects: [
      { icon: "medical_services", status: "Seeking Partners", statusType: "gold", title: "Sunset Woods", sub: "Medical Tourism", desc: "Premium medical retreat focused on post-operative care and wellness in a lush highland setting.", a: ["CAPEX", "USD 3.7M"], b: ["OPEX", "USD 0.8M"], c: ["TOTAL", "USD 4.5M"] },
      { icon: "landscape", status: "Structuring", statusType: "neutral", title: "Pandora Laguna", sub: "Tourism / Avatar", desc: "Immersive hospitality project integrating advanced VR/AR experiences with luxury lakeside eco-lodges.", a: ["CAPEX", "USD 12M"], b: ["State", "Feasibility"], c: ["Return (ROI)", "High"] },
      { icon: "precision_manufacturing", status: "Planning", statusType: "gold", title: "Quintara 5 Hub", sub: "Logistics", desc: "Massive industrial and logistics hub designed to leverage the strategic positioning of the Inter-Oceanic Corridor.", a: ["CAPEX", "USD 100M"], b: ["Phase", "Primary"], c: ["Return (ROI)", "14.5%"] },
      { icon: "solar_power", status: "Active Search", statusType: "neutral", title: "Energy for Education", sub: "Energy", desc: "Public-private partnership to install renewable energy networks in regional educational clusters for sustainable operations.", a: ["CAPEX", "USD 14.2M"], b: ["Impact", "Social"], c: ["Term", "12 Years"] },
      { icon: "potted_plant", status: "Ready", statusType: "neutral", title: "Kokiyá", sub: "Tourism / Tea", desc: "High-altitude boutique tea plantation combined with luxury lodging and educational agritourism circuits.", a: ["CAPEX", "USD 6M"], b: ["Location", "Highlands"], c: ["Niche", "Agro"] },
    ],
    ctaTitle1: "Navigate the Landscape of",
    ctaTitle2: "Sovereign Investment",
    ctaDesc: "Our specialized advisors are ready to provide tailored technical support, legal frameworks and sovereign guarantees for your next strategic move in Honduras.",
    ctaPrimary: "Request Private Consultation",
    ctaSecondary: "Download Legal Guide",
    secureTitle: "Secure Assistance",
    secureText: "Complementary professional support for institutional investors and wealth managers.",
  },
} as const;

export default async function PortafolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = copy[locale];
  const L = (p: string) => resolveHref(locale, p);

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9fa]">
      <header className="relative flex h-[614px] items-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <Image src={designImages.portfolio.hero} alt="Portafolio" fill priority sizes="100vw" className="object-cover brightness-50 grayscale-[20%]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#000a1e] via-[#000a1e]/80 to-transparent" />
        </div>
        <div className="relative z-10 w-full max-w-7xl px-12 md:px-24">
          <div className="mb-6 inline-block border-l-4 border-[#e9c176] bg-[#2e1f00] px-4 py-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#ffdea5]">{c.eyebrow}</span>
          </div>
          <h1 className="mb-6 max-w-3xl text-5xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
            {c.titleA} <br />
            <span className="text-[#e9c176]">{c.titleB}</span>
          </h1>
          <p className="max-w-2xl text-xl font-light leading-relaxed text-[#708ab5]">{c.description}</p>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] flex-col gap-8 px-8 py-12 lg:flex-row">
        <aside className="sticky top-32 hidden h-fit w-72 flex-col space-y-4 rounded-xl bg-[#f3f4f5] py-8 lg:flex">
          <div className="mb-4 px-6">
            <h2 className="text-xl font-extrabold text-[#000a1e]">{c.sectorsTitle}</h2>
            <p className="text-sm text-[#44474e]">{c.sectorsSubtitle}</p>
          </div>
          <nav className="flex flex-col space-y-1">
            {c.sectors.map((s) => (
              <div
                key={s.label}
                className={`flex cursor-pointer items-center gap-4 px-6 py-3 transition-all duration-200 hover:translate-x-1 ${
                  s.active ? "rounded-r-full bg-[#e1e3e4] font-bold text-[#000a1e]" : "text-[#44474e] hover:bg-[#e7e8e9]"
                }`}
              >
                <MaterialIcon name={s.icon} filled={Boolean(s.active)} />
                <span>{s.label}</span>
              </div>
            ))}
          </nav>
          <div className="mt-8 border-t border-[#c4c6cf]/10 px-6 pt-8">
            <Link
              href={L("/postulacion")}
              className="block w-full rounded-md bg-[#000a1e] py-3 text-center font-bold text-white transition-shadow hover:shadow-lg active:scale-95"
            >
              {c.requestProspect}
            </Link>
            <div className="mt-6 flex flex-col space-y-4">
              <div className="flex cursor-pointer items-center gap-3 text-sm font-medium text-[#44474e] hover:text-[#000a1e]">
                <MaterialIcon name="help_outline" className="text-lg" />
                <span>{c.support}</span>
              </div>
              <div className="flex cursor-pointer items-center gap-3 text-sm font-medium text-[#44474e] hover:text-[#000a1e]">
                <MaterialIcon name="gavel" className="text-lg" />
                <span>{c.policies}</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <span className="text-sm font-bold uppercase tracking-widest text-[#44474e]">{c.catalogYear}</span>
              <h2 className="text-3xl font-extrabold text-[#002147]">{c.catalogTitle}</h2>
            </div>
            <div className="flex gap-4">
              <button type="button" className="flex items-center gap-2 rounded-lg bg-[#e1e3e4] px-4 py-2 text-sm font-semibold text-[#000a1e]">
                <MaterialIcon name="filter_list" className="text-sm" />
                {c.sortByValue}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {c.projects.map((p) => (
              <article
                key={p.title}
                className="group rounded-xl border-b-4 border-transparent bg-white p-8 transition-all duration-300 hover:border-[#e9c176] hover:shadow-2xl hover:shadow-[#000a1e]/5"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div className="rounded-xl bg-[#e7e8e9] p-3">
                    <MaterialIcon name={p.icon} className="text-3xl text-[#000a1e]" />
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${
                      p.statusType === "gold" ? "bg-[#2e1f00] text-[#e9c176]" : "bg-[#e7e8e9] text-[#000a1e]"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <h3 className="mb-3 text-2xl font-bold text-[#000a1e]">{p.title}</h3>
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#44474e]">{p.sub}</p>
                <p className="mb-6 text-sm leading-relaxed text-[#44474e]">{p.desc}</p>
                <div className="grid grid-cols-3 gap-4 border-t border-[#c4c6cf]/10 pt-6">
                  {[p.a, p.b, p.c].map(([label, value]) => (
                    <div key={label}>
                      <p className="mb-1 text-[10px] font-bold uppercase text-[#44474e]">{label}</p>
                      <p className="font-bold text-[#000a1e]">{value}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <section className="bg-[#002147] px-12 py-24 md:px-24">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-16 md:flex-row">
          <div className="flex-1">
            <h2 className="mb-6 text-4xl font-extrabold leading-tight text-white md:text-5xl">
              {c.ctaTitle1} <br />
              <span className="text-[#e9c176]">{c.ctaTitle2}</span>
            </h2>
            <p className="mb-10 text-lg leading-relaxed text-[#708ab5]">{c.ctaDesc}</p>
            <div className="flex flex-wrap gap-6">
              <Link
                href={L("/contacto")}
                className="rounded-md bg-[#e9c176] px-10 py-4 font-extrabold text-[#000a1e] shadow-xl transition-all hover:-translate-y-0.5"
              >
                {c.ctaPrimary}
              </Link>
              <button
                type="button"
                className="rounded-md border border-[#708ab5] px-10 py-4 font-bold text-white transition-all hover:bg-white/5"
              >
                {c.ctaSecondary}
              </button>
            </div>
          </div>
          <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md md:w-1/3">
            <div className="text-center">
              <MaterialIcon name="verified_user" className="mb-4 block text-6xl text-[#e9c176]" />
              <h4 className="mb-2 text-xl font-bold text-white">{c.secureTitle}</h4>
              <p className="text-sm text-[#708ab5]">{c.secureText}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

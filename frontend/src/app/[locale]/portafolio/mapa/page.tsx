import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isLocale, type Locale } from "@/src/i18n/config";
import { designImages } from "@/src/lib/designAssets";
import { resolveHref } from "@/src/i18n/path";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["portafolio-mapa"]);

const copy = {
  es: {
    title: "Mapa Interactivo de Inversión",
    visualizationTitle: "Visualización",
    visualizationItems: [
      { icon: "analytics", label: "Proyectos de Inversión", active: true },
      { icon: "business_center", label: "Tarjetas de Oportunidad", active: false },
      { icon: "category", label: "Sectores Estratégicos", active: false },
    ],
    activeSectors: "Sectores Activos",
    sectors: [
      { color: "bg-[#ffdea5]", label: "Agroindustria", checked: true },
      { color: "bg-[#d5e3ff]", label: "Turismo Costero", checked: true },
      { color: "bg-[#708ab5]", label: "Energía Renovable", checked: false },
      { color: "bg-[#708ab5]", label: "Manufactura Ligera", checked: false },
    ],
    dataStatus: "Estatus de Datos",
    dataNote: "Información actualizada en tiempo real vía Secretaría de Inversiones.",
    selectedRegion: "Región Seleccionada",
    region: "Cortés",
    fdiLabel: "Inversión IED",
    fdiValue: "$420.5M",
    projectsLabel: "Proyectos",
    projectsValue: "12 Activos",
    occupancy: "Oportunidades por Sector",
    occupancyValue: "84% Lleno",
    featured: "Oportunidad Destacada",
    featuredText: "Expansión del Parque Industrial ZOLI y Terminal Logística en Puerto Cortés.",
    featuredCta: "Ver Ficha Técnica",
    growth: "Crecimiento Anual",
    growthValue: "+14.2%",
    jobs: "Empleos Gen.",
    jobsValue: "8,420",
    legendHigh: "Nivel Alto",
    legendMed: "Nivel Medio",
    legendEmerging: "Emergente",
  },
  en: {
    title: "Interactive Investment Map",
    visualizationTitle: "Visualization",
    visualizationItems: [
      { icon: "analytics", label: "Investment Projects", active: true },
      { icon: "business_center", label: "Opportunity Cards", active: false },
      { icon: "category", label: "Strategic Sectors", active: false },
    ],
    activeSectors: "Active Sectors",
    sectors: [
      { color: "bg-[#ffdea5]", label: "Agribusiness", checked: true },
      { color: "bg-[#d5e3ff]", label: "Coastal Tourism", checked: true },
      { color: "bg-[#708ab5]", label: "Renewable Energy", checked: false },
      { color: "bg-[#708ab5]", label: "Light Manufacturing", checked: false },
    ],
    dataStatus: "Data Status",
    dataNote: "Real-time information from the Secretariat of Investments.",
    selectedRegion: "Selected Region",
    region: "Cortés",
    fdiLabel: "FDI Investment",
    fdiValue: "$420.5M",
    projectsLabel: "Projects",
    projectsValue: "12 Active",
    occupancy: "Sector Opportunities",
    occupancyValue: "84% Full",
    featured: "Featured Opportunity",
    featuredText: "Expansion of the ZOLI Industrial Park and Logistics Terminal in Puerto Cortés.",
    featuredCta: "View Technical Sheet",
    growth: "Annual Growth",
    growthValue: "+14.2%",
    jobs: "Jobs Gen.",
    jobsValue: "8,420",
    legendHigh: "High Level",
    legendMed: "Medium Level",
    legendEmerging: "Emerging",
  },
} as const;

export default async function MapaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = copy[locale];
  const L = (p: string) => resolveHref(locale, p);

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#000a1e] text-white">
      <h1 className="sr-only">{c.title}</h1>
      <main className="relative flex h-[calc(100vh-7rem)] min-h-[800px] w-full items-center justify-center bg-[#000a1e] pt-28">
        <div className="relative mx-auto flex h-full w-full max-w-7xl items-center justify-center p-4">
          <Image
            src={designImages.mapa.hero3d}
            alt="Investment Map of Honduras"
            width={1200}
            height={900}
            unoptimized
            className="w-full max-w-5xl scale-110 object-contain drop-shadow-[0_0_50px_rgba(0,33,71,0.5)]"
          />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/4 top-1/4 animate-pulse">
              <MaterialIcon name="location_on" className="text-4xl text-[#e9c176]" />
            </div>
            <div className="absolute bottom-1/3 right-1/4 opacity-50">
              <MaterialIcon name="radar" className="text-2xl text-[#d5e3ff]" />
            </div>
          </div>
        </div>

        <aside className="absolute bottom-8 left-8 top-32 hidden w-72 flex-col gap-8 rounded-xl bg-[#002147]/75 p-6 text-white shadow-2xl backdrop-blur-2xl lg:flex">
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-[#e9c176]">{c.visualizationTitle}</h3>
            <div className="space-y-3">
              {c.visualizationItems.map((v) => (
                <button
                  key={v.label}
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-lg p-3 transition-all ${
                    v.active ? "border-l-4 border-[#ffdea5] bg-white/10" : "bg-transparent hover:bg-white/5"
                  }`}
                >
                  <MaterialIcon name={v.icon} className={v.active ? "text-[#ffdea5]" : "text-[#708ab5]"} />
                  <span className={`text-sm font-medium ${v.active ? "text-white" : "text-[#708ab5]"}`}>{v.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex-grow overflow-y-auto pr-2">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#708ab5]">{c.activeSectors}</h3>
            <div className="space-y-4">
              {c.sectors.map((s) => (
                <label key={s.label} className="group flex cursor-pointer items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${s.color}`} />
                    <span className="text-xs transition-colors group-hover:text-[#ffdea5]">{s.label}</span>
                  </div>
                  <input type="checkbox" defaultChecked={s.checked} className="form-checkbox rounded bg-transparent text-[#ffdea5] focus:ring-[#ffdea5]" />
                </label>
              ))}
            </div>
          </div>
          <div className="border-t border-[#708ab5]/20 pt-6">
            <div className="mb-2 flex items-center gap-2">
              <MaterialIcon name="verified" className="text-sm text-[#e9c176]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#708ab5]">{c.dataStatus}</span>
            </div>
            <p className="text-[11px] italic leading-relaxed text-[#708ab5]/60">{c.dataNote}</p>
          </div>
        </aside>

        <section className="absolute right-8 top-32 hidden w-96 flex-col gap-4 lg:flex">
          <div className="rounded-xl border-l border-t border-white/10 bg-[#002147]/75 p-8 shadow-2xl backdrop-blur-2xl">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-tighter text-[#ffdea5]">{c.selectedRegion}</span>
                <h2 className="text-3xl font-extrabold tracking-tight text-white">{c.region}</h2>
              </div>
              <div className="rounded-lg bg-[#ffdea5]/10 p-2">
                <MaterialIcon name="precision_manufacturing" className="text-3xl text-[#ffdea5]" />
              </div>
            </div>
            <div className="mb-8 grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-[#708ab5]">{c.fdiLabel}</p>
                <p className="text-lg font-black text-white">{c.fdiValue}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-[#708ab5]">{c.projectsLabel}</p>
                <p className="text-lg font-black text-white">{c.projectsValue}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex items-end justify-between">
                  <span className="text-xs font-medium uppercase tracking-widest text-[#708ab5]">{c.occupancy}</span>
                  <span className="text-xs font-bold text-[#ffdea5]">{c.occupancyValue}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#000a1e]">
                  <div className="h-full rounded-full bg-[#ffdea5]" style={{ width: "84%" }} />
                </div>
              </div>
              <div className="rounded-lg border border-white/5 bg-[#000a1e]/40 p-4">
                <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#708ab5]">
                  <MaterialIcon name="stars" className="text-sm" /> {c.featured}
                </h4>
                <p className="mb-4 text-sm font-medium text-white/90">{c.featuredText}</p>
                <Link
                  href={L("/portafolio")}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[#ffdea5] py-3 text-sm font-bold uppercase tracking-tight text-[#110a00] transition-all hover:bg-[#e9c176] active:scale-95"
                >
                  {c.featuredCta} <MaterialIcon name="arrow_forward" />
                </Link>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 rounded-lg bg-[#002147]/75 p-4 text-center backdrop-blur-2xl">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#708ab5]">{c.growth}</p>
              <p className="text-base font-black text-[#ffdea5]">{c.growthValue}</p>
            </div>
            <div className="flex-1 rounded-lg bg-[#002147]/75 p-4 text-center backdrop-blur-2xl">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#708ab5]">{c.jobs}</p>
              <p className="text-base font-black text-[#d5e3ff]">{c.jobsValue}</p>
            </div>
          </div>
        </section>

        <div className="absolute bottom-8 right-8 hidden flex-col gap-2 lg:flex">
          {[
            { icon: "add" },
            { icon: "remove" },
          ].map((b) => (
            <button
              key={b.icon}
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/5 bg-[#002147]/75 text-[#708ab5] backdrop-blur-2xl transition-all hover:text-[#ffdea5]"
            >
              <MaterialIcon name={b.icon} />
            </button>
          ))}
          <button
            type="button"
            className="mt-4 flex h-12 w-12 items-center justify-center rounded-lg border border-white/5 bg-[#002147]/75 text-[#708ab5] backdrop-blur-2xl transition-all hover:text-[#ffdea5]"
          >
            <MaterialIcon name="layers" />
          </button>
        </div>

        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 items-center gap-8 rounded-full border border-white/5 bg-[#002147]/75 px-8 py-3 shadow-xl backdrop-blur-2xl lg:flex">
          {[
            { color: "bg-[#ffdea5]", label: c.legendHigh },
            { color: "bg-[#d5e3ff]", label: c.legendMed },
            { color: "bg-[#708ab5]/30", label: c.legendEmerging },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${l.color}`} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#708ab5]">{l.label}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isLocale, type Locale } from "@/src/i18n/config";
import { designImages } from "@/src/lib/designAssets";
import { resolveHref } from "@/src/i18n/path";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { slugify } from "@/src/lib/slugify";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["portafolio-casos"]);

const copy = {
  es: {
    eyebrow: "Ecosistema de Inversión",
    titleA: "Casos de",
    titleB: "Éxito",
    description:
      "Más de una década facilitando inversiones estratégicas que transforman el panorama económico de Honduras. Descubra cómo corporaciones globales y visionarios locales han prosperado en nuestro territorio.",
    filterLabel: "Filtrar por:",
    allFilter: "Todos los sectores",
    filters: ["Agroindustria", "Energía", "Infraestructura", "Manufactura", "Turismo"],
    featured: {
      tag: "Energía",
      title: "IRESA Grupo Larach",
      text: "Pionera en energías renovables desde 1993. Con inversiones que superan los $770 millones, ha desarrollado proyectos clave como el parque solar Valle Solar-Nacaome.",
      m1: "Inversión Total",
      m1v: "$770M+",
      m2: "Años de Trayectoria",
      m2v: "30+",
      cta: "Ver caso completo",
    },
    cases: [
      { img: designImages.casos.sinclair, tag: "Agroindustria", tagBg: "bg-[#3a5f94]/90", title: "Sinclair", desc: "De exportar un contenedor semanal a despachos diarios hacia EE.UU. y Europa desde la terminal de carga de Palmerola." },
      { img: designImages.casos.kimpton, tag: "Turismo", tagBg: "bg-[#2e1f00] text-[#e9c176]", title: "Kimpton Grand Hotel", desc: "Reconocido como el tercer mejor resort de Centroamérica. Emplea a 265 personas, dinamizando la economía de Roatán." },
      { img: designImages.casos.dinant, tag: "Agroindustria", tagBg: "bg-[#3a5f94]/90", title: "Dinant", desc: "Más de 8,000 empleos directos y un impacto positivo en más de 60,000 personas mediante desarrollo local y educación." },
      { img: designImages.casos.copantl, tag: "Turismo / Eventos", tagBg: "bg-[#2e1f00] text-[#e9c176]", title: "Copantl", desc: "Entre los 15 mejores centros de convenciones de Latinoamérica, impulsando la cadena de servicios y turismo regional." },
    ],
    wideCases: [
      { img: designImages.casos.ecoproyectos, tag: "Infraestructura", title: "Ecoproyectos", desc: "Líder en vivienda sostenible con diseño bioclimático, energía solar y sistemas de reciclaje de agua integrados." },
      { img: designImages.casos.cafe, tag: "Agroindustria / Café", title: "Beneficio San Vicente", desc: "Empoderamiento de pequeños caficultores a través de modelos de comercio directo y transferencia técnica." },
    ],
    finalCases: [
      { img: designImages.casos.ibagari, tag: "Turismo", tagBg: "bg-[#2e1f00] text-[#e9c176]", title: "Ibagari Boutique Hotel", desc: "Refugio de sofisticación solo para adultos con buceo de clase mundial y un compromiso firme con la excelencia." },
      { img: designImages.casos.chuck, tag: "Servicios", tagBg: "bg-[#3a5f94]/90", title: "Chuck E. Cheese", desc: "Más de 120 empleos por establecimiento con una inversión de $2 millones por sucursal, elevando los estándares locales." },
    ],
    impactTitle: "Impacto en Cifras",
    impactJobs: "Empleos Generados",
    impactJobsValue: "+15,000 Directos",
    impactInvestment: "Inversión Facilitada",
    impactInvestmentValue: "+$2.4 Billones",
    impactQuote: "“Honduras es el destino estratégico para el crecimiento sostenible en la región.”",
    viewCase: "Ver caso",
    ctaTitle: "Crea tu caso de éxito con la asistencia gratuita del Consejo Nacional de Inversiones de Honduras",
    ctaSub: "Acelera tu proceso de inversión hoy mismo. Nuestros asesores técnicos y legales están listos para acompañarte en cada etapa de tu expansión.",
    ctaPrimary: "Contactar al CNI",
    ctaSecondary: "Descargar Guía de Inversión",
  },
  en: {
    eyebrow: "Investment Ecosystem",
    titleA: "Success",
    titleB: "Stories",
    description:
      "Over a decade facilitating strategic investments that transform the economic landscape of Honduras. Discover how global corporations and local visionaries have thrived in our territory.",
    filterLabel: "Filter by:",
    allFilter: "All sectors",
    filters: ["Agribusiness", "Energy", "Infrastructure", "Manufacturing", "Tourism"],
    featured: {
      tag: "Energy",
      title: "IRESA Grupo Larach",
      text: "Pioneer in renewable energy since 1993. With investments exceeding $770 million, it has developed key projects such as the Valle Solar-Nacaome solar park.",
      m1: "Total Investment",
      m1v: "$770M+",
      m2: "Years of Experience",
      m2v: "30+",
      cta: "View full case",
    },
    cases: [
      { img: designImages.casos.sinclair, tag: "Agribusiness", tagBg: "bg-[#3a5f94]/90", title: "Sinclair", desc: "From exporting a weekly container to daily shipments to the U.S. and Europe from the Palmerola cargo terminal." },
      { img: designImages.casos.kimpton, tag: "Tourism", tagBg: "bg-[#2e1f00] text-[#e9c176]", title: "Kimpton Grand Hotel", desc: "Recognized as the third best resort in Central America. Employs 265 people, energizing Roatán's economy." },
      { img: designImages.casos.dinant, tag: "Agribusiness", tagBg: "bg-[#3a5f94]/90", title: "Dinant", desc: "More than 8,000 direct jobs and a positive impact on more than 60,000 people through local development and education." },
      { img: designImages.casos.copantl, tag: "Tourism / Events", tagBg: "bg-[#2e1f00] text-[#e9c176]", title: "Copantl", desc: "Among the 15 best convention centers in Latin America, driving the service chain and regional tourism." },
    ],
    wideCases: [
      { img: designImages.casos.ecoproyectos, tag: "Infrastructure", title: "Ecoproyectos", desc: "Leader in sustainable housing with bioclimatic design, solar energy, and integrated water recycling systems." },
      { img: designImages.casos.cafe, tag: "Agribusiness / Coffee", title: "Beneficio San Vicente", desc: "Empowerment of small coffee growers through direct trade models and technical transfer." },
    ],
    finalCases: [
      { img: designImages.casos.ibagari, tag: "Tourism", tagBg: "bg-[#2e1f00] text-[#e9c176]", title: "Ibagari Boutique Hotel", desc: "Adults-only refuge of sophistication with world-class diving and a firm commitment to excellence." },
      { img: designImages.casos.chuck, tag: "Services", tagBg: "bg-[#3a5f94]/90", title: "Chuck E. Cheese", desc: "More than 120 jobs per location with a $2 million investment per branch, raising local standards." },
    ],
    impactTitle: "Impact in Numbers",
    impactJobs: "Jobs Generated",
    impactJobsValue: "+15,000 Direct",
    impactInvestment: "Facilitated Investment",
    impactInvestmentValue: "+$2.4 Billion",
    impactQuote: "“Honduras is the strategic destination for sustainable growth in the region.”",
    viewCase: "View case",
    ctaTitle: "Create your success story with free assistance from the National Investment Council of Honduras",
    ctaSub: "Accelerate your investment process today. Our technical and legal advisors are ready to accompany you in every stage of your expansion.",
    ctaPrimary: "Contact the CNI",
    ctaSecondary: "Download Investment Guide",
  },
} as const;

export default async function CasosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = copy[locale];
  const L = (p: string) => resolveHref(locale, p);
  const caseHref = (title: string) => L(`/portafolio/casos/${slugify(title)}`);

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9fa]">
      <header className="hero-gradient relative overflow-hidden pb-20 pt-32">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(112,138,181,0.2)_0%,_transparent_100%)]" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e9c176]/20 bg-[#2e1f00] px-3 py-1">
              <span className="text-xs font-bold uppercase tracking-widest text-[#e9c176]">{c.eyebrow}</span>
            </div>
            <h1 className="mb-8 text-5xl font-extrabold leading-[0.95] tracking-tighter text-white md:text-7xl">
              {c.titleA} <span className="text-[#e9c176]">{c.titleB}</span>
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-[#d6e3ff]/90 md:text-xl">{c.description}</p>
          </div>
        </div>
      </header>

      <section className="sticky top-20 z-40 bg-white/80 py-6 shadow-sm backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="mr-4 text-sm font-bold uppercase tracking-wider text-[#74777f]">{c.filterLabel}</span>
            <button type="button" className="rounded-full bg-[#000a1e] px-5 py-2 text-sm font-bold text-white">{c.allFilter}</button>
            {c.filters.map((f) => (
              <button key={f} type="button" className="rounded-full bg-[#e7e8e9] px-5 py-2 text-sm font-semibold text-[#191c1d] transition-all hover:bg-[#d5e3ff]">
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-8 py-20">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <Link href={caseHref(c.featured.title)} className="group col-span-1 overflow-hidden rounded-xl bg-white shadow-xl shadow-[#000a1e]/5 transition-transform hover:-translate-y-1 md:col-span-8">
            <div className="grid h-full md:grid-cols-2">
              <div className="relative min-h-[300px]">
                <Image src={designImages.casos.energy} alt={c.featured.title} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute left-6 top-6">
                  <span className="rounded-md bg-[#000a1e]/90 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white">{c.featured.tag}</span>
                </div>
              </div>
              <div className="flex flex-col justify-center p-10">
                <h3 className="mb-4 text-3xl font-bold leading-tight text-[#000a1e]">{c.featured.title}</h3>
                <p className="mb-8 leading-relaxed text-[#44474e]">{c.featured.text}</p>
                <div className="mb-8 flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-[#3a5f94]">{c.featured.m1v}</span>
                    <span className="text-[10px] font-bold uppercase text-[#74777f]">{c.featured.m1}</span>
                  </div>
                  <div className="h-10 w-px bg-[#c4c6cf]/30" />
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-[#3a5f94]">{c.featured.m2v}</span>
                    <span className="text-[10px] font-bold uppercase text-[#74777f]">{c.featured.m2}</span>
                  </div>
                </div>
                <span className="inline-flex items-center font-bold text-[#000a1e] transition-all group-hover:gap-2">
                  {c.featured.cta} <MaterialIcon name="arrow_forward" className="ml-2" />
                </span>
              </div>
            </div>
          </Link>

          {c.cases.map((k) => (
            <Link href={caseHref(k.title)} key={k.title} className="group col-span-1 overflow-hidden rounded-xl bg-white shadow-xl shadow-[#000a1e]/5 transition-transform hover:-translate-y-1 md:col-span-4">
              <div className="relative h-48">
                <Image src={k.img} alt={k.title} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" />
                <div className="absolute left-4 top-4">
                  <span className={`rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white ${k.tagBg}`}>{k.tag}</span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="mb-3 text-xl font-bold text-[#000a1e]">{k.title}</h3>
                <p className="mb-6 line-clamp-3 text-sm text-[#44474e]">{k.desc}</p>
                <span className="flex items-center text-sm font-bold text-[#000a1e] transition-transform group-hover:translate-x-1">
                  {c.viewCase} <MaterialIcon name="chevron_right" className="ml-1 text-sm" />
                </span>
              </div>
            </Link>
          ))}

          {c.wideCases.map((k) => (
            <Link href={caseHref(k.title)} key={k.title} className="group col-span-1 overflow-hidden rounded-xl bg-white shadow-xl shadow-[#000a1e]/5 transition-transform hover:-translate-y-1 md:col-span-6">
              <div className="flex flex-col md:flex-row">
                <div className="relative min-h-[250px] md:w-1/2">
                  <Image src={k.img} alt={k.title} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" />
                </div>
                <div className="flex flex-col justify-center p-8 md:w-1/2">
                  <span className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#3a5f94]">{k.tag}</span>
                  <h3 className="mb-4 text-2xl font-bold text-[#000a1e]">{k.title}</h3>
                  <p className="mb-6 text-sm text-[#44474e]">{k.desc}</p>
                  <span className="flex items-center text-sm font-bold text-[#000a1e] transition-transform group-hover:translate-x-1">
                    {c.viewCase} <MaterialIcon name="chevron_right" className="ml-1 text-sm" />
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {c.finalCases.map((k) => (
            <Link href={caseHref(k.title)} key={k.title} className="group col-span-1 overflow-hidden rounded-xl bg-white shadow-xl shadow-[#000a1e]/5 transition-transform hover:-translate-y-1 md:col-span-4">
              <div className="relative h-48">
                <Image src={k.img} alt={k.title} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" />
                <div className="absolute left-4 top-4">
                  <span className={`rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${k.tagBg}`}>{k.tag}</span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="mb-3 text-xl font-bold text-[#000a1e]">{k.title}</h3>
                <p className="mb-6 line-clamp-3 text-sm text-[#44474e]">{k.desc}</p>
                <span className="flex items-center text-sm font-bold text-[#000a1e] transition-transform group-hover:translate-x-1">
                  {c.viewCase} <MaterialIcon name="chevron_right" className="ml-1 text-sm" />
                </span>
              </div>
            </Link>
          ))}

          <div className="col-span-1 flex flex-col justify-between rounded-xl border border-[#000a1e] bg-[#002147] p-8 md:col-span-4">
            <div>
              <h3 className="mb-6 text-2xl font-bold leading-tight text-white">{c.impactTitle}</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <MaterialIcon name="groups" className="text-3xl text-[#e9c176]" />
                  <div>
                    <p className="text-xs font-bold uppercase text-[#708ab5]/60">{c.impactJobs}</p>
                    <p className="text-xl font-black text-white">{c.impactJobsValue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MaterialIcon name="payments" className="text-3xl text-[#e9c176]" />
                  <div>
                    <p className="text-xs font-bold uppercase text-[#708ab5]/60">{c.impactInvestment}</p>
                    <p className="text-xl font-black text-white">{c.impactInvestmentValue}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 border-t border-[#708ab5]/10 pt-6">
              <p className="text-sm italic text-[#708ab5]/80">{c.impactQuote}</p>
            </div>
          </div>
        </div>
      </main>

      <section className="mx-auto mb-24 max-w-7xl px-8">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#000a1e] to-[#002147] p-12 shadow-2xl shadow-[#000a1e]/20 md:p-20">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#e9c176]/10 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-[#3a5f94]/10 blur-3xl" />
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <h2 className="mb-8 text-3xl font-extrabold leading-[1.1] text-white md:text-5xl">{c.ctaTitle}</h2>
            <p className="mx-auto mb-12 max-w-2xl text-lg text-[#708ab5]/90">{c.ctaSub}</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href={L("/contacto")} className="rounded-md bg-[#e9c176] px-10 py-4 text-lg font-black text-[#000a1e] transition-transform duration-300 hover:scale-105">
                {c.ctaPrimary}
              </Link>
              <Link href={L("/recursos")} className="rounded-md border-2 border-[#708ab5] bg-transparent px-10 py-4 font-bold text-white transition-colors hover:bg-white/5">
                {c.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

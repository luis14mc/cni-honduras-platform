import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isLocale, type Locale } from "@/src/i18n/config";
import { designImages } from "@/src/lib/designAssets";
import { resolveHref } from "@/src/i18n/path";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["invertir-por-que-honduras"]);

const copy = {
  es: {
    eyebrow: "Destino de Inversión Elite",
    title: "¿Por qué invertir en Honduras?",
    description:
      "El centro logístico y estratégico de las Américas. Una plataforma soberana diseñada para el crecimiento exponencial de capital institucional.",
    ctaPrimary: "Descargar Reporte País",
    ctaSecondary: "Contactar Consultor",
    metrics: [
      { value: "2.5h", label: "Vuelo a USA" },
      { value: "100%", label: "Exención Fiscal" },
      { value: "#1", label: "Puerto en CA" },
      { value: "65%", label: "Población Joven" },
    ],
    partnersTitle: "Instituciones y Alianzas Estratégicas",
    partners: ["CNI", "INVEST-H", "SEDESOL", "BANHPROVI", "AMDC"],
    locationTitle: "Ubicación Estratégica: El 'Sovereign Gateway'",
    locationText:
      "Honduras se posiciona como el puente natural entre océanos y mercados. Nuestra proximidad geográfica con los Estados Unidos y el acceso dual al Atlántico y Pacífico nos convierte en el eje logístico indiscutible del hemisferio.",
    locationBullets: [
      "Conectividad marítima global vía Puerto Cortés.",
      "Acceso inmediato al mercado del CAFTA-DR.",
    ],
    infraTitle: "Infraestructura y Logística de Clase Mundial",
    infraIntro:
      "Inversiones masivas en conectividad vial, puertos automatizados y una matriz energética renovable.",
    infraLink: "Ver Plan Nacional 2030",
    portTitle: "Puerto Cortés",
    portText:
      "El puerto más profundo y eficiente de Centroamérica, certificado con CSI y megapuerto por el DHS de EE.UU.",
    energyTitle: "Matriz Renovable",
    energyText:
      "Honduras lidera la región con más del 60% de su energía proveniente de fuentes renovables (solar, eólica e hidroeléctrica).",
    energyCapacity: "Capacidad Instalada",
    zonesTitle: "Zonas Industriales",
    zonesText:
      "Parques eco-industriales con beneficios de Zona Libre que facilitan operaciones de manufactura avanzada y servicios.",
    roadTitle: "Canal Seco",
    roadText:
      "Corredor logístico interoceánico de 391 km que conecta el Atlántico y el Pacífico en menos de 5 horas.",
    talentTitle: "Capital Humano: El Motor de la Innovación",
    talentText:
      "Contamos con una fuerza laboral vibrante y joven. Con más de 10,000 graduados universitarios anuales y una de las tasas de bilingüismo más altas de la región, Honduras es el hub ideal para servicios globales y manufactura avanzada.",
    talentBadge: "Bilingüe",
    talentBadgeSub: "Talento Altamente Calificado",
    talentStats: [
      { value: "24 años", label: "Edad Media" },
      { value: "100+", label: "Institutos Técnicos" },
    ],
    casosTitle: "Casos de Éxito y Confianza",
    casos: [
      {
        icon: "eco",
        title: "Energía Sostenible",
        company: "SolarGen Corp",
        quote: "“La agilidad en los permisos y la infraestructura existente nos permitió conectar nuestra planta en tiempo récord.”",
        statValue: "150 MW",
        statLabel: "Capacidad Generada",
      },
      {
        icon: "precision_manufacturing",
        title: "Manufactura",
        company: "Global AeroParts",
        quote: "“Encontramos talento técnico de alta precisión que compite directamente con mercados asiáticos y europeos.”",
        statValue: "2,500+",
        statLabel: "Nuevos Empleos",
      },
      {
        icon: "savings",
        title: "Servicios Compartidos",
        company: "FinTech Solutions",
        quote: "“El bilingüismo en Honduras es excepcional. Operamos nuestro hub regional desde aquí con total eficiencia.”",
        statValue: "95%",
        statLabel: "Eficiencia Operativa",
      },
    ],
    routeTitle: "Ruta de Inversión",
    routeCta: "Iniciar Proceso de Inversión",
  },
  en: {
    eyebrow: "Elite Investment Destination",
    title: "Why invest in Honduras?",
    description:
      "The strategic logistics center of the Americas. A sovereign platform designed for the exponential growth of institutional capital.",
    ctaPrimary: "Download Country Report",
    ctaSecondary: "Contact Consultant",
    metrics: [
      { value: "2.5h", label: "Flight to USA" },
      { value: "100%", label: "Tax Exemption" },
      { value: "#1", label: "CA Port" },
      { value: "65%", label: "Young Population" },
    ],
    partnersTitle: "Strategic Institutions and Alliances",
    partners: ["CNI", "INVEST-H", "SEDESOL", "BANHPROVI", "AMDC"],
    locationTitle: "Strategic Location: The 'Sovereign Gateway'",
    locationText:
      "Honduras positions itself as the natural bridge between oceans and markets. Our geographic proximity to the United States and dual access to the Atlantic and Pacific make us the undisputed logistics hub of the hemisphere.",
    locationBullets: [
      "Global maritime connectivity via Puerto Cortés.",
      "Immediate access to the CAFTA-DR market.",
    ],
    infraTitle: "World-Class Infrastructure and Logistics",
    infraIntro:
      "Massive investments in road connectivity, automated ports and a renewable energy matrix.",
    infraLink: "View 2030 National Plan",
    portTitle: "Puerto Cortés",
    portText:
      "The deepest and most efficient port in Central America, certified by CSI and a mega-port by the US DHS.",
    energyTitle: "Renewable Matrix",
    energyText:
      "Honduras leads the region with over 60% of its energy from renewable sources (solar, wind and hydro).",
    energyCapacity: "Installed Capacity",
    zonesTitle: "Industrial Zones",
    zonesText:
      "Eco-industrial parks with Free Zone benefits that facilitate advanced manufacturing and services operations.",
    roadTitle: "Dry Canal",
    roadText:
      "391 km inter-oceanic logistics corridor connecting the Atlantic and Pacific in less than 5 hours.",
    talentTitle: "Human Capital: The Innovation Engine",
    talentText:
      "We have a vibrant and young workforce. With more than 10,000 annual university graduates and one of the highest bilingual rates in the region, Honduras is the ideal hub for global services and advanced manufacturing.",
    talentBadge: "Bilingual",
    talentBadgeSub: "Highly Qualified Talent",
    talentStats: [
      { value: "24 yrs", label: "Median Age" },
      { value: "100+", label: "Technical Institutes" },
    ],
    casosTitle: "Success Stories and Trust",
    casos: [
      {
        icon: "eco",
        title: "Sustainable Energy",
        company: "SolarGen Corp",
        quote: "“Permit agility and existing infrastructure let us connect our plant in record time.”",
        statValue: "150 MW",
        statLabel: "Generated Capacity",
      },
      {
        icon: "precision_manufacturing",
        title: "Manufacturing",
        company: "Global AeroParts",
        quote: "“We found high-precision technical talent that directly competes with Asian and European markets.”",
        statValue: "2,500+",
        statLabel: "New Jobs",
      },
      {
        icon: "savings",
        title: "Shared Services",
        company: "FinTech Solutions",
        quote: "“Bilingualism in Honduras is exceptional. We run our regional hub from here with total efficiency.”",
        statValue: "95%",
        statLabel: "Operational Efficiency",
      },
    ],
    routeTitle: "Investment Route",
    routeCta: "Start Investment Process",
  },
} as const;

export default async function PorQueHondurasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = copy[locale];
  const L = (p: string) => resolveHref(locale, p);

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9fa]">
      <section className="relative flex h-[870px] items-center overflow-hidden bg-[#002147]">
        <div className="absolute inset-0 z-0">
          <Image src={designImages.porQue.hero} alt="Honduras costa" fill priority sizes="100vw" className="object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#000a1e] via-[#000a1e]/40 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-8">
          <div className="max-w-3xl">
            <span className="mb-6 inline-block rounded-sm bg-[#ffdea5] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#261900]">
              {c.eyebrow}
            </span>
            <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tighter text-white md:text-7xl">
              {c.title}
            </h1>
            <p className="mb-10 max-w-2xl text-xl font-medium leading-relaxed text-[#708ab5] md:text-2xl">
              {c.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                className="rounded-md border border-white/10 bg-gradient-to-r from-[#000a1e] to-[#002147] px-8 py-4 font-bold text-white duration-200 ease-in-out hover:scale-95"
              >
                {c.ctaPrimary}
              </button>
              <Link
                href={L("/contacto")}
                className="rounded-md bg-[#e1e3e4] px-8 py-4 font-bold text-[#191c1d] transition-all hover:bg-white"
              >
                {c.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-16 w-full max-w-7xl px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {c.metrics.map((m) => (
            <div key={m.label} className="rounded-xl bg-white p-8 shadow-xl">
              <div className="mb-2 text-4xl font-black text-[#000a1e]">{m.value}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#44474e]">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f8f9fa] py-12">
        <div className="mx-auto max-w-7xl px-8">
          <p className="mb-8 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#44474e]">
            {c.partnersTitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 grayscale transition-all duration-500 hover:grayscale-0">
            {c.partners.map((p) => (
              <div key={p} className="text-xl font-bold text-[#000a1e]">{p}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-8 py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="mb-8 text-4xl font-extrabold tracking-tight text-[#000a1e]">{c.locationTitle}</h2>
            <p className="mb-6 text-lg leading-relaxed text-[#44474e]">{c.locationText}</p>
            <ul className="space-y-4">
              {c.locationBullets.map((b) => (
                <li key={b} className="flex items-start space-x-4">
                  <MaterialIcon name="check_circle" filled className="text-[#e9c176]" />
                  <span className="font-medium text-[#191c1d]">{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-[#f3f4f5] shadow-2xl">
              <Image src={designImages.porQue.map} alt="Mapa logístico" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f3f4f5] py-24">
        <div className="mx-auto max-w-7xl px-8">
          <div className="mb-12 flex flex-col items-end justify-between md:flex-row">
            <div className="max-w-2xl">
              <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-[#000a1e]">{c.infraTitle}</h2>
              <p className="text-lg text-[#44474e]">{c.infraIntro}</p>
            </div>
            <a href="#" className="mt-6 border-b-2 border-[#000a1e] pb-1 font-bold text-[#000a1e] md:mt-0">
              {c.infraLink}
            </a>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="group relative aspect-video overflow-hidden rounded-xl shadow-lg md:col-span-2">
              <Image src={designImages.porQue.port} alt="Puerto Cortés" fill sizes="(min-width:768px) 66vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000a1e]/90 via-[#000a1e]/20 to-transparent" />
              <div className="absolute bottom-0 p-8">
                <h3 className="mb-2 text-2xl font-bold text-white">{c.portTitle}</h3>
                <p className="max-w-md text-[#708ab5]">{c.portText}</p>
              </div>
            </div>
            <div className="flex flex-col justify-between rounded-xl bg-white p-8 shadow-lg">
              <div>
                <MaterialIcon name="bolt" className="mb-6 text-4xl text-[#000a1e]" />
                <h3 className="mb-4 text-xl font-bold text-[#000a1e]">{c.energyTitle}</h3>
                <p className="text-sm leading-relaxed text-[#44474e]">{c.energyText}</p>
              </div>
              <div className="mt-8 border-t border-[#edeeef] pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#44474e]">{c.energyCapacity}</span>
                  <span className="font-black text-[#000a1e]">2.8 GW</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-[#000a1e] p-8 text-white shadow-lg">
              <h3 className="mb-6 text-xl font-bold">{c.zonesTitle}</h3>
              <p className="mb-8 text-sm leading-relaxed text-[#708ab5]">{c.zonesText}</p>
              <div className="space-y-4">
                <div className="rounded-lg bg-[#002147]/50 p-4">
                  <div className="text-lg font-bold text-[#e9c176]">ZOLI</div>
                  <div className="text-xs uppercase tracking-widest opacity-70">{locale === "es" ? "Régimen de Zona Libre" : "Free Zone Regime"}</div>
                </div>
                <div className="rounded-lg bg-[#002147]/50 p-4">
                  <div className="text-lg font-bold text-[#e9c176]">RIT</div>
                  <div className="text-xs uppercase tracking-widest opacity-70">{locale === "es" ? "Régimen de Importación Temporal" : "Temporary Import Regime"}</div>
                </div>
              </div>
            </div>
            <div className="group relative aspect-[21/9] overflow-hidden rounded-xl shadow-lg md:col-span-2">
              <Image src={designImages.porQue.road} alt="Canal Seco" fill sizes="(min-width:768px) 66vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#000a1e]/80 via-[#000a1e]/20 to-transparent" />
              <div className="absolute inset-y-0 left-0 flex max-w-md flex-col justify-center p-8">
                <h3 className="mb-2 text-2xl font-bold text-white">{c.roadTitle}</h3>
                <p className="text-[#708ab5]">{c.roadText}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-8 py-24">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="relative">
              <div className="absolute -left-4 -top-4 h-32 w-32 rounded-full bg-[#ffdea5]/30 blur-3xl" />
              <Image src={designImages.porQue.talent} alt="Talento" width={720} height={540} className="relative z-10 w-full rounded-xl shadow-2xl" unoptimized />
              <div className="absolute -bottom-6 -right-6 z-20 hidden rounded-lg border border-[#edeeef] bg-white p-6 shadow-xl md:block">
                <div className="text-3xl font-black text-[#000a1e]">{c.talentBadge}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-[#44474e]">{c.talentBadgeSub}</div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="mb-8 text-4xl font-extrabold tracking-tight text-[#000a1e]">{c.talentTitle}</h2>
            <p className="mb-8 text-lg leading-relaxed text-[#44474e]">{c.talentText}</p>
            <div className="grid grid-cols-2 gap-8">
              {c.talentStats.map((s) => (
                <div key={s.label}>
                  <h4 className="mb-1 text-2xl font-black text-[#000a1e]">{s.value}</h4>
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#44474e]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#e1e3e4] py-24">
        <div className="mx-auto max-w-7xl px-8">
          <h2 className="mb-16 text-center text-4xl font-extrabold tracking-tight text-[#000a1e]">
            {c.casosTitle}
          </h2>
          <div className="mb-24 grid grid-cols-1 gap-8 md:grid-cols-3">
            {c.casos.map((cs) => (
              <div key={cs.title} className="rounded-xl border-t-4 border-[#e9c176] bg-white p-8 shadow-lg">
                <div className="mb-6 flex items-center">
                  <MaterialIcon name={cs.icon} className="text-4xl text-[#000a1e]" />
                  <div className="ml-4">
                    <h3 className="text-xl font-extrabold text-[#000a1e]">{cs.title}</h3>
                    <p className="text-sm font-bold text-[#44474e]">{cs.company}</p>
                  </div>
                </div>
                <p className="mb-6 italic text-[#44474e]">{cs.quote}</p>
                <div className="border-t border-[#edeeef] pt-6">
                  <div className="text-2xl font-black text-[#000a1e]">{cs.statValue}</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[#44474e]">{cs.statLabel}</div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <h2 className="mb-12 text-center text-4xl font-extrabold tracking-tight text-[#000a1e]">
              {c.routeTitle}
            </h2>
            <div className="overflow-hidden rounded-2xl bg-white p-4 shadow-2xl">
              <Image src={designImages.porQue.investor} alt="Ruta del Inversionista" width={1400} height={400} className="h-auto w-full" unoptimized />
            </div>
            <div className="mt-12 text-center">
              <Link
                href={L("/postulacion")}
                className="inline-block rounded-md bg-[#000a1e] px-10 py-4 font-bold text-white shadow-lg transition-all hover:bg-[#002147]"
              >
                {c.routeCta}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

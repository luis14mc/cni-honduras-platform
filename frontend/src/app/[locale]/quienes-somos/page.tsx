import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isLocale, type Locale } from "@/src/i18n/config";
import { designImages } from "@/src/lib/designAssets";
import { resolveHref } from "@/src/i18n/path";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["quienes-somos"]);

const copy = {
  es: {
    eyebrow: "Autoridad Gubernamental",
    titleA: "Consejo Nacional de Inversiones:",
    titleB: "Tu puerta para invertir en Honduras",
    description:
      "El CNI es la entidad rectora para identificar oportunidades de inversión en sectores priorizados, brindando seguridad jurídica y acompañamiento técnico a capitales nacionales y extranjeros.",
    ctaExplore: "Explorar Oportunidades",
    ctaFree: "Asesoría Gratuita",
    mision: "Misión",
    misionText:
      "“Somos la agencia de promoción de inversión de Honduras que articula los esfuerzos entre el sector privado y el Estado para atraer la inversión y conectar el capital extranjero con el desarrollo local.”",
    vision: "Visión",
    visionText:
      "Consolidarnos como la agencia de promoción líder que proyecta a Honduras como un destino competitivo de clase mundial para el desarrollo económico integral, turismo y exportaciones.",
    filosofiaTitle: "Filosofía Institucional",
    filosofiaText:
      "El CNI busca promover a Honduras como un destino atractivo, conectando intereses globales con oportunidades locales. Brindamos acompañamiento estratégico y servicios gratuitos durante toda la “Ruta del Inversionista”, alineados con las políticas de desarrollo más exigentes del continente.",
    rutaTitle: "Ruta del Inversionista",
    rutaIntro: "Un proceso estructurado y transparente para garantizar el éxito de su capital en territorio nacional.",
    rutaSteps: [
      { n: 1, title: "Punto de Partida", text: "Análisis inicial y diagnóstico de potencial." },
      { n: 2, title: "Kick Off", text: "Reunión de coordinación estratégica." },
      { n: 3, title: "Pitch de Inversión", text: "Oportunidades sectoriales detalladas." },
      { n: 4, title: "Instalación", text: "Ejecución y puesta en marcha operativa." },
      { n: 5, title: "Aftercare", text: "Acompañamiento post-inversión." },
    ],
    objetivosTitle: "Nuestros Objetivos",
    objetivos: {
      informar: {
        title: "INFORMAR",
        text: "Ser una fuente confiable, independiente y alineada a los intereses del Estado según el plan de nación y de gobierno, así como la visión país.",
        cta: "Asistencia Gratuita",
      },
      promocionar: {
        title: "PROMOCIONAR",
        text: "Promover la inversión y reinversión a nivel nacional e internacional para el crecimiento económico sostenible y de alto impacto.",
        cta: "Asistencia Gratuita",
      },
      acompanar: {
        title: "ACOMPAÑAR",
        text: "Asesoramiento integral al inversionista en todas las etapas críticas de su proceso de establecimiento.",
      },
      articular: {
        title: "ARTICULAR",
        text: "Coordinar esfuerzos interinstitucionales entre los actores claves del gobierno y los inversionistas privados.",
      },
      incidir: {
        title: "INCIDIR",
        text: "Generar opiniones formales y espacios de debate para el estudio profundo del marco legal de incentivos.",
      },
    },
    valoresTitle: "Valores Institucionales",
    valoresIntro: "Nuestros pilares éticos y operativos.",
    valores: [
      { icon: "bolt", title: "Efectividad", text: "Enfocados en brindar resultados concretos en tiempo y forma para su negocio." },
      { icon: "face_retouching_natural", title: "Identidad", text: "Promovemos nuestro mejor activo: Honduras y el talento excepcional de su gente." },
      { icon: "psychology", title: "Resiliencia", text: "El cambio es nuestro aliado estratégico; nos adaptamos a la transformación constante." },
    ],
    serviciosTitle: "Ecosistema de Servicios",
    serviciosIntro: "Soluciones integrales de asesoría para blindar y potenciar su inversión.",
    servicios: [
      {
        icon: "policy",
        title: "Servicios Legales",
        text: "Ofrecemos asesoría legal integral y asistencia técnica en trámites administrativos. Facilitamos el establecimiento de proyectos mediante un blindaje jurídico sólido.",
        href: "/cni/servicios-legales",
      },
      {
        icon: "analytics",
        title: "Inteligencia de Datos",
        text: "Acceso estratégico a información clave. Análisis precisos que fortalecen la competitividad y fomentan el crecimiento sostenible en el ámbito comercial y turístico.",
        href: "/cni/inteligencia-de-datos",
      },
      {
        icon: "engineering",
        title: "Servicios Técnicos",
        text: "Asesoría especializada durante todo el ciclo de vida del proyecto. Proporcionamos acceso directo a una red de contactos estratégicos nacionales.",
        href: "/cni/servicios-tecnicos",
      },
    ],
    ctaTitle: "Acelera tu proceso de inversión",
    ctaSubtitle: "Contacta hoy mismo al CNI para recibir asistencia profesional gratuita.",
    ctaButton: "Contactar Ahora",
  },
  en: {
    eyebrow: "Government Authority",
    titleA: "National Investment Council:",
    titleB: "Your gateway to invest in Honduras",
    description:
      "The CNI is the governing body identifying investment opportunities in prioritized sectors, providing legal security and technical accompaniment for national and foreign capital.",
    ctaExplore: "Explore Opportunities",
    ctaFree: "Free Advisory",
    mision: "Mission",
    misionText:
      "“We are Honduras's investment promotion agency, articulating efforts between the private sector and the State to attract investment and connect foreign capital with local development.”",
    vision: "Vision",
    visionText:
      "To consolidate ourselves as the leading promotion agency projecting Honduras as a world-class competitive destination for integral economic development, tourism and exports.",
    filosofiaTitle: "Institutional Philosophy",
    filosofiaText:
      "The CNI seeks to promote Honduras as an attractive destination, connecting global interests with local opportunities. We provide strategic accompaniment and free services across the entire “Investor Journey”, aligned with the continent's most demanding development policies.",
    rutaTitle: "Investor Journey",
    rutaIntro: "A structured and transparent process to ensure the success of your capital in our territory.",
    rutaSteps: [
      { n: 1, title: "Starting Point", text: "Initial analysis and potential diagnosis." },
      { n: 2, title: "Kick Off", text: "Strategic coordination meeting." },
      { n: 3, title: "Investment Pitch", text: "Detailed sector opportunities." },
      { n: 4, title: "Installation", text: "Execution and operational launch." },
      { n: 5, title: "Aftercare", text: "Post-investment accompaniment." },
    ],
    objetivosTitle: "Our Objectives",
    objetivos: {
      informar: { title: "INFORM", text: "Be a reliable, independent source aligned with State interests according to national plans and country vision.", cta: "Free Assistance" },
      promocionar: { title: "PROMOTE", text: "Promote investment and reinvestment nationally and internationally for sustainable, high-impact economic growth.", cta: "Free Assistance" },
      acompanar: { title: "ACCOMPANY", text: "Comprehensive advisory to investors across all critical stages of establishment." },
      articular: { title: "ARTICULATE", text: "Coordinate inter-institutional efforts between key government actors and private investors." },
      incidir: { title: "INFLUENCE", text: "Generate formal opinions and debate spaces for deep study of the incentive legal framework." },
    },
    valoresTitle: "Institutional Values",
    valoresIntro: "Our ethical and operational pillars.",
    valores: [
      { icon: "bolt", title: "Effectiveness", text: "Focused on delivering concrete results on time and form for your business." },
      { icon: "face_retouching_natural", title: "Identity", text: "We promote our best asset: Honduras and the exceptional talent of its people." },
      { icon: "psychology", title: "Resilience", text: "Change is our strategic ally; we adapt to constant transformation." },
    ],
    serviciosTitle: "Service Ecosystem",
    serviciosIntro: "Integral advisory solutions to safeguard and enhance your investment.",
    servicios: [
      { icon: "policy", title: "Legal Services", text: "Comprehensive legal advisory and technical assistance for administrative procedures. We facilitate project establishment through solid legal protection.", href: "/cni/servicios-legales" },
      { icon: "analytics", title: "Data Intelligence", text: "Strategic access to key information. Precise analyses that strengthen competitiveness and foster sustainable growth in commerce and tourism.", href: "/cni/inteligencia-de-datos" },
      { icon: "engineering", title: "Technical Services", text: "Specialized advisory throughout the project lifecycle. We provide direct access to a strategic national contact network.", href: "/cni/servicios-tecnicos" },
    ],
    ctaTitle: "Accelerate your investment process",
    ctaSubtitle: "Contact the CNI today to receive free professional assistance.",
    ctaButton: "Contact Now",
  },
} as const;

export default async function QuienesSomosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = copy[locale];
  const L = (p: string) => resolveHref(locale, p);

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9fa]">
      <header className="relative flex min-h-[760px] items-center overflow-hidden bg-[#000a1e] py-24">
        <div className="absolute inset-0 z-0">
          <Image src={designImages.cni.heroCity} alt="Honduras" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#000a1e] via-[#000a1e]/80 to-transparent" />
        </div>
        <div className="container relative z-10 mx-auto grid gap-12 px-8 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <div className="mb-6 flex items-center gap-2">
              <span className="h-1 w-12 bg-[#ffdea5]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#ffdea5]">{c.eyebrow}</span>
            </div>
            <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white md:text-7xl">
              {c.titleA} <span className="text-[#e9c176]">{c.titleB}</span>
            </h1>
            <p className="mb-10 max-w-xl text-lg leading-relaxed text-[#d6e3ff]">{c.description}</p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={L("/invertir")}
                className="inline-flex items-center gap-2 rounded-md bg-[#ffdea5] px-8 py-4 font-bold text-[#261900] transition-colors hover:bg-[#e9c176]"
              >
                {c.ctaExplore}
                <MaterialIcon name="arrow_forward" />
              </Link>
              <Link
                href={L("/contacto")}
                className="rounded-md border border-white/20 bg-white/10 px-8 py-4 font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                {c.ctaFree}
              </Link>
            </div>
          </div>
          <div className="hidden items-center justify-center md:flex">
            <div className="group relative">
              <div className="absolute -inset-4 bg-[#ffdea5]/20 blur-3xl transition-all group-hover:bg-[#ffdea5]/30" />
              <Image
                src={designImages.cni.macaw}
                alt="Guacamaya"
                width={320}
                height={320}
                className="relative h-auto w-80 drop-shadow-2xl"
                unoptimized
              />
            </div>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-white py-24">
        <div className="container mx-auto grid gap-16 px-8 md:grid-cols-2">
          <div className="flex flex-col gap-6 rounded-3xl border-l-8 border-[#000a1e] bg-[#f8f9fa] p-12 shadow-xl shadow-[#000a1e]/5">
            <MaterialIcon name="track_changes" filled className="text-4xl text-[#000a1e]" />
            <h2 className="text-4xl font-bold text-[#000a1e]">{c.mision}</h2>
            <p className="text-lg italic leading-relaxed text-[#44474e]">{c.misionText}</p>
          </div>
          <div className="flex flex-col gap-6 rounded-3xl border-l-8 border-[#3a5f94] bg-[#f8f9fa] p-12 shadow-xl shadow-[#000a1e]/5">
            <MaterialIcon name="visibility" filled className="text-4xl text-[#3a5f94]" />
            <h2 className="text-4xl font-bold text-[#000a1e]">{c.vision}</h2>
            <p className="text-lg leading-relaxed text-[#44474e]">{c.visionText}</p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#000a1e] py-24">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 opacity-10">
          <div className="h-full w-full bg-[radial-gradient(circle_at_center,_#e9c176_0%,_transparent_70%)]" />
        </div>
        <div className="container relative z-10 mx-auto flex max-w-4xl flex-col items-center px-8 text-center">
          <h2 className="mb-8 text-4xl font-extrabold tracking-tight text-white">{c.filosofiaTitle}</h2>
          <p className="text-xl font-light leading-loose text-[#d6e3ff]">{c.filosofiaText}</p>
          <div className="mt-12 h-1 w-24 rounded-full bg-[#ffdea5]" />
        </div>
      </section>

      <section className="relative bg-white py-32">
        <div className="container mx-auto px-8">
          <div className="mb-16 flex flex-col items-center text-center">
            <h2 className="mb-4 text-5xl font-black tracking-tighter text-[#000a1e]">{c.rutaTitle}</h2>
            <p className="max-w-2xl text-[#44474e]">{c.rutaIntro}</p>
          </div>
          <div className="flex justify-center">
            <div className="relative w-full max-w-6xl overflow-hidden rounded-3xl shadow-2xl">
              <Image
                src={designImages.cni.routeInfo}
                alt="Ruta del Inversionista"
                width={1400}
                height={500}
                className="h-auto w-full"
                unoptimized
              />
            </div>
          </div>
          <div className="mt-20 grid gap-8 md:grid-cols-5">
            {c.rutaSteps.map((s) => (
              <div key={s.n} className="group text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#3a5f94] text-xl font-bold text-white transition-transform group-hover:scale-110">
                  {s.n}
                </div>
                <h3 className="mb-2 font-bold text-[#000a1e]">{s.title}</h3>
                <p className="text-xs text-[#44474e]">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f3f4f5] py-24">
        <div className="container mx-auto px-8">
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-[#000a1e]">{c.objetivosTitle}</h2>
            <div className="mt-4 h-1.5 w-16 bg-[#e9c176]" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
            <div className="group rounded-xl border-b-4 border-[#3a5f94] bg-white p-10 transition-all hover:shadow-2xl md:col-span-3">
              <MaterialIcon name="info" filled className="mb-6 block text-4xl text-[#3a5f94]" />
              <h3 className="mb-4 text-2xl font-bold text-[#000a1e]">{c.objetivos.informar.title}</h3>
              <p className="leading-relaxed text-[#44474e]">{c.objetivos.informar.text}</p>
              <Link
                href={L("/contacto")}
                className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#3a5f94] transition-all group-hover:gap-4"
              >
                {c.objetivos.informar.cta}
                <MaterialIcon name="chevron_right" />
              </Link>
            </div>
            <div className="group rounded-xl border-b-4 border-[#000a1e] bg-white p-10 transition-all hover:shadow-2xl md:col-span-3">
              <MaterialIcon name="campaign" filled className="mb-6 block text-4xl text-[#000a1e]" />
              <h3 className="mb-4 text-2xl font-bold text-[#000a1e]">{c.objetivos.promocionar.title}</h3>
              <p className="leading-relaxed text-[#44474e]">{c.objetivos.promocionar.text}</p>
              <Link
                href={L("/contacto")}
                className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#000a1e] transition-all group-hover:gap-4"
              >
                {c.objetivos.promocionar.cta}
                <MaterialIcon name="chevron_right" />
              </Link>
            </div>
            <div className="rounded-xl bg-[#000a1e] p-10 text-white transition-all hover:shadow-2xl md:col-span-2">
              <MaterialIcon name="handshake" className="mb-6 block text-4xl text-[#ffdea5]" />
              <h3 className="mb-4 text-2xl font-bold">{c.objetivos.acompanar.title}</h3>
              <p className="text-sm text-[#d6e3ff]/80">{c.objetivos.acompanar.text}</p>
            </div>
            <div className="rounded-xl border-b-4 border-[#3a5f94] bg-white p-10 transition-all hover:shadow-2xl md:col-span-2">
              <MaterialIcon name="hub" className="mb-6 block text-4xl text-[#3a5f94]" />
              <h3 className="mb-4 text-2xl font-bold text-[#000a1e]">{c.objetivos.articular.title}</h3>
              <p className="text-sm text-[#44474e]">{c.objetivos.articular.text}</p>
            </div>
            <div className="rounded-xl border-b-4 border-[#e9c176] bg-white p-10 transition-all hover:shadow-2xl md:col-span-2">
              <MaterialIcon name="gavel" className="mb-6 block text-4xl text-[#e9c176]" />
              <h3 className="mb-4 text-2xl font-bold text-[#000a1e]">{c.objetivos.incidir.title}</h3>
              <p className="text-sm text-[#44474e]">{c.objetivos.incidir.text}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="container mx-auto px-8">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="flex flex-col gap-4">
              <h3 className="text-4xl font-black leading-tight text-[#000a1e]">{c.valoresTitle}</h3>
              <p className="text-[#44474e]">{c.valoresIntro}</p>
            </div>
            {c.valores.map((v) => (
              <div
                key={v.title}
                className="flex flex-col gap-4 rounded-2xl bg-[#f8f9fa] p-8 shadow-lg transition-transform hover:-translate-y-2"
              >
                <MaterialIcon name={v.icon} className="text-3xl text-[#3a5f94]" />
                <h4 className="text-xl font-bold text-[#000a1e]">{v.title}</h4>
                <p className="text-sm text-[#44474e]">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#000a1e] py-32">
        <div className="container relative z-10 mx-auto px-8">
          <div className="mb-20 text-center">
            <h2 className="mb-4 text-5xl font-extrabold text-white">{c.serviciosTitle}</h2>
            <p className="mx-auto max-w-2xl text-[#d6e3ff]">{c.serviciosIntro}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {c.servicios.map((s, i) => {
              const colors = ["text-[#ffdea5]", "text-[#9fc2fe]", "text-white"] as const;
              const accent = colors[i] ?? "text-white";
              return (
                <div
                  key={s.title}
                  className="group flex h-full flex-col rounded-2xl border border-white/5 bg-[#002147] p-10 transition-all hover:border-[#ffdea5]/30"
                >
                  <MaterialIcon name={s.icon} className={`mb-8 text-5xl ${accent}`} />
                  <h3 className="mb-6 text-2xl font-bold text-white">{s.title}</h3>
                  <p className="mb-8 grow leading-relaxed text-[#d6e3ff]/70">{s.text}</p>
                  <Link
                    href={L(s.href)}
                    className={`inline-flex items-center gap-2 font-bold transition-transform group-hover:translate-x-2 ${accent}`}
                  >
                    {locale === "es" ? "Más detalles" : "More details"}
                    <MaterialIcon name="arrow_right_alt" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#ffdea5] py-24">
        <div className="container mx-auto flex flex-col items-center justify-between gap-8 px-8 md:flex-row">
          <div className="text-center md:text-left">
            <h2 className="mb-2 text-4xl font-extrabold text-[#261900]">{c.ctaTitle}</h2>
            <p className="text-lg text-[#5d4201]">{c.ctaSubtitle}</p>
          </div>
          <Link
            href={L("/contacto")}
            className="rounded-md bg-[#000a1e] px-10 py-5 text-lg font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            {c.ctaButton}
          </Link>
        </div>
      </section>
    </div>
  );
}

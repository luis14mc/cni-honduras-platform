import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isLocale, type Locale } from "@/src/i18n/config";
import { designImages } from "@/src/lib/designAssets";
import { resolveHref } from "@/src/i18n/path";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";

const copy = {
  es: {
    storyLabel: "Caso de Éxito",
    quote: "“Invertir aquí es invertir en un modelo de crecimiento sostenible con rostro humano.”",
    quoteAuthor: "— Naman Antonio Sánchez, Gerente General",
    metrics: [
      { icon: "groups", number: "+1,000", label: "Empleos Directos Generados", text: "Impacto socioeconómico continuo durante los doce meses del año en comunidades rurales.", border: "border-[#000a1e]" },
      { icon: "public", number: "6+ Países", label: "Mercados de Exportación", text: "Presencia en USA, Reino Unido, Francia, Bélgica, Italia y Países Bajos con altos estándares.", border: "border-[#3a5f94]" },
      { icon: "flight_takeoff", number: "Palmerola", label: "Hub Logístico Estratégico", text: "Garantía de frescura y trazabilidad absoluta desde el corazón de Centroamérica.", border: "border-[#e9c176]" },
    ],
    leftTitle: "De un Contenedor a un Gigante Regional",
    leftText: "Con más de una década de experiencia en el sector, la empresa ha experimentado una transformación radical. Lo que comenzó como un modesto esfuerzo de exportar un contenedor semanal se ha convertido en una operación logística masiva que despacha cargamentos diarios.",
    leftQuote: "“Nuestro país tiene gente trabajadora, tierra fértil y una ubicación privilegiada. Nosotros lo hemos demostrado desde el sur, consolidando una plataforma de desarrollo rural sin precedentes.”",
    rightTitle: "Impacto en Guasaule, Choluteca",
    rightText: "Enclavada en la frontera sur de Honduras, esta inversión se ha consolidado como una de las empresas líderes en la exportación de okra fresca. Su operación no solo genera riqueza, sino que funciona como una plataforma de estabilidad para cientos de familias en Choluteca.",
    strategicTitle: "Ventaja Estratégica: El Hub de Palmerola",
    strategicText: "Su centro operativo se apalanca estratégicamente en la terminal de carga de Palmerola. Esta infraestructura de clase mundial permite movilizar productos con estándares de frescura insuperables, reduciendo tiempos de tránsito hacia destinos globales y garantizando una trazabilidad del 100% desde la finca hasta la góndola.",
    relatedTitle: "Otros Casos de Éxito",
    relatedSub: "Descubre cómo otras inversiones están transformando Honduras.",
    seeAll: "Ver todos los casos",
    viewCase: "Ver caso",
    related: [
      { img: designImages.casos.relKimpton, title: "Kimpton Grand Hotel: Roatán", desc: "Transformación del turismo de lujo y compromiso social a través de la Abundant Life Foundation en las Islas de la Bahía." },
      { img: designImages.casos.relIbagari, title: "Ibagari: Santuario de Lujo", desc: "Reconocido como uno de los resorts más exclusivos de la isla, ideal para bodas de destino y relajación de alto nivel." },
    ],
    ctaTitle: "Acelera tu proceso de inversión en Honduras",
    ctaText: "Nuestro equipo de asesores técnicos y legales está listo para acompañar tu visión de negocio.",
    ctaButton: "Contacta al CNI para asistencia gratuita",
    backToList: "Volver a Casos de Éxito",
  },
  en: {
    storyLabel: "Success Story",
    quote: "“Investing here is investing in a sustainable growth model with a human face.”",
    quoteAuthor: "— Naman Antonio Sánchez, General Manager",
    metrics: [
      { icon: "groups", number: "+1,000", label: "Direct Jobs Generated", text: "Continuous socio-economic impact during the twelve months of the year in rural communities.", border: "border-[#000a1e]" },
      { icon: "public", number: "6+ Countries", label: "Export Markets", text: "Presence in USA, United Kingdom, France, Belgium, Italy and Netherlands with high standards.", border: "border-[#3a5f94]" },
      { icon: "flight_takeoff", number: "Palmerola", label: "Strategic Logistics Hub", text: "Guarantee of freshness and absolute traceability from the heart of Central America.", border: "border-[#e9c176]" },
    ],
    leftTitle: "From One Container to a Regional Giant",
    leftText: "With more than a decade of sector experience, the company has undergone a radical transformation. What began as a modest effort to export a weekly container has become a massive logistics operation shipping daily.",
    leftQuote: "“Our country has hard-working people, fertile land, and a privileged location. We have demonstrated this from the south, consolidating an unprecedented rural development platform.”",
    rightTitle: "Impact in Guasaule, Choluteca",
    rightText: "Nestled on the southern border of Honduras, this investment has consolidated itself as one of the leading companies exporting fresh okra. Its operation not only generates wealth, but also functions as a stability platform for hundreds of families in Choluteca.",
    strategicTitle: "Strategic Advantage: The Palmerola Hub",
    strategicText: "Its operational center strategically leverages the Palmerola cargo terminal. This world-class infrastructure allows mobilizing products with unbeatable freshness standards, reducing transit times to global destinations and ensuring 100% traceability from the farm to the shelf.",
    relatedTitle: "Other Success Stories",
    relatedSub: "Discover how other investments are transforming Honduras.",
    seeAll: "View all cases",
    viewCase: "View case",
    related: [
      { img: designImages.casos.relKimpton, title: "Kimpton Grand Hotel: Roatán", desc: "Transformation of luxury tourism and social commitment through the Abundant Life Foundation in the Bay Islands." },
      { img: designImages.casos.relIbagari, title: "Ibagari: Luxury Sanctuary", desc: "Recognized as one of the most exclusive resorts on the island, ideal for destination weddings and high-end relaxation." },
    ],
    ctaTitle: "Accelerate your investment process in Honduras",
    ctaText: "Our team of technical and legal advisors is ready to accompany your business vision.",
    ctaButton: "Contact the CNI for free assistance",
    backToList: "Back to Success Stories",
  },
} as const;

export default async function CasoDetallePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = copy[locale];
  const L = (p: string) => resolveHref(locale, p);

  const title = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const subtitle = locale === "es" ? "Liderazgo Estratégico" : "Strategic Leadership";

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9fa]">
      <header className="hero-gradient relative overflow-hidden pb-24 pt-48 md:pt-56">
        <div className="absolute inset-0 opacity-40">
          <Image src={designImages.casos.sinclairHero} alt={title} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000a1e] via-[#000a1e]/60 to-transparent" />
        </div>
        <div className="container relative z-10 mx-auto px-6 md:px-12">
          <Link href={L("/portafolio/casos")} className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#ffdea5] hover:text-white">
            <MaterialIcon name="arrow_back" className="text-sm" />
            {c.backToList}
          </Link>
          <div className="max-w-4xl">
            <span className="mb-6 inline-block rounded-sm bg-[#2e1f00] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#ffdea5]">{c.storyLabel}: {title}</span>
            <h1 className="mb-8 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
              {title}: {subtitle}
            </h1>
            <div className="border-l-4 border-[#ffdea5] py-2 pl-6">
              <p className="mb-4 text-xl font-light italic leading-relaxed text-white/90 md:text-2xl">{c.quote}</p>
              <cite className="font-bold not-italic tracking-wide text-[#ffdea5]">{c.quoteAuthor}</cite>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-[#f8f9fa] py-20">
        <div className="container mx-auto grid grid-cols-1 gap-8 px-6 md:grid-cols-3 md:px-12">
          {c.metrics.map((m) => (
            <div key={m.label} className={`rounded-xl border-t-4 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 ${m.border}`}>
              <MaterialIcon name={m.icon} className="mb-4 block text-4xl text-[#3a5f94]" />
              <h3 className="mb-2 text-4xl font-bold text-[#000a1e]">{m.number}</h3>
              <p className="font-medium text-[#44474e]">{m.label}</p>
              <p className="mt-4 text-sm leading-relaxed text-[#44474e]/70">{m.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f3f4f5] py-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col items-start gap-16 lg:flex-row">
            <div className="space-y-8 lg:w-1/2">
              <div className="relative">
                <h2 className="text-3xl font-bold tracking-tight text-[#000a1e]">{c.leftTitle}</h2>
                <span className="absolute -bottom-1 left-0 h-1 w-10 bg-[#ffdea5]" />
              </div>
              <p className="text-lg leading-relaxed text-[#44474e]">{c.leftText}</p>
              <div className="rounded-xl bg-[#000a1e] p-8 text-white">
                <p className="italic leading-loose text-white/80">{c.leftQuote}</p>
              </div>
            </div>
            <div className="space-y-8 lg:w-1/2">
              <div className="relative">
                <h2 className="text-3xl font-bold tracking-tight text-[#000a1e]">{c.rightTitle}</h2>
                <span className="absolute -bottom-1 left-0 h-1 w-10 bg-[#ffdea5]" />
              </div>
              <p className="text-lg leading-relaxed text-[#44474e]">{c.rightText}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative h-48">
                  <Image src={designImages.casos.okra} alt="Okra" fill sizes="(min-width:768px) 25vw, 50vw" className="rounded-xl object-cover" />
                </div>
                <div className="relative h-48">
                  <Image src={designImages.casos.warehouse} alt="Warehouse" fill sizes="(min-width:768px) 25vw, 50vw" className="rounded-xl object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#000a1e] py-24 text-white">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_center,_rgba(255,222,165,0.4)_0%,_transparent_70%)] opacity-10" />
        <div className="container relative z-10 mx-auto px-6 md:px-12">
          <div className="max-w-3xl">
            <h2 className="mb-6 text-4xl font-bold">{c.strategicTitle}</h2>
            <p className="mb-10 text-xl leading-relaxed text-[#708ab5]">{c.strategicText}</p>
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-[#2d476f]/30" />
              <MaterialIcon name="verified_user" filled className="text-[#ffdea5]" />
              <div className="h-px flex-1 bg-[#2d476f]/30" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f8f9fa] py-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#000a1e]">{c.relatedTitle}</h2>
              <p className="mt-2 text-[#44474e]">{c.relatedSub}</p>
            </div>
            <Link href={L("/portafolio/casos")} className="hidden font-bold text-[#3a5f94] underline-offset-4 hover:underline md:block">
              {c.seeAll}
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {c.related.map((r) => (
              <Link key={r.title} href={L(`/portafolio/casos/${r.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`)} className="group cursor-pointer">
                <div className="relative mb-6 aspect-video overflow-hidden rounded-xl">
                  <Image src={r.img} alt={r.title} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-[#000a1e] transition-colors group-hover:text-[#3a5f94]">{r.title}</h3>
                <p className="mb-4 line-clamp-2 text-[#44474e]">{r.desc}</p>
                <span className="inline-flex items-center text-sm font-bold uppercase tracking-wide text-[#000a1e]">
                  {c.viewCase} <MaterialIcon name="arrow_forward" className="ml-2 text-sm" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#e1e3e4] py-20">
        <div className="container mx-auto px-6 text-center md:px-12">
          <div className="mx-auto max-w-2xl rounded-2xl bg-white p-12 shadow-xl shadow-[#000a1e]/5">
            <h2 className="mb-6 text-3xl font-extrabold text-[#000a1e]">{c.ctaTitle}</h2>
            <p className="mb-10 text-lg text-[#44474e]">{c.ctaText}</p>
            <Link
              href={L("/contacto")}
              className="inline-block rounded-md bg-[#000a1e] px-10 py-4 text-lg font-bold text-white shadow-lg shadow-[#000a1e]/20 transition-colors hover:bg-[#002147] active:scale-95"
            >
              {c.ctaButton}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

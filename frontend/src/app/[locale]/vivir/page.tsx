import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isLocale, type Locale } from "@/src/i18n/config";
import { designImages } from "@/src/lib/designAssets";
import { resolveHref } from "@/src/i18n/path";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO.vivir);

const copy = {
  es: {
    titleA: "Vivir en Honduras:",
    titleB: "Calidad de Vida y Oportunidad",
    description:
      "Descubra un país con un encanto único y gente acogedora. Cada inversión es una oportunidad de éxito en una nación que combina tradición milenaria con una visión arquitectónica moderna.",
    ctaPrimary: "Explorar Estilo de Vida",
    section2Eyebrow: "Hogar & Infraestructura",
    section2Title: "Honduras, tu nuevo hogar",
    section2Lead:
      "Honduras le ofrece una experiencia única que combina lo mejor de la vida moderna con nuestra rica cultura. Desde vibrantes centros urbanos hasta exclusivas zonas residenciales, descubra un país que evoluciona mientras mantiene su esencia.",
    section2Items: [
      { icon: "apartment", title: "Desarrollos Residenciales", text: "Arquitectura contemporánea con amenidades exclusivas y amplios espacios verdes." },
      { icon: "account_balance", title: "Banca de Primer Nivel", text: "Sistema financiero robusto con servicios digitales avanzados y presencia global." },
    ],
    eduTitle: "Educación de clase mundial",
    eduSub: "Formación académica de excelencia para las futuras generaciones de líderes globales.",
    edu: [
      { value: "18", title: "Colegios IB", items: ["Currículum internacional reconocido", "Programas multilingües", "Alta tasa de admisión internacional"], lines: [] as string[], dark: false },
      { value: "06", title: "Universidades Estatales", items: ["Acreditación nacional e internacional", "Presencia en todo el territorio nacional", "Centros de investigación y desarrollo"], lines: [] as string[], dark: true },
      { value: "17", title: "Instituciones de Prestigio", items: [] as string[], lines: ["UNITEC / CEUTEC", "UTH (9 sedes estratégicas)", "UNICAH (8 sedes regionales)", "UCENM (10 sedes locales)"], dark: false },
    ],
    healthTitle: "Red completa de servicios médicos",
    healthText:
      "Honduras destaca por una infraestructura de salud robusta, combinando la calidez humana con tecnología de vanguardia en hospitales como el Honduras Medical Center y CEMESA.",
    healthStats: [
      { value: "1,867", label: "Instalaciones Médicas" },
      { value: "16", label: "Hospitales de Especialidad" },
    ],
    healthQuote: "“Atención médica especializada que cumple con los más altos estándares internacionales.”",
    cultureTitle: "Balance perfecto entre modernidad y tradición",
    cultureSub: "Desde escapadas naturales hasta centros culturales de vanguardia, Honduras ofrece un estilo de vida multifacético.",
    cultureGroups: [
      { icon: "forest", title: "Atractivos Naturales", tags: ["La Tigra", "El Picacho", "Valle de Ángeles"] },
      { icon: "museum", title: "Cultura e Historia", tags: ["MIN", "Basílica de Suyapa", "Plaza Morazán"] },
      { icon: "shopping_bag", title: "Vida Moderna", tags: ["Galerías de Arte", "Malls de Lujo", "Distritos Gastronómicos"] },
    ],
    minTag: "Cultura",
    minTitle: "Museo para la Identidad Nacional",
    natureTag: "Naturaleza",
    natureTitle: "Parque Nacional La Tigra",
    mallTag: "Vida Urbana",
    mallTitle: "Centros Comerciales Premium",
    ctaTitle: "Vive la experiencia Honduras",
    ctaDesc: "Nuestro equipo está listo para asesorarle en cada paso de su establecimiento en el país. Acelere su proceso de inversión con el apoyo del Centro Nacional de Inversiones.",
    ctaButton: "Contactar al CNI para asistencia gratuita",
  },
  en: {
    titleA: "Living in Honduras:",
    titleB: "Quality of Life and Opportunity",
    description:
      "Discover a country with unique charm and welcoming people. Every investment is an opportunity to succeed in a nation that combines millenary tradition with a modern architectural vision.",
    ctaPrimary: "Explore Lifestyle",
    section2Eyebrow: "Home & Infrastructure",
    section2Title: "Honduras, your new home",
    section2Lead:
      "Honduras offers you a unique experience that combines the best of modern life with our rich culture. From vibrant urban centers to exclusive residential zones, discover a country that evolves while keeping its essence.",
    section2Items: [
      { icon: "apartment", title: "Residential Developments", text: "Contemporary architecture with exclusive amenities and ample green spaces." },
      { icon: "account_balance", title: "First-Class Banking", text: "Robust financial system with advanced digital services and global presence." },
    ],
    eduTitle: "World-class education",
    eduSub: "Academic excellence for future generations of global leaders.",
    edu: [
      { value: "18", title: "IB Schools", items: ["Recognized international curriculum", "Multilingual programs", "High international admission rate"], lines: [] as string[], dark: false },
      { value: "06", title: "State Universities", items: ["National and international accreditation", "Presence throughout the national territory", "Research and development centers"], lines: [] as string[], dark: true },
      { value: "17", title: "Prestige Institutions", items: [] as string[], lines: ["UNITEC / CEUTEC", "UTH (9 strategic campuses)", "UNICAH (8 regional campuses)", "UCENM (10 local campuses)"], dark: false },
    ],
    healthTitle: "Complete medical services network",
    healthText:
      "Honduras stands out for its robust health infrastructure, combining human warmth with cutting-edge technology in hospitals like Honduras Medical Center and CEMESA.",
    healthStats: [
      { value: "1,867", label: "Medical Facilities" },
      { value: "16", label: "Specialty Hospitals" },
    ],
    healthQuote: "“Specialized medical care that meets the highest international standards.”",
    cultureTitle: "Perfect balance between modernity and tradition",
    cultureSub: "From natural escapes to cutting-edge cultural centers, Honduras offers a multifaceted lifestyle.",
    cultureGroups: [
      { icon: "forest", title: "Natural Attractions", tags: ["La Tigra", "El Picacho", "Valle de Ángeles"] },
      { icon: "museum", title: "Culture and History", tags: ["MIN", "Suyapa Basilica", "Plaza Morazán"] },
      { icon: "shopping_bag", title: "Modern Life", tags: ["Art Galleries", "Luxury Malls", "Gastronomic Districts"] },
    ],
    minTag: "Culture",
    minTitle: "National Identity Museum",
    natureTag: "Nature",
    natureTitle: "La Tigra National Park",
    mallTag: "Urban Life",
    mallTitle: "Premium Shopping Centers",
    ctaTitle: "Experience Honduras",
    ctaDesc: "Our team is ready to advise you on every step of your establishment in the country. Accelerate your investment process with the support of the National Investment Council.",
    ctaButton: "Contact CNI for free assistance",
  },
} as const;

export default async function VivirPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = copy[locale];
  const L = (p: string) => resolveHref(locale, p);

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9fa]">
      <header className="relative flex min-h-[870px] items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <Image src={designImages.vivir.hero} alt="Tegucigalpa" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 hero-gradient" />
        </div>
        <div className="container relative z-10 mx-auto px-8 text-center md:text-left">
          <div className="max-w-4xl">
            <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
              {c.titleA} <span className="text-[#ffdea5]">{c.titleB}</span>
            </h1>
            <p className="mb-8 max-w-2xl text-xl leading-relaxed text-white/90">{c.description}</p>
            <div className="flex flex-wrap justify-center gap-4 md:justify-start">
              <Link
                href={L("/vivir/calidad-de-vida")}
                className="inline-flex items-center gap-2 rounded-md bg-[#ffdea5] px-8 py-4 font-bold text-[#261900] transition-colors hover:bg-[#e9c176]"
              >
                {c.ctaPrimary}
                <MaterialIcon name="arrow_forward" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-[#f8f9fa] py-24">
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <span className="mb-4 block text-sm font-bold uppercase tracking-widest text-[#3a5f94]">{c.section2Eyebrow}</span>
              <h2 className="mb-8 text-4xl font-black leading-tight text-[#000a1e] md:text-5xl">{c.section2Title}</h2>
              <div className="space-y-6 text-lg leading-relaxed text-[#44474e]">
                <p>{c.section2Lead}</p>
                {c.section2Items.map((it) => (
                  <div key={it.title} className="flex items-start gap-4 rounded-xl bg-[#f3f4f5] p-4 shadow-sm">
                    <MaterialIcon name={it.icon} className="scale-125 pt-1 text-[#3a5f94]" />
                    <div>
                      <h4 className="mb-1 font-bold text-[#000a1e]">{it.title}</h4>
                      <p className="text-base">{it.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:col-span-7">
              <div className="space-y-4 pt-12">
                <div className="aspect-[3/4] overflow-hidden rounded-2xl shadow-2xl">
                  <Image src={designImages.vivir.residential} alt="Residencial" width={600} height={800} className="h-full w-full object-cover" unoptimized />
                </div>
              </div>
              <div className="space-y-4">
                <div className="aspect-[3/4] overflow-hidden rounded-2xl shadow-2xl">
                  <Image src={designImages.vivir.banking} alt="Banca" width={600} height={800} className="h-full w-full object-cover" unoptimized />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#d9dadb] py-24">
        <div className="container mx-auto px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-[#000a1e]">{c.eduTitle}</h2>
            <p className="mx-auto max-w-2xl text-lg text-[#44474e]">{c.eduSub}</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {c.edu.map((e) => (
              <div
                key={e.title}
                className={`flex h-full flex-col rounded-2xl p-10 shadow-xl ${
                  e.dark ? "bg-[#002147] text-white shadow-[#000a1e]/10" : "border border-[#c4c6cf]/10 bg-white shadow-[#000a1e]/5"
                }`}
              >
                <div className={`mb-4 text-6xl font-black ${e.dark ? "text-[#ffdea5]" : "text-[#3a5f94]"}`}>{e.value}</div>
                <h3 className={`mb-6 text-2xl font-bold ${e.dark ? "text-white" : "text-[#000a1e]"}`}>{e.title}</h3>
                {e.items.length > 0 ? (
                  <ul className={`space-y-4 ${e.dark ? "opacity-90" : "text-[#44474e]"}`}>
                    {e.items.map((it) => (
                      <li key={it} className="flex items-center gap-3">
                        <MaterialIcon name="check_circle" className={`text-sm ${e.dark ? "text-[#ffdea5]" : "text-[#e9c176]"}`} />
                        {it}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="space-y-3 text-sm">
                    <p className="font-bold text-[#000a1e]">{locale === "es" ? "Red de Excelencia:" : "Excellence Network:"}</p>
                    {e.lines.map((line) => (
                      <p key={line} className="text-[#44474e]">• {line}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f8f9fa] py-24">
        <div className="container mx-auto px-8">
          <div className="flex flex-col overflow-hidden rounded-3xl bg-[#e7e8e9] shadow-2xl lg:flex-row">
            <div className="relative min-h-[400px] lg:w-1/2">
              <Image src={designImages.vivir.healthcare} alt="Salud" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="flex flex-col justify-center p-12 lg:w-1/2 lg:p-16">
              <h2 className="mb-6 text-4xl font-bold text-[#000a1e]">{c.healthTitle}</h2>
              <p className="mb-8 text-lg leading-relaxed text-[#44474e]">{c.healthText}</p>
              <div className="mb-10 grid grid-cols-2 gap-8">
                {c.healthStats.map((s) => (
                  <div key={s.label}>
                    <div className="mb-1 text-3xl font-black text-[#3a5f94]">{s.value}</div>
                    <div className="text-xs uppercase tracking-widest text-[#44474e]">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border-l-4 border-[#3a5f94] bg-white p-4">
                <p className="italic">{c.healthQuote}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="container mx-auto px-8">
          <div className="flex flex-col gap-16 lg:flex-row">
            <div className="lg:w-1/3">
              <h2 className="mb-8 text-4xl font-black leading-tight text-[#000a1e]">{c.cultureTitle}</h2>
              <p className="mb-12 text-lg text-[#44474e]">{c.cultureSub}</p>
              <div className="space-y-8">
                {c.cultureGroups.map((g) => (
                  <div key={g.title}>
                    <h4 className="mb-4 flex items-center gap-2 font-bold text-[#3a5f94]">
                      <MaterialIcon name={g.icon} />
                      {g.title}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {g.tags.map((t) => (
                        <span key={t} className="rounded-full bg-[#edeeef] px-4 py-1.5 text-sm font-semibold text-[#000a1e]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:w-2/3">
              <div className="group relative overflow-hidden rounded-2xl">
                <Image src={designImages.vivir.museum} alt="MIN" width={600} height={750} className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#000a1e]/90 to-transparent p-8">
                  <p className="mb-1 text-xs uppercase tracking-widest text-[#ffdea5]">{c.minTag}</p>
                  <h5 className="text-xl font-bold text-white">{c.minTitle}</h5>
                </div>
              </div>
              <div className="space-y-8">
                <div className="group relative overflow-hidden rounded-2xl">
                  <Image src={designImages.vivir.nature} alt="La Tigra" width={600} height={350} className="aspect-video w-full object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#000a1e]/90 to-transparent p-6">
                    <p className="mb-1 text-xs uppercase tracking-widest text-[#ffdea5]">{c.natureTag}</p>
                    <h5 className="text-lg font-bold text-white">{c.natureTitle}</h5>
                  </div>
                </div>
                <div className="group relative overflow-hidden rounded-2xl">
                  <Image src={designImages.vivir.mall} alt="Mall" width={600} height={350} className="aspect-video w-full object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#000a1e]/90 to-transparent p-6">
                    <p className="mb-1 text-xs uppercase tracking-widest text-[#ffdea5]">{c.mallTag}</p>
                    <h5 className="text-lg font-bold text-white">{c.mallTitle}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#002147] p-12 text-center shadow-2xl shadow-[#000a1e]/40 md:p-24">
            <div className="absolute right-0 top-0 -mr-48 -mt-48 h-96 w-96 rounded-full bg-[#3a5f94]/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-48 -ml-48 h-96 w-96 rounded-full bg-[#ffdea5]/5 blur-3xl" />
            <div className="relative z-10 mx-auto max-w-3xl">
              <h2 className="mb-6 text-4xl font-black text-white md:text-5xl">{c.ctaTitle}</h2>
              <p className="mb-12 text-xl text-white/80">{c.ctaDesc}</p>
              <div className="flex flex-col justify-center gap-6 sm:flex-row">
                <Link
                  href={L("/contacto")}
                  className="rounded-md bg-[#ffdea5] px-10 py-5 text-lg font-bold text-[#261900] shadow-lg transition-all hover:bg-[#e9c176] active:scale-95"
                >
                  {c.ctaButton}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

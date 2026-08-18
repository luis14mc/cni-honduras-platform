import Image from "next/image";
import Link from "next/link";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { designImages } from "@/src/lib/designAssets";
import type { Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";

const copy = {
  es: {
    titleA: "Vivir en",
    titleB: "Honduras",
    description:
      "Salud, educación bilingüe, residencias y un entorno cultural para arraigar capital y familia.",
    heroImageAlt: "Tegucigalpa",
    heroExplore: "Explorar estilo de vida",
    heroSectors: "Ver sectores",
    heroContact: "Contactar al CNI",
    nav: [
      { href: "#hogar", label: "Hogar" },
      { href: "#educacion", label: "Educación" },
      { href: "#salud", label: "Salud" },
      { href: "#cultura", label: "Cultura" },
      { href: "#zonas", label: "Zonas" },
    ],
    stats: [
      { value: "24", label: "Edad mediana" },
      { value: "18", label: "Colegios IB" },
      { value: "1,867", label: "Instalaciones médicas" },
      { value: "2h", label: "Caribe ↔ Pacífico" },
    ],
    homeEyebrow: "Hogar",
    homeTitle: "Honduras, su nuevo hogar",
    homeLead:
      "Centros urbanos, residenciales privados y un sistema financiero con servicios digitales para operación de largo plazo.",
    homeItems: [
      { icon: "apartment", title: "Desarrollos residenciales", text: "Arquitectura contemporánea, amenidades y seguridad gestionada." },
      { icon: "account_balance", title: "Banca", text: "Sistema financiero con canales digitales y presencia internacional." },
    ],
    eduEyebrow: "Educación",
    eduTitle: "Formación de clase mundial",
    eduLead: "Currículos internacionales y universidades con presencia nacional.",
    edu: [
      { value: "18", title: "Colegios IB", items: ["Currículum internacional", "Programas multilingües", "Admisión en el exterior"] },
      { value: "06", title: "Universidades estatales", items: ["Acreditación nacional e internacional", "Cobertura territorial", "Investigación y desarrollo"] },
      { value: "17", title: "Red de prestigio", items: ["UNITEC / CEUTEC", "UTH · 9 sedes", "UNICAH · 8 sedes", "UCENM · 10 sedes"] },
    ],
    healthEyebrow: "Salud",
    healthTitle: "Red médica de alta complejidad",
    healthText:
      "Infraestructura de salud que combina hospitales de especialidad con tecnología de vanguardia, incluyendo Honduras Medical Center y CEMESA.",
    healthStats: [
      { value: "1,867", label: "Instalaciones médicas" },
      { value: "16", label: "Hospitales de especialidad" },
    ],
    cultureEyebrow: "Cultura",
    cultureTitle: "Modernidad y tradición",
    cultureLead: "Naturaleza, museos y vida urbana a poca distancia de los hubs de inversión.",
    cultureGroups: [
      { title: "Naturaleza", tags: ["La Tigra", "El Picacho", "Valle de Ángeles"] },
      { title: "Historia", tags: ["MIN", "Basílica de Suyapa", "Plaza Morazán"] },
      { title: "Vida urbana", tags: ["Galerías", "Malls", "Gastronomía"] },
    ],
    minTitle: "Museo para la Identidad Nacional",
    natureTitle: "Parque Nacional La Tigra",
    mallTitle: "Centros comerciales",
    zonesEyebrow: "Zonas",
    zonesTitle: "Dónde vivir según su agenda",
    zonesLead:
      "Tegucigalpa, San Pedro Sula, La Ceiba, Tela y Roatán concentran residencias demandadas por ejecutivos, con servicios y conectividad aérea.",
    zones: [
      "Cuatro aeropuertos internacionales y vuelos a Houston, Miami, Atlanta, CDMX y Madrid.",
      "Residenciales privados con concierge, gimnasio y seguridad.",
      "Comunidad expatriada con cámaras binacionales y clubes corporativos.",
    ],
    ctaEyebrow: "Acompañamiento CNI",
    ctaTitle1: "Vivir aquí también es",
    ctaTitle2: "invertir aquí",
    ctaDesc: "El CNI asesora el establecimiento en el país: familia, operación y aftercare, sin costo.",
    ctaPrimary: "Contactar al CNI",
    ctaSecondary: "Portafolio",
  },
  en: {
    titleA: "Live in",
    titleB: "Honduras",
    description:
      "Healthcare, bilingual education, residences and culture to root both capital and family.",
    heroImageAlt: "Tegucigalpa",
    heroExplore: "Explore lifestyle",
    heroSectors: "View sectors",
    heroContact: "Contact CNI",
    nav: [
      { href: "#hogar", label: "Home" },
      { href: "#educacion", label: "Education" },
      { href: "#salud", label: "Healthcare" },
      { href: "#cultura", label: "Culture" },
      { href: "#zonas", label: "Areas" },
    ],
    stats: [
      { value: "24", label: "Median age" },
      { value: "18", label: "IB schools" },
      { value: "1,867", label: "Medical facilities" },
      { value: "2h", label: "Caribbean ↔ Pacific" },
    ],
    homeEyebrow: "Home",
    homeTitle: "Honduras, your new home",
    homeLead:
      "Urban centers, private residences and a financial system with digital services for long-term operations.",
    homeItems: [
      { icon: "apartment", title: "Residential developments", text: "Contemporary architecture, amenities and managed security." },
      { icon: "account_balance", title: "Banking", text: "A financial system with digital channels and international presence." },
    ],
    eduEyebrow: "Education",
    eduTitle: "World-class schooling",
    eduLead: "International curricula and universities with national reach.",
    edu: [
      { value: "18", title: "IB schools", items: ["International curriculum", "Multilingual programs", "Overseas admissions"] },
      { value: "06", title: "State universities", items: ["National and international accreditation", "Nationwide presence", "Research and development"] },
      { value: "17", title: "Prestige network", items: ["UNITEC / CEUTEC", "UTH · 9 campuses", "UNICAH · 8 campuses", "UCENM · 10 campuses"] },
    ],
    healthEyebrow: "Healthcare",
    healthTitle: "High-complexity medical network",
    healthText:
      "Health infrastructure combining specialty hospitals and modern technology, including Honduras Medical Center and CEMESA.",
    healthStats: [
      { value: "1,867", label: "Medical facilities" },
      { value: "16", label: "Specialty hospitals" },
    ],
    cultureEyebrow: "Culture",
    cultureTitle: "Modernity and tradition",
    cultureLead: "Nature, museums and urban life within reach of investment hubs.",
    cultureGroups: [
      { title: "Nature", tags: ["La Tigra", "El Picacho", "Valle de Ángeles"] },
      { title: "History", tags: ["MIN", "Suyapa Basilica", "Plaza Morazán"] },
      { title: "Urban life", tags: ["Galleries", "Malls", "Dining"] },
    ],
    minTitle: "National Identity Museum",
    natureTitle: "La Tigra National Park",
    mallTitle: "Shopping centers",
    zonesEyebrow: "Areas",
    zonesTitle: "Where to live for your agenda",
    zonesLead:
      "Tegucigalpa, San Pedro Sula, La Ceiba, Tela and Roatán host residences sought by executives, with services and air connectivity.",
    zones: [
      "Four international airports and flights to Houston, Miami, Atlanta, Mexico City and Madrid.",
      "Private residences with concierge, gym and security.",
      "An expatriate community with binational chambers and corporate clubs.",
    ],
    ctaEyebrow: "CNI support",
    ctaTitle1: "Living here is also",
    ctaTitle2: "investing here",
    ctaDesc: "CNI advises on establishing in the country: family, operations and aftercare, at no cost.",
    ctaPrimary: "Contact CNI",
    ctaSecondary: "Portfolio",
  },
} as const;

export function VivirPageView({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const L = (path: string) => withLocale(locale, path);

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9fa]">
      <header className="relative flex min-h-screen items-center overflow-hidden bg-[#000a1e] pt-32 pb-24 text-white">
        <div className="absolute inset-0">
          <Image
            src={designImages.vivir.hero}
            alt={c.heroImageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-[0.42]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#000a1e]/70 via-[#000a1e]/35 to-transparent" />
          <div className="site-footer-mesh pointer-events-none absolute inset-0 opacity-[0.16]" aria-hidden />
        </div>
        <div className={cn("relative z-10 w-full", layout.container)}>
          <div className="max-w-3xl">
            <h1 className={cn("text-white", t.heroTitle)}>
              {c.titleA} <span className="text-[#32B372]">{c.titleB}</span>
            </h1>
            <p className={cn("mt-6 max-w-2xl text-white/80", t.heroLead)}>{c.description}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#hogar"
                className="rounded bg-[#32B372] px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#000a1e]"
              >
                {c.heroExplore}
              </a>
              <Link
                href={L("/invertir/sectores")}
                className="rounded border border-white px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#000a1e]"
              >
                {c.heroSectors}
              </Link>
              <Link
                href={L("/contacto")}
                className="rounded border border-white px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#000a1e]"
              >
                {c.heroContact}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="border-b border-[#c5c6cd]/30 bg-white py-5">
        <div className={cn(layout.container, "flex flex-wrap gap-2")}>
          {c.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full bg-[#f3f4f5] px-4 py-2 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-cni-primary transition hover:bg-[#000a1e] hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>
      </section>

      <section className={cn("bg-white", layout.section)}>
        <div className={layout.container}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-[#c5c6cd]/30 bg-[#f3f4f5] px-6 py-5">
                <p className={t.metricValue}>{stat.value}</p>
                <p className={cn("mt-1", t.metricLabel)}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="hogar" className={cn("bg-[#f3f4f5]", layout.section)}>
        <div className={layout.container}>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className={t.eyebrow}>{c.homeEyebrow}</p>
              <h2 className={cn("mt-3", t.h2)}>{c.homeTitle}</h2>
              <div className={cn("mt-4", t.sectionRule)} />
              <p className={cn("mt-6", t.lead)}>{c.homeLead}</p>
              <div className="mt-8 space-y-4">
                {c.homeItems.map((item) => (
                  <article key={item.title} className="rounded-xl border border-[#c5c6cd]/30 bg-white p-6">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#32B372]/10 text-[#32B372]">
                      <MaterialIcon name={item.icon} className="text-[20px]" />
                    </div>
                    <h3 className={t.h3Card}>{item.title}</h3>
                    <p className="mt-2 font-body text-sm leading-relaxed text-[#44474d]">{item.text}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:col-span-7">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                <Image src={designImages.vivir.residential} alt="" fill sizes="40vw" className="object-cover" unoptimized />
              </div>
              <div className="relative mt-10 aspect-[3/4] overflow-hidden rounded-xl">
                <Image src={designImages.vivir.banking} alt="" fill sizes="40vw" className="object-cover" unoptimized />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="educacion" className={cn("bg-white", layout.section)}>
        <div className={layout.container}>
          <p className={t.eyebrow}>{c.eduEyebrow}</p>
          <h2 className={cn("mt-3", t.h2)}>{c.eduTitle}</h2>
          <div className={cn("mt-4", t.sectionRule)} />
          <p className={cn("mt-6 max-w-2xl", t.lead)}>{c.eduLead}</p>
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {c.edu.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-[#c5c6cd]/30 bg-[#f8f9fa] p-8"
              >
                <p className="font-display text-5xl font-extrabold text-[#32B372]">{item.value}</p>
                <h3 className={cn("mt-4", t.h3Card)}>{item.title}</h3>
                <ul className="mt-5 space-y-2">
                  {item.items.map((line) => (
                    <li key={line} className="flex items-start gap-2 font-body text-sm text-[#44474d]">
                      <MaterialIcon name="check_circle" className="mt-0.5 text-[16px] text-[#32B372]" />
                      {line}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 h-1 w-16 bg-[#32B372]" aria-hidden />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="salud" className={cn("bg-[#f3f4f5]", layout.section)}>
        <div className={layout.container}>
          <div className="grid overflow-hidden rounded-xl lg:grid-cols-2">
            <div className="relative min-h-[320px]">
              <Image src={designImages.vivir.healthcare} alt="" fill sizes="50vw" className="object-cover" />
            </div>
            <div className="bg-white p-8 md:p-12">
              <p className={t.eyebrow}>{c.healthEyebrow}</p>
              <h2 className={cn("mt-3", t.h2)}>{c.healthTitle}</h2>
              <div className={cn("mt-4", t.sectionRule)} />
              <p className={cn("mt-6", t.lead)}>{c.healthText}</p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {c.healthStats.map((stat) => (
                  <div key={stat.label}>
                    <p className={t.metricValue}>{stat.value}</p>
                    <p className={cn("mt-1", t.metricLabel)}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="cultura" className={cn("bg-white", layout.section)}>
        <div className={layout.container}>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className={t.eyebrow}>{c.cultureEyebrow}</p>
              <h2 className={cn("mt-3", t.h2)}>{c.cultureTitle}</h2>
              <div className={cn("mt-4", t.sectionRule)} />
              <p className={cn("mt-6", t.lead)}>{c.cultureLead}</p>
              <div className="mt-8 space-y-6">
                {c.cultureGroups.map((group) => (
                  <div key={group.title}>
                    <h3 className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-[#32B372]">
                      {group.title}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {group.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#f3f4f5] px-3 py-1.5 font-body text-sm text-cni-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-8">
              <div className="group relative overflow-hidden rounded-xl md:row-span-2">
                <Image
                  src={designImages.vivir.museum}
                  alt={c.minTitle}
                  width={600}
                  height={750}
                  className="h-full min-h-[280px] w-full object-cover transition duration-700 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#000a1e]/90 to-transparent p-6">
                  <p className="font-display text-lg font-extrabold text-white">{c.minTitle}</p>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-xl">
                <Image
                  src={designImages.vivir.nature}
                  alt={c.natureTitle}
                  width={600}
                  height={350}
                  className="aspect-video w-full object-cover transition duration-700 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#000a1e]/90 to-transparent p-5">
                  <p className="font-display text-base font-extrabold text-white">{c.natureTitle}</p>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-xl">
                <Image
                  src={designImages.vivir.mall}
                  alt={c.mallTitle}
                  width={600}
                  height={350}
                  className="aspect-video w-full object-cover transition duration-700 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#000a1e]/90 to-transparent p-5">
                  <p className="font-display text-base font-extrabold text-white">{c.mallTitle}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="zonas" className={cn("bg-[#f3f4f5]", layout.section)}>
        <div className={layout.container}>
          <p className={t.eyebrow}>{c.zonesEyebrow}</p>
          <h2 className={cn("mt-3", t.h2)}>{c.zonesTitle}</h2>
          <div className={cn("mt-4", t.sectionRule)} />
          <p className={cn("mt-6 max-w-2xl", t.lead)}>{c.zonesLead}</p>
          <div className="mt-10 divide-y divide-cni-primary/10 overflow-hidden rounded-2xl border border-cni-primary/10 bg-white">
            {c.zones.map((line, index) => (
              <div key={line} className="grid grid-cols-1 gap-3 px-6 py-5 md:grid-cols-12 md:items-center md:px-8">
                <span className="font-headline text-[11px] font-bold tracking-[0.18em] text-[#32B372] md:col-span-1">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="font-body text-sm leading-relaxed text-[#44474d] md:col-span-11">{line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#000a1e] py-24 text-white">
        <div className="site-footer-mesh pointer-events-none absolute inset-0 opacity-[0.16]" aria-hidden />
        <div className={cn("relative z-10", layout.container)}>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <p className={t.eyebrowOnDark}>{c.ctaEyebrow}</p>
              <h2 className={cn("mt-3 text-white", t.h2OnDark)}>
                {c.ctaTitle1} <span className="text-[#32B372]">{c.ctaTitle2}</span>
              </h2>
              <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-white/80">{c.ctaDesc}</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href={L("/contacto")}
                  className="rounded bg-[#32B372] px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#000a1e]"
                >
                  {c.ctaPrimary}
                </Link>
                <Link
                  href={L("/portafolio")}
                  className="rounded border border-white px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#000a1e]"
                >
                  {c.ctaSecondary}
                </Link>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <MaterialIcon name="verified_user" className="text-5xl text-[#32B372]" />
              <p className="mt-4 font-display text-xl font-extrabold text-white">
                {locale === "es" ? "Asesoría sin costo" : "No-cost advisory"}
              </p>
              <p className="mt-2 font-body text-sm leading-relaxed text-white/70">
                {locale === "es"
                  ? "El CNI acompaña la evaluación, la instalación y el aftercare. No sustituye la decisión de inversión."
                  : "CNI supports evaluation, setup and aftercare. It does not replace the investment decision."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

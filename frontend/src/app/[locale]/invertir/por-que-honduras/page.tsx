import { notFound } from "next/navigation";
import Image from "next/image";
import { isLocale, type Locale } from "@/src/i18n/config";
import { designImages } from "@/src/lib/designAssets";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { GcbiBusinessEaseChart } from "@/src/components/cni/GcbiBusinessEaseChart";
import { InvestorRouteSection } from "@/src/components/cni/InvestorRouteSection";
import { PageHero } from "@/src/components/cni/PageHero";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["invertir-por-que-honduras"]);

const copy = {
  es: {
    title: "¿Por qué invertir en Honduras?",
    description:
      "El centro logístico y estratégico de las Américas. Una plataforma diseñada para el crecimiento de capital institucional en Centroamérica.",
    metrics: [
      {
        value: "#1",
        label: "Exportación de arneses a EE.UU.",
        detail: "USD 4,212.7 M en manufactura (nov. 2024)",
      },
      {
        value: "78.6%",
        label: "Movimiento portuario nacional",
        detail: "Puerto Cortés · 12,548 TM en 2024",
      },
      {
        value: "#1",
        label: "Dominio del inglés en CA",
        detail: "Índice EF EPI 2024 · 824 centros bilingües",
      },
    ],
    growthTitle: "Invierta en el país de mayor crecimiento en Centroamérica",
    growthLead:
      "Honduras registró inversiones para un total de 1.729 millones de dólares en 2023, ocho veces más que el año anterior,",
    growthBody:
      "con lo que se convirtió en el principal destino de estos anuncios en Centroamérica.",
    growthSource: "Fuente: CEPAL",
    infraSectionTitle: "Infraestructura que impulsa tu negocio",
    infra: [
      {
        icon: "flight",
        title: "Conectividad aérea",
        highlight: "4",
        highlightLabel: "Aeropuertos internacionales",
        bullets: [
          "Palmerola (Comayagua): hub internacional del centro del país",
          "Ramón Villeda Morales (SPS): mayor conectividad con EE.UU., México y Centroamérica",
          "Golosón (La Ceiba): acceso al litoral atlántico",
          "Juan Manuel Gálvez (Roatán): enlace turístico y comercial del Caribe",
        ],
      },
      {
        icon: "anchor",
        title: "Puertos estratégicos",
        highlight: "8",
        highlightLabel: "Instalaciones portuarias (6 con conexión internacional)",
        bullets: [
          "1 millón TEUs de capacidad anual",
          "Certificaciones internacionales",
          "Aduana integrada con EE.UU.",
        ],
      },
      {
        icon: "domain",
        title: "Parques industriales",
        highlight: "220+",
        highlightLabel: "Empresas operando en 43 parques industriales (ZOLI)",
        bullets: [] as string[],
      },
    ],
    humanCapitalTitle: "Capital humano",
    humanCapitalIntro: "Una fuerza laboral joven, calificada y competitiva.",
    humanCapital: [
      {
        icon: "groups",
        title: "Demografía dinámica",
        bullets: [
          "9.9 M de habitantes, 31 años de promedio",
          "71% en edad laboral",
          "56% económicamente activa de la PET",
          "2010 – 2045: duración del bono demográfico",
        ],
      },
      {
        icon: "school",
        title: "Talento humano",
        bullets: [
          "+101,400 graduados universitarios",
          "899,000 egresados en educación extracurricular",
          "21 instituciones de educación superior",
        ],
      },
      {
        icon: "translate",
        title: "Ventaja lingüística",
        bullets: [
          "#1 en dominio del inglés en Centroamérica",
          "#3 en América Latina",
          "Fuerza laboral bilingüe en crecimiento",
        ],
      },
    ],
    businessEaseTitle: "Facilidad para hacer negocios",
    businessEaseDescription:
      "Honduras es el país más confiable para hacer negocios en Centroamérica según el índice de Complejidad Corporativa (GCBI) 2025, publicado en el 12.º informe anual de TMF Group.",
    businessEaseSource: "Elaboración propia con datos de TMF Group, 2025.",
    routeTitlePrefix: "",
    routeTitleHighlight: "Ruta del Inversionista",
    routeEyebrow: "Proceso estructurado",
    routeDescription:
      "Un enfoque metodológico de 5 fases diseñado para asegurar el éxito y la eficiencia operativa de su inversión en territorio hondureño.",
    routeSteps: [
      {
        n: 1,
        label: "Punto de Partida",
        icon: "place",
        color: "#29AB85",
        description:
          "Definición de objetivos, alcance del proyecto y análisis preliminar de viabilidad en el contexto hondureño.",
      },
      {
        n: 2,
        label: "Kick Off",
        icon: "groups",
        color: "#0E7A7C",
        description:
          "Reunión inicial de coordinación institucional. Alineación de actores clave y establecimiento del cronograma de trabajo.",
      },
      {
        n: 3,
        label: "Pitch de Inversiones",
        icon: "description",
        color: "#1E88A8",
        description:
          "Presentación formal de oportunidades estratégicas por sector. Análisis profundo de incentivos fiscales y beneficios aplicables.",
      },
      {
        n: 4,
        label: "Instalación de Inversión",
        icon: "work",
        color: "#24436B",
        description:
          "Acompañamiento especializado en procesos legales, obtención de permisos y establecimiento operativo de la empresa.",
      },
      {
        n: 5,
        label: "Aftercare",
        icon: "volunteer_activism",
        color: "#252A58",
        description:
          "Seguimiento continuo, resolución de fricciones operativas y apoyo estratégico post-establecimiento para fomentar la expansión.",
      },
    ],
  },
  en: {
    title: "Why invest in Honduras?",
    description:
      "The strategic logistics hub of the Americas. A platform designed for institutional capital growth in Central America.",
    metrics: [
      {
        value: "#1",
        label: "Wire harness exports to the U.S.",
        detail: "USD 4,212.7 M in manufacturing (Nov 2024)",
      },
      {
        value: "78.6%",
        label: "National port throughput",
        detail: "Puerto Cortés · 12,548 TM in 2024",
      },
      {
        value: "#1",
        label: "English proficiency in CA",
        detail: "EF EPI Index 2024 · 824 bilingual centers",
      },
    ],
    growthTitle: "Invest in Central America's fastest-growing country",
    growthLead:
      "Honduras recorded USD 1.729 billion in new investment announcements in 2023, eight times more than the previous year,",
    growthBody:
      "making it the leading destination for these announcements in Central America.",
    growthSource: "Source: ECLAC (CEPAL)",
    infraSectionTitle: "Infrastructure that powers your business",
    infra: [
      {
        icon: "flight",
        title: "Air connectivity",
        highlight: "4",
        highlightLabel: "International airports",
        bullets: [
          "Palmerola (Comayagua): international hub for the central region",
          "Ramón Villeda Morales (SPS): top connectivity to the U.S., Mexico, and Central America",
          "Golosón (La Ceiba): access to the Atlantic coast",
          "Juan Manuel Gálvez (Roatán): tourism and trade gateway to the Caribbean",
        ],
      },
      {
        icon: "anchor",
        title: "Strategic ports",
        highlight: "8",
        highlightLabel: "Port facilities (6 with international connections)",
        bullets: [
          "1 million TEUs of annual capacity",
          "International certifications",
          "Integrated customs with the U.S.",
        ],
      },
      {
        icon: "domain",
        title: "Industrial parks",
        highlight: "220+",
        highlightLabel: "Companies operating in 43 industrial parks (ZOLI)",
        bullets: [] as string[],
      },
    ],
    humanCapitalTitle: "Human capital",
    humanCapitalIntro: "A young, skilled, and competitive workforce.",
    humanCapital: [
      {
        icon: "groups",
        title: "Dynamic demographics",
        bullets: [
          "9.9 M inhabitants, 31-year average age",
          "71% of working age",
          "56% economically active within the working-age population",
          "2010 – 2045: demographic dividend window",
        ],
      },
      {
        icon: "school",
        title: "Human talent",
        bullets: [
          "+101,400 university graduates",
          "899,000 graduates from extracurricular education",
          "21 higher-education institutions",
        ],
      },
      {
        icon: "translate",
        title: "Linguistic advantage",
        bullets: [
          "#1 in English proficiency in Central America",
          "#3 in Latin America",
          "Growing bilingual workforce",
        ],
      },
    ],
    businessEaseTitle: "Ease of doing business",
    businessEaseDescription:
      "Honduras is the most reliable country for doing business in Central America according to the Global Complexity Business Index (GCBI) 2025, published in TMF Group's 12th annual report.",
    businessEaseSource: "Own elaboration with data from TMF Group, 2025.",
    routeTitlePrefix: "",
    routeTitleHighlight: "Investor Journey",
    routeEyebrow: "Structured process",
    routeDescription:
      "A five-phase methodology designed to ensure the success and operational efficiency of your investment in Honduran territory.",
    routeSteps: [
      {
        n: 1,
        label: "Starting Point",
        icon: "place",
        color: "#29AB85",
        description:
          "Definition of objectives, project scope, and preliminary feasibility analysis in the Honduran context.",
      },
      {
        n: 2,
        label: "Kick Off",
        icon: "groups",
        color: "#0E7A7C",
        description:
          "Initial institutional coordination meeting. Alignment of key stakeholders and work schedule.",
      },
      {
        n: 3,
        label: "Investment Pitch",
        icon: "description",
        color: "#1E88A8",
        description:
          "Formal presentation of strategic opportunities by sector. In-depth analysis of applicable tax incentives and benefits.",
      },
      {
        n: 4,
        label: "Investment Installation",
        icon: "work",
        color: "#24436B",
        description:
          "Specialized support in legal processes, obtaining permits, and operational establishment of the company.",
      },
      {
        n: 5,
        label: "Aftercare",
        icon: "volunteer_activism",
        color: "#252A58",
        description:
          "Continuous monitoring, resolution of operational friction, and post-establishment strategic support to foster expansion.",
      },
    ],
  },
} as const;

export default async function PorQueHondurasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = copy[locale];

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9ff]">
      <PageHero
        title={
          locale === "es" ? (
            <>
              <span className="text-[#29AB85]">¿Por qué invertir en</span>{" "}
              <span className="text-white">Honduras</span>?
            </>
          ) : (
            <>
              <span className="text-[#29AB85]">Why invest in</span>{" "}
              <span className="text-white">Honduras</span>?
            </>
          )
        }
        description={c.description}
        imageSrc={designImages.porQue.hero}
        imageAlt={locale === "es" ? "Costa de Honduras" : "Honduras coastline"}
        heightClass="min-h-screen"
        imageClassName="absolute inset-0 object-cover opacity-[0.42]"
        overlayClassName="bg-gradient-to-r from-cni-primary/70 via-cni-primary/35 to-transparent"
        patternClassName="site-footer-mesh opacity-[0.16]"
      />

      <section className="relative z-20 -mt-16">
        <div className={cn(layout.container)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {c.metrics.map((m) => (
              <div key={m.label} className="rounded-xl bg-white p-8 shadow-xl">
                <div className={cn("mb-2", t.metricValue)}>{m.value}</div>
                <div className={t.metricLabel}>{m.label}</div>
                <p className={cn("mt-3", t.bodySm)}>{m.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={cn("bg-white", layout.section)}>
        <div className={cn(layout.containerNarrow, "text-center")}>
          <h2 className={t.h2}>{c.growthTitle}</h2>
          <div className={cn("mx-auto mt-4", t.sectionRule)} />
          <p className={cn("mt-8", t.lead)}>
            {c.growthLead}{" "}
            <span className="font-semibold text-cni-primary">{c.growthBody}</span>
          </p>
          <p className={cn("mt-6", t.caption)}>{c.growthSource}</p>
        </div>
      </section>

      <section className={cn("bg-[#eff4ff]", layout.section)}>
        <div className={layout.container}>
          <div className="mb-12 max-w-2xl">
            <h2 className={t.h2}>{c.infraSectionTitle}</h2>
            <div className={cn("mt-4", t.sectionRule)} />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-lg md:col-span-2">
              <div className="group relative aspect-[21/9] min-h-[200px] overflow-hidden">
                <Image
                  src={designImages.porQue.port}
                  alt={locale === "es" ? "Puertos estratégicos de Honduras" : "Strategic ports of Honduras"}
                  fill
                  sizes="(min-width:768px) 66vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#252A58] text-[#29AB85]">
                    <MaterialIcon name="anchor" className="text-2xl" />
                  </div>
                  <h3 className={t.h3}>{c.infra[1].title}</h3>
                </div>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className={cn(t.metricValue, "text-[#29AB85]")}>{c.infra[1].highlight}</span>
                  <span className={cn(t.bodySm, "font-semibold text-cni-on-surface-variant")}>{c.infra[1].highlightLabel}</span>
                </div>
                <ul className="mt-6 space-y-3 border-t border-[#e5eeff] pt-6">
                  {c.infra[1].bullets.map((bullet) => (
                    <li key={bullet} className={cn("flex items-start gap-3", t.bodySm)}>
                      <MaterialIcon name="check_circle" filled className="mt-0.5 shrink-0 text-[#35A963]" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-xl bg-[#252A58] p-8 text-white shadow-lg">
              <MaterialIcon name="domain" className="mb-6 text-4xl text-[#29AB85]" />
              <h3 className={cn("mb-4", t.h3Card, "text-white")}>{c.infra[2].title}</h3>
              <div className={cn(t.metricValue, "text-[#35A963]")}>{c.infra[2].highlight}</div>
              <p className={cn("mt-3", t.bodySm, "text-[#b6c2d3]")}>{c.infra[2].highlightLabel}</p>
              <div className="mt-8 rounded-lg bg-[#24436B]/50 p-4">
                <div className="text-lg font-bold text-[#35A963]">ZOLI</div>
                <div className="text-xs uppercase tracking-widest opacity-70">
                  {locale === "es" ? "Régimen de Zona Libre" : "Free Zone Regime"}
                </div>
              </div>
            </div>

            <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-lg md:col-span-3 md:flex-row">
              <div className="flex flex-1 flex-col p-8 md:py-10">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#252A58] text-[#29AB85]">
                    <MaterialIcon name="flight" className="text-2xl" />
                  </div>
                  <h3 className={t.h3}>{c.infra[0].title}</h3>
                </div>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className={cn(t.metricValue, "text-[#29AB85]")}>{c.infra[0].highlight}</span>
                  <span className={cn(t.bodySm, "font-semibold text-cni-on-surface-variant")}>{c.infra[0].highlightLabel}</span>
                </div>
                <ul className="mt-6 grid gap-3 border-t border-[#e5eeff] pt-6 sm:grid-cols-2">
                  {c.infra[0].bullets.map((bullet) => (
                    <li key={bullet} className={cn("flex items-start gap-3", t.bodySm)}>
                      <MaterialIcon name="check_circle" filled className="mt-0.5 shrink-0 text-[#35A963]" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="group relative min-h-[220px] w-full shrink-0 overflow-hidden md:min-h-0 md:w-[38%] lg:w-[34%]">
                <Image
                  src={designImages.porQue.map}
                  alt={locale === "es" ? "Conectividad aérea en Honduras" : "Air connectivity in Honduras"}
                  fill
                  sizes="(min-width:768px) 38vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>

            <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-lg md:col-span-3 md:flex-row">
              <div className="flex flex-1 flex-col justify-center p-8 md:py-10">
                <p className={t.eyebrow}>
                  {locale === "es" ? "Red logística integrada" : "Integrated logistics network"}
                </p>
                <p className={cn("mt-3 max-w-2xl", t.lead)}>
                  {locale === "es"
                    ? "Aeropuertos, puertos certificados y parques industriales conectados para mover mercancías con eficiencia regional."
                    : "Airports, certified ports, and industrial parks connected to move goods with regional efficiency."}
                </p>
              </div>
              <div className="group relative min-h-[220px] w-full shrink-0 overflow-hidden md:min-h-0 md:w-[38%] lg:w-[34%]">
                <Image
                  src={designImages.porQue.road}
                  alt={locale === "es" ? "Corredor logístico hondureño" : "Honduran logistics corridor"}
                  fill
                  sizes="(min-width:768px) 38vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={layout.section}>
        <div className={layout.container}>
          <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
            <div className="relative lg:sticky lg:top-32">
              <div className="absolute -left-4 -top-4 h-32 w-32 rounded-full bg-[#8DC046]/30 blur-3xl" />
              <div className="relative overflow-hidden rounded-xl shadow-2xl">
                <Image
                  src={designImages.porQue.talent}
                  alt={locale === "es" ? "Capital humano en Honduras" : "Human capital in Honduras"}
                  width={720}
                  height={540}
                  className="relative z-10 w-full object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#252A58]/50 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-4 z-20 rounded-lg border border-[#e5eeff] bg-white p-5 shadow-xl md:-right-6">
                <div className={t.metricValue}>#1</div>
                <div className={t.metricLabel}>{locale === "es" ? "Inglés en CA" : "English in CA"}</div>
              </div>
              <div className="absolute -left-4 top-8 z-20 hidden rounded-lg border border-[#e5eeff] bg-white p-5 shadow-xl md:block">
                <div className={t.metricValue}>31</div>
                <div className={t.metricLabel}>{locale === "es" ? "Años promedio" : "Average age"}</div>
              </div>
            </div>

            <div>
              <h2 className={t.h2}>{c.humanCapitalTitle}</h2>
              <div className={cn("mt-4", t.sectionRule)} />
              <p className={cn("mt-6", t.lead)}>{c.humanCapitalIntro}</p>

              <div className="mt-10 space-y-6">
                {c.humanCapital.map((block) => (
                  <article
                    key={block.title}
                    className="overflow-hidden rounded-xl border border-[#252A58]/10 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="flex shrink-0 items-center justify-center bg-[#252A58] px-6 py-5 sm:w-28 sm:flex-col sm:py-8">
                        <MaterialIcon name={block.icon} className="text-3xl text-[#29AB85]" />
                      </div>
                      <div className="p-6 sm:p-7">
                        <h3 className={t.h3Card}>{block.title}</h3>
                        <ul className="mt-4 space-y-2.5">
                          {block.bullets.map((bullet) => (
                            <li key={bullet} className={cn("flex items-start gap-3", t.bodySm)}>
                              <MaterialIcon name="check_circle" filled className="mt-0.5 shrink-0 text-[#35A963]" />
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={cn("relative overflow-hidden bg-[#252A58]", layout.section)}>
        <div className="site-footer-mesh pointer-events-none absolute inset-0 opacity-[0.22]" aria-hidden />

        <div className={cn(layout.container, "relative z-10 max-w-5xl")}>
          <header className="text-center md:text-left">
            <p className={t.eyebrowOnDark}>GCBI Index 2025 · TMF Group</p>
            <h2 className={cn("mt-3", t.h2OnDark)}>{c.businessEaseTitle}</h2>
            <p className={cn("mt-4 text-white/75", t.bodySm)}>{c.businessEaseDescription}</p>
          </header>

          <div className="mt-6">
            <GcbiBusinessEaseChart locale={locale} />
          </div>

          <p className={cn("mt-4 text-center md:text-left", t.captionOnDark)}>
            {c.businessEaseSource}
          </p>
        </div>
      </section>

      <InvestorRouteSection
        eyebrow={c.routeEyebrow}
        title={c.routeTitleHighlight}
        description={c.routeDescription}
        steps={c.routeSteps}
      />
    </div>
  );
}

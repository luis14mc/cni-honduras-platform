import { whyHondurasCopy as copy } from "@/src/i18n/copy/whyHonduras";
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

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/src/components/cni/PageHero";
import { PAGE_HEROES } from "@/src/lib/pageHeroes";
import { Section, SectionHeader } from "@/src/components/cni/Section";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { crecerPageCopy } from "@/src/i18n/copy/crecerPage";
import { withLocale } from "@/src/i18n/path";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { getOpportunities } from "@/src/lib/strapi/editorial";
import type { InvestmentOpportunity } from "@/src/types/investment";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["crecer-oportunidades"]);

const copy = {
  es: {
    listEyebrow: "Portafolio",
    listTitle: "Oportunidades de inversión",
    listDescription:
      "Una selección de oportunidades priorizadas. Para información detallada, contacte al equipo del CNI.",
    empty: "No hay oportunidades publicadas en este momento.",
    error: "No se pudieron cargar las oportunidades. Intente de nuevo más tarde.",
    cta: "Ver oportunidad",
  },
  en: {
    listEyebrow: "Portfolio",
    listTitle: "Investment opportunities",
    listDescription:
      "A selection of priority opportunities. For detailed information, contact the CNI team.",
    empty: "There are no published opportunities at this time.",
    error: "Opportunities could not be loaded. Please try again later.",
    cta: "View opportunity",
  },
} as const;

function brief(opp: InvestmentOpportunity): string {
  return (opp.summary || "").trim();
}

function cardMetrics(opp: InvestmentOpportunity) {
  return (opp.metrics ?? []).slice(0, 2);
}

export default async function OportunidadesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = crecerPageCopy[locale];
  const t = copy[locale];
  const L = (path: string) => withLocale(locale, path);

  let opportunities: InvestmentOpportunity[] = [];
  let loadError = false;
  try {
    opportunities = await getOpportunities(locale);
  } catch {
    loadError = true;
  }

  return (
    <div className="flex flex-1 flex-col bg-[#f8f9ff]">
      <div className="-mt-28">
        <PageHero
          eyebrow={c.heroEyebrow}
          title={
            <>
              {c.heroTitleBefore} <span className="text-[#35A963]">{c.heroTitleAccent}</span>
            </>
          }
          description={c.heroDescription}
          imageSrc={PAGE_HEROES.oportunidades.image}
          imageAlt={c.heroImageAlt}
          heightClass="min-h-[560px] md:min-h-[620px]"
        >
          <div className="flex flex-wrap gap-4">
            <Link
              href="#portafolio"
              className="inline-flex items-center gap-2 rounded-md bg-[#35A963] px-8 py-4 text-xs font-bold uppercase tracking-widest text-[#252A58] transition hover:brightness-95"
            >
              {c.ctaPortfolio}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={L("/contacto")}
              className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md transition hover:bg-white/20"
            >
              {c.advisoryCta}
            </Link>
          </div>
        </PageHero>
      </div>

      <Section id="portafolio" tone="surface">
        <SectionHeader eyebrow={t.listEyebrow} title={t.listTitle} description={t.listDescription} />

        {loadError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {t.error}
          </p>
        ) : opportunities.length === 0 ? (
          <p className="rounded-lg border border-[#334E88]/15 bg-white px-4 py-8 text-center text-sm text-[#0E7A7C]">
            {t.empty}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {opportunities.map((opp) => {
              const metrics = cardMetrics(opp);
              const text = brief(opp);
              return (
                <article
                  key={opp.id}
                  className="flex h-full flex-col border border-[#dce9ff]/30 bg-white p-6 transition hover:shadow-lg hover:shadow-[#252A58]/5"
                >
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                    {opp.sector?.name ? (
                      <span className="bg-[#e5eeff] px-3 py-1 text-[#294f83]">{opp.sector.name}</span>
                    ) : null}
                    {opp.code ? (
                      <span className="font-mono text-[#0E7A7C]">{opp.code}</span>
                    ) : null}
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-[#252A58]">{opp.title}</h3>
                  {text ? (
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-[#0E7A7C] line-clamp-3">
                      {text}
                    </p>
                  ) : null}
                  {metrics.length > 0 ? (
                    <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {metrics.map((m) => (
                        <div key={m.id} className="border-t border-[#dce9ff]/40 pt-3">
                          <dd className="text-sm font-semibold text-[#252A58]">{m.value || "—"}</dd>
                          <dt className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[#b6c2d3]">
                            {m.label}
                          </dt>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                  <div className="mt-6">
                    <Link
                      href={L(`/crecer/oportunidades/${opp.slug}`)}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#252A58] underline-offset-4 hover:text-[#35A963] hover:underline"
                    >
                      {t.cta}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}

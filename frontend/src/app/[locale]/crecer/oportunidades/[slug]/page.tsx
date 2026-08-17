import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale, type Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import { PageHero } from "@/src/components/cni/PageHero";
import { PAGE_HEROES } from "@/src/lib/pageHeroes";
import { Section } from "@/src/components/cni/Section";
import { buildDetailMetadata } from "@/src/lib/seo";
import { getOpportunityBySlug } from "@/src/lib/strapi/editorial";
import { StrapiApiError } from "@/src/lib/strapi/client";
import type { InvestmentOpportunity } from "@/src/types/investment";

const copy = {
  es: {
    back: "Volver a oportunidades",
    code: "Código",
    sector: "Sector",
    description: "La oportunidad",
    value: "Propuesta de valor",
    metrics: "Datos clave",
    cta: "Contactar al equipo del CNI",
    ctaAlt: "Conocer más sobre esta oportunidad",
    ctaLead:
      "¿Está interesado en conocer más detalles sobre esta oportunidad de inversión? Nuestro equipo puede brindarle información adicional y acompañamiento.",
    heroEyebrow: "Oportunidades",
    heroTitle: "Oportunidad de inversión",
    heroDescription: "Información resumida para descubrir oportunidades priorizadas por el CNI.",
    loadError: "No pudimos cargar esta oportunidad. Intente de nuevo más tarde.",
  },
  en: {
    back: "Back to opportunities",
    code: "Code",
    sector: "Sector",
    description: "The opportunity",
    value: "Value proposition",
    metrics: "Key figures",
    cta: "Contact the CNI team",
    ctaAlt: "Learn more about this opportunity",
    ctaLead:
      "Interested in learning more about this investment opportunity? Our team can provide additional information and support.",
    heroEyebrow: "Opportunities",
    heroTitle: "Investment opportunity",
    heroDescription: "A short overview of priority opportunities promoted by CNI.",
    loadError: "We could not load this opportunity right now. Please try again later.",
  },
} as const;

function paragraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? (raw as Locale) : "es";
  try {
    const opp = await getOpportunityBySlug(locale, slug);
    return buildDetailMetadata({
      locale,
      slugPath: `/crecer/oportunidades/${slug}`,
      title: opp.title,
      description: opp.summary,
    });
  } catch {
    return {};
  }
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = copy[locale];
  const L = (path: string) => withLocale(locale, path);

  let opp: InvestmentOpportunity | null = null;
  let loadError = false;
  try {
    opp = await getOpportunityBySlug(locale, slug);
  } catch (error) {
    if (error instanceof StrapiApiError && error.status === 404) {
      notFound();
    }
    loadError = true;
  }

  if (loadError || !opp) {
    return (
      <div className="flex flex-1 flex-col bg-[#f8f9ff]">
        <Section tone="surface">
          <Link
            href={L("/crecer/oportunidades")}
            className="text-xs font-bold uppercase tracking-widest text-[#334E88] hover:text-[#35A963]"
          >
            ← {t.back}
          </Link>
          <div
            role="alert"
            className="mt-10 rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center text-sm text-red-800"
          >
            {t.loadError}
          </div>
        </Section>
      </div>
    );
  }

  const summary = (opp.summary || "").trim();
  const valueProp = (opp.value_proposition || "").trim();
  const metrics = (opp.metrics ?? []).slice(0, 4);
  const contactHref = L(`/contacto?opportunity=${encodeURIComponent(opp.slug)}`);

  return (
    <div className="flex flex-1 flex-col bg-[#f8f9ff]">
      <div className="-mt-28">
        <PageHero
          eyebrow={t.heroEyebrow}
          title={t.heroTitle}
          description={t.heroDescription}
          imageSrc={PAGE_HEROES.oportunidades.image}
          imageAlt={opp.title}
          heightClass="min-h-[420px] md:min-h-[480px]"
        />
      </div>

      <Section tone="surface">
        <Link
          href={L("/crecer/oportunidades")}
          className="text-xs font-bold uppercase tracking-widest text-[#334E88] hover:text-[#35A963]"
        >
          ← {t.back}
        </Link>

        <header className="mt-8 space-y-3 border-b border-[#dce9ff]/40 pb-8">
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-[#0E7A7C]">
            {opp.sector?.name ? <span>{opp.sector.name}</span> : null}
            {opp.code ? (
              <span className="font-mono">
                {t.code}: {opp.code}
              </span>
            ) : null}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#252A58] md:text-4xl">
            {opp.title}
          </h1>
        </header>

        {summary ? (
          <section className="mt-10 max-w-3xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#0E7A7C]">
              {t.description}
            </h2>
            {paragraphs(summary).map((p) => (
              <p key={p.slice(0, 40)} className="text-base leading-relaxed text-[#252A58]">
                {p}
              </p>
            ))}
          </section>
        ) : null}

        {metrics.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#0E7A7C]">{t.metrics}</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((m) => (
                <div key={m.id} className="border border-[#dce9ff]/40 bg-white p-5">
                  <p className="text-xl font-bold text-[#252A58]">{m.value || "—"}</p>
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-[#b6c2d3]">
                    {m.label}
                  </p>
                  {m.note ? <p className="mt-1 text-sm text-[#0E7A7C]">{m.note}</p> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {valueProp ? (
          <section className="mt-12 max-w-3xl space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#0E7A7C]">{t.value}</h2>
            <p className="text-base leading-relaxed text-[#252A58]">{valueProp}</p>
          </section>
        ) : null}

        <section className="mt-14 max-w-2xl space-y-5 border-t border-[#dce9ff]/40 pt-10">
          <p className="text-base leading-relaxed text-[#0E7A7C]">{t.ctaLead}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={contactHref}
              className="inline-flex items-center justify-center rounded-md bg-[#252A58] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#0E7A7C]"
            >
              {t.cta}
            </Link>
            <Link
              href={contactHref}
              className="inline-flex items-center justify-center rounded-md border border-[#334E88]/30 px-8 py-3 text-xs font-bold uppercase tracking-widest text-[#334E88] transition hover:bg-[#334E88]/5"
            >
              {t.ctaAlt}
            </Link>
          </div>
        </section>
      </Section>
    </div>
  );
}

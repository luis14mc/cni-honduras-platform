import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale, type Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import { PageHero } from "@/src/components/cni/PageHero";
import { PAGE_HEROES } from "@/src/lib/pageHeroes";
import { Section } from "@/src/components/cni/Section";
import { PortfolioImageLightbox } from "@/src/components/cni/PortfolioImageLightbox";
import { buildDetailMetadata } from "@/src/lib/seo";
import { getOpportunity } from "@/src/services/investment";
import type { InvestmentOpportunity, RegionRef } from "@/src/types/investment";
import { portfolioCatalogCopy } from "@/src/i18n/copy/portfolioCatalog";
import { formatPoloLabel, formatSubregionLabel, getSeedBySlug } from "@/src/lib/portfolioCatalog";

export const revalidate = 300;

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
    const opp = await getOpportunity(slug, { locale });
    return buildDetailMetadata({
      locale,
      slugPath: `/portafolio/oportunidades/${slug}`,
      enMirrorPath: `/en/portfolio/opportunities/${slug}`,
      title: opp.title,
      description: opp.summary,
      image: opp.cover_image_url,
    });
  } catch {
    const seed = getSeedBySlug("opportunity", slug, locale);
    if (seed) {
      return buildDetailMetadata({
        locale,
        slugPath: `/portafolio/oportunidades/${slug}`,
        enMirrorPath: `/en/portfolio/opportunities/${slug}`,
        title: seed.item.title,
        description: seed.record.description,
        image: seed.item.coverImageUrl,
      });
    }
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
  const catalog = portfolioCatalogCopy[locale];

  let opp: InvestmentOpportunity | null = null;
  try {
    opp = await getOpportunity(slug, { locale });
  } catch {
    // Cualquier fallo (404, 500, timeout, sin conexión) cae al seed.
  }

  // Fallback al JSON local si Django no trae la oportunidad.
  const seedFallback = !opp ? getSeedBySlug("opportunity", slug, locale) : null;

  if (!opp && !seedFallback) {
    return (
      <div className="flex flex-1 flex-col bg-[#f8f9ff]">
        <Section tone="surface">
          <Link
            href={L("/portafolio?tipo=oportunidades")}
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

  if (seedFallback && !opp) {
    const item = seedFallback.item;
    const record = seedFallback.record;
    const summary = (record.description || "").trim();
    const regionLabel = item.subregionLabel;
    const macroregionName = record.macroregion ? record.macroregion : null;
    const poloName = record.polos?.[0]
      ? record.polos[0].split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
      : null;
    const heroImage = item.coverImageUrl || PAGE_HEROES.oportunidades.image;
    const contactHref = L(`/contacto?ref=${encodeURIComponent(item.code || item.slug)}`);
    const phaseLabel = record.phase_detail ? `${record.phase} — ${record.phase_detail}` : record.phase;
    const facts: Array<[string, string]> = [
      item.code ? [t.code, item.code] : null,
      item.sectorName ? [t.sector, item.sectorName] : null,
      item.locationText ? [catalog.location, item.locationText] : null,
      regionLabel ? [catalog.region, regionLabel] : null,
      macroregionName ? [catalog.macroregion, macroregionName] : null,
      poloName ? [catalog.polo, poloName] : null,
      item.amountText ? [catalog.amount, `${item.amountText}${record.amount_notes?.[0] ? ` · ${record.amount_notes[0]}` : ""}`] : null,
      phaseLabel ? [catalog.phaseLabel, phaseLabel] : null,
      item.investmentType ? [catalog.investmentType, item.investmentType] : null,
    ].filter(Boolean) as Array<[string, string]>;

    return (
      <div className="flex flex-1 flex-col bg-[#f8f9ff]">
        <div className="-mt-28">
          <PageHero
            eyebrow={t.heroEyebrow}
            title={t.heroTitle}
            description={t.heroDescription}
            imageSrc={heroImage}
            imageAlt={item.title}
            heightClass="min-h-[420px] md:min-h-[480px]"
            imageClassName="absolute inset-0 object-cover object-top"
          />
        </div>

        <Section tone="surface">
          <Link
            href={L("/portafolio?tipo=oportunidades")}
            className="text-xs font-bold uppercase tracking-widest text-[#334E88] hover:text-[#35A963]"
          >
            ← {t.back}
          </Link>

          <header className="mt-8 space-y-3 border-b border-[#dce9ff]/40 pb-8">
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-[#0E7A7C]">
              {item.sectorName ? <span>{item.sectorName}</span> : null}
              {item.code ? (
                <span className="font-mono">
                  {t.code}: {item.code}
                </span>
              ) : null}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#252A58] md:text-4xl">
              {item.title}
            </h1>
            {item.amountText ? (
              <p className="text-2xl font-extrabold text-[#001a33]">
                {item.amountText}
                {record.amount_notes?.[0] ? (
                  <span className="ml-2 text-sm font-normal text-cni-primary/45">{record.amount_notes[0]}</span>
                ) : null}
              </p>
            ) : null}
          </header>

          {facts.length > 0 ? (
            <dl className="mt-10 divide-y divide-cni-primary/10 rounded-xl border border-cni-primary/10 bg-white">
              {facts.map(([label, value]) => (
                <div key={label} className="grid gap-1 px-5 py-4 sm:grid-cols-3">
                  <dt className="font-headline text-[11px] font-bold uppercase tracking-[0.14em] text-cni-primary/50">{label}</dt>
                  <dd className="font-body text-sm text-cni-primary sm:col-span-2">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

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

          <section className="mt-14 max-w-2xl space-y-5 border-t border-[#dce9ff]/40 pt-10">
            <p className="text-base leading-relaxed text-[#0E7A7C]">{t.ctaLead}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={contactHref}
                className="inline-flex items-center justify-center rounded-md bg-[#252A58] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#0E7A7C]"
              >
                {t.cta}
              </Link>
              {item.coverImageUrl ? (
                <PortfolioImageLightbox
                  src={item.coverImageUrl}
                  alt={item.title}
                  openLabel={catalog.viewFullCard}
                  closeLabel={catalog.closeLightbox}
                />
              ) : null}
              <Link
                href={L(`/portafolio/mapa?opportunity=${encodeURIComponent(item.slug)}`)}
                className="inline-flex items-center justify-center rounded-md border border-[#334E88]/30 px-8 py-3 text-xs font-bold uppercase tracking-widest text-[#334E88] transition hover:bg-[#334E88]/5"
              >
                {catalog.viewOnMapCta}
              </Link>
            </div>
          </section>
        </Section>
      </div>
    );
  }

  if (!opp) notFound();

  const summary = (opp.summary || "").trim();
  const valueProp = (opp.value_proposition || "").trim();
  const metrics = (opp.metrics ?? []).slice(0, 4);
  const contactHref = L(`/contacto?ref=${encodeURIComponent(opp.code || opp.slug)}`);
  const region = opp.region as RegionRef | null;
  const heroImage = opp.cover_image_url || PAGE_HEROES.oportunidades.image;
  const facts = [
    opp.code ? [t.code, opp.code] : null,
    opp.sector?.name ? [t.sector, opp.sector.name] : null,
    opp.location_text ? [catalog.location, opp.location_text] : null,
    formatSubregionLabel(region, locale) ? [catalog.region, formatSubregionLabel(region, locale)!] : null,
    region?.parent?.name ? [catalog.macroregion, region.parent.name] : null,
    formatPoloLabel(region) ? [catalog.polo, formatPoloLabel(region)!] : null,
    opp.amount_text ? [catalog.amount, `${opp.amount_text}${opp.amount_notes?.[0] ? ` · ${opp.amount_notes[0]}` : ""}`] : null,
    opp.phase ? [catalog.phaseLabel, `${opp.phase}${opp.phase_detail ? ` — ${opp.phase_detail}` : ""}`] : null,
    opp.investment_type ? [catalog.investmentType, opp.investment_type] : null,
  ].filter(Boolean) as Array<[string, string]>;

  return (
    <div className="flex flex-1 flex-col bg-[#f8f9ff]">
      <div className="-mt-28">
        <PageHero
          eyebrow={t.heroEyebrow}
          title={t.heroTitle}
          description={t.heroDescription}
          imageSrc={heroImage}
          imageAlt={opp.title}
          heightClass="min-h-[420px] md:min-h-[480px]"
          imageClassName={opp.cover_image_url ? "absolute inset-0 object-cover object-top" : undefined}
        />
      </div>

      <Section tone="surface">
        <Link
          href={L("/portafolio?tipo=oportunidades")}
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
          {opp.amount_text ? (
            <p className="text-2xl font-extrabold text-[#001a33]">
              {opp.amount_text}
              {opp.amount_notes?.[0] ? (
                <span className="ml-2 text-sm font-normal text-cni-primary/45">{opp.amount_notes[0]}</span>
              ) : null}
            </p>
          ) : null}
        </header>

        {facts.length > 0 ? (
          <dl className="mt-10 divide-y divide-cni-primary/10 rounded-xl border border-cni-primary/10 bg-white">
            {facts.map(([label, value]) => (
              <div key={label} className="grid gap-1 px-5 py-4 sm:grid-cols-3">
                <dt className="font-headline text-[11px] font-bold uppercase tracking-[0.14em] text-cni-primary/50">{label}</dt>
                <dd className="font-body text-sm text-cni-primary sm:col-span-2">{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

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
            {opp.cover_image_url ? (
              <PortfolioImageLightbox
                src={opp.cover_image_url}
                alt={opp.title}
                openLabel={catalog.viewFullCard}
                closeLabel={catalog.closeLightbox}
              />
            ) : null}
            <Link
              href={L(`/portafolio/mapa?opportunity=${encodeURIComponent(opp.slug)}`)}
              className="inline-flex items-center justify-center rounded-md border border-[#334E88]/30 px-8 py-3 text-xs font-bold uppercase tracking-widest text-[#334E88] transition hover:bg-[#334E88]/5"
            >
              {catalog.viewOnMapCta}
            </Link>
          </div>
        </section>
      </Section>
    </div>
  );
}

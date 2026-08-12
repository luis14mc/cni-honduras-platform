import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale, type Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import { PageHero } from "@/src/components/cni/PageHero";
import { PAGE_HEROES } from "@/src/lib/pageHeroes";
import { Section } from "@/src/components/cni/Section";
import { buildDetailMetadata } from "@/src/lib/seo";
import { getOpportunity } from "@/src/services/investment";
import type { InvestmentOpportunity } from "@/src/types/investment";

const copy = {
  es: {
    back: "Volver a oportunidades",
    code: "Código",
    sector: "Sector",
    description: "Descripción de la oportunidad",
    target: "Cliente / comprador objetivo",
    market: "Mercado / demanda",
    value: "Propuesta de valor",
    metrics: "Métricas clave",
    fundUses: "Uso de fondos / CAPEX",
    component: "Componente",
    amount: "Monto",
    note: "Nota",
    cta: "Contactar al CNI",
    heroEyebrow: "Oportunidades",
    heroTitle: "Ficha de inversión",
    heroDescription: "Información estructurada para evaluación de la oportunidad.",
  },
  en: {
    back: "Back to opportunities",
    code: "Code",
    sector: "Sector",
    description: "Opportunity description",
    target: "Target customer / buyer",
    market: "Market / demand",
    value: "Value proposition",
    metrics: "Key metrics",
    fundUses: "Use of funds / CAPEX",
    component: "Component",
    amount: "Amount",
    note: "Note",
    cta: "Contact the CNI",
    heroEyebrow: "Opportunities",
    heroTitle: "Investment profile",
    heroDescription: "Structured information for opportunity evaluation.",
  },
} as const;

function formatAmount(value: string | null | undefined, locale: Locale): string {
  if (value == null || value === "") return "—";
  const num = Number(value);
  if (Number.isFinite(num)) {
    return new Intl.NumberFormat(locale === "en" ? "en-US" : "es-HN", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 1,
    }).format(num);
  }
  return value;
}

function paragraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function RichBlock({ title, body }: { title: string; body: string }) {
  if (!body.trim()) return null;
  const parts = paragraphs(body);
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-widest text-[#0E7A7C]">{title}</h2>
      <div className="space-y-3 text-base leading-relaxed text-[#252A58]">
        {parts.map((p) => (
          <p key={p.slice(0, 48)} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
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
      slugPath: `/crecer/oportunidades/${slug}`,
      title: opp.title,
      description: opp.summary || opp.description,
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

  let opp: InvestmentOpportunity;
  try {
    opp = await getOpportunity(slug, { locale });
  } catch {
    notFound();
  }

  const description = opp.opportunity_description || opp.description || "";
  const metrics = opp.metrics ?? [];
  const fundUses = opp.fund_uses ?? [];

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
            {opp.code ? (
              <span className="font-mono">
                {t.code}: {opp.code}
              </span>
            ) : null}
            {opp.sector?.name ? (
              <span>
                {t.sector}: {opp.sector.name}
              </span>
            ) : null}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#252A58] md:text-4xl">
            {opp.title}
          </h1>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="space-y-10">
            <RichBlock title={t.description} body={description} />
            <RichBlock title={t.target} body={opp.target_customer || ""} />
          </div>
          <div className="space-y-10">
            <RichBlock title={t.market} body={opp.market_demand || ""} />
            <RichBlock title={t.value} body={opp.value_proposition || ""} />
          </div>
        </div>

        {metrics.length > 0 ? (
          <section className="mt-14">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#0E7A7C]">{t.metrics}</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {metrics.map((m) => (
                <div
                  key={m.id}
                  className="border border-[#dce9ff]/40 bg-white p-5"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[#b6c2d3]">
                    {m.label}
                  </p>
                  <p className="mt-2 text-xl font-bold text-[#252A58]">{m.value || "—"}</p>
                  {m.note ? <p className="mt-1 text-sm text-[#0E7A7C]">{m.note}</p> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {fundUses.length > 0 ? (
          <section className="mt-14">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#0E7A7C]">{t.fundUses}</h2>
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#dce9ff]/50 text-[11px] font-bold uppercase tracking-wide text-[#b6c2d3]">
                    <th className="px-3 py-3">{t.component}</th>
                    <th className="px-3 py-3">{t.amount}</th>
                    <th className="hidden px-3 py-3 md:table-cell">{t.note}</th>
                  </tr>
                </thead>
                <tbody>
                  {fundUses.map((row) => (
                    <tr key={row.id} className="border-b border-[#dce9ff]/30 bg-white">
                      <td className="px-3 py-3 font-semibold text-[#252A58]">{row.component}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-[#252A58]">
                        {formatAmount(row.amount, locale)}
                      </td>
                      <td className="hidden px-3 py-3 text-[#0E7A7C] md:table-cell">
                        {row.description || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="mt-4 space-y-3 md:hidden">
              {fundUses.map((row) => (
                <li key={`m-${row.id}`} className="border border-[#dce9ff]/40 bg-white p-4">
                  <p className="font-semibold text-[#252A58]">{row.component}</p>
                  <p className="mt-1 text-sm text-[#252A58]">{formatAmount(row.amount, locale)}</p>
                  {row.description ? (
                    <p className="mt-2 text-sm text-[#0E7A7C]">{row.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-14">
          <Link
            href={L("/contacto")}
            className="inline-flex items-center justify-center rounded-md bg-[#252A58] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#0E7A7C]"
          >
            {t.cta}
          </Link>
        </div>
      </Section>
    </div>
  );
}

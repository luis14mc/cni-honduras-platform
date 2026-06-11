import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { Section, SectionHeader } from "@/src/components/cni/Section";
import type { Locale } from "@/src/i18n/config";
import type { SectorCopy, SectorSlug } from "@/src/data/investmentSectors";
import { SectorIcon } from "@/src/components/cni/SectorIcon";
import { getSectorPageExtra } from "@/src/i18n/copy/sectorDetailPage";
import { invertirPageCopy } from "@/src/i18n/copy/invertirPage";
import { withLocale } from "@/src/i18n/path";
import type { InvestmentOpportunity } from "@/src/types/investment";

type Props = {
  locale: Locale;
  slug: SectorSlug;
  sector: SectorCopy;
  opportunities?: InvestmentOpportunity[];
};

export function SectorDetailView({ locale, slug, sector, opportunities = [] }: Props) {
  const x = getSectorPageExtra(slug, locale);
  const inv = invertirPageCopy[locale];
  const L = (path: string) => withLocale(locale, path);
  const hasOpportunities = opportunities.length > 0;

  const borderClass = (i: number, wide?: boolean) => {
    if (wide) return "border-l-4 border-[#3a5f94] md:col-span-2";
    if (i === 0) return "border-l-4 border-[#000a1e]";
    return "border-l-4 border-[#e9c176]";
  };

  return (
    <div className="flex flex-1 flex-col bg-[#f8f9fa]">
      <header className="relative -mt-28 flex min-h-[min(819px,100dvh)] flex-col justify-center overflow-hidden bg-[#000a1e] pb-16 pt-36 md:pb-24 md:pt-28">
        <div className="absolute inset-0">
          <Image
            src={sector.image}
            alt={sector.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#000a1e] via-[#000a1e]/80 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-6 md:px-10">
          <Link
            href={L("/invertir/sectores")}
            className="mb-8 inline-block text-xs font-bold uppercase tracking-widest text-[#e9c176] transition hover:text-white"
          >
            {x.backToSectors}
          </Link>
          <span className="mb-4 inline-flex items-center gap-3 rounded-full border border-[#e9c176]/35 bg-[#2e1f00]/40 px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#e9c176] backdrop-blur">
            <SectorIcon slug={slug} size={24} />
            {x.heroBadge}
          </span>
          <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            {x.heroTitleBefore}{" "}
            <span className="text-[#e9c176]">{x.heroTitleAccent}</span>
            {x.heroTitleAfter ? ` ${x.heroTitleAfter}` : ""}
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-light leading-relaxed text-white/85 md:text-xl">{sector.short}</p>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
            {x.stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border-l-4 border-[#e9c176] bg-[#000a1e]/40 p-6 backdrop-blur-md"
              >
                <p className="text-sm font-medium uppercase tracking-wider text-[#708ab5]">{s.label}</p>
                <p className="font-headline text-4xl font-extrabold text-white">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={L("/contacto")}
              className="inline-flex items-center gap-2 rounded-md bg-[#e9c176] px-8 py-4 text-xs font-bold uppercase tracking-widest text-[#191c1d] transition hover:brightness-95"
            >
              {inv.ctaAdvisor}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={L("/recursos")}
              className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/10 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white backdrop-blur transition hover:bg-white/20"
            >
              {inv.ctaGuide}
            </Link>
          </div>
        </div>
      </header>

      <Section tone="surface">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#000a1e] md:text-4xl">{x.valueTitle}</h2>
            <p className="mt-4 text-base leading-relaxed text-[#44474e]">{x.valueLead}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-8">
            {x.advantages.map((a, i) => (
              <article
                key={a.title}
                className={`rounded-xl bg-white p-8 tonal-depth-layering ${borderClass(i, a.wide)}`}
              >
                <h3 className="text-lg font-bold text-[#000a1e]">{a.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#44474e]">{a.text}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="low" className="border-y border-black/5">
        <SectionHeader eyebrow={x.analysisEyebrow} title={x.analysisTitle} description={x.analysisIntro} />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#e7e8e9] lg:col-span-5">
            <Image
              src={sector.image}
              alt={sector.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#000a1e]/70 to-transparent" />
          </div>
          <div className="lg:col-span-7">
            <p className="text-base leading-relaxed text-[#44474e]">{sector.fullText}</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {sector.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-center gap-3 rounded-lg border border-[#c4c6cf]/30 bg-white px-4 py-3 text-sm font-medium text-[#000a1e]"
                >
                  <Check className="h-4 w-4 shrink-0 text-[#3a5f94]" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {hasOpportunities && (
        <Section tone="white">
          <SectionHeader
            eyebrow={locale === "en" ? "Investment pipeline" : "Cartera de inversión"}
            title={locale === "en" ? "Related opportunities" : "Oportunidades relacionadas"}
            description={
              locale === "en"
                ? "Public opportunities currently associated with this strategic sector."
                : "Oportunidades públicas actualmente asociadas a este sector estratégico."
            }
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((opportunity) => (
              <article
                key={opportunity.slug}
                className="rounded-xl border border-[#c4c6cf]/30 bg-[#f8f9fa] p-7 tonal-depth-layering"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-[#3a5f94]">
                  {opportunity.status}
                </p>
                <h3 className="mt-3 text-lg font-bold text-[#000a1e]">{opportunity.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#44474e]">
                  {opportunity.summary || opportunity.description}
                </p>
                <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-black/10 pt-5 text-sm">
                  {opportunity.estimated_investment && (
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-widest text-[#708ab5]">
                        {locale === "en" ? "Investment" : "Inversión"}
                      </dt>
                      <dd className="mt-1 font-bold text-[#000a1e]">{opportunity.estimated_investment}</dd>
                    </div>
                  )}
                  {opportunity.estimated_jobs !== null && (
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-widest text-[#708ab5]">
                        {locale === "en" ? "Jobs" : "Empleos"}
                      </dt>
                      <dd className="mt-1 font-bold text-[#000a1e]">{opportunity.estimated_jobs}</dd>
                    </div>
                  )}
                </dl>
              </article>
            ))}
          </div>
        </Section>
      )}

      <section className="relative overflow-hidden bg-[#000a1e] py-20 text-white">
        <div className="absolute right-0 top-0 h-full w-1/2 -skew-x-12 translate-x-24 bg-[#002147] opacity-45" />
        <div className="relative z-10 mx-auto flex max-w-screen-2xl flex-col items-start justify-between gap-8 px-6 md:flex-row md:items-center md:px-10">
          <p className="max-w-xl text-lg text-white/75">{inv.ctaBody}</p>
          <Link
            href={L("/contacto")}
            className="inline-flex items-center gap-2 rounded-md bg-[#e9c176] px-10 py-4 text-xs font-bold uppercase tracking-widest text-[#191c1d] transition hover:brightness-95"
          >
            {inv.ctaAdvisory}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

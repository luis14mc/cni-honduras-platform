import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import type { Locale } from "@/src/i18n/config";
import { crecerPageCopy } from "@/src/i18n/copy/crecerPage";
import { withLocale } from "@/src/i18n/path";
import {
  formatSuccessStoryInvestment,
  formatSuccessStoryJobs,
  successStoryDetailHref,
} from "@/src/lib/cmsSuccessStories";
import { isSectorSlug } from "@/src/data/investmentSectors";
import { sectorPhotoHeaders } from "@/src/lib/sectorIcons";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";
import type { AsyncData } from "@/src/lib/asyncData";
import type { InvestmentOpportunity, SuccessStory } from "@/src/types/investment";

const HERO_IMAGE = "/images/hero/home/logistica.webp";
const PDI_HREF = "https://pdihonduras.gob.hn";
const PDI_LOGO = "/brand/pdi-logo.png";
const LEVER_ICONS = ["gavel", "account_balance", "handshake"] as const;
const SECTOR_ICONS: Record<string, string> = {
  agroindustria: "agriculture",
  manufactura: "precision_manufacturing",
  turismo: "beach_access",
  energia: "solar_power",
  infraestructura: "apartment",
  logistica: "local_shipping",
};

type Props = {
  locale: Locale;
  opportunities: AsyncData<InvestmentOpportunity[]>;
  stories: AsyncData<SuccessStory[]>;
};

function opportunityCover(item: InvestmentOpportunity): string {
  const slug = item.sector?.slug;
  if (slug && isSectorSlug(slug)) return sectorPhotoHeaders[slug];
  return HERO_IMAGE;
}

export function CrecerPageView({ locale, opportunities, stories }: Props) {
  const c = crecerPageCopy[locale];
  const L = (path: string) => withLocale(locale, path);
  const opportunityItems = opportunities.data.slice(0, 4);
  const storyItems = stories.data.slice(0, 3);
  const featured = opportunityItems[0];
  const secondary = opportunityItems[1];
  const compact = opportunityItems.slice(2, 4);

  return (
    <div className="al-crecer flex flex-1 flex-col bg-[#f8f9fa]">
      <header className="relative -mt-28 flex min-h-screen items-center overflow-hidden bg-[#000a1e] pt-32 pb-24 text-white">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMAGE}
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
            <h1 className="font-display text-[3.75rem] font-extrabold leading-[0.95] tracking-[-0.04em] text-white sm:text-7xl lg:text-[6.25rem] lg:leading-[0.9]">
              {c.heroTitleBefore} {c.heroTitleAccent}
            </h1>
            <p className="mt-6 max-w-2xl font-body text-lg leading-relaxed text-white/80">
              {c.heroDescription}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="#oportunidades"
                className="rounded bg-[#32B372] px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#000a1e]"
              >
                {c.ctaPortfolio}
              </Link>
              <Link
                href="#casos"
                className="rounded border border-white px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#000a1e]"
              >
                {c.ctaCases}
              </Link>
              <Link
                href="#aftercare"
                className="rounded border border-white px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#000a1e]"
              >
                {c.ctaAftercare}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section id="por-que" className={cn("bg-[#f3f4f5]", layout.section)}>
        <div className={layout.container}>
          <div className="mb-10 md:mb-12">
            <p className="mb-2 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-[#32B372]">
              01 · {c.leversEyebrow}
            </p>
            <h2 className={cn(t.h2)}>
              {c.leversTitle}{" "}
              <span className="text-[#32B372]">{c.leversTitleAccent}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {c.levers.map((lever, index) => (
              <article
                key={lever.title}
                className="group relative overflow-hidden rounded-xl border border-[#c5c6cd]/30 bg-white p-10 shadow-lg transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="mb-6 flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#32B372]/10 text-[#32B372]">
                    <MaterialIcon name={LEVER_ICONS[index] ?? "handshake"} className="text-[22px]" />
                  </span>
                  <span className="font-display text-5xl font-extrabold leading-none text-[#d9dadb] transition-colors group-hover:text-[#32B372]/20">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="font-display text-xl font-extrabold text-cni-primary">{lever.title}</h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-[#44474d]">{lever.text}</p>
                <div className="mt-6 h-1 w-16 bg-[#32B372]" aria-hidden />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="oportunidades" className={cn("bg-white", layout.section)}>
        <div className={layout.container}>
          <div className="mb-10 flex flex-col items-start justify-between gap-6 md:mb-12 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h2 className={t.h2}>{c.portfolioTitle}</h2>
              <p className={cn("mt-3", t.lead)}>{c.portfolioDescription}</p>
            </div>
            <Link
              href={L("/crecer/oportunidades")}
              className="inline-flex items-center gap-2 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-[#32B372] transition hover:text-cni-primary"
            >
              {c.portfolioAll}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          {opportunities.status === "error" ? (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-800">
              {c.portfolioError}
            </p>
          ) : opportunityItems.length === 0 ? (
            <p className="rounded-xl border border-dashed border-cni-primary/15 bg-[#f3f4f5] px-6 py-12 text-center text-sm text-[#44474d]">
              {c.portfolioEmpty}
            </p>
          ) : (
            <div className="grid auto-rows-[280px] grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
              {featured ? (
                <Link
                  href={L(`/crecer/oportunidades/${featured.slug}`)}
                  className="group relative overflow-hidden rounded-xl md:col-span-2 md:row-span-2"
                >
                  <Image
                    src={opportunityCover(featured)}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000a1e]/90 via-[#000a1e]/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-8">
                    {featured.sector?.name ? (
                      <span className="mb-3 inline-block rounded bg-[#32B372] px-3 py-1 font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                        {featured.sector.name}
                      </span>
                    ) : null}
                    <h3 className="font-display text-2xl font-extrabold text-white">{featured.title}</h3>
                    {featured.summary ? (
                      <p className="mt-2 line-clamp-2 font-body text-sm text-white/80">{featured.summary}</p>
                    ) : null}
                  </div>
                </Link>
              ) : null}

              {secondary ? (
                <Link
                  href={L(`/crecer/oportunidades/${secondary.slug}`)}
                  className="group relative overflow-hidden rounded-xl md:col-span-2"
                >
                  <Image
                    src={opportunityCover(secondary)}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000a1e]/90 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    {secondary.sector?.name ? (
                      <span className="mb-2 inline-block rounded bg-[#32B372]/80 px-3 py-1 font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                        {secondary.sector.name}
                      </span>
                    ) : null}
                    <h3 className="font-display text-xl font-extrabold text-white">{secondary.title}</h3>
                  </div>
                </Link>
              ) : null}

              {compact.map((item, index) => (
                <Link
                  key={item.slug}
                  href={L(`/crecer/oportunidades/${item.slug}`)}
                  className={cn(
                    "flex flex-col justify-between rounded-xl border p-6 transition",
                    index === 0
                      ? "border-white/10 bg-[#000a1e] text-white hover:bg-[#12162e]"
                      : "border-[#c5c6cd]/30 bg-[#f3f4f5] text-cni-primary hover:bg-[#e7e8e9]",
                  )}
                >
                  <MaterialIcon
                    name={SECTOR_ICONS[item.sector?.slug ?? ""] ?? "trending_up"}
                    className={cn("text-4xl", index === 0 ? "text-[#32B372]" : "text-cni-primary")}
                  />
                  <div>
                    <h3 className="mt-6 font-display text-lg font-extrabold">{item.title}</h3>
                    {item.summary ? (
                      <p
                        className={cn(
                          "mt-2 line-clamp-2 font-body text-sm",
                          index === 0 ? "text-white/70" : "text-[#44474d]",
                        )}
                      >
                        {item.summary}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="casos" className={cn("bg-[#f3f4f5]", layout.section)}>
        <div className={layout.container}>
          <header className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h2 className={t.h2}>{c.casesTitle}</h2>
              <p className={cn("mt-3", t.lead)}>{c.casesDescription}</p>
            </div>
            <Link
              href={L("/portafolio/casos")}
              className="inline-flex items-center gap-2 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-[#32B372] transition hover:text-cni-primary"
            >
              {c.casesAll}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </header>
          {stories.status === "error" ? (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-800">
              {c.casesError}
            </p>
          ) : storyItems.length === 0 ? (
            <p className="rounded-xl border border-dashed border-cni-primary/15 bg-white px-6 py-12 text-center text-sm text-[#44474d]">
              {c.casesEmpty}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {storyItems.map((story) => (
                <Link
                  key={story.slug}
                  href={successStoryDetailHref(locale, story.slug)}
                  className="flex h-full flex-col rounded-xl border border-[#c5c6cd]/30 bg-white p-8 shadow-sm transition hover:-translate-y-1"
                >
                  <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-[#32B372]">
                    {story.company_name || story.sector?.name || "CNI"}
                  </p>
                  <h3 className="mt-4 flex-1 font-display text-xl font-extrabold text-cni-primary">{story.title}</h3>
                  {story.summary ? (
                    <p className="mt-3 line-clamp-4 font-body text-sm text-[#44474d]">{story.summary}</p>
                  ) : null}
                  <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-[#c5c6cd]/40 pt-5">
                    {story.investment_amount &&
                    formatSuccessStoryInvestment(locale, story.investment_amount) ? (
                      <div>
                        <dt className="font-headline text-[9px] font-bold uppercase tracking-[0.18em] text-[#74777f]">
                          {locale === "es" ? "Inversión" : "Investment"}
                        </dt>
                        <dd className="mt-1 font-display text-sm font-extrabold text-cni-primary">
                          {formatSuccessStoryInvestment(locale, story.investment_amount)}
                        </dd>
                      </div>
                    ) : null}
                    {story.jobs_generated !== null &&
                    formatSuccessStoryJobs(locale, story.jobs_generated) ? (
                      <div>
                        <dt className="font-headline text-[9px] font-bold uppercase tracking-[0.18em] text-[#74777f]">
                          {locale === "es" ? "Empleos" : "Jobs"}
                        </dt>
                        <dd className="mt-1 font-display text-sm font-extrabold text-cni-primary">
                          {formatSuccessStoryJobs(locale, story.jobs_generated)}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="aftercare" className={cn("bg-white", layout.section)}>
        <div className={cn(layout.container, "max-w-3xl")}>
          <p className="font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-[#32B372]">
            {c.aftercareEyebrow}
          </p>
          <h2 className={cn("mt-3", t.h2)}>{c.aftercareTitle}</h2>
          <p className={cn("mt-4", t.lead)}>{c.aftercareBody}</p>
          <Link
            href={L("/crecer/acompanamiento")}
            className="mt-8 inline-flex items-center gap-2 rounded bg-[#000a1e] px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#32B372]"
          >
            {c.aftercareCta}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </section>

      <section id="pdi" className="relative overflow-hidden bg-[#000a1e] py-24 text-white">
        <div className="al-crecer-hero-mesh pointer-events-none absolute inset-0 opacity-20" aria-hidden />
        <div className={cn("relative z-10", layout.container)}>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className={cn(t.h2, "text-white")}>{c.pdiTitle}</h2>
              <p className="mt-6 font-body text-lg leading-relaxed text-white/80">{c.pdiBody}</p>
              <ul className="mt-8 space-y-4">
                {c.pdiPoints.map((point) => (
                  <li key={point.title} className="flex items-start gap-3">
                    <MaterialIcon name="check_circle" filled className="mt-0.5 text-[#32B372]" />
                    <div>
                      <strong className="block font-display text-base font-extrabold text-white">
                        {point.title}
                      </strong>
                      <span className="font-body text-sm text-white/70">{point.text}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <a
                href={PDI_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 inline-flex items-center gap-2 rounded bg-[#32B372] px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#000a1e]"
              >
                {c.pdiLink}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
            <div className="relative">
              <div className="rounded-xl border border-white/15 bg-white/5 p-2 shadow-2xl backdrop-blur-sm">
                <div className="flex min-h-[20rem] items-center justify-center rounded-lg bg-white px-8 py-10 md:min-h-[400px]">
                  <Image
                    src={PDI_LOGO}
                    alt={c.pdiTitle}
                    width={512}
                    height={179}
                    className="h-auto w-full max-w-md object-contain"
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#32B372]/20 blur-2xl" aria-hidden />
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" aria-hidden />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

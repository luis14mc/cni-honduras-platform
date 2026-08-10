import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2, Briefcase, Quote, Sparkles, Eye } from "lucide-react";
import { PageHero } from "@/src/components/cni/PageHero";
import { PAGE_HEROES } from "@/src/lib/pageHeroes";
import { Section, SectionHeader } from "@/src/components/cni/Section";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { crecerPageCopy } from "@/src/i18n/copy/crecerPage";
import { withLocale } from "@/src/i18n/path";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["crecer-acompanamiento"]);

const LEVER_ICONS = [Building2, Briefcase, Sparkles] as const;

export default async function CrecerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = crecerPageCopy[locale];
  const L = (path: string) => withLocale(locale, path);

  const levers = c.levers.map((l, i) => ({ ...l, Icon: LEVER_ICONS[i] ?? Building2 }));

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
              href="#casos"
              className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md transition hover:bg-white/20"
            >
              {c.ctaCases}
            </Link>
          </div>
        </PageHero>
      </div>

      <Section id="portafolio" tone="surface">
        <SectionHeader
          eyebrow={c.portfolioEyebrow}
          title={c.portfolioTitle}
          description={c.portfolioDescription}
          action={
            <Link
              href={L("/recursos")}
              className="border-b-2 border-[#35A963] pb-1 text-sm font-bold uppercase tracking-widest text-[#252A58] hover:text-[#35A963]"
            >
              {c.prospectCta}
            </Link>
          }
        />
        <div className="space-y-6">
          {c.portfolio.map((p) => (
            <article
              key={p.title}
              className="group rounded-xl border border-[#dce9ff]/20 bg-white p-1 transition-all duration-500 hover:shadow-2xl hover:shadow-[#252A58]/5"
            >
              <div className="flex flex-col items-stretch gap-6 p-6 lg:flex-row lg:items-center lg:gap-8">
                <div className="relative h-40 w-full overflow-hidden rounded-lg bg-[#e5eeff] lg:h-32 lg:w-56 lg:shrink-0">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 220px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#0E7A7C] px-3 py-1 text-[10px] font-bold uppercase tracking-tighter text-[#35A963]">
                      {p.badge}
                    </span>
                    <span className="rounded-full bg-[#e5eeff] px-3 py-1 text-[10px] font-bold uppercase tracking-tighter text-[#294f83]">
                      {p.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#252A58]">{p.title}</h3>
                  <p className="text-xs uppercase tracking-widest text-[#0E7A7C]">{p.location}</p>
                  <p className="max-w-2xl text-sm leading-relaxed text-[#0E7A7C]">{p.description}</p>
                </div>
                <div className="flex shrink-0 flex-col items-stretch gap-4 lg:items-end">
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#b6c2d3]">{c.targetCapital}</p>
                    <p className="text-lg font-bold text-[#252A58]">{p.capex}</p>
                  </div>
                  <Link
                    href={L("/contacto")}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#252A58] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#0E7A7C] group-hover:scale-[1.02]"
                  >
                    {c.downloadProspect}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="low">
        <SectionHeader eyebrow={c.leversEyebrow} title={c.leversTitle} align="center" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {levers.map(({ Icon, title, text }) => (
            <div key={title} className="rounded-xl border-t-4 border-[#35A963] bg-white p-8 tonal-depth-layering">
              <Icon className="mb-6 h-8 w-8 text-[#0E7A7C]" />
              <h3 className="text-lg font-bold text-[#252A58]">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#0E7A7C]">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="casos" tone="surface">
        <SectionHeader eyebrow={c.casesEyebrow} title={c.casesTitle} description={c.casesDescription} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {c.cases.map((cs) => (
            <article
              key={cs.company}
              className="flex h-full flex-col justify-between rounded-2xl bg-[#252A58] p-8 text-white shadow-2xl shadow-[#252A58]/15"
            >
              <Quote className="h-8 w-8 text-[#35A963]" />
              <p className="mt-6 text-base leading-relaxed text-white/90">“{cs.quote}”</p>
              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-xs font-bold uppercase tracking-widest text-[#35A963]">{cs.sector}</p>
                <p className="mt-2 text-base font-bold">{cs.company}</p>
                <p className="text-sm text-white/60">
                  {cs.spokesperson} · {cs.role}
                </p>
                <p className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80">
                  <Eye className="h-3.5 w-3.5 text-[#35A963]" />
                  {cs.highlight}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="primary" className="relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/2 -skew-x-12 translate-x-32 bg-[#24436B] opacity-40" />
        <div className="relative z-10 grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">{c.pdiTitle}</h2>
            <p className="mt-4 text-lg text-white/75">{c.pdiBody}</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row md:justify-end">
            <a
              href="https://pdihonduras.gob.hn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#35A963] px-10 py-4 text-xs font-bold uppercase tracking-widest text-[#252A58] transition hover:brightness-95"
            >
              {c.pdiLink}
            </a>
            <Link
              href={L("/contacto")}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-white/5 px-10 py-4 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-white/10"
            >
              {c.advisoryCta}
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}

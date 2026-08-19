import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import { SectorIcon } from "@/src/components/cni/SectorIcon";
import { SectorHero } from "@/src/components/cni/sector/SectorHero";
import { SectorIntro } from "@/src/components/cni/sector/SectorIntro";
import { SectorBenefits } from "@/src/components/cni/sector/SectorBenefits";
import { SectorOpportunities } from "@/src/components/cni/sector/SectorOpportunities";
import { SectorSuccessStories } from "@/src/components/cni/sector/SectorSuccessStories";
import { SectorProjects } from "@/src/components/cni/sector/SectorProjects";
import { SectorGuide } from "@/src/components/cni/sector/SectorGuide";
import { sectorPhotoHeaders, SECTOR_ICON_SIZE } from "@/src/lib/sectorIcons";
import { designImages } from "@/src/lib/designAssets";
import type { Locale } from "@/src/i18n/config";
import type { SectorCopy, SectorSlug } from "@/src/data/investmentSectors";
import { getSectorDisplayName, SECTOR_SLUGS } from "@/src/data/investmentSectors";
import { getSectorPageContent, sectorTemplateChrome } from "@/src/data/sectorPageContent";
import { invertirPageCopy, SECTOR_ACCENTS } from "@/src/i18n/copy/invertirPage";
import { withLocale, getSectorHref } from "@/src/i18n/path";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";
import type { AsyncData } from "@/src/lib/asyncData";
import type { InvestmentOpportunity, InvestmentProject, SuccessStory } from "@/src/types/investment";

type Props = {
  locale: Locale;
  slug: SectorSlug;
  sector: SectorCopy;
  opportunities: AsyncData<InvestmentOpportunity[]>;
  projects: AsyncData<InvestmentProject[]>;
  successStories: AsyncData<SuccessStory[]>;
};

export function SectorDetailView({
  locale,
  slug,
  sector,
  opportunities,
  projects,
  successStories,
}: Props) {
  const page = getSectorPageContent(slug, locale);
  const chrome = sectorTemplateChrome[locale];
  const inv = invertirPageCopy[locale];
  const L = (path: string) => withLocale(locale, path);
  const photoSrc = sectorPhotoHeaders[slug] ?? designImages.sectors.agroindustria;
  const sectorStyle: CSSProperties & Record<string, string> = {
    "--sector-accent": page.palette.accent,
    "--sector-soft": page.palette.soft,
    "--sector-border": page.palette.border,
  };
  const otherSectors = SECTOR_SLUGS.filter((item) => item !== slug);

  return (
    <div className={cn("flex flex-1 flex-col bg-[#f8f9ff]", "al-sector-detail")} style={sectorStyle}>
      <SectorHero
        slug={slug}
        name={sector.name || page.name}
        headline={page.hero.headline}
        metrics={page.hero.metrics}
        photoSrc={photoSrc}
        backHref={L("/invertir/sectores")}
        backLabel={chrome.backToSectors}
      />
      <SectorIntro
        slug={slug}
        title={page.intro.title}
        description={page.intro.description}
        videoUrl={page.intro.videoUrl}
        videoTitle={`${chrome.videoTitle}: ${page.name}`}
      />
      <SectorBenefits title={page.benefits.title} items={page.benefits.items} />
      <SectorOpportunities locale={locale} result={opportunities} />
      <SectorSuccessStories locale={locale} result={successStories} />
      <SectorProjects locale={locale} result={projects} />
      <SectorGuide locale={locale} guide={page.guide} />

      <section className={cn("bg-[#f8f9ff] py-16 md:py-20", "border-t border-cni-primary/8")}>
        <div className={layout.container}>
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className={t.eyebrow}>{chrome.otherSectorsEyebrow}</p>
              <h2 className={cn("mt-3", t.h2)}>{chrome.otherSectorsTitle}</h2>
              <div className={cn("mt-4", t.sectionRule)} />
            </div>
            <Link
              href={L("/invertir/sectores")}
              className="inline-flex items-center gap-2 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-cni-primary transition hover:text-[color:var(--sector-accent)]"
            >
              {chrome.catalogCta}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {otherSectors.map((otherSlug) => {
              const otherPalette = SECTOR_ACCENTS[otherSlug];
              return (
                <Link
                  key={otherSlug}
                  href={getSectorHref(locale, otherSlug)}
                  className="al-sector-pill-card group flex items-center gap-3 rounded-xl border border-cni-primary/8 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={
                    {
                      "--sector-accent": otherPalette.accent,
                      "--sector-soft": otherPalette.soft,
                      "--sector-border": otherPalette.border,
                    } as CSSProperties
                  }
                >
                  <span
                    className="al-sector-mini-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    aria-hidden
                  >
                    <SectorIcon slug={otherSlug} size={SECTOR_ICON_SIZE.sidebar} />
                  </span>
                  <span className="min-w-0 font-headline text-xs font-bold leading-tight text-cni-primary">
                    {getSectorDisplayName(locale, otherSlug)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="al-sector-cta-final relative overflow-hidden bg-[#252A58] py-20 text-white md:py-24">
        <div className="site-footer-mesh pointer-events-none absolute inset-0 opacity-[0.22]" aria-hidden />
        <div className={cn(layout.container, "relative z-10")}>
          <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className={t.eyebrowOnDark}>{locale === "es" ? "Acompañamiento CNI" : "CNI support"}</p>
              <h2 className={cn("mt-3", t.h2OnDark)}>{inv.ctaTitle}</h2>
              <p className={cn("mt-4 text-white/75", t.lead)}>{inv.ctaBody}</p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href={L("/asesoria")}
                className="al-sector-cta-primary inline-flex items-center justify-center gap-2 rounded-lg px-10 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.16em] transition"
              >
                {inv.ctaAdvisory}
              </Link>
              <Link
                href={L("/recursos")}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-10 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-white/10"
              >
                {inv.ctaGuide}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

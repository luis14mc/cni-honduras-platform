import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "@/src/components/cni/PageHero";
import { SectorIcon } from "@/src/components/cni/SectorIcon";
import { getSectorBySlug, type SectorSlug } from "@/src/data/investmentSectors";
import type { Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import { designImages } from "@/src/lib/designAssets";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";

const PORTFOLIO_SECTORS = ["turismo", "energia", "infraestructura", "agroindustria", "manufactura"] as const satisfies readonly SectorSlug[];

const copy = {
  es: {
    back: "Volver al portafolio",
    eyebrow: "Portafolio de Inversiones",
    description: "Seleccione un sector de inversión para consultar sus recursos disponibles.",
    sheets: {
      title: "Fichas de Proyectos",
      empty: "Próximamente estarán disponibles las fichas de proyectos de este sector.",
    },
    opportunities: {
      title: "Opportunity Cards",
      empty: "Próximamente estarán disponibles las Opportunity Cards de este sector.",
    },
  },
  en: {
    back: "Back to portfolio",
    eyebrow: "Investment Portfolio",
    description: "Select an investment sector to view its available resources.",
    sheets: {
      title: "Project Sheets",
      empty: "Project sheets for this sector will be available soon.",
    },
    opportunities: {
      title: "Opportunity Cards",
      empty: "Opportunity Cards for this sector will be available soon.",
    },
  },
} as const;

export function PortfolioSectorPage({ locale, type }: { locale: Locale; type: "sheets" | "opportunities" }) {
  const c = copy[locale];
  const section = c[type];

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9ff]">
      <PageHero
        eyebrow={c.eyebrow}
        title={section.title}
        description={c.description}
        imageSrc={designImages.portfolio.hero}
        imageAlt=""
        heightClass="min-h-[480px] pt-28 md:min-h-[560px]"
        imageClassName="absolute inset-0 object-cover opacity-40"
        overlayClassName="bg-gradient-to-r from-[#000a1e]/90 via-[#000a1e]/70 to-[#000a1e]/35"
      >
        <Link href={withLocale(locale, "/portafolio")} className="inline-flex items-center gap-2 font-headline text-xs font-bold uppercase tracking-[0.16em] text-white underline-offset-4 hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {c.back}
        </Link>
      </PageHero>

      <section className={cn("bg-[#f8f9ff]", layout.section)} aria-label={section.title}>
        <div className={layout.container}>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PORTFOLIO_SECTORS.map((slug) => {
              const sector = getSectorBySlug(locale, slug);
              if (!sector) return null;
              return (
                <article key={slug} className="flex min-h-64 flex-col rounded-xl border border-cni-primary/10 bg-white p-7 shadow-sm sm:p-8">
                  <div className="flex items-center gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#eaf7f0]" aria-hidden>
                      <SectorIcon slug={slug} size={34} />
                    </span>
                    <h2 className={t.h3}>{sector.name}</h2>
                  </div>
                  <div className="my-6 h-px bg-cni-primary/10" />
                  <p className="font-body text-sm leading-relaxed text-cni-primary/65" role="status">{section.empty}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

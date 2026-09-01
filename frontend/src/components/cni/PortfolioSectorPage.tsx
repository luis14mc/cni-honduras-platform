import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "@/src/components/cni/PageHero";
import { PortfolioDocumentCard, portfolioCoverUrl } from "@/src/components/cni/PortfolioDocumentCard";
import { SectorIcon } from "@/src/components/cni/SectorIcon";
import { getSectorBySlug, type SectorSlug } from "@/src/data/investmentSectors";
import type { Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import type { AsyncData } from "@/src/lib/asyncData";
import { designImages } from "@/src/lib/designAssets";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";
import type { CmsDocument, PortfolioDocumentType } from "@/src/types/cms";

const PORTFOLIO_SECTORS = ["turismo", "energia", "infraestructura", "agroindustria", "manufactura"] as const satisfies readonly SectorSlug[];

const copy = {
  es: {
    back: "Volver al portafolio",
    eyebrow: "Portafolio de Inversiones",
    description: "Seleccione un sector de inversión para consultar sus recursos disponibles.",
    download: "Ver / Descargar",
    sheets: {
      title: "Fichas de Proyectos",
      empty: "No hay fichas de proyectos disponibles en este sector.",
      error: "Las fichas de proyectos no están disponibles temporalmente.",
    },
    opportunities: {
      title: "Opportunity Cards",
      empty: "No hay Opportunity Cards disponibles en este sector.",
      error: "Las Opportunity Cards no están disponibles temporalmente.",
    },
  },
  en: {
    back: "Back to portfolio",
    eyebrow: "Investment Portfolio",
    description: "Select an investment sector to view its available resources.",
    download: "View / Download",
    sheets: {
      title: "Project Sheets",
      empty: "No project sheets are available in this sector.",
      error: "Project sheets are temporarily unavailable.",
    },
    opportunities: {
      title: "Opportunity Cards",
      empty: "No Opportunity Cards are available in this sector.",
      error: "Opportunity Cards are temporarily unavailable.",
    },
  },
} as const;

export function getPortfolioSectionCopy(locale: Locale, type: "sheets" | "opportunities") {
  return copy[locale][type];
}

function portfolioType(type: "sheets" | "opportunities"): PortfolioDocumentType {
  return type === "sheets" ? "project_sheet" : "opportunity_card";
}

export function portfolioDocumentsForSector(
  documents: CmsDocument[],
  type: "sheets" | "opportunities",
  sector: SectorSlug,
): CmsDocument[] {
  const expectedType = portfolioType(type);
  return documents
    .filter((document) => document.document_type === expectedType && document.sector === sector)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export { portfolioCoverUrl };

type Props = {
  locale: Locale;
  type: "sheets" | "opportunities";
  documents: AsyncData<CmsDocument[]>;
};

export function PortfolioSectorPage({ locale, type, documents }: Props) {
  const c = copy[locale];
  const section = getPortfolioSectionCopy(locale, type);

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
        <div className={cn(layout.container, "space-y-8")}>
          {PORTFOLIO_SECTORS.map((slug) => {
            const sector = getSectorBySlug(locale, slug);
            if (!sector) return null;
            const sectorDocuments = portfolioDocumentsForSector(documents.data, type, slug);
            return (
              <section key={slug} className="rounded-xl border border-cni-primary/10 bg-white p-6 shadow-sm sm:p-8" aria-labelledby={`portfolio-sector-${slug}`}>
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#eaf7f0]" aria-hidden>
                    <SectorIcon slug={slug} size={34} />
                  </span>
                  <h2 id={`portfolio-sector-${slug}`} className={t.h3}>{sector.name}</h2>
                </div>
                <div className="my-6 h-px bg-cni-primary/10" />

                {documents.status === "error" ? (
                  <p className="font-body text-sm leading-relaxed text-cni-primary/65" role="status">{section.error}</p>
                ) : sectorDocuments.length === 0 ? (
                  <p className="font-body text-sm leading-relaxed text-cni-primary/65" role="status">{section.empty}</p>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {sectorDocuments.map((document) => (
                      <PortfolioDocumentCard
                        key={`${document.id}-${document.slug}`}
                        document={document}
                        label={sector.name}
                        downloadLabel={c.download}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}

import { PortfolioDocumentCard } from "@/src/components/cni/PortfolioDocumentCard";
import { SectorIcon } from "@/src/components/cni/SectorIcon";
import { getSectorBySlug, type SectorSlug } from "@/src/data/investmentSectors";
import type { Locale } from "@/src/i18n/config";
import type { AsyncData } from "@/src/lib/asyncData";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";
import type { CmsDocument, PortfolioDocumentType } from "@/src/types/cms";

const PORTFOLIO_SECTORS = ["turismo", "energia", "infraestructura", "agroindustria", "manufactura"] as const satisfies readonly SectorSlug[];

const copy = {
  es: {
    sectorEyebrow: "Recursos descargables", sectorTitle: "Portafolio de Inversiones",
    sectorLead: "Consulte los portafolios de inversión publicados para cada sector prioritario.",
    sectorEmpty: "No hay un portafolio disponible para este sector.",
    sectorError: "Los portafolios sectoriales no están disponibles temporalmente.",
    opportunityEyebrow: "Oportunidades de inversión", opportunityTitle: "Portafolio de Oportunidades de Inversión",
    opportunityLead: "Documento consolidado de oportunidades de inversión disponibles en Honduras.",
    opportunityEmpty: "No hay un portafolio consolidado disponible por el momento.",
    opportunityError: "El portafolio de oportunidades no está disponible temporalmente.",
    consolidated: "Portafolio consolidado", download: "Ver / Descargar",
  },
  en: {
    sectorEyebrow: "Downloadable resources", sectorTitle: "Investment Portfolio",
    sectorLead: "View published investment portfolios for each priority sector.",
    sectorEmpty: "No portfolio is available for this sector.", sectorError: "Sector portfolios are temporarily unavailable.",
    opportunityEyebrow: "Investment opportunities", opportunityTitle: "Investment Opportunities Portfolio",
    opportunityLead: "Consolidated document of investment opportunities available in Honduras.",
    opportunityEmpty: "No consolidated portfolio is available at this time.",
    opportunityError: "The investment opportunities portfolio is temporarily unavailable.",
    consolidated: "Consolidated portfolio", download: "View / Download",
  },
} as const;

export function documentsByType(documents: CmsDocument[], documentType: PortfolioDocumentType, sector?: SectorSlug): CmsDocument[] {
  return documents
    .filter((document) => document.document_type === documentType && (!sector || document.sector === sector))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export function getDownloadablePortfolioCopy(locale: Locale) {
  return copy[locale];
}

export function DownloadablePortfolios({ locale, sectorPortfolios, opportunityPortfolios }: {
  locale: Locale; sectorPortfolios: AsyncData<CmsDocument[]>; opportunityPortfolios: AsyncData<CmsDocument[]>;
}) {
  const c = copy[locale];
  const consolidatedDocuments = documentsByType(opportunityPortfolios.data, "opportunity_portfolio");
  return <>
    <section id="documentos" className={cn("bg-[#f3f4f5]", layout.section)} aria-labelledby="sector-portfolios-title">
      <div className={layout.container}>
        <p className={t.eyebrow}>{c.sectorEyebrow}</p>
        <h2 id="sector-portfolios-title" className={cn("mt-3", t.h2)}>{c.sectorTitle}</h2>
        <div className={cn("mt-4", t.sectionRule)} />
        <p className={cn("mt-6 max-w-2xl", t.lead)}>{c.sectorLead}</p>
        <div className="mt-10 space-y-5">
          {PORTFOLIO_SECTORS.map((slug) => {
            const sector = getSectorBySlug(locale, slug);
            if (!sector) return null;
            const documents = documentsByType(sectorPortfolios.data, "sector_portfolio", slug);
            return <section key={slug} className="rounded-xl border border-cni-primary/10 bg-white p-6 shadow-sm sm:p-8" aria-labelledby={`resource-sector-${slug}`}>
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#eaf7f0]" aria-hidden><SectorIcon slug={slug} size={30} /></span>
                <h3 id={`resource-sector-${slug}`} className={t.h3}>{sector.name}</h3>
              </div>
              <div className="my-5 h-px bg-cni-primary/10" />
              {sectorPortfolios.status === "error" ? <p className="font-body text-sm text-cni-primary/65" role="status">{c.sectorError}</p>
                : documents.length === 0 ? <p className="font-body text-sm text-cni-primary/65" role="status">{c.sectorEmpty}</p>
                : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{documents.map((document) =>
                  <PortfolioDocumentCard key={`${document.id}-${document.slug}`} document={document} label={sector.name} downloadLabel={c.download} />)}</div>}
            </section>;
          })}
        </div>
      </div>
    </section>
    <section className={cn("bg-white", layout.section)} aria-labelledby="opportunity-portfolio-title">
      <div className={layout.container}>
        <p className={t.eyebrow}>{c.opportunityEyebrow}</p>
        <h2 id="opportunity-portfolio-title" className={cn("mt-3", t.h2)}>{c.opportunityTitle}</h2>
        <div className={cn("mt-4", t.sectionRule)} />
        <p className={cn("mt-6 max-w-2xl", t.lead)}>{c.opportunityLead}</p>
        <div className="mt-10">
          {opportunityPortfolios.status === "error" ? <p className="rounded-xl border border-cni-primary/10 bg-[#f8f9ff] p-8 font-body text-sm text-cni-primary/65" role="status">{c.opportunityError}</p>
            : consolidatedDocuments.length === 0 ? <p className="rounded-xl border border-cni-primary/10 bg-[#f8f9ff] p-8 font-body text-sm text-cni-primary/65" role="status">{c.opportunityEmpty}</p>
            : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{consolidatedDocuments.map((document) =>
              <PortfolioDocumentCard key={`${document.id}-${document.slug}`} document={document} label={c.consolidated} downloadLabel={c.download} />)}</div>}
        </div>
      </div>
    </section>
  </>;
}

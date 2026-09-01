import { describe, expect, it } from "vitest";
import {
  getPortfolioSectionCopy,
  portfolioCoverUrl,
  portfolioDocumentsForSector,
} from "@/src/components/cni/PortfolioSectorPage";
import type { CmsDocument, PortfolioDocumentType } from "@/src/types/cms";

function document(
  id: number,
  documentType: PortfolioDocumentType,
  sector: string,
  order = 0,
): CmsDocument {
  return {
    id,
    title: `Document ${id}`,
    slug: `document-${id}`,
    file: "",
    file_url: null,
    external_url: "",
    description: "",
    category: "biblioteca",
    is_featured: false,
    document_type: documentType,
    sector,
    order,
    cover_image: null,
    file_type: "",
    file_size_bytes: null,
    published_at: "",
    document_date: null,
    seo_title: "",
    seo_description: "",
    created_at: "",
    updated_at: "",
    has_resource: false,
  };
}

describe("PortfolioSectorPage document selection", () => {
  const documents = [
    document(1, "project_sheet", "energia", 2),
    document(2, "opportunity_card", "energia"),
    document(3, "project_sheet", "turismo"),
    document(4, "project_sheet", "energia", 1),
  ];

  it("never mixes project sheets and opportunity cards", () => {
    expect(portfolioDocumentsForSector(documents, "sheets", "energia").map((item) => item.id)).toEqual([4, 1]);
    expect(portfolioDocumentsForSector(documents, "opportunities", "energia").map((item) => item.id)).toEqual([2]);
  });

  it("filters by the requested sector", () => {
    expect(portfolioDocumentsForSector(documents, "sheets", "turismo").map((item) => item.id)).toEqual([3]);
  });

  it("provides localized empty states", () => {
    expect(getPortfolioSectionCopy("es", "sheets").empty).toBe("No hay fichas de proyectos disponibles en este sector.");
    expect(getPortfolioSectionCopy("en", "opportunities").empty).toBe("No Opportunity Cards are available in this sector.");
  });

  it("uses the institutional fallback when cover media is missing", () => {
    expect(portfolioCoverUrl(documents[0]!)).toBeNull();
  });
});

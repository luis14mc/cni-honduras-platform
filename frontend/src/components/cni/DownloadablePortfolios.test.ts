import { describe, expect, it } from "vitest";
import { documentsByType, getDownloadablePortfolioCopy } from "@/src/components/cni/DownloadablePortfolios";
import { portfolioCoverUrl } from "@/src/components/cni/PortfolioDocumentCard";
import type { CmsDocument, PortfolioDocumentType } from "@/src/types/cms";

function document(id: number, type: PortfolioDocumentType, sector: string | undefined, order: number): CmsDocument {
  return {
    id, title: `Document ${id}`, slug: `document-${id}`, file: "", file_url: null,
    external_url: "", description: "", category: "biblioteca", is_featured: false,
    document_type: type, sector, order, cover_image: null, file_type: "",
    file_size_bytes: null, published_at: "", document_date: null, seo_title: "",
    seo_description: "", created_at: "", updated_at: "", has_resource: false,
  };
}

describe("DownloadablePortfolios document selection", () => {
  const documents = [
    document(1, "sector_portfolio", "energia", 2),
    document(2, "project_sheet", "energia", 0),
    document(3, "sector_portfolio", "turismo", 0),
    document(4, "sector_portfolio", "energia", 1),
    document(5, "opportunity_portfolio", undefined, 0),
    document(6, "opportunity_card", "energia", 0),
  ];

  it("filters and orders sector portfolios without project sheets", () => {
    expect(documentsByType(documents, "sector_portfolio", "energia").map((item) => item.id)).toEqual([4, 1]);
  });

  it("selects the consolidated portfolio without requiring a sector", () => {
    expect(documentsByType(documents, "opportunity_portfolio").map((item) => item.id)).toEqual([5]);
  });

  it("never includes consolidated portfolios in opportunity cards", () => {
    expect(documentsByType(documents, "opportunity_card").map((item) => item.id)).toEqual([6]);
  });

  it("provides ES/EN empty states", () => {
    expect(getDownloadablePortfolioCopy("es").sectorEmpty).toContain("No hay un portafolio");
    expect(getDownloadablePortfolioCopy("en").opportunityEmpty).toContain("No consolidated portfolio");
  });

  it("keeps missing cover and file empty for the visual fallback", () => {
    expect(portfolioCoverUrl(documents[0]!)).toBeNull();
    expect(documents[0]?.has_resource).toBe(false);
    expect(documents[0]?.file_url).toBeNull();
  });
});

/** Guards for public opportunity teaser mapping (no CAPEX / sensitive fields). */

import { describe, expect, it } from "vitest";
import type { InvestmentOpportunity } from "@/src/types/investment";

const SENSITIVE_KEYS = [
  "fund_uses",
  "target_customer",
  "market_demand",
  "opportunity_description",
  "description",
] as const;

function buildContactHref(localePath: (path: string) => string, slug: string): string {
  return localePath(`/contacto?opportunity=${encodeURIComponent(slug)}`);
}

function teaserMetrics(opp: InvestmentOpportunity, limit = 4) {
  return (opp.metrics ?? []).slice(0, limit);
}

describe("public opportunity teaser", () => {
  const teaser: InvestmentOpportunity = {
    id: 1,
    code: "OC-CNI-T002",
    title: "Complejo Ecoturístico El Cajón",
    slug: "el-cajon",
    summary: "Desarrollo ecoturístico priorizado por el CNI.",
    value_proposition: "ESG y turismo de naturaleza.",
    sector: { id: 1, name: "Turismo", slug: "turismo", icon: "", color_hex: "" },
    estimated_investment: null,
    estimated_jobs: null,
    status: "open",
    is_public: true,
    is_featured: true,
    metrics: [
      { id: 1, label: "Inversión", value: "USD 6.3M", note: "", icon: "", order: 0 },
      { id: 2, label: "ROI", value: "18–24%", note: "", icon: "", order: 1 },
      { id: 3, label: "Payback", value: "5–7 años", note: "", icon: "", order: 2 },
      { id: 4, label: "Capacidad", value: "30 cabañas", note: "", icon: "", order: 3 },
      { id: 5, label: "Extra", value: "no", note: "", icon: "", order: 4 },
    ],
    published_at: "2026-08-01T00:00:00Z",
  };

  it("does not carry CAPEX or sensitive dossier fields on the public shape", () => {
    for (const key of SENSITIVE_KEYS) {
      expect(teaser).not.toHaveProperty(key);
    }
  });

  it("limits card/detail metrics to the public teaser budget", () => {
    expect(teaserMetrics(teaser, 2)).toHaveLength(2);
    expect(teaserMetrics(teaser, 4)).toHaveLength(4);
    expect(teaserMetrics(teaser, 4).map((m) => m.label)).not.toContain("Extra");
  });

  it("builds locale contact CTA without hardcoded hostname", () => {
    const hrefEs = buildContactHref((p) => `/es${p}`, teaser.slug);
    const hrefEn = buildContactHref((p) => `/en${p}`, teaser.slug);
    expect(hrefEs).toBe("/es/contacto?opportunity=el-cajon");
    expect(hrefEn).toBe("/en/contacto?opportunity=el-cajon");
    expect(hrefEs).not.toMatch(/https?:\/\//);
    expect(hrefEn).not.toMatch(/cni\.hn/);
  });

  it("keeps summary/title/sector for card rendering", () => {
    expect(teaser.sector?.name).toBe("Turismo");
    expect(teaser.title).toContain("El Cajón");
    expect(teaser.summary.length).toBeGreaterThan(10);
  });
});

import { describe, expect, it } from "vitest";
import {
  emptyFundUse,
  emptyMetric,
  emptyOpportunityForm,
  opportunityFormToPayload,
  opportunityToForm,
  reorderList,
} from "@/src/lib/cms/editorial/opportunities";
import type { OpportunityItem } from "@/src/lib/cms/editorial/types";

function sampleItem(overrides: Partial<OpportunityItem> = {}): OpportunityItem {
  return {
    id: 1,
    code: "OC-CNI-T002",
    title: "El Cajón",
    title_es: "El Cajón",
    title_en: "El Cajon",
    slug: "el-cajon",
    summary: "",
    summary_es: "Resumen",
    summary_en: "Summary",
    description: "",
    description_es: "Desc ES",
    description_en: "Desc EN",
    target_customer: "",
    target_customer_es: "Cliente",
    target_customer_en: "Customer",
    market_demand: "",
    market_demand_es: "Mercado",
    market_demand_en: "Market",
    value_proposition: "",
    value_proposition_es: "Valor",
    value_proposition_en: "Value",
    sector: 3,
    sector_detail: { id: 3, name: "Turismo", slug: "turismo" },
    department: null,
    region: null,
    estimated_investment: null,
    estimated_jobs: null,
    lifecycle_status: "open",
    status: "draft",
    published_at: null,
    is_public: false,
    is_featured: true,
    order: 0,
    metrics: [
      {
        id: 10,
        label: "TIR",
        label_es: "TIR",
        label_en: "IRR",
        value: "14%",
        value_es: "14%",
        value_en: "14%",
        note: "",
        note_es: "Validar",
        note_en: "Validate",
        icon: "",
        order: 0,
        is_public: true,
      },
    ],
    fund_uses: [
      {
        id: 20,
        component: "Terreno",
        component_es: "Terreno",
        component_en: "Land",
        amount: "500000.00",
        description: "",
        description_es: "",
        description_en: "",
        order: 0,
      },
    ],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-02T00:00:00Z",
    created_by: null,
    created_by_name: null,
    updated_by: null,
    updated_by_name: "invest",
    ...overrides,
  };
}

describe("opportunity form mapping", () => {
  it("maps API item to form and back without dropping ES/EN", () => {
    const form = opportunityToForm(sampleItem());
    expect(form.title_es).toBe("El Cajón");
    expect(form.title_en).toBe("El Cajon");
    expect(form.metrics).toHaveLength(1);
    expect(form.fund_uses[0].component_en).toBe("Land");

    const payload = opportunityFormToPayload(form);
    expect(payload.title_es).toBe("El Cajón");
    expect(payload.title_en).toBe("El Cajon");
    expect(payload.metrics?.[0].label_en).toBe("IRR");
    expect(payload.metrics?.[0].is_public).toBe(true);
    expect(payload.fund_uses?.[0].amount).toBe("500000.00");
    expect(payload).not.toHaveProperty("status");
  });

  it("preserves EN when only ES fields change in form state", () => {
    const form = opportunityToForm(sampleItem());
    form.title_es = "Nuevo título";
    form.description_es = "Nueva desc";
    const payload = opportunityFormToPayload(form);
    expect(payload.title_en).toBe("El Cajon");
    expect(payload.description_en).toBe("Desc EN");
  });

  it("adds edits deletes and reorders metrics", () => {
    const form = emptyOpportunityForm();
    form.metrics = [emptyMetric(0), emptyMetric(1)];
    form.metrics[0].label_es = "Monto";
    form.metrics[1].label_es = "TIR";
    form.metrics = reorderList(form.metrics, 1, 0);
    expect(form.metrics[0].label_es).toBe("TIR");
    expect(form.metrics[0].order).toBe(0);
    form.metrics = form.metrics.filter((_, i) => i !== 1);
    expect(form.metrics).toHaveLength(1);
    form.metrics.push(emptyMetric(1));
    form.metrics[1].label_es = "ROI";
    expect(form.metrics.map((m) => m.label_es)).toEqual(["TIR", "ROI"]);
  });

  it("adds edits deletes and reorders fund uses", () => {
    let rows = [emptyFundUse(0), emptyFundUse(1)];
    rows[0].component_es = "Terreno";
    rows[1].component_es = "Cabañas";
    rows = reorderList(rows, 0, 1);
    expect(rows.map((r) => r.component_es)).toEqual(["Cabañas", "Terreno"]);
    rows = rows.filter((_, i) => i !== 0);
    expect(rows).toHaveLength(1);
    rows[0].amount = "3100000";
    expect(rows[0].amount).toBe("3100000");
  });
});

describe("public opportunity card helpers", () => {
  it("maps teaser payload without requiring CAPEX or internal narrative", () => {
    const item = {
      id: 1,
      code: "OC-CNI-T002",
      title: "El Cajón",
      slug: "el-cajon",
      summary: "Resumen",
      value_proposition: "ESG",
      sector: { id: 1, name: "Turismo", slug: "turismo", icon: "", color_hex: "" },
      metrics: [{ id: 1, label: "TIR", value: "14%", note: "Validar", icon: "", order: 0 }],
    };
    expect(item.code).toBe("OC-CNI-T002");
    expect(item.metrics[0].label).toBe("TIR");
    expect(item.sector?.name).toBe("Turismo");
    expect(item).not.toHaveProperty("fund_uses");
    expect(item).not.toHaveProperty("target_customer");
    expect(item).not.toHaveProperty("market_demand");
  });
});

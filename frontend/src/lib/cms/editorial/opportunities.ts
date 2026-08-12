import { cmsDelete, cmsGet, cmsPatch, cmsPost } from "@/src/lib/cms/api";
import type {
  ListParams,
  OpportunityFundUseItem,
  OpportunityItem,
  OpportunityMetricItem,
  OpportunityLifecycleStatus,
  PaginatedResponse,
  PublishStatus,
} from "@/src/lib/cms/editorial/types";
import { buildListQuery } from "@/src/lib/cms/editorial/types";

export type OpportunityWritePayload = Partial<
  Pick<
    OpportunityItem,
    | "code"
    | "title"
    | "title_es"
    | "title_en"
    | "slug"
    | "summary"
    | "summary_es"
    | "summary_en"
    | "description"
    | "description_es"
    | "description_en"
    | "target_customer"
    | "target_customer_es"
    | "target_customer_en"
    | "market_demand"
    | "market_demand_es"
    | "market_demand_en"
    | "value_proposition"
    | "value_proposition_es"
    | "value_proposition_en"
    | "sector"
    | "department"
    | "region"
    | "estimated_investment"
    | "estimated_jobs"
    | "lifecycle_status"
    | "is_featured"
    | "order"
    | "metrics"
    | "fund_uses"
  >
>;

export async function listOpportunities(
  params: ListParams = {},
): Promise<PaginatedResponse<OpportunityItem>> {
  return cmsGet<PaginatedResponse<OpportunityItem>>(`/opportunities/${buildListQuery(params)}`);
}

export async function getOpportunity(id: number): Promise<OpportunityItem> {
  return cmsGet<OpportunityItem>(`/opportunities/${id}/`);
}

export async function createOpportunity(payload: OpportunityWritePayload): Promise<OpportunityItem> {
  return cmsPost<OpportunityItem>("/opportunities/", { status: "draft", ...payload });
}

export async function updateOpportunity(
  id: number,
  payload: OpportunityWritePayload,
): Promise<OpportunityItem> {
  return cmsPatch<OpportunityItem>(`/opportunities/${id}/`, payload);
}

export async function deleteOpportunity(id: number): Promise<void> {
  return cmsDelete(`/opportunities/${id}/`);
}

export async function publishOpportunity(id: number): Promise<OpportunityItem> {
  return cmsPost<OpportunityItem>(`/opportunities/${id}/publish/`, {});
}

export async function archiveOpportunity(id: number): Promise<OpportunityItem> {
  return cmsPost<OpportunityItem>(`/opportunities/${id}/archive/`, {});
}

export async function unpublishOpportunity(id: number): Promise<OpportunityItem> {
  return cmsPost<OpportunityItem>(`/opportunities/${id}/unpublish/`, {});
}

export type OpportunityFormMetric = {
  id?: number | null;
  label_es: string;
  label_en: string;
  value_es: string;
  value_en: string;
  note_es: string;
  note_en: string;
  icon: string;
  order: number;
};

export type OpportunityFormFundUse = {
  id?: number | null;
  component_es: string;
  component_en: string;
  amount: string;
  description_es: string;
  description_en: string;
  order: number;
};

export type OpportunityFormState = {
  code: string;
  title_es: string;
  title_en: string;
  slug: string;
  summary_es: string;
  summary_en: string;
  description_es: string;
  description_en: string;
  target_customer_es: string;
  target_customer_en: string;
  market_demand_es: string;
  market_demand_en: string;
  value_proposition_es: string;
  value_proposition_en: string;
  sector: number | null;
  lifecycle_status: OpportunityLifecycleStatus;
  is_featured: boolean;
  order: number;
  metrics: OpportunityFormMetric[];
  fund_uses: OpportunityFormFundUse[];
  status: PublishStatus;
  updated_at: string | null;
  updated_by_name: string | null;
};

export function emptyOpportunityForm(): OpportunityFormState {
  return {
    code: "",
    title_es: "",
    title_en: "",
    slug: "",
    summary_es: "",
    summary_en: "",
    description_es: "",
    description_en: "",
    target_customer_es: "",
    target_customer_en: "",
    market_demand_es: "",
    market_demand_en: "",
    value_proposition_es: "",
    value_proposition_en: "",
    sector: null,
    lifecycle_status: "open",
    is_featured: false,
    order: 0,
    metrics: [],
    fund_uses: [],
    status: "draft",
    updated_at: null,
    updated_by_name: null,
  };
}

export function opportunityToForm(item: OpportunityItem): OpportunityFormState {
  return {
    code: item.code ?? "",
    title_es: item.title_es ?? "",
    title_en: item.title_en ?? "",
    slug: item.slug ?? "",
    summary_es: item.summary_es ?? "",
    summary_en: item.summary_en ?? "",
    description_es: item.description_es ?? "",
    description_en: item.description_en ?? "",
    target_customer_es: item.target_customer_es ?? "",
    target_customer_en: item.target_customer_en ?? "",
    market_demand_es: item.market_demand_es ?? "",
    market_demand_en: item.market_demand_en ?? "",
    value_proposition_es: item.value_proposition_es ?? "",
    value_proposition_en: item.value_proposition_en ?? "",
    sector: item.sector,
    lifecycle_status: item.lifecycle_status ?? "open",
    is_featured: item.is_featured,
    order: item.order ?? 0,
    metrics: (item.metrics ?? []).map((m, index) => ({
      id: m.id,
      label_es: m.label_es ?? m.label ?? "",
      label_en: m.label_en ?? "",
      value_es: m.value_es ?? m.value ?? "",
      value_en: m.value_en ?? "",
      note_es: m.note_es ?? m.note ?? "",
      note_en: m.note_en ?? "",
      icon: m.icon ?? "",
      order: m.order ?? index,
    })),
    fund_uses: (item.fund_uses ?? []).map((f, index) => ({
      id: f.id,
      component_es: f.component_es ?? f.component ?? "",
      component_en: f.component_en ?? "",
      amount: f.amount ?? "",
      description_es: f.description_es ?? f.description ?? "",
      description_en: f.description_en ?? "",
      order: f.order ?? index,
    })),
    status: item.status,
    updated_at: item.updated_at,
    updated_by_name: item.updated_by_name,
  };
}

/** Never force draft on published opportunities — publish is a separate action. */
export function opportunityFormToPayload(form: OpportunityFormState): OpportunityWritePayload {
  const metrics: OpportunityMetricItem[] = form.metrics.map((m, index) => ({
    id: m.id ?? null,
    label: m.label_es || m.label_en,
    label_es: m.label_es,
    label_en: m.label_en,
    value: m.value_es || m.value_en,
    value_es: m.value_es,
    value_en: m.value_en,
    note: m.note_es || m.note_en,
    note_es: m.note_es,
    note_en: m.note_en,
    icon: m.icon,
    order: m.order ?? index,
  }));
  const fund_uses: OpportunityFundUseItem[] = form.fund_uses.map((f, index) => ({
    id: f.id ?? null,
    component: f.component_es || f.component_en,
    component_es: f.component_es,
    component_en: f.component_en,
    amount: f.amount || null,
    description: f.description_es || f.description_en,
    description_es: f.description_es,
    description_en: f.description_en,
    order: f.order ?? index,
  }));
  return {
    code: form.code,
    title_es: form.title_es,
    title_en: form.title_en,
    title: form.title_es || form.title_en,
    slug: form.slug || undefined,
    summary_es: form.summary_es,
    summary_en: form.summary_en,
    description_es: form.description_es,
    description_en: form.description_en,
    target_customer_es: form.target_customer_es,
    target_customer_en: form.target_customer_en,
    market_demand_es: form.market_demand_es,
    market_demand_en: form.market_demand_en,
    value_proposition_es: form.value_proposition_es,
    value_proposition_en: form.value_proposition_en,
    sector: form.sector,
    lifecycle_status: form.lifecycle_status,
    is_featured: form.is_featured,
    order: form.order,
    metrics,
    fund_uses,
  };
}

export function emptyMetric(order = 0): OpportunityFormMetric {
  return {
    label_es: "",
    label_en: "",
    value_es: "",
    value_en: "",
    note_es: "",
    note_en: "",
    icon: "",
    order,
  };
}

export function emptyFundUse(order = 0): OpportunityFormFundUse {
  return {
    component_es: "",
    component_en: "",
    amount: "",
    description_es: "",
    description_en: "",
    order,
  };
}

export function reorderList<T extends { order: number }>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next.map((item, index) => ({ ...item, order: index }));
}

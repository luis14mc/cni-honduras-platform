import { cmsDelete, cmsGet, cmsPatch, cmsPost } from "@/src/lib/cms/api";
import type { ListParams, OpportunityItem, PaginatedResponse } from "@/src/lib/cms/editorial/types";
import { buildListQuery } from "@/src/lib/cms/editorial/types";

export type OpportunityWritePayload = Partial<
  Pick<
    OpportunityItem,
    | "title"
    | "slug"
    | "summary"
    | "description"
    | "sector"
    | "department"
    | "region"
    | "estimated_investment"
    | "estimated_jobs"
    | "status"
    | "is_public"
    | "is_featured"
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
  return cmsPost<OpportunityItem>("/opportunities/", { is_public: false, ...payload });
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

export async function unpublishOpportunity(id: number): Promise<OpportunityItem> {
  return cmsPost<OpportunityItem>(`/opportunities/${id}/unpublish/`, {});
}

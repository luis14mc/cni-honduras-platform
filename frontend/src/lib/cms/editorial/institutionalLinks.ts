import { cmsDelete, cmsGet, cmsPatch, cmsPost } from "@/src/lib/cms/api";
import type { InstitutionalLinkItem, ListParams, PaginatedResponse } from "@/src/lib/cms/editorial/types";
import { buildListQuery } from "@/src/lib/cms/editorial/types";

export type InstitutionalLinkWritePayload = Partial<
  Pick<
    InstitutionalLinkItem,
    | "section"
    | "title"
    | "title_es"
    | "title_en"
    | "description"
    | "description_es"
    | "description_en"
    | "url"
    | "is_external"
    | "icon"
    | "accent_color"
    | "is_active"
    | "order"
  >
>;

export async function listInstitutionalLinks(
  params: ListParams = {},
): Promise<PaginatedResponse<InstitutionalLinkItem>> {
  return cmsGet<PaginatedResponse<InstitutionalLinkItem>>(
    `/institutional-links/${buildListQuery(params)}`,
  );
}

export async function createInstitutionalLink(
  payload: InstitutionalLinkWritePayload,
): Promise<InstitutionalLinkItem> {
  return cmsPost<InstitutionalLinkItem>("/institutional-links/", payload);
}

export async function updateInstitutionalLink(
  id: number,
  payload: InstitutionalLinkWritePayload,
): Promise<InstitutionalLinkItem> {
  return cmsPatch<InstitutionalLinkItem>(`/institutional-links/${id}/`, payload);
}

export async function deleteInstitutionalLink(id: number): Promise<void> {
  return cmsDelete(`/institutional-links/${id}/`);
}

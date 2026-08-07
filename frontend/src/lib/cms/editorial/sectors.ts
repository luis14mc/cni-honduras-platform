import {
  CMS_API_BASE,
  clearInMemoryCsrfToken,
  cmsDelete,
  cmsGet,
  cmsPatch,
  cmsPost,
  ensureCsrfToken,
} from "@/src/lib/cms/api";
import type { ListParams, PaginatedResponse, SectorItem } from "@/src/lib/cms/editorial/types";
import { buildListQuery } from "@/src/lib/cms/editorial/types";

export type SectorWritePayload = Partial<
  Pick<
    SectorItem,
    | "name"
    | "name_es"
    | "name_en"
    | "slug"
    | "short_description"
    | "short_description_es"
    | "short_description_en"
    | "description"
    | "description_es"
    | "description_en"
    | "icon"
    | "color_hex"
    | "is_featured"
    | "is_active"
    | "order"
  >
>;

export async function listSectors(params: ListParams = {}): Promise<PaginatedResponse<SectorItem>> {
  return cmsGet<PaginatedResponse<SectorItem>>(`/sectors/${buildListQuery(params)}`);
}

export async function getSector(id: number): Promise<SectorItem> {
  return cmsGet<SectorItem>(`/sectors/${id}/`);
}

export async function createSector(payload: SectorWritePayload, image?: File): Promise<SectorItem> {
  if (image) return sectorMultipart("POST", "/sectors/", payload, image);
  return cmsPost<SectorItem>("/sectors/", payload);
}

export async function updateSector(
  id: number,
  payload: SectorWritePayload,
  image?: File,
): Promise<SectorItem> {
  if (image) return sectorMultipart("PATCH", `/sectors/${id}/`, payload, image);
  return cmsPatch<SectorItem>(`/sectors/${id}/`, payload);
}

async function sectorMultipart(
  method: "POST" | "PATCH",
  path: string,
  payload: SectorWritePayload,
  image: File,
): Promise<SectorItem> {
  const csrf = await ensureCsrfToken();
  const form = new FormData();
  form.append("image", image);
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined && value !== null) form.append(key, String(value));
  }
  const response = await fetch(`${CMS_API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: { Accept: "application/json", "X-CSRFToken": csrf },
    body: form,
  });
  if (!response.ok) {
    if (response.status === 403) clearInMemoryCsrfToken();
    throw new Error(await response.text());
  }
  return response.json() as Promise<SectorItem>;
}

export async function deleteSector(id: number): Promise<void> {
  return cmsDelete(`/sectors/${id}/`);
}

export async function activateSector(id: number): Promise<SectorItem> {
  return cmsPost<SectorItem>(`/sectors/${id}/activate/`, {});
}

export async function deactivateSector(id: number): Promise<SectorItem> {
  return cmsPost<SectorItem>(`/sectors/${id}/deactivate/`, {});
}

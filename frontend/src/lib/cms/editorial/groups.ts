import { cmsGet, cmsPatch } from "@/src/lib/cms/api";
import type { CmsGroup, PaginatedResponse, PermissionCatalogModel } from "@/src/lib/cms/editorial/types";

export async function listGroups(): Promise<PaginatedResponse<CmsGroup>> {
  return cmsGet<PaginatedResponse<CmsGroup>>("/groups/");
}

export async function getPermissionCatalog(): Promise<{ models: PermissionCatalogModel[] }> {
  return cmsGet<{ models: PermissionCatalogModel[] }>("/groups/permission_catalog/");
}

export async function updateGroupPermissions(id: number, permissionIds: number[]): Promise<CmsGroup> {
  return cmsPatch<CmsGroup>(`/groups/${id}/`, { permission_ids: permissionIds });
}

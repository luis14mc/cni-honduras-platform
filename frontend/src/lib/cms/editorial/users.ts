import { cmsDelete, cmsGet, cmsPatch, cmsPost } from "@/src/lib/cms/api";
import type { CmsStaffUser, PaginatedResponse } from "@/src/lib/cms/editorial/types";

export interface UserListParams {
  page?: number;
  page_size?: number;
  search?: string;
}

export interface UserCreatePayload {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  is_active?: boolean;
  is_staff?: boolean;
  group_ids?: number[];
}

export interface UserUpdatePayload {
  email?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  group_ids?: number[];
}

function buildUserQuery(params: UserListParams): string {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  if (params.search) qs.set("search", params.search);
  const str = qs.toString();
  return str ? `?${str}` : "";
}

export async function listUsers(params: UserListParams = {}): Promise<PaginatedResponse<CmsStaffUser>> {
  return cmsGet<PaginatedResponse<CmsStaffUser>>(`/users/${buildUserQuery(params)}`);
}

export async function getUser(id: number): Promise<CmsStaffUser> {
  return cmsGet<CmsStaffUser>(`/users/${id}/`);
}

export async function createUser(payload: UserCreatePayload): Promise<CmsStaffUser> {
  return cmsPost<CmsStaffUser>("/users/", { is_staff: true, ...payload });
}

export async function updateUser(id: number, payload: UserUpdatePayload): Promise<CmsStaffUser> {
  return cmsPatch<CmsStaffUser>(`/users/${id}/`, payload);
}

export async function deleteUser(id: number): Promise<void> {
  return cmsDelete(`/users/${id}/`);
}

export async function setUserPassword(id: number, password: string, password_confirm: string): Promise<void> {
  return cmsPost<void>(`/users/${id}/set_password/`, { password, password_confirm });
}

export async function activateUser(id: number): Promise<CmsStaffUser> {
  return cmsPost<CmsStaffUser>(`/users/${id}/activate/`, {});
}

export async function deactivateUser(id: number): Promise<CmsStaffUser> {
  return cmsPost<CmsStaffUser>(`/users/${id}/deactivate/`, {});
}

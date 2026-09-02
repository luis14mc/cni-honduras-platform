import { cmsGet, cmsPatch, cmsPost } from "@/src/lib/cms/api";
import type { PaginatedResponse } from "@/src/lib/cms/editorial/types";

export type ProjectApplicationStatus =
  | "new"
  | "reviewing"
  | "contacted"
  | "qualified"
  | "rejected"
  | "converted";

export type StaffUserBrief = {
  id: number;
  name: string;
  email: string;
};

export type GeoRefBrief = {
  slug: string;
  name: string;
} | null;

export type ProjectApplicationListItem = {
  reference_code: string;
  project_name: string;
  company: string;
  full_name: string;
  email: string;
  sector: GeoRefBrief;
  department: GeoRefBrief;
  municipality: GeoRefBrief;
  investment_range: string;
  status: ProjectApplicationStatus;
  assigned_to: StaffUserBrief | null;
  created_at: string;
};

export type ProjectApplicationDetail = ProjectApplicationListItem & {
  phone: string;
  country: string;
  website: string;
  project_description: string;
  estimated_jobs: number | null;
  source: string;
  updated_at: string;
};

export type ProjectApplicationNote = {
  id: number;
  body: string;
  author: StaffUserBrief;
  created_at: string;
};

export type ProjectApplicationHistoryEntry = {
  id: number;
  event_type:
    | "status_changed"
    | "assigned"
    | "reassigned"
    | "unassigned"
    | "note_added";
  from_status: string;
  to_status: string;
  from_assignee: StaffUserBrief | null;
  to_assignee: StaffUserBrief | null;
  metadata: Record<string, unknown>;
  actor: StaffUserBrief | null;
  created_at: string;
};

export type PostulacionesListParams = {
  page?: number;
  page_size?: number;
  search?: string;
  status?: ProjectApplicationStatus | "";
  sector?: string;
  department?: string;
  investment_range?: string;
  assigned_to?: string;
  date_from?: string;
  date_to?: string;
};

export function buildPostulacionesQuery(params: PostulacionesListParams): string {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  if (params.sector) qs.set("sector", params.sector);
  if (params.department) qs.set("department", params.department);
  if (params.investment_range) qs.set("investment_range", params.investment_range);
  if (params.assigned_to) qs.set("assigned_to", params.assigned_to);
  if (params.date_from) qs.set("date_from", params.date_from);
  if (params.date_to) qs.set("date_to", params.date_to);
  const str = qs.toString();
  return str ? `?${str}` : "";
}

export async function listPostulaciones(
  params: PostulacionesListParams = {},
): Promise<PaginatedResponse<ProjectApplicationListItem>> {
  return cmsGet<PaginatedResponse<ProjectApplicationListItem>>(
    `/project-applications/${buildPostulacionesQuery(params)}`,
  );
}

export async function getPostulacion(referenceCode: string): Promise<ProjectApplicationDetail> {
  return cmsGet<ProjectApplicationDetail>(`/project-applications/${encodeURIComponent(referenceCode)}/`);
}

export async function updatePostulacion(
  referenceCode: string,
  payload: { status?: ProjectApplicationStatus; assigned_to?: number | null },
): Promise<ProjectApplicationDetail> {
  return cmsPatch<ProjectApplicationDetail>(
    `/project-applications/${encodeURIComponent(referenceCode)}/`,
    payload,
  );
}

export async function listPostulacionNotes(referenceCode: string): Promise<ProjectApplicationNote[]> {
  return cmsGet<ProjectApplicationNote[]>(
    `/project-applications/${encodeURIComponent(referenceCode)}/notes/`,
  );
}

export async function createPostulacionNote(
  referenceCode: string,
  body: string,
): Promise<ProjectApplicationNote> {
  return cmsPost<ProjectApplicationNote>(
    `/project-applications/${encodeURIComponent(referenceCode)}/notes/`,
    { body },
  );
}

export async function listPostulacionHistory(
  referenceCode: string,
): Promise<ProjectApplicationHistoryEntry[]> {
  return cmsGet<ProjectApplicationHistoryEntry[]>(
    `/project-applications/${encodeURIComponent(referenceCode)}/history/`,
  );
}

export async function listAssignableStaff(): Promise<StaffUserBrief[]> {
  return cmsGet<StaffUserBrief[]>("/project-applications/assignable-users/");
}

export const PROJECT_APPLICATION_STATUS_LABELS: Record<ProjectApplicationStatus, string> = {
  new: "Nuevo",
  reviewing: "En revisión",
  contacted: "Contactado",
  qualified: "Calificado",
  rejected: "Rechazado",
  converted: "Convertido",
};

export const INVESTMENT_RANGE_LABELS: Record<string, string> = {
  under_10m: "Menos de USD 10 millones",
  "10m_50m": "USD 10 a 50 millones",
  "50m_100m": "USD 50 a 100 millones",
  over_100m: "Más de USD 100 millones",
};

export function formatHistoryEntry(entry: ProjectApplicationHistoryEntry): string {
  const actor = entry.actor?.name ?? "Sistema";
  if (entry.event_type === "status_changed") {
    const fromLabel =
      PROJECT_APPLICATION_STATUS_LABELS[entry.from_status as ProjectApplicationStatus] ??
      entry.from_status;
    const toLabel =
      PROJECT_APPLICATION_STATUS_LABELS[entry.to_status as ProjectApplicationStatus] ??
      entry.to_status;
    return `${actor} cambió estado: ${fromLabel} → ${toLabel}`;
  }
  if (entry.event_type === "assigned") {
    return `Asignado a ${entry.to_assignee?.name ?? "—"}`;
  }
  if (entry.event_type === "reassigned") {
    return `${actor} reasignó a ${entry.to_assignee?.name ?? "—"}`;
  }
  if (entry.event_type === "unassigned") {
    return `${actor} quitó la asignación`;
  }
  if (entry.event_type === "note_added") {
    return `${actor} agregó una nota interna`;
  }
  return entry.event_type;
}

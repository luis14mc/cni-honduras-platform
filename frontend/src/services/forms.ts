import { apiPost } from "@/src/lib/api";
import type {
  ProjectApplicationPayload,
  ProjectApplicationResponse,
} from "@/src/types/forms";

const BASE = "/forms";

export function submitProjectApplication(
  payload: ProjectApplicationPayload,
): Promise<ProjectApplicationResponse> {
  return apiPost<ProjectApplicationResponse, ProjectApplicationPayload>(
    `${BASE}/project-application/`,
    payload,
  );
}


type DownloadIdentity = {
  full_name: string;
  email: string;
  company: string;
  country: string;
  details: string;
  consent: boolean;
  website: string;
};

type ResourceDownloadPayload = {
  strapi_document_id: string;
  locale: "es" | "en";
} & (DownloadIdentity | { remember_token: string });

export function submitResourceDownload(payload: ResourceDownloadPayload) {
  return apiPost<
    { download_url: string; expires_in: number; remember_token: string },
    ResourceDownloadPayload
  >(`${BASE}/resource-download/`, payload);
}

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

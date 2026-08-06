// Authenticated CMS API client.
//
// Talks to Django under /api/v1/cms-admin/ using session cookies (HttpOnly) and
// CSRF. Never stores passwords or tokens in localStorage. All requests send
// credentials so the browser attaches the session cookie.

import { API_BASE_URL } from "@/src/lib/api";
import type { CmsFailureKind } from "@/src/lib/cms/types";

export const CMS_API_BASE = `${API_BASE_URL}/cms-admin`;

export class CmsApiError extends Error {
  readonly status: number;
  readonly kind: CmsFailureKind;

  constructor(message: string, status: number) {
    super(message);
    this.name = "CmsApiError";
    this.status = status;
    this.kind = classifyStatus(status);
  }
}

// Map an HTTP status to a UI-facing failure kind. Exported for testing.
export function classifyStatus(status: number): CmsFailureKind {
  if (status === 401) return "expired";
  if (status === 403) return "unauthorized";
  return "error";
}

// Read a cookie value from a document.cookie-style string. Exported for testing.
export function readCookie(name: string, cookieString: string): string | null {
  if (!cookieString) return null;
  for (const part of cookieString.split(";")) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (rawKey === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

function currentCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  return readCookie("csrftoken", document.cookie);
}

// Ensure the CSRF cookie is present before an unsafe request.
export async function ensureCsrfCookie(): Promise<void> {
  if (currentCsrfToken()) return;
  await fetch(`${CMS_API_BASE}/csrf/`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
}

async function parseDetail(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (
      body &&
      typeof body === "object" &&
      "detail" in body &&
      typeof (body as { detail: unknown }).detail === "string"
    ) {
      return (body as { detail: string }).detail;
    }
  } catch {
    // non-JSON body
  }
  return response.statusText || "Request failed";
}

export async function cmsGet<T>(path: string): Promise<T> {
  const response = await fetch(`${CMS_API_BASE}${path}`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new CmsApiError(await parseDetail(response), response.status);
  }
  return response.json() as Promise<T>;
}

export async function cmsPost<T>(path: string, payload?: unknown): Promise<T> {
  await ensureCsrfCookie();
  const csrf = currentCsrfToken();
  const response = await fetch(`${CMS_API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRFToken": csrf } : {}),
    },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  if (response.status === 204) {
    return undefined as T;
  }
  if (!response.ok) {
    throw new CmsApiError(await parseDetail(response), response.status);
  }
  return response.json() as Promise<T>;
}

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

/** In-memory CSRF token from GET /csrf/ JSON — never localStorage/sessionStorage. */
let inMemoryCsrfToken: string | null = null;
let csrfFetchPromise: Promise<string> | null = null;

/** Test hook: read the cached CSRF token without fetching. */
export function getInMemoryCsrfToken(): string | null {
  return inMemoryCsrfToken;
}

/** Test hook: reset the in-memory CSRF cache. */
export function clearInMemoryCsrfToken(): void {
  inMemoryCsrfToken = null;
  csrfFetchPromise = null;
}

async function fetchCsrfTokenFromApi(): Promise<string> {
  const response = await fetch(`${CMS_API_BASE}/csrf/`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new CmsApiError(await parseDetail(response), response.status);
  }
  const body: unknown = await response.json();
  if (
    !body ||
    typeof body !== "object" ||
    !("csrfToken" in body) ||
    typeof (body as { csrfToken: unknown }).csrfToken !== "string"
  ) {
    throw new CmsApiError("Missing csrfToken in response", response.status);
  }
  const token = (body as { csrfToken: string }).csrfToken;
  inMemoryCsrfToken = token;
  return token;
}

/** Fetch and cache the CSRF token from the API JSON body. */
export async function ensureCsrfToken(): Promise<string> {
  if (inMemoryCsrfToken) return inMemoryCsrfToken;
  if (!csrfFetchPromise) {
    csrfFetchPromise = fetchCsrfTokenFromApi().finally(() => {
      csrfFetchPromise = null;
    });
  }
  return csrfFetchPromise;
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

function isCsrfForbidden(status: number, detail: string): boolean {
  return status === 403 && detail.toLowerCase().includes("csrf");
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

async function cmsUnsafeRequest<T>(
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  payload: unknown | undefined,
  csrfRetried: boolean,
): Promise<T> {
  const csrf = await ensureCsrfToken();
  const response = await fetch(`${CMS_API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-CSRFToken": csrf,
    },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  if (response.status === 204) {
    return undefined as T;
  }
  if (!response.ok) {
    const detail = await parseDetail(response);
    if (!csrfRetried && isCsrfForbidden(response.status, detail)) {
      clearInMemoryCsrfToken();
      return cmsUnsafeRequest(method, path, payload, true);
    }
    throw new CmsApiError(detail, response.status);
  }
  return response.json() as Promise<T>;
}

export async function cmsPost<T>(path: string, payload?: unknown): Promise<T> {
  return cmsUnsafeRequest("POST", path, payload, false);
}

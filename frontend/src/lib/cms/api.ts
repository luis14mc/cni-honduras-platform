// Authenticated CMS API client.
//
// Talks to Django under /api/v1/cms-admin/ using session cookies (HttpOnly) and
// CSRF. Never stores passwords or tokens in localStorage. All requests send
// credentials so the browser attaches the session cookie.

import { API_BASE_URL } from "@/src/lib/api";
import { CmsApiError, parseCmsErrorBody } from "@/src/lib/cms/errors";

export { CmsApiError, classifyStatus } from "@/src/lib/cms/errors";

export const CMS_API_BASE = `${API_BASE_URL}/cms-admin`;

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

async function parseErrorResponse(response: Response): Promise<CmsApiError> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // non-JSON body
  }
  const parsed = parseCmsErrorBody(body, response.status);
  return new CmsApiError(parsed.message, response.status, parsed.fieldErrors);
}

async function parseDetail(response: Response): Promise<string> {
  const err = await parseErrorResponse(response);
  return err.message;
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
    throw await parseErrorResponse(response);
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
    const err = await parseErrorResponse(response);
    if (!csrfRetried && isCsrfForbidden(response.status, err.message)) {
      clearInMemoryCsrfToken();
      return cmsUnsafeRequest(method, path, payload, true);
    }
    throw err;
  }
  return response.json() as Promise<T>;
}

export async function cmsPost<T>(path: string, payload?: unknown): Promise<T> {
  return cmsUnsafeRequest("POST", path, payload, false);
}

export async function cmsPut<T>(path: string, payload?: unknown): Promise<T> {
  return cmsUnsafeRequest("PUT", path, payload, false);
}

export async function cmsPatch<T>(path: string, payload?: unknown): Promise<T> {
  return cmsUnsafeRequest("PATCH", path, payload, false);
}

export async function cmsDelete(path: string): Promise<void> {
  await cmsUnsafeRequest<void>("DELETE", path, undefined, false);
}

/** Multipart upload (e.g. media library). Sends CSRF; does not set Content-Type. */
export async function cmsUpload<T>(path: string, formData: FormData): Promise<T> {
  return cmsUploadInternal(path, formData, false);
}

async function cmsUploadInternal<T>(
  path: string,
  formData: FormData,
  csrfRetried: boolean,
): Promise<T> {
  const csrf = await ensureCsrfToken();
  const response = await fetch(`${CMS_API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "X-CSRFToken": csrf,
    },
    body: formData,
  });
  if (response.status === 204) {
    return undefined as T;
  }
  if (!response.ok) {
    const err = await parseErrorResponse(response);
    if (!csrfRetried && isCsrfForbidden(response.status, err.message)) {
      clearInMemoryCsrfToken();
      return cmsUploadInternal(path, formData, true);
    }
    throw err;
  }
  return response.json() as Promise<T>;
}

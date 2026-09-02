import type { Locale } from "@/src/i18n/config";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export function unwrapPage<T>(payload: PaginatedResponse<T> | T[]): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  return payload.results ?? [];
}

const DEFAULT_API_BASE_URL = "http://localhost:8000/api/v1";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

export class ApiError extends Error {
  readonly status: number;
  readonly path: string;
  readonly data: unknown;

  constructor(message: string, status: number, path: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.path = path;
    this.data = data;
  }
}

function joinApiPath(base: string, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

function withLang(path: string, locale?: Locale): string {
  if (!locale) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}lang=${encodeURIComponent(locale)}`;
}

export type FetchOptions = RequestInit & { locale?: Locale };

export async function apiGet<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { locale, ...init } = options;
  const url = joinApiPath(API_BASE_URL, withLang(path, locale));

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      ...init,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    throw new ApiError(`Failed to fetch ${path}: ${message}`, 0, path);
  }

  if (!response.ok) {
    let detail = response.statusText;
    let data: unknown;
    try {
      const body: unknown = await response.json();
      data = body;
      if (
        body &&
        typeof body === "object" &&
        "detail" in body &&
        typeof body.detail === "string"
      ) {
        detail = body.detail;
      }
    } catch {
      // Response body is not JSON; keep statusText.
    }

    throw new ApiError(
      `HTTP ${response.status} ${response.statusText}: ${detail}`,
      response.status,
      path,
      data,
    );
  }

  return response.json() as Promise<T>;
}

export async function apiGetList<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T[]> {
  const payload = await apiGet<PaginatedResponse<T> | T[]>(path, options);
  return unwrapPage(payload);
}

export async function apiPost<TResponse, TPayload = unknown>(
  path: string,
  payload: TPayload,
): Promise<TResponse> {
  const url = joinApiPath(API_BASE_URL, path);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    throw new ApiError(`Failed to post ${path}: ${message}`, 0, path);
  }

  if (!response.ok) {
    let detail = response.statusText;
    let data: unknown;
    try {
      const body: unknown = await response.json();
      data = body;
      if (
        body &&
        typeof body === "object" &&
        "detail" in body &&
        typeof body.detail === "string"
      ) {
        detail = body.detail;
      }
    } catch {
      // Response body is not JSON; keep statusText.
    }

    throw new ApiError(
      `HTTP ${response.status} ${response.statusText}: ${detail}`,
      response.status,
      path,
      data,
    );
  }

  return response.json() as Promise<TResponse>;
}

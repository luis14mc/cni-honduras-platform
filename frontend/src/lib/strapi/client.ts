import type { StrapiListResponse, StrapiLocale } from "@/src/lib/strapi/types";

export class StrapiApiError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(message: string, status: number, path: string) {
    super(message);
    this.name = "StrapiApiError";
    this.status = status;
    this.path = path;
  }
}

export function getStrapiBaseUrl(): string {
  const configured = (process.env.NEXT_PUBLIC_STRAPI_URL ?? "").replace(/\/+$/, "");
  if (!configured) return "";
  if (/^https?:\/\//i.test(configured)) return configured;
  const prefix = configured.startsWith("/") ? configured : `/${configured}`;
  if (typeof window !== "undefined") return prefix;
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");
  return site ? `${site}${prefix}` : prefix;
}

function getStrapiApiToken(): string | undefined {
  if (typeof window !== "undefined") {
    return undefined;
  }
  const token = process.env.STRAPI_API_TOKEN?.trim();
  return token || undefined;
}

export function buildStrapiQuery(params: {
  locale?: StrapiLocale | string;
  populate?: string;
  extra?: Record<string, string>;
}): string {
  const search = new URLSearchParams();
  if (params.locale) {
    search.set("locale", params.locale);
  }
  if (params.populate) {
    search.set("populate", params.populate);
  }
  if (params.extra) {
    for (const [key, value] of Object.entries(params.extra)) {
      search.set(key, value);
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export type StrapiFetchOptions = RequestInit & {
  locale?: StrapiLocale | string;
  populate?: string;
};

export async function strapiGet<T>(
  path: string,
  options: StrapiFetchOptions = {},
): Promise<T> {
  const base = getStrapiBaseUrl();
  if (!base) {
    throw new StrapiApiError(
      "NEXT_PUBLIC_STRAPI_URL is not configured",
      0,
      path,
    );
  }

  const { locale, populate, headers, ...init } = options;
  const query = buildStrapiQuery({ locale, populate });
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${normalizedPath}${query}`;

  const token = getStrapiApiToken();
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");
  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      ...init,
      headers: requestHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    throw new StrapiApiError(`Failed to fetch ${path}: ${message}`, 0, path);
  }

  if (!response.ok) {
    throw new StrapiApiError(
      `HTTP ${response.status} ${response.statusText}`,
      response.status,
      path,
    );
  }

  return response.json() as Promise<T>;
}

export async function strapiGetList<T>(
  path: string,
  options: StrapiFetchOptions = {},
): Promise<T[]> {
  const payload = await strapiGet<StrapiListResponse<T>>(path, options);
  return payload.data ?? [];
}

/** Explicit media populate for list endpoints (prefer over populate=* in production). */
export const STRAPI_MEDIA_POPULATE = {
  news: "featured_image",
  documents: "file,cover",
  successStories: "logo,featured_image,person_photo",
  investmentOpportunities: "featured_image,public_metrics",
} as const;

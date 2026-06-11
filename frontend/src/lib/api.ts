const DEFAULT_API_BASE_URL = "http://localhost:8000/api/v1";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

export class ApiError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(message: string, status: number, path: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.path = path;
  }
}

function joinApiPath(base: string, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = joinApiPath(API_BASE_URL, path);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    throw new ApiError(`Failed to fetch ${path}: ${message}`, 0, path);
  }

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body: unknown = await response.json();
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
    );
  }

  return response.json() as Promise<T>;
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
    try {
      const body: unknown = await response.json();
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
    );
  }

  return response.json() as Promise<TResponse>;
}

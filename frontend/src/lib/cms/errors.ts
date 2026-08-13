import type { CmsFailureKind } from "@/src/lib/cms/types";

export class CmsApiError extends Error {
  readonly status: number;
  readonly kind: CmsFailureKind;
  readonly fieldErrors: Record<string, string[]>;
  readonly code?: string;

  constructor(
    message: string,
    status: number,
    fieldErrors: Record<string, string[]> = {},
    code?: string,
  ) {
    super(message);
    this.name = "CmsApiError";
    this.status = status;
    this.kind = status === 401 ? "expired" : status === 403 ? "unauthorized" : "error";
    this.fieldErrors = fieldErrors;
    this.code = code;
  }
}

export type CmsHttpStatus = 400 | 401 | 403 | 404 | 409 | 429 | 500;

export const MEDIA_STORAGE_ERROR_CODE = "media_storage_error";
export const MEDIA_STORAGE_ERROR_MESSAGE =
  "No fue posible subir el archivo. Verifique el almacenamiento multimedia.";

export interface ParsedCmsError {
  message: string;
  fieldErrors: Record<string, string[]>;
  status: number;
  kind: CmsFailureKind;
  code?: string;
}

function flattenFieldErrors(body: Record<string, unknown>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(body)) {
    if (key === "detail" || key === "code") continue;
    if (Array.isArray(value)) {
      out[key] = value.map(String);
    } else if (typeof value === "string") {
      out[key] = [value];
    }
  }
  return out;
}

/** Parse a Django/DRF JSON error body. Pure — unit tested. */
export function parseCmsErrorBody(body: unknown, status: number): ParsedCmsError {
  let message = "Ocurrió un error inesperado.";
  let fieldErrors: Record<string, string[]> = {};
  let code: string | undefined;

  if (typeof body === "object" && body !== null) {
    const record = body as Record<string, unknown>;
    if (typeof record.code === "string" && record.code.trim()) {
      code = record.code.trim();
    }
    if (typeof record.detail === "string") {
      message = record.detail;
    }
    fieldErrors = flattenFieldErrors(record);
    if (!record.detail && Object.keys(fieldErrors).length > 0) {
      const first = Object.values(fieldErrors)[0]?.[0];
      if (first) message = first;
    }
    if (code === MEDIA_STORAGE_ERROR_CODE) {
      message = MEDIA_STORAGE_ERROR_MESSAGE;
    }
  }

  return {
    message: messageForStatus(status, message),
    fieldErrors,
    status,
    kind: status === 401 ? "expired" : status === 403 ? "unauthorized" : "error",
    code,
  };
}

/** User-facing message by HTTP status. Pure — unit tested. */
export function messageForStatus(status: number, detail?: string): string {
  switch (status) {
    case 400:
      return detail || "Revise los datos del formulario.";
    case 401:
      return "Su sesión expiró. Inicie sesión nuevamente.";
    case 403:
      return detail || "No tiene permisos para realizar esta acción.";
    case 404:
      return detail || "El recurso solicitado no existe.";
    case 409:
      return detail || "Conflicto al guardar. Actualice e intente de nuevo.";
    case 429:
      return "Demasiados intentos. Espere un momento e intente de nuevo.";
    case 500:
      return "Error del servidor. Intente de nuevo más tarde.";
    case 503:
      return detail || "El servicio no está disponible. Intente de nuevo más tarde.";
    default:
      return detail || "Ocurrió un error inesperado.";
  }
}

export function resolveCmsError(error: unknown): ParsedCmsError {
  if (error instanceof CmsApiError) {
    return {
      message: messageForStatus(error.status, error.message),
      fieldErrors: error.fieldErrors ?? {},
      status: error.status,
      kind: error.kind,
      code: error.code,
    };
  }
  if (error instanceof Error) {
    return { message: error.message, fieldErrors: {}, status: 0, kind: "error" };
  }
  return { message: "Ocurrió un error inesperado.", fieldErrors: {}, status: 0, kind: "error" };
}

export function isAuthError(error: unknown): boolean {
  return error instanceof CmsApiError && (error.status === 401 || error.status === 403);
}

export function isSessionExpired(error: unknown): boolean {
  return error instanceof CmsApiError && error.status === 401;
}

/** Map an HTTP status to a UI-facing failure kind. Exported for testing. */
export function classifyStatus(status: number): CmsFailureKind {
  if (status === 401) return "expired";
  if (status === 403) return "unauthorized";
  return "error";
}

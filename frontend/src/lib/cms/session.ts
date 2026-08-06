// Session service: thin wrappers over the CMS API + pure helpers the UI and
// tests share. Keeping the logic here (not in the React component) makes it
// unit-testable in the Node vitest environment.

import { CmsApiError, cmsGet, cmsPost } from "@/src/lib/cms/api";
import type { CmsUser } from "@/src/lib/cms/types";

export async function fetchCurrentUser(): Promise<CmsUser> {
  return cmsGet<CmsUser>("/me/");
}

export async function login(username: string, password: string): Promise<CmsUser> {
  return cmsPost<CmsUser>("/login/", { username, password });
}

export async function logout(): Promise<void> {
  await cmsPost<void>("/logout/");
}

export interface LoginFieldErrors {
  username?: string;
  password?: string;
}

// Validate the login form before hitting the network. Pure — unit tested.
export function validateLogin(username: string, password: string): LoginFieldErrors {
  const errors: LoginFieldErrors = {};
  if (!username.trim()) errors.username = "Ingrese su usuario.";
  if (!password) errors.password = "Ingrese su contraseña.";
  return errors;
}

// Turn a thrown error into a human message for the login form. Pure — tested.
export function loginErrorMessage(error: unknown): string {
  if (error instanceof CmsApiError) {
    if (error.status === 401) return "Usuario o contraseña incorrectos.";
    if (error.status === 403) return "Esta cuenta no tiene acceso al CMS.";
    if (error.status === 429) return "Demasiados intentos. Espere un momento e intente de nuevo.";
    return error.message || "No se pudo iniciar sesión.";
  }
  return "No se pudo conectar con el servidor.";
}

// Display name for the header/user menu. Pure — tested.
export function displayName(user: CmsUser): string {
  const full = `${user.first_name} ${user.last_name}`.trim();
  return full || user.username;
}

// Initials for the avatar. Pure — tested.
export function initials(user: CmsUser): string {
  const full = `${user.first_name} ${user.last_name}`.trim();
  const source = full || user.username;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

import type { Locale } from "@/src/i18n/config";
import { defaultLocale, isLocale } from "@/src/i18n/config";

/** Path without locale prefix, always starts with `/` (e.g. `/`, `/invertir`). */
export function stripLocalePrefix(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "/";
  if (isLocale(parts[0])) {
    const rest = parts.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function getLocaleFromPathname(pathname: string): Locale {
  const first = pathname.split("/").filter(Boolean)[0];
  if (isLocale(first)) return first;
  return defaultLocale;
}

/** Prefix an internal path with the active locale (`/invertir` → `/es/invertir`). Preserves `#hash`. */
export function withLocale(locale: Locale, path: string): string {
  const [rawPath, hash] = path.split("#");
  const normalized = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  const base = normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
  return hash ? `${base}#${hash}` : base;
}

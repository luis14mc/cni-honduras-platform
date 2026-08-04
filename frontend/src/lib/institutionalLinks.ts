import type { Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import type { InstitutionalLink } from "@/src/types/cms";

const SITE_HOSTS = new Set(["cni.hn", "www.cni.hn", "test.cni.hn"]);

/** Resolve CMS link URLs for locale-aware internal paths. */
export function resolveInstitutionalHref(
  url: string,
  isExternal: boolean,
  locale: Locale,
): string {
  if (isExternal) {
    return url;
  }

  try {
    const parsed = new URL(url);
    if (SITE_HOSTS.has(parsed.hostname)) {
      return withLocale(locale, `${parsed.pathname}${parsed.search}${parsed.hash}`);
    }
  } catch {
    // Fall through for relative paths.
  }

  if (url.startsWith("/")) {
    return withLocale(locale, url);
  }

  return url;
}

export function mapInstitutionalLinkHref(link: InstitutionalLink, locale: Locale): string {
  return resolveInstitutionalHref(link.url, link.is_external, locale);
}

import type { Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import type { InstitutionalLink } from "@/src/types/cms";

/** Production domains for the CNI public site. */
const INSTITUTIONAL_HOSTS = new Set(["cni.hn", "www.cni.hn"]);

function configuredSiteHost(): string | null {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    return null;
  }

  try {
    return new URL(siteUrl).hostname;
  } catch {
    return null;
  }
}

function isInstitutionalHost(hostname: string): boolean {
  if (INSTITUTIONAL_HOSTS.has(hostname)) {
    return true;
  }

  const siteHost = configuredSiteHost();
  return siteHost !== null && hostname === siteHost;
}

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
    if (isInstitutionalHost(parsed.hostname)) {
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

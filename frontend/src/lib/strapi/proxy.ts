/**
 * Next.js reverse-proxy mapping onto a separate Strapi origin.
 * STRAPI_ORIGIN is server-only and must never be NEXT_PUBLIC_*.
 */

export type StrapiRewrite = {
  source: string;
  destination: string;
};

/** Plugin HTTP prefixes used by Strapi 5 admin (not nested under /admin). */
export const STRAPI_ADMIN_PLUGIN_PREFIXES = [
  "/content-manager",
  "/content-type-builder",
  "/upload",
  "/uploads",
  "/i18n",
  "/users-permissions",
  "/email",
  "/content-releases",
  "/review-workflows",
  "/cloud",
] as const;

export function normalizeStrapiOrigin(raw: string | undefined | null): string | null {
  const value = raw?.trim() ?? "";
  if (!value) return null;
  return value.replace(/\/+$/, "");
}

export function isStrapiProxyPath(pathname: string): boolean {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;
  if (pathname === "/strapi-api" || pathname.startsWith("/strapi-api/")) return true;
  return STRAPI_ADMIN_PLUGIN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Rewrites for `next.config` `beforeFiles` so `/admin` is not captured by `[locale]`.
 * Empty origin → no Strapi rewrites (local/CI build without a Strapi service).
 */
export function buildStrapiBeforeFileRewrites(
  originRaw: string | undefined | null,
): StrapiRewrite[] {
  const origin = normalizeStrapiOrigin(originRaw);
  if (!origin) return [];

  const rewrites: StrapiRewrite[] = [
    { source: "/admin", destination: `${origin}/admin` },
    { source: "/admin/:path*", destination: `${origin}/admin/:path*` },
    { source: "/strapi-api/:path*", destination: `${origin}/api/:path*` },
  ];

  for (const prefix of STRAPI_ADMIN_PLUGIN_PREFIXES) {
    rewrites.push({ source: prefix, destination: `${origin}${prefix}` });
    rewrites.push({
      source: `${prefix}/:path*`,
      destination: `${origin}${prefix}/:path*`,
    });
  }

  return rewrites;
}

/** Map a public proxy path to the Strapi origin URL, or null if not proxied. */
export function rewriteStrapiProxyUrl(
  originRaw: string | undefined | null,
  pathname: string,
  search = "",
): string | null {
  const origin = normalizeStrapiOrigin(originRaw);
  if (!origin || !isStrapiProxyPath(pathname)) return null;

  let destPath = pathname;
  if (pathname === "/strapi-api" || pathname.startsWith("/strapi-api/")) {
    destPath = pathname.replace(/^\/strapi-api/, "/api") || "/api";
  }

  return `${origin}${destPath}${search}`;
}

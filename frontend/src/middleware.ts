import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { legacyRedirects, resolveInternalPath } from "@/src/config/routeRewrites";
import { normalizePath } from "@/src/config/siteNavigation";
import { isStrapiProxyPath, rewriteStrapiProxyUrl } from "@/src/lib/strapi/proxy";

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/apple-icon") ||
    (pathname.includes(".") && !pathname.endsWith("/"))
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // Django editorial CMS stays on this app. Strapi is reverse-proxied when STRAPI_ORIGIN is set.
  if (pathname === "/cms" || pathname.startsWith("/cms/")) {
    return NextResponse.next();
  }

  if (isStrapiProxyPath(pathname)) {
    const target = rewriteStrapiProxyUrl(
      process.env.STRAPI_ORIGIN,
      pathname,
      request.nextUrl.search,
    );
    if (target) {
      return NextResponse.rewrite(new URL(target));
    }
    return NextResponse.next();
  }

  const normalized = normalizePath(pathname);

  for (const rule of legacyRedirects) {
    if (rule.from.test(normalized)) {
      const target = rule.to(normalized);
      if (target && target !== normalized) {
        const url = request.nextUrl.clone();
        url.pathname = target;
        return NextResponse.redirect(url, 308);
      }
    }
  }

  if (normalized.startsWith("/es/") || normalized === "/es") {
    const url = request.nextUrl.clone();
    url.pathname = normalized === "/es" ? "/" : normalized.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  const internal = resolveInternalPath(normalized);
  if (internal && internal !== normalized) {
    const url = request.nextUrl.clone();
    url.pathname = internal;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|favicon\\.ico|robots\\.txt).*)"],
};

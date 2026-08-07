"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { resolveNavForPath } from "@/src/lib/cms/nav";

export interface Crumb {
  label: string;
  href: string;
}

// Build breadcrumb trail from the current pathname using the nav model.
export function buildCrumbs(pathname: string): Crumb[] {
  const crumbs: Crumb[] = [{ label: "CMS", href: "/cms" }];
  if (pathname === "/cms" || pathname === "/cms/") return crumbs;

  const { section, actionLabel } = resolveNavForPath(pathname);
  if (section && section.href !== "/cms") {
    crumbs.push({ label: section.label, href: section.href });
  }
  if (actionLabel) {
    crumbs.push({ label: actionLabel, href: pathname.replace(/\/$/, "") });
  }
  return crumbs;
}

export function CmsBreadcrumb({ pathname }: { pathname: string }) {
  const crumbs = buildCrumbs(pathname);
  return (
    <nav aria-label="Ruta de navegación" className="flex items-center gap-1 text-sm">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span key={`${crumb.href}-${index}`} className="flex items-center gap-1">
            {index > 0 ? (
              <ChevronRight className="h-4 w-4 text-[#252A58]/30" aria-hidden />
            ) : null}
            {isLast ? (
              <span className="font-semibold text-[#252A58]" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link href={crumb.href} className="text-[#334E88] hover:underline">
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

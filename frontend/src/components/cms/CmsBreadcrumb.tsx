"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { findNavItem } from "@/src/lib/cms/nav";

// Build breadcrumb trail from the current pathname using the nav model.
export function buildCrumbs(pathname: string): { label: string; href: string }[] {
  const crumbs: { label: string; href: string }[] = [{ label: "CMS", href: "/cms" }];
  if (pathname === "/cms" || pathname === "/cms/") return crumbs;

  const item = findNavItem(pathname.replace(/\/$/, ""));
  if (item && item.href !== "/cms") {
    crumbs.push({ label: item.label, href: item.href });
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
          <span key={crumb.href} className="flex items-center gap-1">
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

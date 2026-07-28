"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { layoutCopy } from "@/src/i18n/copy/layout";
import { getLocaleFromPathname, getMirrorPath } from "@/src/config/siteNavigation";
import { cn } from "@/src/lib/utils";

export function LanguageSwitch() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const hrefEs = getMirrorPath(pathname, "es");
  const hrefEn = getMirrorPath(pathname, "en");
  const labels = layoutCopy[locale].language;

  const activeClass = "bg-[#32B372] text-white";
  const inactiveClass = "text-white/70 hover:text-white";

  return (
    <div
      className="flex items-center rounded-md border border-white/15 bg-white/5 p-0.5"
      role="group"
      aria-label={labels.aria}
    >
      <Link
        href={hrefEs}
        className={cn(
          "rounded px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-widest transition",
          locale === "es" ? activeClass : inactiveClass,
        )}
        hrefLang="es"
      >
        {labels.es}
      </Link>
      <Link
        href={hrefEn}
        className={cn(
          "rounded px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-widest transition",
          locale === "en" ? activeClass : inactiveClass,
        )}
        hrefLang="en"
      >
        {labels.en}
      </Link>
    </div>
  );
}

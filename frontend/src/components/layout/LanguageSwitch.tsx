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

  return (
    <div
      className="flex items-center rounded border border-white/15 bg-white/5 p-0.5"
      role="group"
      aria-label={labels.aria}
    >
      <Link
        href={hrefEs}
        className={cn(
          "rounded px-2 py-1 text-[0.65rem] font-bold uppercase tracking-widest transition",
          locale === "es" ? "bg-[#e9c176] text-[#191c1d]" : "text-white/70 hover:text-white",
        )}
        hrefLang="es"
      >
        {labels.es}
      </Link>
      <Link
        href={hrefEn}
        className={cn(
          "rounded px-2 py-1 text-[0.65rem] font-bold uppercase tracking-widest transition",
          locale === "en" ? "bg-[#e9c176] text-[#191c1d]" : "text-white/70 hover:text-white",
        )}
        hrefLang="en"
      >
        {labels.en}
      </Link>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { layoutCopy } from "@/src/i18n/copy/layout";
import { getLocaleFromPathname, getMirrorPath } from "@/src/config/siteNavigation";
import { cn } from "@/src/lib/utils";

type LanguageSwitchProps = {
  /** `onDark` for the navy top bar; `onLight` for the white mobile drawer. */
  variant?: "onDark" | "onLight";
};

export function LanguageSwitch({ variant = "onDark" }: LanguageSwitchProps) {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const hrefEs = getMirrorPath(pathname, "es");
  const hrefEn = getMirrorPath(pathname, "en");
  const labels = layoutCopy[locale].language;
  const onLight = variant === "onLight";

  return (
    <div
      className={cn(
        "flex items-center rounded-md border p-0.5",
        onLight ? "border-slate-200 bg-slate-50" : "border-white/15 bg-white/5",
      )}
      role="group"
      aria-label={labels.aria}
    >
      <Link
        href={hrefEs}
        className={cn(
          "inline-flex items-center justify-center rounded font-semibold uppercase tracking-widest transition",
          onLight
            ? "min-h-12 min-w-12 px-3 text-xs"
            : "px-2.5 py-1 text-[0.65rem]",
          locale === "es"
            ? "bg-[#32B372] text-white"
            : onLight
              ? "text-[#334E88] hover:text-[#252A58]"
              : "text-white/70 hover:text-white",
        )}
        hrefLang="es"
      >
        {labels.es}
      </Link>
      <Link
        href={hrefEn}
        className={cn(
          "inline-flex items-center justify-center rounded font-semibold uppercase tracking-widest transition",
          onLight
            ? "min-h-12 min-w-12 px-3 text-xs"
            : "px-2.5 py-1 text-[0.65rem]",
          locale === "en"
            ? "bg-[#32B372] text-white"
            : onLight
              ? "text-[#334E88] hover:text-[#252A58]"
              : "text-white/70 hover:text-white",
        )}
        hrefLang="en"
      >
        {labels.en}
      </Link>
    </div>
  );
}

"use client";

import { cn } from "@/src/lib/utils";

export type CmsLocale = "es" | "en";

const TABS: { key: CmsLocale; label: string }[] = [
  { key: "es", label: "Español" },
  { key: "en", label: "English" },
];

interface CmsLocaleTabsProps {
  locale: CmsLocale;
  onChange: (locale: CmsLocale) => void;
  className?: string;
}

export function CmsLocaleTabs({ locale, onChange, className }: CmsLocaleTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Idioma del contenido"
      className={cn("inline-flex rounded-lg border border-[#334E88]/20 bg-white p-1", className)}
    >
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={locale === tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-semibold transition",
            locale === tab.key
              ? "bg-[#334E88] text-white"
              : "text-[#334E88] hover:bg-[#334E88]/5",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/** Returns the localized field suffix for ES/EN model fields. */
export function localeField(base: string, locale: CmsLocale): string {
  return locale === "es" ? `${base}_es` : `${base}_en`;
}

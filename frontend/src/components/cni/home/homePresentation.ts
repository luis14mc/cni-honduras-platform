import type { Locale } from "@/src/i18n/config";

export function formatNewsDate(locale: Locale, value: string): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-HN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function statValueSize(value: string): string {
  const len = value.length;
  if (len > 28) return "text-lg md:text-xl";
  if (len > 18) return "text-xl md:text-2xl";
  return "text-2xl md:text-3xl";
}

export function statBackTextSize(text: string): string {
  const len = text.length;
  if (len > 180) return "text-xs md:text-[13px] leading-snug";
  if (len > 120) return "text-[13px] md:text-sm leading-snug";
  return "text-sm md:text-[15px] leading-relaxed";
}

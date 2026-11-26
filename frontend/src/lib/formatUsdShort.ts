import type { Locale } from "@/src/i18n/config";

function formatNumber(locale: Locale, value: number, maximumFractionDigits: number): string {
  return new Intl.NumberFormat(locale === "es" ? "es-HN" : "en-US", {
    useGrouping: "always",
    maximumFractionDigits,
  }).format(value);
}

export function formatUsdShort(locale: Locale, amountUsd: number, original = ""): string {
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) return original.trim() || "—";
  const approx = /^[~≈]/.test(original.trim()) ? "~" : "";
  const isMillion = amountUsd >= 1_000_000;
  const amount = formatNumber(locale, isMillion ? amountUsd / 1_000_000 : amountUsd, isMillion ? 2 : 0);
  return `${approx}USD ${amount}${isMillion ? " MM" : ""}`;
}

export function formatUsdPortfolioTotal(locale: Locale, amountUsd: number): string {
  if (!Number.isFinite(amountUsd) || amountUsd < 1_000_000_000) return formatUsdShort(locale, amountUsd);
  const billions = formatNumber(locale, amountUsd / 1_000_000_000, 1);
  return `USD ${billions} ${locale === "es" ? "mil MM" : "B"}`;
}

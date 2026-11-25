import type { Locale } from "@/src/i18n/config";

export function formatUsdShort(locale: Locale, amountUsd: number, original = ""): string {
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) return original.trim() || "—";
  const approx = /^[~≈]/.test(original.trim()) ? "~" : "";
  const isMillion = amountUsd >= 1_000_000;
  const amount = new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-US", {
    useGrouping: "always",
    maximumFractionDigits: isMillion ? 2 : 0,
  }).format(isMillion ? amountUsd / 1_000_000 : amountUsd);
  return `${approx}USD ${amount}${isMillion ? " MM" : ""}`;
}

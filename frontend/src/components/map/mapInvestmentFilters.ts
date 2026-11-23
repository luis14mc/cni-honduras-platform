import { MAP_INVESTMENT_AMOUNT, type MapInvestmentProject } from "@/src/lib/types/investment-map";

export function matchesInvestmentFilters(
  item: MapInvestmentProject,
  stage: string,
  minimum: string,
  maximum: string,
): boolean {
  if (stage && item.stage !== stage) return false;
  const min = MAP_INVESTMENT_AMOUNT.test(minimum) ? Number(minimum) : null;
  const max = MAP_INVESTMENT_AMOUNT.test(maximum) ? Number(maximum) : null;
  if (min === null && max === null) return true;
  if (item.investment_amount == null || item.investment_amount === "") return false;
  const amount = Number(item.investment_amount);
  return Number.isFinite(amount) && (min === null || amount >= min) && (max === null || amount <= max);
}

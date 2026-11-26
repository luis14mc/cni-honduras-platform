import { describe, expect, it } from "vitest";
import { formatUsdPortfolioTotal, formatUsdShort } from "./formatUsdShort";

describe("formatUsdShort", () => {
  it("formats millions consistently in both locales", () => {
    expect(formatUsdShort("es", 1_702_400_000)).toBe("USD 1,702.4 MM");
    expect(formatUsdShort("en", 1_702_400_000)).toBe("USD 1,702.4 MM");
  });

  it("preserves an approximation and handles smaller amounts", () => {
    expect(formatUsdShort("en", 450_000_000, "~USD 450 MM")).toBe("~USD 450 MM");
    expect(formatUsdShort("es", 850_000)).toBe("USD 850,000");
  });

  it("keeps the source copy when a numeric amount is unavailable", () => {
    expect(formatUsdShort("es", 0, "Por definir")).toBe("Por definir");
    expect(formatUsdShort("en", 0)).toBe("—");
  });
});

describe("formatUsdPortfolioTotal", () => {
  it("uses compact billions for the hero", () => {
    expect(formatUsdPortfolioTotal("es", 5_715_460_000)).toBe("USD 5.7 mil MM");
    expect(formatUsdPortfolioTotal("en", 5_715_460_000)).toBe("USD 5.7 B");
    expect(formatUsdPortfolioTotal("es", 450_000_000)).toBe("USD 450 MM");
  });
});

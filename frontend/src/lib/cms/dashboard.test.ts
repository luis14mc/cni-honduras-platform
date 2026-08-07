import { describe, expect, it } from "vitest";
import {
  buildStatCards,
  describeActivity,
  relativeTime,
} from "@/src/lib/cms/dashboard";
import type { DashboardPayload } from "@/src/lib/cms/types";

const payload: DashboardPayload = {
  counts: {
    news: { total: 5, published: 3, draft: 2 },
    documents: { total: 4, published: 4, draft: 0 },
    banners: { total: 2, published: 1, draft: 1 },
    success_stories: { total: 3, published: 2, draft: 1 },
    sectors: { total: 6, active: 5 },
    opportunities: { total: 7, open: 4 },
  },
  recent_activity: [],
  generated_at: "2026-08-06T12:00:00Z",
};

describe("buildStatCards", () => {
  it("produces six cards with real values", () => {
    const cards = buildStatCards(payload);
    expect(cards).toHaveLength(6);
    const news = cards.find((c) => c.key === "news")!;
    expect(news.value).toBe(5);
    expect(news.hint).toContain("3 publicadas");
    // Banners card surfaces the active/published count.
    expect(cards.find((c) => c.key === "banners")!.value).toBe(1);
  });
});

describe("describeActivity", () => {
  it("labels type and status", () => {
    expect(
      describeActivity({ type: "news", id: 1, label: "x", status: "published", updated_at: "" }),
    ).toBe("Noticia · publicado");
  });
  it("omits status when absent", () => {
    expect(
      describeActivity({ type: "banner", id: 1, label: "x", status: null, updated_at: "" }),
    ).toBe("Banner");
  });
});

describe("relativeTime", () => {
  const now = new Date("2026-08-06T12:00:00Z");
  it("formats minutes", () => {
    expect(relativeTime("2026-08-06T11:30:00Z", now)).toBe("hace 30 min");
  });
  it("formats hours", () => {
    expect(relativeTime("2026-08-06T09:00:00Z", now)).toBe("hace 3 h");
  });
  it("formats days", () => {
    expect(relativeTime("2026-08-01T12:00:00Z", now)).toBe("hace 5 d");
  });
  it("returns a moment for very recent", () => {
    expect(relativeTime("2026-08-06T11:59:40Z", now)).toBe("hace un momento");
  });
});

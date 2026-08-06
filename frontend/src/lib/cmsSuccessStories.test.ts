import { describe, expect, it } from "vitest";
import {
  formatSuccessStoryInvestment,
  formatSuccessStoryJobs,
  successStoryCoverImage,
  successStoryDetailHref,
  successStoryDetailPath,
  successStoryDisplayName,
  successStoryHasCover,
  successStoryHasLogo,
  successStoryInitials,
  successStoryLogoImage,
  successStoryQuote,
} from "@/src/lib/cmsSuccessStories";
import type { SuccessStory } from "@/src/types/investment";

const baseStory: SuccessStory = {
  id: 1,
  title: "Inversión hotelera",
  slug: "inversion-hotelera",
  company_name: "Hotel Group",
  sector: { id: 1, name: "Turismo", slug: "turismo", icon: "", color_hex: "" },
  summary: "Resumen del caso",
  content: "Contenido completo",
  image: "/media/success_stories/2026/01/hotel.jpg",
  logo: { id: 2, file: "/media/logos/hotel.png", alt_text: "Hotel Group" },
  country_origin: "Estados Unidos",
  investment_amount: "25000000",
  jobs_generated: 120,
  testimonial_quote: "Excelente acompañamiento del CNI",
  testimonial_author: "María López",
  is_featured: true,
  order: 1,
  published_at: "2026-01-01T00:00:00Z",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("successStoryCoverImage", () => {
  it("returns CMS image URL", () => {
    expect(successStoryCoverImage(baseStory)).toBe("/media/success_stories/2026/01/hotel.jpg");
  });

  it("returns null when missing", () => {
    expect(successStoryCoverImage({ ...baseStory, image: null })).toBeNull();
    expect(successStoryHasCover({ ...baseStory, image: null })).toBe(false);
  });
});

describe("successStoryLogoImage", () => {
  it("returns logo file from CMS", () => {
    expect(successStoryLogoImage(baseStory)).toBe("/media/logos/hotel.png");
    expect(successStoryHasLogo(baseStory)).toBe(true);
  });

  it("returns null when missing", () => {
    expect(successStoryLogoImage({ ...baseStory, logo: null })).toBeNull();
  });
});

describe("successStory navigation", () => {
  it("builds localized detail href without domain prefix", () => {
    expect(successStoryDetailPath("inversion-hotelera")).toBe("/portafolio/casos/inversion-hotelera");
    expect(successStoryDetailHref("es", "inversion-hotelera")).toBe(
      "/portafolio/casos/inversion-hotelera",
    );
    expect(successStoryDetailHref("en", "inversion-hotelera")).toBe(
      "/en/portfolio/success-stories/inversion-hotelera",
    );
  });
});

describe("successStory display helpers", () => {
  it("prefers testimonial author as display name", () => {
    expect(successStoryDisplayName(baseStory)).toBe("María López");
  });

  it("uses summary as quote fallback", () => {
    expect(successStoryQuote({ ...baseStory, testimonial_quote: "" })).toBe("Resumen del caso");
  });

  it("builds initials when logo is absent", () => {
    expect(successStoryInitials({ ...baseStory, company_name: "Hotel Group" })).toBe("HG");
  });
});

describe("successStory metrics", () => {
  it("formats investment and jobs for ES/EN", () => {
    expect(formatSuccessStoryInvestment("es", "25000000")).toContain("25");
    expect(formatSuccessStoryJobs("en", 120)).toBe("120");
  });
});

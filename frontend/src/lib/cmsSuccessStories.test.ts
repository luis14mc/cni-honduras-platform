import { describe, expect, it } from "vitest";
import { successStoryFormToPayload } from "@/src/lib/cms/editorial/successStories";
import {
  formatSuccessStoryInvestment,
  formatSuccessStoryJobs,
  mapSuccessStoryToCard,
  successStoryCoverImage,
  successStoryDetailHref,
  successStoryDetailPath,
  successStoryDisplayName,
  successStoryHasCover,
  successStoryHasLogo,
  successStoryHasPersonPhoto,
  successStoryInitials,
  successStoryLogoImage,
  successStoryPersonPhoto,
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
  image: "/media/success_stories/2026/01/hotel-legacy.jpg",
  logo: {
    id: 2,
    title: "Logo",
    file: "/media/logos/hotel.png",
    file_url: "https://api.example.com/media/logos/hotel.png",
    alt_text: "Hotel Group",
    caption: "",
    media_type: "image",
    created_at: "2026-01-01T00:00:00Z",
  },
  featured_image: {
    id: 3,
    title: "Featured",
    file: "/media/stories/featured.webp",
    file_url: "https://api.example.com/media/stories/featured.webp",
    alt_text: "Hotel",
    caption: "",
    media_type: "image",
    created_at: "2026-01-01T00:00:00Z",
  },
  person_photo: {
    id: 4,
    title: "Person",
    file: "/media/stories/person.webp",
    file_url: "https://api.example.com/media/stories/person.webp",
    alt_text: "María",
    caption: "",
    media_type: "image",
    created_at: "2026-01-01T00:00:00Z",
  },
  person_name: "María López",
  person_role: "CEO",
  country_origin: "Estados Unidos",
  investment_amount: "25000000",
  jobs_generated: 120,
  testimonial_quote: "Excelente acompañamiento del CNI",
  testimonial_author: "Autor legado",
  is_featured: true,
  order: 1,
  published_at: "2026-01-01T00:00:00Z",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("successStory media roles", () => {
  it("prefers featured_image over legacy image", () => {
    expect(successStoryCoverImage(baseStory)).toBe(
      "https://api.example.com/media/stories/featured.webp",
    );
    expect(successStoryHasCover(baseStory)).toBe(true);
  });

  it("falls back to legacy image when featured missing", () => {
    const story = { ...baseStory, featured_image: null };
    const url = successStoryCoverImage(story);
    expect(url).toContain("/media/success_stories/2026/01/hotel-legacy.jpg");
  });

  it("resolves logo and person photo independently", () => {
    expect(successStoryLogoImage(baseStory)).toBe("https://api.example.com/media/logos/hotel.png");
    expect(successStoryPersonPhoto(baseStory)).toBe(
      "https://api.example.com/media/stories/person.webp",
    );
    expect(successStoryHasLogo(baseStory)).toBe(true);
    expect(successStoryHasPersonPhoto(baseStory)).toBe(true);
    expect(successStoryCoverImage(baseStory)).not.toBe(successStoryLogoImage(baseStory));
    expect(successStoryCoverImage(baseStory)).not.toBe(successStoryPersonPhoto(baseStory));
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
  it("prefers person_name over testimonial_author", () => {
    expect(successStoryDisplayName(baseStory)).toBe("María López");
  });

  it("uses summary as quote fallback", () => {
    expect(successStoryQuote({ ...baseStory, testimonial_quote: "" })).toBe("Resumen del caso");
  });

  it("builds initials when logo is absent", () => {
    expect(successStoryInitials({ ...baseStory, company_name: "Hotel Group" })).toBe("HG");
  });

  it("maps card with distinct cover and person photo", () => {
    const card = mapSuccessStoryToCard(baseStory, "es");
    expect(card.cover).toBe(successStoryCoverImage(baseStory));
    expect(card.personPhoto).toBe(successStoryPersonPhoto(baseStory));
    expect(card.logo).toBe(successStoryLogoImage(baseStory));
    expect(card.cover).not.toBe(card.personPhoto);
  });
});

describe("successStory metrics", () => {
  it("formats investment and jobs for ES/EN", () => {
    expect(formatSuccessStoryInvestment("es", "25000000")).toContain("25");
    expect(formatSuccessStoryJobs("en", 120)).toBe("120");
  });
});

describe("formToPayload", () => {
  it("does not force draft when story is published", () => {
    const payload = successStoryFormToPayload({
      title_es: "T",
      title_en: "T",
      slug: "t",
      company_name: "C",
      sector: null,
      summary_es: "S",
      summary_en: "",
      content_es: "C",
      content_en: "",
      country_origin: "",
      investment_amount: "",
      jobs_generated: null,
      testimonial_quote_es: "",
      testimonial_quote_en: "",
      testimonial_author_es: "",
      testimonial_author_en: "",
      is_featured: false,
      logo: 1,
      featured_image: 2,
      person_photo: 3,
      person_name: "A",
      person_role: "B",
      status: "published",
    });
    expect(payload.status).toBeUndefined();
    expect(payload.logo).toBe(1);
    expect(payload.featured_image).toBe(2);
    expect(payload.person_photo).toBe(3);
  });

  it("sets draft for non-published forms", () => {
    const payload = successStoryFormToPayload({
      title_es: "T",
      title_en: "",
      slug: "",
      company_name: "",
      sector: null,
      summary_es: "",
      summary_en: "",
      content_es: "",
      content_en: "",
      country_origin: "",
      investment_amount: "",
      jobs_generated: null,
      testimonial_quote_es: "",
      testimonial_quote_en: "",
      testimonial_author_es: "",
      testimonial_author_en: "",
      is_featured: false,
      logo: null,
      featured_image: null,
      person_photo: null,
      person_name: "",
      person_role: "",
      status: "draft",
    });
    expect(payload.status).toBe("draft");
  });
});

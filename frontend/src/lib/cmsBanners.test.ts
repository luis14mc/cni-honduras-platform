import { describe, expect, it } from "vitest";
import {
  bannerCtaRel,
  bannerCtaTarget,
  bannerCtaUrl,
  bannerDesktopImage,
  bannerHasCta,
  bannerMobileImage,
  bannerOpensInNewTab,
  bannerCtaIsExternal,
  heroSlideImages,
  primaryHeroBanner,
} from "@/src/lib/cmsBanners";
import type { SiteBanner } from "@/src/types/cms";

const baseBanner: SiteBanner = {
  id: 1,
  placement: "home_hero",
  title: "Invertir en Honduras",
  body: "Oportunidades de inversión",
  cta_label: "Conocer más",
  starts_at: null,
  ends_at: null,
  priority: 5,
  order: 5,
  link_url: "/es/invertir",
  cta_url: "/es/invertir",
  link_external: false,
  open_in_new_tab: false,
  dismissible: false,
  background_color: "",
  text_color: "",
  image: { id: 1, file: "/media/banners/hero-desktop.webp", alt_text: "Hero" },
  mobile_image: { id: 2, file: "/media/banners/hero-mobile.webp", alt_text: "Hero móvil" },
  published_at: "2026-01-01T00:00:00Z",
};

describe("bannerCtaUrl", () => {
  it("prefers cta_url alias", () => {
    expect(bannerCtaUrl(baseBanner)).toBe("/es/invertir");
  });

  it("falls back to link_url", () => {
    const banner = { ...baseBanner, cta_url: "" };
    expect(bannerCtaUrl(banner)).toBe("/es/invertir");
  });
});

describe("bannerOpensInNewTab", () => {
  it("uses open_in_new_tab alias", () => {
    expect(bannerOpensInNewTab({ ...baseBanner, open_in_new_tab: true })).toBe(true);
  });

  it("falls back to link_external", () => {
    const banner = { ...baseBanner, open_in_new_tab: undefined, link_external: true };
    expect(bannerOpensInNewTab(banner)).toBe(true);
  });
});

describe("banner images", () => {
  it("returns absolute desktop and mobile image URLs", () => {
    const banner: SiteBanner = {
      ...baseBanner,
      image: {
        id: 1,
        file: "/media/banners/hero-desktop.webp",
        file_url: "https://api-test.cni.hn/media/banners/hero-desktop.webp",
        alt_text: "Hero",
      },
    };
    expect(bannerDesktopImage(banner)).toBe("https://api-test.cni.hn/media/banners/hero-desktop.webp");
    expect(bannerMobileImage(banner)).toContain("/media/");
  });

  it("falls back mobile to desktop", () => {
    const banner = { ...baseBanner, mobile_image: null };
    expect(bannerMobileImage(banner)).toBe("http://localhost:8000/media/banners/hero-desktop.webp");
  });
});

describe("bannerHasCta", () => {
  it("requires label and URL", () => {
    expect(bannerHasCta(baseBanner)).toBe(true);
    expect(bannerHasCta({ ...baseBanner, cta_label: "" })).toBe(false);
    expect(bannerHasCta({ ...baseBanner, cta_url: "", link_url: "" })).toBe(false);
  });
});

describe("bannerCta navigation", () => {
  it("treats relative paths as internal", () => {
    expect(bannerCtaIsExternal(baseBanner)).toBe(false);
    expect(bannerCtaTarget(baseBanner)).toBeUndefined();
    expect(bannerCtaUrl(baseBanner)).toBe("/es/invertir");
  });

  it("treats external URLs with target and rel", () => {
    const external = {
      ...baseBanner,
      cta_url: "https://example.com/recursos",
      link_url: "https://example.com/recursos",
      link_external: true,
      open_in_new_tab: true,
    };
    expect(bannerCtaIsExternal(external)).toBe(true);
    expect(bannerCtaTarget(external)).toBe("_blank");
    expect(bannerCtaRel(external)).toBe("noopener noreferrer");
  });

  it("does not mutate or prefix internal paths", () => {
    const internal = { ...baseBanner, cta_url: "/en/resources", link_url: "/en/resources" };
    expect(bannerCtaUrl(internal)).toBe("/en/resources");
  });
});

describe("heroSlideImages", () => {
  it("collects desktop images in order", () => {
    const second = {
      ...baseBanner,
      id: 2,
      image: { id: 3, file: "/media/banners/hero-2.webp", alt_text: "2" },
    };
    expect(heroSlideImages([baseBanner, second])).toEqual([
      "http://localhost:8000/media/banners/hero-desktop.webp",
      "http://localhost:8000/media/banners/hero-2.webp",
    ]);
  });
});

describe("primaryHeroBanner", () => {
  it("returns first banner or null", () => {
    expect(primaryHeroBanner([baseBanner])).toEqual(baseBanner);
    expect(primaryHeroBanner([])).toBeNull();
  });
});

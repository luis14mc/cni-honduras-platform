import { homeSectionCopy } from "@/src/i18n/copy/homeSections";
import { useMemo, useState } from "react";
import type { Locale } from "@/src/i18n/config";
import { homeCopy } from "@/src/i18n/copy/home";
import { getSectorHref, withLocale } from "@/src/i18n/path";
import type { NewsArticle, InstitutionalLink } from "@/src/types/cms";
import type { Sector, SuccessStory } from "@/src/types/investment";
import { ledgerChartPalette } from "@/src/lib/themes/architectural-ledger";
import { ledgerHomeShell } from "@/src/lib/themes/ledger-home";
import { designImages } from "@/src/lib/designAssets";
import { mapSuccessStoryToCard, successStoryDetailHref } from "@/src/lib/cmsSuccessStories";
import { sectorIconAssets } from "@/src/lib/sectorIcons";
import { SECTOR_ACCENTS } from "@/src/i18n/copy/invertirPage";
type LoadStatus = "ok" | "error";

export type HomePageProps = {
  locale: Locale;
  latestNews?: NewsArticle[];
  latestNewsStatus?: LoadStatus;
  featuredStories?: SuccessStory[];
  featuredStoriesStatus?: LoadStatus;
  apiSectors?: Sector[];
  sectorsStatus?: LoadStatus;
  interestLinks?: InstitutionalLink[];
  interestLinksStatus?: LoadStatus;
};

export function useHomePage({
  locale,
  latestNews = [],
  latestNewsStatus = "ok",
  featuredStories = [],
  featuredStoriesStatus = "ok",
  apiSectors = [],
  sectorsStatus = "ok",
  interestLinks = [],
  interestLinksStatus = "ok",
}: HomePageProps) {
  const hc = homeCopy[locale];
  const L = (path: string) => withLocale(locale, path);
  const visibleNews = latestNews.slice(0, 3);
  const shell = ledgerHomeShell();

  // 1. Slider interactivo "¿Por qué Honduras?"
  const [whyHondurasIndex, setWhyHondurasIndex] = useState(0);
  const totalWhyHondurasSlides = 3;
  // Estados para tooltips de los gráficos interactivos
  const [iedHoveredBar, setIedHoveredBar] = useState<{ year: string; type: "total" | "semestre" } | null>(null);
  const [pibHoveredIdx, setPibHoveredIdx] = useState<number | null>(null);
  const [climaHoveredBar, setClimaHoveredBar] = useState<{ year: string; countryIndex: number } | null>(null);

  const moveWhyHonduras = (direction: number) => {
    setWhyHondurasIndex((prev) => (prev + direction + totalWhyHondurasSlides) % totalWhyHondurasSlides);
  };

  // 2. Dashboard interactivo de Indicadores Económicos (Simulación AJAX)
  const [activeChart, setActiveChart] = useState<"ied" | "pib" | "clima">("ied");
  const [chartLoading, setChartLoading] = useState(false);

  const handleSwitchChart = (type: "ied" | "pib" | "clima") => {
    if (type === activeChart) return;
    setChartLoading(true);
    setTimeout(() => {
      setActiveChart(type);
      setChartLoading(false);
    }, 400);
  };

  // Datos para los gráficos dinámicos interactivos reales (JSON de la solicitud)
  const ledgerCharts = useMemo(() => ledgerChartPalette(locale), [locale]);

  const IED_DATA = ledgerCharts.ied;

  const PIB_DATA = ledgerCharts.pib;

  const CLIMA_DATA = ledgerCharts.clima;

  const sectorsData = useMemo(() => {
    if (sectorsStatus !== "ok" || apiSectors.length === 0) return [];

    const visualBySlug: Record<string, { iconSrc: string; img: string }> = {
      agroindustria: {
        iconSrc: sectorIconAssets.agroindustria.src,
        img: designImages.sectors.agroindustria,
      },
      manufactura: {
        iconSrc: sectorIconAssets.manufactura.src,
        img: designImages.sectors.manufactura,
      },
      energia: {
        iconSrc: sectorIconAssets.energia.src,
        img: designImages.sectors.energia,
      },
      logistica: {
        iconSrc: sectorIconAssets.logistica.src,
        img: designImages.sectors.logistica,
      },
      turismo: {
        iconSrc: sectorIconAssets.turismo.src,
        img: designImages.sectors.turismo,
      },
      infraestructura: {
        iconSrc: sectorIconAssets.infraestructura.src,
        img: designImages.sectors.infraestructura,
      },
    };

    return [...apiSectors]
      .filter((sector) => sector.is_active)
      .sort((a, b) => a.order - b.order)
      .map((sector) => {
        const visual = visualBySlug[sector.slug];
        const palette = SECTOR_ACCENTS[sector.slug];
        return {
          slug: sector.slug,
          iconSrc: visual?.iconSrc ?? sectorIconAssets.agroindustria.src,
          accent: palette?.accent || sector.color_hex || "#252A58",
          img: visual?.img || sector.image || designImages.sectors.agroindustria,
          name: sector.name,
          desc: sector.short_description || sector.description || "",
          href: getSectorHref(locale, sector.slug),
        };
      });
  }, [apiSectors, locale, sectorsStatus]);

  const { partnerBenefits, testimonialsCopy, dCopy, actionCards, postExtra } = homeSectionCopy(locale);

  const countryLabel = (country: string) =>
    locale === "es" ? `Origen: ${country}` : `Origin: ${country}`;

  const testimonialCards =
    featuredStoriesStatus === "ok"
      ? featuredStories.slice(0, 2).map((story) => mapSuccessStoryToCard(story, locale))
      : [];

  const caseHref = (slug: string) => successStoryDetailHref(locale, slug);

  // Obtener copias específicas para mayor legibilidad
  const prensaCopy = hc.prensa;

  return {
    L,
    actionCards,
    hc,
    locale,
    postExtra,
    whyHondurasIndex,
    totalWhyHondurasSlides,
    moveWhyHonduras,
    iedHoveredBar,
    setIedHoveredBar,
    IED_DATA,
    pibHoveredIdx,
    setPibHoveredIdx,
    PIB_DATA,
    climaHoveredBar,
    setClimaHoveredBar,
    CLIMA_DATA,
    shell,
    activeChart,
    chartLoading,
    handleSwitchChart,
    dCopy,
    sectorsStatus,
    sectorsData,
    partnerBenefits,
    featuredStoriesStatus,
    testimonialsCopy,
    countryLabel,
    testimonialCards,
    caseHref,
    latestNewsStatus,
    visibleNews,
    prensaCopy,
    interestLinks,
    interestLinksStatus,
  };
}

export type HomePageModel = ReturnType<typeof useHomePage>;

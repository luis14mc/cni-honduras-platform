"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/src/i18n/config";
import { homeCopy } from "@/src/i18n/copy/home";
import { getSectorHref, withLocale } from "@/src/i18n/path";
import type { NewsArticle, NewsCategory, InstitutionalLink } from "@/src/types/cms";
import type { Sector, SuccessStory } from "@/src/types/investment";
import { ledgerChartPalette } from "@/src/lib/themes/architectural-ledger";
import { ledgerHomeShell } from "@/src/lib/themes/ledger-home";
import { designImages } from "@/src/lib/designAssets";
import { newsCardImage } from "@/src/lib/cmsNews";
import { sectorIconAssets } from "@/src/lib/sectorIcons";
import { cn } from "@/src/lib/utils";
import { type as t } from "@/src/lib/typography";
import { strategicAlliesLevel1, strategicAlliesLevel2, strategicAllyLogoSize } from "@/src/data/strategicAllies";
import { InterestLinksSection } from "@/src/components/cni/InterestLinksSection";

type LoadStatus = "ok" | "error";

type Props = {
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

const newsCategoryLabels: Record<Locale, Record<NewsCategory, string>> = {
  es: {
    news: "Noticia",
    press_release: "Comunicado",
    event: "Evento",
    announcement: "Anuncio",
    article: "Artículo",
  },
  en: {
    news: "News",
    press_release: "Press release",
    event: "Event",
    announcement: "Announcement",
    article: "Article",
  },
};

function formatNewsDate(locale: Locale, value: string): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-HN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function statValueSize(value: string): string {
  const len = value.length;
  if (len > 28) return "text-lg md:text-xl";
  if (len > 18) return "text-xl md:text-2xl";
  return "text-2xl md:text-3xl";
}

function statBackTextSize(text: string): string {
  const len = text.length;
  if (len > 180) return "text-xs md:text-[13px] leading-snug";
  if (len > 120) return "text-[13px] md:text-sm leading-snug";
  return "text-sm md:text-[15px] leading-relaxed";
}

export function HomePageView({
  locale,
  latestNews = [],
  latestNewsStatus = "ok",
  featuredStories = [],
  featuredStoriesStatus = "ok",
  apiSectors = [],
  sectorsStatus = "ok",
  interestLinks = [],
  interestLinksStatus = "ok",
}: Props) {
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

  // Imágenes de fondo para héroe animado
  const heroImages = [
    "/images/hero/home/agricultura.webp",
    "/images/hero/home/turismo.webp",
    "/images/hero/home/energia.webp",
    "/images/hero/home/logistica.webp"
  ];

  // Datos para los gráficos dinámicos interactivos reales (JSON de la solicitud)
  const ledgerCharts = useMemo(() => ledgerChartPalette(locale), [locale]);

  const IED_DATA = ledgerCharts.ied;

  const PIB_DATA = ledgerCharts.pib;

  const CLIMA_DATA = ledgerCharts.clima;

  const sectorsData = useMemo(() => {
    if (sectorsStatus !== "ok" || apiSectors.length === 0) return [];

    const visualBySlug: Record<
      string,
      { iconSrc: string; accent: string; img: string }
    > = {
      agroindustria: {
        iconSrc: sectorIconAssets.agroindustria.src,
        accent: "#93C01F",
        img: designImages.sectors.agroindustria,
      },
      manufactura: {
        iconSrc: sectorIconAssets.manufactura.src,
        accent: "#7C25A8",
        img: designImages.sectors.manufactura,
      },
      energia: {
        iconSrc: sectorIconAssets.energia.src,
        accent: "#F7BF06",
        img: designImages.sectors.energia,
      },
      logistica: {
        iconSrc: sectorIconAssets.logistica.src,
        accent: "#2EB29C",
        img: designImages.sectors.logistica,
      },
      turismo: {
        iconSrc: sectorIconAssets.turismo.src,
        accent: "#57D0E1",
        img: designImages.sectors.turismo,
      },
      infraestructura: {
        iconSrc: sectorIconAssets.infraestructura.src,
        accent: "#F98639",
        img: designImages.sectors.infraestructura,
      },
    };

    return [...apiSectors]
      .filter((sector) => sector.is_active)
      .sort((a, b) => a.order - b.order)
      .map((sector) => {
        const visual = visualBySlug[sector.slug];
        return {
          slug: sector.slug,
          iconSrc: visual?.iconSrc ?? sectorIconAssets.agroindustria.src,
          accent: sector.color_hex || visual?.accent || "#252A58",
          img: sector.image || visual?.img || designImages.sectors.agroindustria,
          name: sector.name,
          desc: sector.short_description || sector.description || "",
          href: getSectorHref(locale, sector.slug),
        };
      });
  }, [apiSectors, locale, sectorsStatus]);

  const partnerBenefits =
    locale === "es"
      ? [
          { icon: "diversity_3", title: "Acompañamiento Integral" },
          { icon: "person_pin_circle", title: "Punto de Contacto Único" },
          { icon: "manage_search", title: "Información Actualizada" },
          { icon: "cases", title: "Portafolio Exclusivo" },
          { icon: "assured_workload", title: "Respaldo Gubernamental" },
          { icon: "hub", title: "Conexiones Estratégicas" },
        ]
      : [
          { icon: "diversity_3", title: "End-to-End Support" },
          { icon: "person_pin_circle", title: "Single Point of Contact" },
          { icon: "manage_search", title: "Up-to-Date Information" },
          { icon: "cases", title: "Exclusive Portfolio" },
          { icon: "assured_workload", title: "Government Backing" },
          { icon: "hub", title: "Strategic Connections" },
        ];

  const testimonialsCopy = hc.testimonials ?? {
    title: locale === "es" ? "Casos de Éxito" : "Success Stories",
    cta: locale === "es" ? "Ver todos los casos" : "View all cases",
    empty:
      locale === "es"
        ? "Próximamente publicaremos casos de éxito destacados."
        : "Featured success stories will be published here soon.",
    error:
      locale === "es"
        ? "No pudimos cargar los casos de éxito. Intente de nuevo más tarde."
        : "We could not load success stories right now. Please try again later.",
  };

  const testimonialCards =
    featuredStoriesStatus === "ok"
      ? featuredStories.slice(0, 2).map((story) => ({
          slug: story.slug,
          name: story.testimonial_author || story.company_name || story.title,
          role: story.company_name,
          quote: story.testimonial_quote || story.summary,
          caseTitle: story.title,
          photo: story.image || designImages.casos.sinclair,
          logo: story.logo?.file || designImages.casos.sinclair,
          logoAlt: story.title,
        }))
      : [];

  const caseHref = (slug: string) => L(`/portafolio/casos/${slug}`);

  // Obtener copias específicas para mayor legibilidad
  const dCopy = hc.graficosDashboard ?? {
    eyebrow: "Dashboard Inteligente",
    title: "Comparativa Regional",
    downloadBtn: "Descargar Reporte Completo",
    sources: "Fuentes: Banco Central de Honduras, GCBI Index 2025, Proyecciones FMI.",
    ied: {
      label: "Reporte 2024-2025",
      title: "Inversión Extranjera Directa",
      desc: "Honduras consolida su posición como un receptor clave de capital extranjero en Centroamérica, superando expectativas regionales.",
      value: "$993.9M",
      insight: "El crecimiento sostenido en la reinversión de utilidades refleja la confianza del inversor a largo plazo.",
      source: "Fuente: Sección de Balanza de Pagos, Departamento de Sector Externo, BCH",
    },
    pib: {
      label: "Proyección 2024-2029",
      title: "Crecimiento Proyectado PIB",
      desc: "Estimaciones macroeconómicas que posicionan a Honduras con una de las recuperaciones más robustas de la región.",
      value: "3.85%",
      insight: "La estabilidad monetaria y el control inflacionario son pilares de esta proyección positiva.",
      source: "Elaboración propia con datos del Informe Proyecciones 2024-2025, Banco Central de Honduras; CEPAL, Balance Preiminar de las Económias de ALC 2023 (dic. 2023).",
    },
    clima: {
      label: "GCBI Index 2025",
      title: "Facilidad para Negocios",
      desc: "Honduras lidera los índices de confianza corporativa gracias a la digitalización de trámites y seguridad jurídica.",
      value: "60 Pts",
      insight: "Honduras es calificado como el país más confiable para negocios en CA según el GCBI 2025.",
      source: "Elaboración propia con datos de TMF group, 2025.",
    }
  };

  const prensaCopy = hc.prensa;

  const actionCards = hc.actionCards ?? {
    investTitle: "Invertir en Honduras",
    investDesc: "Forma parte de nuestra red de inversionista.",
    growTitle: "Crecer en Honduras",
    growDesc: "Herramientas, inteligencia de mercado y soporte especializado para empresas establecidas.",
    moreInfo: locale === "es" ? "Más información" : "More information"
  };

  const postExtra = hc.postulacionExtra ?? {
    advisoryTitle: "Asesoría Técnica",
    advisoryDesc: "Conoce las oportunidades y proyectos de inversión para expandir tus operaciones en Honduras",
    ctaProject: "Postular Mi Proyecto"
  };

  return (
    <div className={cn("flex flex-1 flex-col overflow-hidden", shell.root)}>

      {/* 1. Animated Hero */}
      <section
        className={cn(
          "relative flex items-center overflow-hidden bg-cni-primary -mt-[5.25rem] pt-[5.25rem] h-screen min-h-[100vh]",
        )}
      >
        <div className="absolute inset-0 z-0">
          {heroImages.map((src, idx) => (
            <div key={idx} className="hero-slide absolute inset-0">
              <Image
                className="object-cover opacity-70"
                src={src}
                alt={hc.hero.imageAlt}
                fill
                priority={idx === 0}
                sizes="100vw"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-cni-primary via-cni-primary/30 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-screen-2xl mx-auto px-8 w-full">
          <h1 className={cn(t.heroTitle, "text-white uppercase leading-[0.9] tracking-tighter")}>
            {hc.hero.titleLine1} <br />
            <span className="text-cni-gold">{hc.hero.titleGrow}</span>
          </h1>
        </div>
      </section>

      {/* 2. Action Entry Points */}
      <section className="py-12 px-8 -mt-24 relative z-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 shadow-2xl rounded-[32px] overflow-hidden relative">
          
          {/* Yin-Yang Curved Divider (desktop only) */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-48 pointer-events-none hidden lg:block z-10">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <path
                d="M 0 0 L 60 0 C 52 30, 48 70, 40 100 L 0 100 Z"
                className="fill-cni-primary"
              />
              <path
                d="M 100 0 L 60 0 C 52 30, 48 70, 40 100 L 100 100 Z"
                className="fill-white"
              />
            </svg>
          </div>

          <Link
            href={L("/invertir")}
            className="group relative overflow-hidden bg-cni-primary text-white p-8 md:p-12 flex flex-col items-center text-center border-b lg:border-b-0 lg:border-r border-cni-gold/20 rounded-t-[32px] lg:rounded-t-none lg:rounded-l-[32px] transition-all duration-500"
          >
            <span className="material-symbols-outlined text-[110px] text-cni-gold/30 group-hover:text-cni-gold group-hover:scale-110 transition-all duration-500 mb-6 select-none">
              add_circle
            </span>
            <h3 className="font-display text-3xl font-extrabold uppercase mb-4 tracking-tight">
              {actionCards.investTitle}
            </h3>
            <p className="font-body text-sm max-w-sm leading-relaxed mb-8 text-white/70">
              {actionCards.investDesc}
            </p>
            <span className="inline-flex items-center gap-2 font-headline font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-full bg-white text-cni-primary group-hover:bg-white/90 group-hover:scale-105 transition-all duration-500 shadow-md">
              {actionCards.moreInfo}
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </span>
          </Link>

          <Link
            href={L("/crecer")}
            className="group relative overflow-hidden bg-white text-cni-primary p-8 md:p-12 flex flex-col items-center text-center rounded-b-[32px] lg:rounded-b-none lg:rounded-r-[32px] transition-all duration-500"
          >
            <span className="material-symbols-outlined text-[110px] text-cni-primary/10 group-hover:text-cni-primary group-hover:scale-110 transition-all duration-500 mb-6 select-none">
              trending_up
            </span>
            <h3 className="font-display text-3xl font-extrabold uppercase mb-4 tracking-tight transition-colors duration-500">
              {actionCards.growTitle}
            </h3>
            <p className="font-body text-sm max-w-sm leading-relaxed mb-8 text-on-surface-variant">
              {actionCards.growDesc}
            </p>
            <span className="inline-flex items-center gap-2 font-headline font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-full bg-cni-primary text-white group-hover:bg-cni-gold group-hover:text-cni-primary group-hover:scale-105 transition-all duration-500 shadow-md">
              {actionCards.moreInfo}
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </span>
          </Link>
        </div>
      </section>

      {/* 3. Facilidades Migratorias */}
      <section className="border-y border-cni-primary/8 bg-[#f8f9ff] py-14 md:py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-8 md:flex-row md:items-center md:gap-14">
          <div className="flex shrink-0 items-center justify-center rounded-2xl bg-cni-primary px-8 py-7 shadow-lg shadow-cni-primary/15 md:px-10 md:py-8">
            <Image
              src="/home_index/imagenes/despacho_logo.png"
              alt={hc.facilidadesMigratorias.logoAlt}
              width={220}
              height={280}
              className="h-auto w-[9.5rem] object-contain md:w-[11rem]"
              priority={false}
            />
          </div>

          <div className="flex-1 text-center md:text-left">
            <p className={cn("mb-3", t.eyebrow)}>
              {hc.facilidadesMigratorias.eyebrow}
            </p>
            <h2 className={t.h2Upper}>
              {hc.facilidadesMigratorias.title}
            </h2>
            <p className={cn("mx-auto mt-4 max-w-xl md:mx-0", t.lead, "text-cni-primary/70")}>
              {hc.facilidadesMigratorias.description}
            </p>
            <Link
              href={L("/facilidades-migratorias")}
              className="mt-8 inline-flex items-center gap-3 bg-cni-primary px-8 py-3.5 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-all hover:bg-[#29AB85] hover:shadow-lg hover:shadow-[#29AB85]/20"
            >
              {hc.facilidadesMigratorias.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Project Submission */}
      <section className="py-28 px-8 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2">
            <h2 className={cn(t.h2Upper, "mb-8 leading-[1.1]")}>
              {locale === "es" ? (
                <>¿TIENES UN PROYECTO <br /><span className="text-cni-gold">DE INVERSIÓN?</span></>
              ) : (
                <>Project <br /><span className="text-cni-gold">Submission</span></>
              )}
            </h2>
            <p className={cn(t.lead, "mb-10")}>
              {hc.postulacion.description}
            </p>
            <Link
              href={L("/postulacion-de-proyectos")}
              className="bg-cni-primary text-white px-10 py-4 rounded-DEFAULT font-headline font-bold text-[12px] tracking-[0.2em] uppercase hover:bg-cni-gold hover:text-cni-primary transition-all inline-flex items-center gap-4"
            >
              {postExtra.ctaProject}
              <span className="material-symbols-outlined">send</span>
            </Link>
          </div>

          <div className="lg:w-1/2 relative w-full">
            <div className="aspect-video bg-cni-primary overflow-hidden shadow-2xl relative">
              <Image
                alt="Colaboración profesional"
                className="object-cover opacity-50"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqlhU_RbYvkxBlYzAj4-JtinsyOxfbNJWy3dijV5GdOD--pP85WIxoiQ7Sk0Q-lRYx5sMe7kzQ9jIcHdOVm2s-dmhYYOGr1LHnyFIi9Jph5IoX_fNsF4hHqhdugIzWl9t7eGGor3MD99NX2QA6-mO-uxN97DKeH2m9pItMpoZlymNvIiga0_Uokz5xO5dN_fospS89vsPMohMijrLWO6LVrvX4k3OiF6ww07a2JJFkhX614J_rk3IE27CvkIR0gvbFmNDamGonIFU"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-8 -left-4 md:-left-8 bg-cni-gold p-10 text-cni-primary max-w-xs shadow-xl">
              <p className="font-headline text-[10px] font-extrabold uppercase tracking-[0.3em] mb-3">
                {postExtra.advisoryTitle}
              </p>
              <p className="font-body text-sm font-medium leading-relaxed">
                {postExtra.advisoryDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      <InterestLinksSection
        locale={locale}
        links={interestLinks}
        status={interestLinksStatus}
      />

      {/* 5. Why Honduras Slider */}
      <section className="py-32 bg-cni-primary text-white overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* Left Column: Institutional Image */}
            <div className="relative group w-full h-full flex items-center justify-center">
              {/* Decorative elements */}
              <div className="absolute -inset-4 border border-cni-gold/20 rounded-[40px] group-hover:scale-105 group-hover:border-cni-gold/40 transition-all duration-700 pointer-events-none"></div>
              <div className="absolute -inset-8 border border-white/5 rounded-[50px] group-hover:scale-105 transition-all duration-1000 pointer-events-none"></div>
              
              <div className="relative w-full aspect-square md:h-[600px] overflow-visible flex items-center justify-center p-4">
                
                {/* Ambient Radial Glow Behind the Map */}
                <div className="absolute w-[280px] h-[280px] md:w-[450px] md:h-[450px] bg-gradient-to-tr from-cni-gold/20 to-cni-primary/40 rounded-full blur-[60px] md:blur-[90px] pointer-events-none group-hover:bg-cni-gold/30 group-hover:scale-110 transition-all duration-1000 z-0"></div>

                <Image
                  alt="Mapa de Honduras"
                  className="object-contain p-4 transition-all duration-700 group-hover:scale-[1.03] group-hover:-translate-y-2 z-10 drop-shadow-[0_20px_20px_rgba(233,193,118,0.15)]"
                  src="/images/home/mapa-nuevo.png"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />

              </div>
            </div>

            {/* Right Column: Carousel Content */}
            <div className="flex flex-col w-full">
              <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight uppercase mb-12">
                {locale === "es" ? (
                  <>¿Por qué <span className="text-cni-gold">Honduras?</span></>
                ) : (
                  <>Why <span className="text-cni-gold">Honduras?</span></>
                )}
              </h2>

              <div className="relative overflow-hidden w-full">
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${whyHondurasIndex * 100}%)` }}
                >
                  {hc.porque.cards.map((card, i) => (
                    <div key={i} className="min-w-full">
                      <span className="font-display text-7xl font-extrabold text-white/10 mb-6 block select-none">
                        0{i + 1}
                      </span>
                      <h3 className="font-headline text-3xl font-bold uppercase mb-6 tracking-wide text-cni-gold">
                        {card.title}
                      </h3>
                      <p className="text-white/70 font-body leading-relaxed text-lg max-w-lg">
                        {card.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-8 mt-16">
                <div className="flex gap-3">
                  <button
                    onClick={() => moveWhyHonduras(-1)}
                    className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-cni-gold hover:text-cni-primary hover:border-cni-gold transition-all"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <button
                    onClick={() => moveWhyHonduras(1)}
                    className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-cni-gold hover:text-cni-primary hover:border-cni-gold transition-all"
                  >
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  {[...Array(totalWhyHondurasSlides)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-300 ${i === whyHondurasIndex ? "w-8 bg-cni-gold" : "w-8 bg-white/20"
                        }`}
                    />
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 6. Economic Indicators Slider (Dashboard) */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-8">

          <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-10">
            <div className="max-w-xl">
              <p className={cn("mb-4", t.eyebrow, "text-cni-gold tracking-[0.4em]")}>
                {dCopy.eyebrow}
              </p>
              <h2 className={cn(t.h2Upper, "mb-6 leading-tight")}>
                {locale === "es" ? (
                  <>Comparativa <span className="text-cni-gold">Regional</span></>
                ) : (
                  <>Regional <span className="text-cni-gold">Comparison</span></>
                )}
              </h2>
              <div className="h-1.5 w-28 bg-cni-gold"></div>
            </div>

            {/* Switch Buttons */}
            <nav className="flex flex-wrap gap-2 bg-cni-primary/5 p-1.5 rounded-full border border-cni-primary/10">
              <button
                onClick={() => handleSwitchChart("ied")}
                className={`px-8 py-3 rounded-full font-headline font-bold text-[11px] uppercase tracking-widest transition-all ${activeChart === "ied"
                  ? "bg-cni-primary text-white shadow-lg"
                  : "text-cni-primary hover:bg-cni-primary/10"
                  }`}
              >
                {locale === "es" ? "Inversión Extranjera" : "Foreign Investment"}
              </button>
              <button
                onClick={() => handleSwitchChart("pib")}
                className={`px-8 py-3 rounded-full font-headline font-bold text-[11px] uppercase tracking-widest transition-all ${activeChart === "pib"
                  ? "bg-cni-primary text-white shadow-lg"
                  : "text-cni-primary hover:bg-cni-primary/10"
                  }`}
              >
                {locale === "es" ? "Crecimiento PIB" : "GDP Growth"}
              </button>
              <button
                onClick={() => handleSwitchChart("clima")}
                className={`px-8 py-3 rounded-full font-headline font-bold text-[11px] uppercase tracking-widest transition-all ${activeChart === "clima"
                  ? "bg-cni-primary text-white shadow-lg"
                  : "text-cni-primary hover:bg-cni-primary/10"
                  }`}
              >
                {locale === "es" ? "Facilidad de Negocios" : "Ease of Doing Business"}
              </button>
            </nav>
          </div>

          <div className="relative bg-cni-primary rounded-xl overflow-hidden shadow-2xl border border-white/10 group min-h-[650px]">

            {/* Loading Overlay */}
            <div
              className={`absolute inset-0 bg-cni-primary/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4 transition-opacity duration-300 ${chartLoading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            >
              <div className="w-12 h-12 border-4 border-cni-gold border-t-transparent rounded-full animate-spin"></div>
              <p className="font-headline text-[10px] uppercase tracking-[0.3em] text-white">
                {locale === "es" ? "Actualizando Datos..." : "Updating Data..."}
              </p>
            </div>

            {/* Background Dot Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: shell.dotGrid,
                  backgroundSize: "32px 32px"
                }}
              ></div>
            </div>

            {/* Dashboard Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative z-10 min-h-[650px] w-full">

              {/* Left Sidebar Stats */}
              <div className="lg:col-span-4 p-12 bg-white/5 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between">
                <div>
                  <div className="mb-12">
                    <span className="inline-block px-3 py-1 bg-cni-gold text-cni-primary font-headline font-extrabold text-[9px] uppercase tracking-widest mb-6 rounded-full">
                      {dCopy[activeChart].label}
                    </span>
                    <h3 className={cn(t.h2OnDark, "uppercase leading-none mb-6")}>
                      {dCopy[activeChart].title}
                    </h3>
                    <p className="text-white/60 font-body text-sm leading-relaxed">
                      {dCopy[activeChart].desc}
                    </p>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <p className="text-white/40 font-headline text-[10px] uppercase tracking-widest mb-2">
                        {locale === "es" ? "Valor Destacado (Honduras)" : "Featured Value (Honduras)"}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-display font-extrabold text-cni-gold">
                          {dCopy[activeChart].value}
                        </span>
                        <span className="material-symbols-outlined text-sm text-cni-gold al-accent-metric">trending_up</span>
                      </div>
                    </div>

                    <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="material-symbols-outlined text-cni-gold">insights</span>
                        <p className="font-headline text-xs font-bold uppercase text-white tracking-wider">
                          {locale === "es" ? "Insight del Sector" : "Sector Insight"}
                        </p>
                      </div>
                      <p className="text-white/50 text-xs leading-relaxed font-body">
                        {dCopy[activeChart].insight}
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href={L("/recursos")}
                  className="mt-12 w-full py-4 border border-white/20 text-white font-headline text-[11px] font-bold uppercase tracking-widest hover:bg-white hover:text-cni-primary transition-all flex items-center justify-center gap-3 text-center"
                >
                  {dCopy.downloadBtn}
                  <span className="material-symbols-outlined text-[16px]">download</span>
                </a>
              </div>

              {/* Right Chart display */}
              <div className="lg:col-span-8 p-8 md:p-16 flex flex-col justify-center">
                <div className="relative flex-grow bg-white/[0.02] rounded-xl border border-white/5 overflow-visible flex items-center justify-center min-h-[350px]">
                  {/* Active Chart view - Dynamic Chart */}
                  <div className="w-full h-full p-6 flex flex-col justify-end min-h-[400px] text-white">
                    <style dangerouslySetInnerHTML={{__html: `
                      @keyframes bounceShort {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-3px); }
                      }
                      .animate-bounce-short {
                        animation: bounceShort 1.5s ease-in-out infinite;
                      }
                    `}} />

                    {activeChart === "ied" && (
                      <div className="w-full h-full flex flex-col justify-between min-h-[350px]">
                        {/* Grid / Values Container */}
                        <div className="relative flex-grow h-72 w-full flex items-end border-b border-white/10 pb-2">
                          {/* Grid Lines */}
                          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-white/30">
                            {[1200, 900, 600, 300, 0].map((v, i) => (
                              <div key={i} className="w-full flex items-center gap-2 h-0">
                                <span className="w-8 text-right select-none">{v}</span>
                                <div className="flex-grow border-t border-white/5" />
                              </div>
                            ))}
                          </div>

                          {/* Columns Container */}
                          <div className="w-full h-full flex justify-between items-end pl-10 pr-2 z-10">
                            {IED_DATA.labels.map((year, yearIdx) => {
                              const totalVal = IED_DATA.datasets[0].data[yearIdx];
                              const semestreVal = IED_DATA.datasets[1].data[yearIdx];

                              const totalHeight = totalVal ? (totalVal / 1200) * 100 : 0;
                              const semestreHeight = (semestreVal / 1200) * 100;

                              return (
                                <div key={year} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                                  {/* Bars Row - Hover wrappers covering full height */}
                                  <div className="flex items-end gap-1 md:gap-2.5 h-full pb-1 w-full justify-center">
                                    {/* Total Bar Hover Wrapper */}
                                    {totalVal !== undefined && (
                                      <div
                                        className="h-full flex-1 flex items-end justify-center cursor-pointer px-0.5 md:px-1"
                                        onMouseEnter={() => setIedHoveredBar({ year, type: "total" })}
                                        onMouseLeave={() => setIedHoveredBar(null)}
                                      >
                                        <div
                                          className="w-2.5 md:w-5 rounded-t transition-all duration-300 relative"
                                          style={{
                                            height: `${totalHeight}%`,
                                            backgroundColor: IED_DATA.datasets[0].color,
                                            opacity: iedHoveredBar ? (iedHoveredBar.year === year && iedHoveredBar.type === "total" ? 1 : 0.5) : 0.9,
                                            transform: iedHoveredBar?.year === year && iedHoveredBar?.type === "total" ? "scaleY(1.02)" : "scaleY(1)",
                                            transformOrigin: "bottom"
                                          }}
                                        >
                                        </div>
                                      </div>
                                    )}

                                    {/* Semestre Bar Hover Wrapper */}
                                    <div
                                      className="h-full flex-1 flex items-end justify-center cursor-pointer px-0.5 md:px-1"
                                      onMouseEnter={() => setIedHoveredBar({ year, type: "semestre" })}
                                      onMouseLeave={() => setIedHoveredBar(null)}
                                    >
                                      <div
                                        className="w-2.5 md:w-5 rounded-t transition-all duration-300 relative"
                                        style={{
                                          height: `${semestreHeight}%`,
                                          backgroundColor: IED_DATA.datasets[1].color,
                                          opacity: iedHoveredBar ? (iedHoveredBar.year === year && iedHoveredBar.type === "semestre" ? 1 : 0.5) : 0.9,
                                          transform: iedHoveredBar?.year === year && iedHoveredBar?.type === "semestre" ? "scaleY(1.02)" : "scaleY(1)",
                                          transformOrigin: "bottom"
                                        }}
                                      >
                                      </div>
                                    </div>
                                  </div>

                                  {/* Tooltip */}
                                  {iedHoveredBar?.year === year && (
                                    <div className="absolute bottom-full mb-3 bg-white text-cni-primary p-3 rounded-lg shadow-2xl border-b-4 border-cni-gold pointer-events-none z-20 flex flex-col items-center min-w-[120px] transition-all">
                                      <span className="font-headline text-[9px] font-extrabold uppercase text-cni-primary/60 tracking-wider">
                                        {year} - {iedHoveredBar.type === "total" ? "Total" : (locale === "es" ? "I Semestre" : "1st Sem.")}
                                      </span>
                                      <span className="font-display text-base font-extrabold text-cni-primary mt-0.5 animate-bounce-short">
                                        ${iedHoveredBar.type === "total" ? totalVal : semestreVal}M
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* X Axis Labels */}
                        <div className="w-full flex justify-between pl-10 pr-2 pt-3 text-[10px] md:text-xs font-headline font-bold uppercase tracking-wider text-white/50">
                          {IED_DATA.labels.map((year) => (
                            <div key={year} className="flex-1 text-center">
                              {year}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeChart === "pib" && (
                      <div className="w-full h-full flex flex-col justify-between min-h-[350px] relative">
                        {/* SVG container */}
                        <div className="relative flex-grow w-full h-72">
                          <svg
                            viewBox="0 0 600 300"
                            className="w-full h-full overflow-visible"
                          >
                            {/* Horizontal grid lines */}
                            {[4.0, 3.5, 3.0, 2.5].map((v, i) => {
                              const y = 30 + ((4.0 - v) / 1.5) * 225;
                              return (
                                <g key={i}>
                                  <line
                                    x1="50"
                                    y1={y}
                                    x2="570"
                                    y2={y}
                                    stroke="rgba(255,255,255,0.08)"
                                    strokeDasharray="4 4"
                                  />
                                  <text
                                    x="40"
                                    y={y + 3}
                                    fill="rgba(255,255,255,0.4)"
                                    fontSize="10"
                                    textAnchor="end"
                                    className="font-headline font-bold"
                                  >
                                    {v.toFixed(1)}%
                                  </text>
                                </g>
                              );
                            })}

                            {/* X Axis labels inside SVG to align perfectly */}
                            {PIB_DATA.labels.map((year, idx) => {
                              const x = 50 + (idx / 5) * 520;
                              return (
                                <text
                                  key={idx}
                                  x={x}
                                  y="285"
                                  fill="rgba(255,255,255,0.4)"
                                  fontSize="10"
                                  textAnchor="middle"
                                  className="font-headline font-bold"
                                >
                                  {year}
                                </text>
                              );
                            })}

                            {/* Hover vertical guideline */}
                            {pibHoveredIdx !== null && (
                              <line
                                x1={50 + (pibHoveredIdx / 5) * 520}
                                y1="30"
                                x2={50 + (pibHoveredIdx / 5) * 520}
                                y2="255"
                                stroke="#cbb281"
                                strokeWidth="1.5"
                                strokeDasharray="3 3"
                              />
                            )}

                            {/* Lines */}
                            {PIB_DATA.datasets.map((dataset, cIdx) => {
                              const d = dataset.data
                                .map((val, idx) => {
                                  const x = 50 + (idx / 5) * 520;
                                  const y = 30 + ((4.0 - val) / 1.5) * 225;
                                  return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                                })
                                .join(" ");

                              return (
                                <path
                                  key={cIdx}
                                  d={d}
                                  stroke={dataset.color}
                                  strokeWidth={pibHoveredIdx !== null ? "2" : "3"}
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="transition-all duration-300"
                                  style={{
                                    opacity: pibHoveredIdx !== null ? 0.3 : 1
                                  }}
                                />
                              );
                            })}

                            {/* Highlighted active country lines on hover */}
                            {pibHoveredIdx !== null && PIB_DATA.datasets.map((dataset, cIdx) => {
                              const d = dataset.data
                                .map((val, idx) => {
                                  const x = 50 + (idx / 5) * 520;
                                  const y = 30 + ((4.0 - val) / 1.5) * 225;
                                  return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                                })
                                .join(" ");

                              return (
                                <path
                                  key={`highlight-${cIdx}`}
                                  d={d}
                                  stroke={dataset.color}
                                  strokeWidth="3.5"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="pointer-events-none"
                                  style={{
                                    clipPath: `inset(0px ${600 - (50 + (pibHoveredIdx / 5) * 520 + 8)}px 0px ${50 + (pibHoveredIdx / 5) * 520 - 8}px)`
                                  }}
                                />
                              );
                            })}

                            {/* Dots for each point */}
                            {PIB_DATA.datasets.map((dataset, cIdx) => {
                              return dataset.data.map((val, idx) => {
                                const x = 50 + (idx / 5) * 520;
                                const y = 30 + ((4.0 - val) / 1.5) * 225;
                                const isCurrentYearHovered = pibHoveredIdx === idx;

                                return (
                                  <circle
                                    key={`${cIdx}-${idx}`}
                                    cx={x}
                                    cy={y}
                                    r={isCurrentYearHovered ? "5" : "0"}
                                    fill={dataset.color}
                                    stroke="white"
                                    strokeWidth={isCurrentYearHovered ? "1.5" : "0"}
                                    className="transition-all duration-300 pointer-events-none"
                                    style={{
                                      opacity: pibHoveredIdx !== null && !isCurrentYearHovered ? 0 : 1
                                    }}
                                  />
                                );
                              });
                            })}

                            {/* Transparent columns for hovering */}
                            {PIB_DATA.labels.map((year, idx) => {
                              const x = 50 + (idx / 5) * 520;
                              const colW = 520 / 5;
                              const hoverX = x - colW / 2;
                              return (
                                <rect
                                  key={idx}
                                  x={hoverX}
                                  y="10"
                                  width={colW}
                                  height="270"
                                  fill="transparent"
                                  className="cursor-pointer"
                                  onMouseEnter={() => setPibHoveredIdx(idx)}
                                  onMouseLeave={() => setPibHoveredIdx(null)}
                                />
                              );
                            })}
                          </svg>

                          {/* Consolidate Tooltip showing all countries */}
                          {pibHoveredIdx !== null && (
                            <div
                              className="absolute bg-white text-cni-primary p-3 rounded-lg shadow-2xl border-b-4 border-cni-gold pointer-events-none z-20 flex flex-col gap-1.5 min-w-[150px] transition-all"
                              style={{
                                bottom: "80px",
                                left: `${Math.min(Math.max(50 + (pibHoveredIdx / 5) * 520 - 75, 10), 440)}px`
                              }}
                            >
                              <span className="font-headline text-[9px] font-extrabold uppercase text-cni-primary/60 tracking-wider text-center border-b border-cni-primary/10 pb-1 mb-1">
                                {locale === "es" ? "Proyección" : "Projection"} {PIB_DATA.labels[pibHoveredIdx]}
                              </span>
                              {PIB_DATA.datasets.map((ds, cIdx) => (
                                <div key={cIdx} className="flex justify-between items-center gap-4 text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ds.color }} />
                                    <span className="font-headline font-bold text-cni-primary">{ds.label}</span>
                                  </div>
                                  <span className="font-display font-extrabold text-cni-primary">
                                    {ds.data[pibHoveredIdx]}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeChart === "clima" && (
                      <div className="w-full h-full flex flex-col justify-between min-h-[350px]">
                        {/* Grid / Values Container */}
                        <div className="relative flex-grow h-72 w-full flex items-end border-b border-white/10 pb-2">
                          {/* Grid Lines */}
                          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-white/30">
                            {[70, 60, 50, 40, 30, 20, 10, 0].map((v, i) => (
                              <div key={i} className="w-full flex items-center gap-2 h-0">
                                <span className="w-8 text-right select-none">{v}</span>
                                <div className="flex-grow border-t border-white/5" />
                              </div>
                            ))}
                          </div>

                          {/* Columns Container */}
                          <div className="w-full h-full flex justify-around items-end pl-10 pr-2 z-10">
                            {CLIMA_DATA.labels.map((year, yearIdx) => {
                              return (
                                <div key={year} className="flex-1 flex flex-col items-center justify-end h-full relative group px-1 md:px-3">
                                  {/* Bars Row - Hover wrappers covering full height */}
                                  <div className="flex items-end gap-0.5 md:gap-1.5 h-full pb-1 w-full justify-center">
                                    {CLIMA_DATA.datasets.map((dataset, cIdx) => {
                                      const val = dataset.data[yearIdx];
                                      const barHeight = (val / 70) * 100;
                                      const isHovered = climaHoveredBar?.year === year && climaHoveredBar?.countryIndex === cIdx;

                                      return (
                                        <div
                                          key={cIdx}
                                          className="h-full flex-1 flex items-end justify-center cursor-pointer px-0.5"
                                          onMouseEnter={() => setClimaHoveredBar({ year, countryIndex: cIdx })}
                                          onMouseLeave={() => setClimaHoveredBar(null)}
                                        >
                                          <div
                                            className="w-[5px] md:w-3.5 rounded-t transition-all duration-300 relative"
                                            style={{
                                              height: `${barHeight}%`,
                                              backgroundColor: dataset.color,
                                              opacity: climaHoveredBar ? (isHovered ? 1.0 : 0.4) : 0.9,
                                              transform: isHovered ? "scaleY(1.02)" : "scaleY(1)",
                                              transformOrigin: "bottom"
                                            }}
                                          >
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Tooltip */}
                                  {climaHoveredBar?.year === year && (
                                    <div className="absolute bottom-full mb-3 bg-white text-cni-primary p-3 rounded-lg shadow-2xl border-b-4 border-cni-gold pointer-events-none z-20 flex flex-col items-center min-w-[130px] transition-all">
                                      <span className="font-headline text-[9px] font-extrabold uppercase text-cni-primary/60 tracking-wider text-center">
                                        {CLIMA_DATA.datasets[climaHoveredBar.countryIndex].label} - {year}
                                      </span>
                                      <span className="font-display text-base font-extrabold text-cni-primary mt-0.5 animate-bounce-short">
                                        {CLIMA_DATA.datasets[climaHoveredBar.countryIndex].data[yearIdx]} Pts
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* X Axis Labels */}
                        <div className="w-full flex justify-between pl-10 pr-2 pt-3 text-[10px] md:text-xs font-headline font-bold uppercase tracking-wider text-white/50">
                          {CLIMA_DATA.labels.map((year) => (
                            <div key={year} className="flex-1 text-center">
                              {year}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-6 w-full">
                  <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-start">
                    {activeChart === "ied" && IED_DATA.datasets.map((ds, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ds.color }} />
                        <span className="text-white/70 font-headline text-[10px] uppercase tracking-widest">{ds.label}</span>
                      </div>
                    ))}
                    {activeChart === "pib" && PIB_DATA.datasets.map((ds, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ds.color }} />
                        <span className="text-white/70 font-headline text-[10px] uppercase tracking-widest">{ds.label}</span>
                      </div>
                    ))}
                    {activeChart === "clima" && CLIMA_DATA.datasets.map((ds, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ds.color }} />
                        <span className="text-white/70 font-headline text-[10px] uppercase tracking-widest">{ds.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-white/40 text-[10px] font-body italic text-center md:text-right">
                    {dCopy[activeChart].source}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 7. Honduras in Figures */}
      <section className="relative py-24 md:py-32 bg-cni-primary overflow-hidden">
        <div className="al-figures-bg absolute inset-0 pointer-events-none" aria-hidden>
          <div className="al-figures-orb al-figures-orb--teal" />
          <div className="al-figures-orb al-figures-orb--green" />
          <div className="al-figures-orb al-figures-orb--accent" />
          <div className="al-figures-shine" />
          <div className="al-figures-beam" />
        </div>

        <div className="max-w-screen-2xl mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">

            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <div className="border-l border-white/20 pl-6 md:pl-8">
                <h2 className={cn(t.h2Upper, "text-white leading-[1.05] lg:text-[3.25rem]")}>
                  <span className="text-cni-gold block mb-1">Honduras</span>
                  {locale === "es" ? "en cifras" : "in figures"}
                </h2>
                <div className="h-1 w-20 bg-cni-gold mt-6" />
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[
                  {
                    value: "112,777",
                    label: "Km² de Extensión Territorial",
                    iconSrc: "/home_index/iconos-cifras/extension-1.svg",
                    backText:
                      "Honduras se destaca como el segundo país más grande de Centroamérica, ofreciendo una ubicación estratégica, vastos recursos naturales y un entorno ideal para la inversión.",
                  },
                  {
                    value: "Más de 9.89 M",
                    label: "de Habitantes. fuerza laboral joven y dinámica",
                    iconSrc: "/home_index/iconos-cifras/ubicacion-1.svg",
                    backText:
                      "Honduras cuenta con una fuerza laboral joven y dinámica, con una edad promedio de 31 años y 7.0 millones de personas en edad de trabajar, lista para impulsar el crecimiento empresarial.",
                  },
                  {
                    value: "Más de 108,250 Egresados",
                    label: "En educación superior(2021 - 2024)",
                    iconSrc: "/home_index/iconos-cifras/educacion-1.svg",
                    backText:
                      "Con 21 instituciones de educación superior, Honduras forma talento diversificado en ciencias sociales (28 %), ciencias administrativas (20 %), ingenierías y TIC (15 %), y en ciencias de la salud (8 %), además de otras áreas, posgrados y técnicos altamente capacitados.",
                  },
                  {
                    value: "Más del 58.6%",
                    label: "de la energía proviene de fuentes renovables",
                    iconSrc: "/home_index/iconos-cifras/energia-1.svg",
                    backText:
                      "Honduras cuenta con una matriz diversificada que incluye 10 tipos de energéticos para la generación eléctrica.",
                  },
                  {
                    value: "En 2024 el 35.3%",
                    label: "de las exportaciones totales correspondieron a productos textiles",
                    iconSrc: "/home_index/iconos-cifras/textiles-1.svg",
                    backText:
                      "Honduras cuenta con una matriz diversificada que incluye 10 tipos de energéticos para la generación eléctrica.",
                  },
                  {
                    value: "11 tratados de Libre Comercio",
                    label: "que abarcan 45 naciones",
                    iconSrc: "/home_index/iconos-cifras/aviones-1.svg",
                    backText:
                      "Honduras exporta más de 3,200 productos al año a más de 120 países en todo el mundo, respaldado por 11 tratados de libre comercio que abarcan más de 45 naciones, facilitando el acceso a mercados globales estratégicos.",
                  },
                ].map((stat, i) => (
                  <div key={i} className="flip-card w-full aspect-square">
                    <div className="flip-card-inner h-full shadow-xl rounded-xl">

                      {/* Front */}
                      <div className="flip-card-front bg-white/[0.04] backdrop-blur-[2px] p-5 md:p-7 border border-white/10 rounded-xl flex flex-col items-center justify-center text-center">
                        <Image
                          src={stat.iconSrc}
                          alt=""
                          aria-hidden
                          width={56}
                          height={56}
                          className="mb-4 h-11 w-auto md:h-12 object-contain shrink-0"
                        />
                        <div className="flex min-h-[3.25rem] md:min-h-[3.75rem] items-center justify-center mb-2 px-1">
                          <span
                            className={cn(
                              "font-display font-extrabold text-white text-balance leading-tight",
                              statValueSize(stat.value),
                            )}
                          >
                            {stat.value}
                          </span>
                        </div>
                        <p className="font-headline text-[11px] md:text-xs font-semibold uppercase tracking-wide text-white/65 leading-snug px-1">
                          {stat.label}
                        </p>
                      </div>

                      {/* Back */}
                      <div className="flip-card-back bg-cni-gold p-5 md:p-7 rounded-xl flex flex-col items-center justify-center text-center overflow-hidden relative">
                        <Image
                          src={stat.iconSrc}
                          alt=""
                          aria-hidden
                          width={128}
                          height={128}
                          className="pointer-events-none absolute inset-0 m-auto h-24 w-auto opacity-[0.12] select-none md:h-28"
                        />

                        <p
                          className={cn(
                            "font-body text-cni-primary font-medium text-balance relative z-10 px-1",
                            statBackTextSize(stat.backText),
                          )}
                        >
                          {stat.backText}
                        </p>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. Sectores Estratégicos */}
      <section className="py-24 md:py-28 bg-cni-surface-low">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="mb-12 md:mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h2 className={cn(t.h2Upper, "leading-tight")}>
                {locale === "es" ? "Sectores Estratégicos" : "Strategic Sectors"}
              </h2>
              <div className="h-1 w-20 bg-cni-gold mt-4" />
            </div>
            <Link
              href={L("/invertir")}
              className="inline-flex items-center gap-2 font-headline text-[11px] font-extrabold uppercase tracking-[0.15em] text-cni-primary transition-colors hover:text-cni-gold"
            >
              {locale === "es" ? "Ver todos los sectores" : "View all sectors"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectorsStatus === "error" ? (
              <div
                role="alert"
                className="sm:col-span-2 lg:col-span-3 rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center text-sm text-red-800"
              >
                {locale === "es"
                  ? "No pudimos cargar los sectores. Intente de nuevo más tarde."
                  : "We could not load sectors right now. Please try again later."}
              </div>
            ) : sectorsData.length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-dashed border-cni-primary/15 bg-white px-6 py-12 text-center text-sm text-cni-primary/60">
                {locale === "es"
                  ? "Próximamente publicaremos los sectores priorizados."
                  : "Priority sectors will be published here soon."}
              </div>
            ) : (
              sectorsData.map((sector) => (
              <Link
                key={sector.slug}
                href={sector.href}
                className="al-sector-card group relative flex min-h-[340px] flex-col overflow-hidden rounded-2xl bg-white p-7 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{
                  boxShadow: "0 4px 24px rgba(37, 42, 88, 0.06)",
                  ["--sector-accent" as string]: sector.accent,
                }}
              >
                <div
                  className="absolute left-0 top-8 bottom-8 w-1.5 rounded-r-full transition-all duration-300 group-hover:top-6 group-hover:bottom-6 group-hover:w-2"
                  style={{ backgroundColor: sector.accent }}
                  aria-hidden
                />

                <div
                  className="absolute inset-x-0 top-0 h-1 opacity-80"
                  style={{ backgroundColor: sector.accent }}
                  aria-hidden
                />

                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-[0.08]"
                  aria-hidden
                >
                  <Image src={sector.img} alt="" fill sizes="33vw" className="object-cover" />
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, ${sector.accent}33 0%, transparent 55%)` }}
                  />
                </div>

                <div className="relative flex flex-1 flex-col pl-4">
                  <div
                    className="mb-6 flex h-[100px] w-[100px] md:h-[112px] md:w-[112px] items-center justify-center rounded-2xl border-2 transition-transform duration-300 group-hover:scale-105"
                    style={{
                      backgroundColor: `${sector.accent}18`,
                      borderColor: `${sector.accent}40`,
                    }}
                  >
                    <Image
                      src={sector.iconSrc}
                      alt=""
                      width={88}
                      height={88}
                      className="h-[76px] w-[76px] md:h-[88px] md:w-[88px] object-contain"
                    />
                  </div>

                  <h3
                    className="font-display text-lg font-extrabold uppercase tracking-tight"
                    style={{ color: sector.accent }}
                  >
                    {sector.name}
                  </h3>

                  <p className="mt-3 flex-1 text-sm leading-relaxed text-cni-primary/70 line-clamp-4">
                    {sector.desc}
                  </p>

                  <span
                    className="mt-6 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] transition-all duration-300 group-hover:gap-3"
                    style={{ color: sector.accent }}
                  >
                    {locale === "es" ? "Ver detalles" : "View details"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))
            )}
          </div>
        </div>
      </section>

      {/* 8.5. Socio Estratégico */}
      <section className="py-24 md:py-28 bg-white overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <div className="al-partner-panel relative overflow-hidden rounded-2xl bg-gradient-to-br from-cni-primary via-[#1e2348] to-cni-primary-container p-8 md:p-10 text-white">
                <div className="al-partner-panel-glow pointer-events-none absolute inset-0" aria-hidden />
                <h2 className={cn(t.h2OnDark, "leading-[1.1]")}>
                  {locale === "es" ? (
                    <>
                      CNI tu socio estratégico para{" "}
                      <span className="text-[#29AB85]">invertir y crecer</span> en Honduras
                    </>
                  ) : (
                    <>
                      CNI your strategic partner to{" "}
                      <span className="text-[#29AB85]">invest and grow</span> in Honduras
                    </>
                  )}
                </h2>
                <div className="relative h-1 w-16 bg-cni-gold mt-6" />
                <Link
                  href={L("/cni")}
                  className="relative mt-8 inline-flex items-center gap-2 font-headline text-[11px] font-extrabold uppercase tracking-[0.15em] text-white transition-colors hover:text-[#29AB85]"
                >
                  {locale === "es" ? "Conocer la CNI" : "About CNI"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {partnerBenefits.map((item, idx) => (
                <div
                  key={item.title}
                  className="al-partner-benefit group relative flex items-center gap-4 overflow-hidden rounded-xl border border-cni-primary/8 bg-[#f8f9ff] p-5 md:p-6 transition-all duration-300 hover:border-[#29AB85]/30 hover:shadow-lg hover:shadow-cni-primary/5"
                >
                  <span className="pointer-events-none absolute -right-1 -top-2 font-display text-6xl font-extrabold leading-none text-cni-primary/[0.04] transition-colors group-hover:text-[#29AB85]/10">
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-cni-primary shadow-sm ring-1 ring-cni-primary/8 transition-colors duration-300 group-hover:bg-cni-primary group-hover:text-[#29AB85]">
                    <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                  </div>

                  <div className="relative min-w-0 flex-1">
                    <p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-cni-secondary">
                      {String(idx + 1).padStart(2, "0")}
                    </p>
                    <h3 className="font-headline text-base font-extrabold text-cni-primary">{item.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 9. Two-Level Partners Carousel */}
      <section className="py-28 md:py-32 overflow-hidden border-y relative al-allies-carousel border-transparent">
        <div className="al-allies-mesh absolute inset-0 pointer-events-none" aria-hidden />
        <div className="al-allies-vignette pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative z-10 al-allies-inner">
          <div className="text-center mb-16 md:mb-20 flex flex-col items-center px-8">
            <h2 className={cn(t.h2Upper, "text-white")}>
              {locale === "es" ? "Nuestros Aliados Estratégicos" : "Our Strategic Allies"}
            </h2>
            <div className="h-1.5 w-24 bg-cni-gold mt-6" />
          </div>

        <div className="space-y-12 md:space-y-14">
          {/* Row 1 — aliados nivel 1 (230×130 px uniformes) */}
          <div className="al-allies-track flex overflow-hidden">
            <div className="flex shrink-0 animate-marquee items-center gap-12 md:gap-16 pr-12 md:pr-16">
              {strategicAlliesLevel1.map((ally) => (
                <div key={ally.src} className="shrink-0 select-none al-allies-logo al-allies-logo--level1">
                  <Image
                    src={ally.src}
                    alt={ally.name}
                    width={strategicAllyLogoSize.width}
                    height={strategicAllyLogoSize.height}
                    className="al-allies-logo-img h-[130px] w-[230px] object-contain md:h-[156px] md:w-[276px]"
                    sizes="276px"
                  />
                </div>
              ))}
            </div>
            <div aria-hidden="true" className="flex shrink-0 animate-marquee items-center gap-12 md:gap-16 pr-12 md:pr-16">
              {strategicAlliesLevel1.map((ally) => (
                <div key={`rep-${ally.src}`} className="shrink-0 select-none al-allies-logo al-allies-logo--level1">
                  <Image
                    src={ally.src}
                    alt=""
                    width={strategicAllyLogoSize.width}
                    height={strategicAllyLogoSize.height}
                    className="al-allies-logo-img h-[130px] w-[230px] object-contain md:h-[156px] md:w-[276px]"
                    sizes="276px"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 — aliados nivel 2 (230×130 px uniformes) */}
          <div className="al-allies-track flex overflow-hidden">
            <div className="flex shrink-0 animate-marquee-reverse items-center gap-12 md:gap-16 pr-12 md:pr-16">
              {strategicAlliesLevel2.map((ally) => (
                <div key={ally.src} className="shrink-0 select-none al-allies-logo al-allies-logo--level1">
                  <Image
                    src={ally.src}
                    alt={ally.name}
                    width={strategicAllyLogoSize.width}
                    height={strategicAllyLogoSize.height}
                    className="al-allies-logo-img h-[130px] w-[230px] object-contain md:h-[156px] md:w-[276px]"
                    sizes="276px"
                  />
                </div>
              ))}
            </div>
            <div aria-hidden="true" className="flex shrink-0 animate-marquee-reverse items-center gap-12 md:gap-16 pr-12 md:pr-16">
              {strategicAlliesLevel2.map((ally) => (
                <div key={`rep-${ally.src}`} className="shrink-0 select-none al-allies-logo al-allies-logo--level1">
                  <Image
                    src={ally.src}
                    alt=""
                    width={strategicAllyLogoSize.width}
                    height={strategicAllyLogoSize.height}
                    className="al-allies-logo-img h-[130px] w-[230px] object-contain md:h-[156px] md:w-[276px]"
                    sizes="276px"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* 10. Casos de Éxito — testimonios compactos */}
      <section className="py-14 md:py-16 bg-white border-t border-cni-primary/5">
        <div className="max-w-screen-xl mx-auto px-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className={t.h2Upper}>
              {testimonialsCopy.title}
            </h2>
            <Link
              href={L("/portafolio/casos")}
              className="inline-flex items-center gap-2 font-headline text-[10px] font-extrabold uppercase tracking-[0.14em] text-cni-primary/70 transition-colors hover:text-cni-gold"
            >
              {testimonialsCopy.cta}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {featuredStoriesStatus === "error" ? (
              <div
                role="alert"
                className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-800"
              >
                {testimonialsCopy.error}
              </div>
            ) : testimonialCards.length === 0 ? (
              <div className="md:col-span-2 rounded-xl border border-dashed border-cni-primary/15 bg-[#f8f9ff] px-6 py-10 text-center text-sm text-cni-primary/60">
                {testimonialsCopy.empty}
              </div>
            ) : (
              testimonialCards.map((card) => (
              <Link
                key={card.slug}
                href={caseHref(card.slug)}
                className="al-success-card group flex flex-col rounded-xl border border-cni-primary/8 bg-[#f8f9ff] p-5 md:p-6 transition-colors hover:border-cni-gold/25 hover:bg-white"
              >
                <div className="al-success-logo mb-5 flex h-16 w-full items-center justify-center rounded-lg border border-cni-primary/10 bg-white px-4 py-3 md:h-[4.5rem]">
                  <Image
                    src={card.logo}
                    alt={card.logoAlt}
                    width={180}
                    height={56}
                    className="h-10 w-auto max-h-full max-w-full object-contain md:h-12"
                    sizes="180px"
                  />
                </div>

                <p className="font-body text-sm leading-relaxed text-cni-primary/80 italic line-clamp-4">
                  &ldquo;{card.quote}&rdquo;
                </p>

                <div className="mt-5 flex items-center gap-3 border-t border-cni-primary/8 pt-4">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-sm">
                    <Image
                      src={card.photo}
                      alt={card.name}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-headline text-xs font-extrabold uppercase tracking-wide text-cni-primary">
                      {card.name}
                    </p>
                    <p className="truncate text-[11px] text-cni-primary/55">{card.role}</p>
                  </div>
                </div>
              </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 11. CNI al día — últimas noticias */}
      <section className="py-14 md:py-20 bg-cni-surface-low border-t border-cni-primary/5">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div className="max-w-2xl">
              <p className={cn(t.eyebrow, "mb-2 text-cni-secondary tracking-[0.25em]")}>
                {prensaCopy.eyebrow}
              </p>
              <h2 className={cn(t.h2Upper, "leading-tight")}>
                {prensaCopy.title}
              </h2>
              <p className="mt-2 font-body text-sm leading-relaxed text-cni-primary/65">
                {prensaCopy.description}
              </p>
            </div>
            <Link
              href={L("/prensa")}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-cni-primary/12 bg-white px-5 py-2.5 font-headline text-[10px] font-extrabold uppercase tracking-[0.14em] text-cni-primary shadow-sm transition-all hover:border-cni-gold/40 hover:text-cni-gold"
            >
              {locale === "es" ? "Sala de prensa" : "Press room"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {latestNewsStatus === "error" ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center text-sm text-red-800"
            >
              {prensaCopy.error}
            </div>
          ) : visibleNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {visibleNews.map((article, idx) => (
                <Link
                  key={article.slug}
                  href={L(`/prensa/${article.slug}`)}
                  className="group flex h-full flex-col overflow-hidden rounded-xl bg-white border border-cni-primary/8 shadow-sm transition-all hover:-translate-y-0.5 hover:border-cni-gold/25 hover:shadow-md"
                >
                  <div className="relative h-44 overflow-hidden bg-cni-primary">
                    <Image
                      src={newsCardImage(article, idx)}
                      alt={article.featured_image?.alt_text || article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-cni-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  </div>
                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-cni-surface-low px-2.5 py-0.5 font-headline text-[10px] font-bold uppercase tracking-[0.14em] text-cni-secondary">
                        {newsCategoryLabels[locale][article.category]}
                      </span>
                      <time
                        dateTime={article.published_at}
                        className="text-[11px] font-body text-cni-primary/50"
                      >
                        {formatNewsDate(locale, article.published_at)}
                      </time>
                    </div>
                    <h3 className="font-headline text-base md:text-lg font-extrabold leading-snug text-cni-primary line-clamp-2 group-hover:text-cni-secondary transition-colors">
                      {article.title}
                    </h3>
                    {article.summary ? (
                      <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-cni-primary/60">
                        {article.summary}
                      </p>
                    ) : null}
                    <span className="mt-4 inline-flex items-center gap-2 font-headline text-[10px] font-extrabold uppercase tracking-[0.14em] text-cni-gold">
                      {prensaCopy.readMore}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-cni-primary/15 bg-white px-6 py-12 text-center">
              <p className="font-body text-sm text-cni-primary/60">{prensaCopy.empty}</p>
              <Link
                href={L("/prensa")}
                className="mt-4 inline-flex items-center gap-2 font-headline text-[10px] font-extrabold uppercase tracking-[0.14em] text-cni-primary hover:text-cni-gold"
              >
                {prensaCopy.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

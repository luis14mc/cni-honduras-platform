"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/src/i18n/config";
import { homeCopy } from "@/src/i18n/copy/home";
import { getSectorHref, withLocale } from "@/src/i18n/path";

type Props = { locale: Locale };

export function HomePageView({ locale }: Props) {
  const hc = homeCopy[locale];
  const L = (path: string) => withLocale(locale, path);

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
  const IED_DATA = {
    labels: ["2020", "2021", "2022", "2023", "2024", "2025"],
    datasets: [
      {
        label: "Total",
        data: [418.6, 738.7, 822.6, 1076, 993.9], // 5 valores
        color: "#E97131",
        backgroundColor: "rgba(233, 113, 49, 0.8)"
      },
      {
        label: locale === "es" ? "I Semestre" : "1st Semester",
        data: [289.6, 366.8, 459.9, 492.5, 470.1, 500.4], // 6 valores
        color: "#135F82",
        backgroundColor: "rgba(19, 95, 130, 0.8)"
      }
    ]
  };

  const PIB_DATA = {
    labels: ["2024", "2025", "2026", "2027", "2028", "2029"],
    datasets: [
      {
        label: "Honduras",
        data: [3.6, 3.5, 3.7, 3.8, 3.85, 3.85],
        color: "#35A8E0"
      },
      {
        label: "Costa Rica",
        data: [4.0, 3.5, 3.5, 3.5, 3.49, 3.45],
        color: "#252A58"
      },
      {
        label: "El Salvador",
        data: [3.0, 3.0, 2.8, 2.8, 2.8, 2.8],
        color: "#25A966"
      },
      {
        label: "Guatemala",
        data: [3.41, 3.6, 3.7, 3.75, 3.75, 3.75],
        color: "#E76F51"
      }
    ]
  };

  const CLIMA_DATA = {
    labels: ["2022", "2023", "2024"],
    datasets: [
      {
        label: "Panamá",
        data: [35, 27, 39],
        color: "#2A9D8F",
        backgroundColor: "rgba(42, 157, 143, 0.8)"
      },
      {
        label: "Guatemala",
        data: [36, 37, 44],
        color: "#E76F51",
        backgroundColor: "rgba(231, 111, 81, 0.8)"
      },
      {
        label: "El Salvador",
        data: [44, 44, 50],
        color: "#F4A261",
        backgroundColor: "rgba(244, 162, 97, 0.8)"
      },
      {
        label: "Costa Rica",
        data: [45, 45, 51],
        color: "#25A966",
        backgroundColor: "rgba(37, 169, 102, 0.8)"
      },
      {
        label: "Nicaragua",
        data: [18, 26, 53],
        color: "#252A58",
        backgroundColor: "rgba(37, 42, 88, 0.8)"
      },
      {
        label: "Honduras",
        data: [47, 47, 60],
        color: "#35A8E0",
        backgroundColor: "rgba(53, 168, 224, 0.8)"
      }
    ]
  };

  // Datos para los sectores en el grid asimétrico
  const sectorsData = [
    {
      slug: "agroindustria",
      iconImg: "/img/sectores/Agroindustria.png",
      hexColor: "#93c01f",
      name: locale === "es" ? "Agroindustria" : "Agroindustry",
      desc: locale === "es" ? "Liderazgo regional consolidado en café, banano y productos de alto valor no tradicionales." : "Consolidated regional leadership in coffee, bananas, and high-value non-traditional products.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfKbgE8A8NbJ8h1rDyiVxDkYDQxMRRY572tw1594bk6VAQ4HRBKuC62ZRhuOBl_e0KHD3h_PwWCnwGgtlmjXUwsG6MlZxxO864V-X7rJ_UeamN8rox4q5v7NN061MJ80kxYCIAJETPyPsLj-CixaPdkhwaQEvHOU1O22Rke0c3XbIQenob0BprQpEY2l6bPfAPzo0mN4jvL6zuZ6vL_BICpoVIvaKPN40Z-Mmq-SYGAVkiIeOgQTsf-uGwwoNpm92PWXZBoZhBZ6E",
      href: getSectorHref(locale, "agroindustria"),
      span: "md:col-span-4",
      bgClass: "bg-white hover:bg-cni-surface-low transition-colors duration-500",
      textColor: "text-cni-primary",
      isDark: false
    },
    {
      slug: "manufactura",
      iconImg: "/img/sectores/Manufactura 1.png",
      hexColor: "#7c25a8",
      name: locale === "es" ? "Manufactura" : "Manufacturing",
      desc: locale === "es" ? "Hub logístico estratégico para textiles técnicos y autopartes con acceso preferencial a Norteamérica." : "Strategic logistics hub for technical textiles and auto parts with preferential access to North America.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAqlhU_RbYvkxBlYzAj4-JtinsyOxfbNJWy3dijV5GdOD--pP85WIxoiQ7Sk0Q-lRYx5sMe7kzQ9jIcHdOVm2s-dmhYYOGr1LHnyFIi9Jph5IoX_fNsF4hHqhdugIzWl9t7eGGor3MD99NX2QA6-mO-uxN97DKeH2m9pItMpoZlymNvIiga0_Uokz5xO5dN_fospS89vsPMohMijrLWO6LVrvX4k3OiF6ww07a2JJFkhX614J_rk3IE27CvkIR0gvbFmNDamGonIFU",
      href: getSectorHref(locale, "manufactura"),
      span: "md:col-span-8",
      bgClass: "bg-white hover:bg-cni-surface-low transition-colors duration-500",
      textColor: "text-cni-primary",
      isDark: false
    },
    {
      slug: "energia",
      iconImg: "/img/sectores/Energía 1.png",
      hexColor: "#f7bf06",
      name: locale === "es" ? "Energía" : "Energy",
      desc: locale === "es" ? "Incentivos para el desarrollo de proyectos solares, eólicos e hidroeléctricos a gran escala." : "Incentives for the development of large-scale solar, wind, and hydroelectric projects.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLeOzKajqhalcfmd6t0Y77JjpvOtSrf8GYtNoa1CmbRNU-2Bmb9r3b8WtDxgdqzqxgFVTx2alVdlODmHzJRFPV1Y6vbXur2hOW04cz2rJ18JZd7p5MQ6odd2LPu4Im4wNpf9tZnzqCfOx8he0sbEL40H4C76j8Q75kScs2XBCc0gDFvCCNFYk0hvHyXvokqDNf0gIxiSvzZSN2Y-5Y54CrtlZGrroOP1YQGuZCnOU7cOqHqjQjG81R1DGb0KBM5QDqxHw5qmDt3Lg",
      href: getSectorHref(locale, "energia"),
      span: "md:col-span-6",
      bgClass: "bg-white hover:bg-cni-surface-low transition-colors duration-500",
      textColor: "text-cni-primary",
      isDark: false
    },
    {
      slug: "logistica",
      iconImg: "/img/sectores/Logística 1.png",
      hexColor: "#2eb29c",
      name: locale === "es" ? "Logística y Transporte" : "Logistics and Transport",
      desc: locale === "es" ? "Conectividad multimodal y servicios de valor agregado para el comercio global eficiente." : "Multimodal connectivity and value-added services for efficient global trade.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfKbgE8A8NbJ8h1rDyiVxDkYDQxMRRY572tw1594bk6VAQ4HRBKuC62ZRhuOBl_e0KHD3h_PwWCnwGgtlmjXUwsG6MlZxxO864V-X7rJ_UeamN8rox4q5v7NN061MJ80kxYCIAJETPyPsLj-CixaPdkhwaQEvHOU1O22Rke0c3XbIQenob0BprQpEY2l6bPfAPzo0mN4jvL6zuZ6vL_BICpoVIvaKPN40Z-Mmq-SYGAVkiIeOgQTsf-uGwwoNpm92PWXZBoZhBZ6E",
      href: L("/invertir"),
      span: "md:col-span-6",
      bgClass: "bg-white hover:bg-cni-surface-low transition-colors duration-500",
      textColor: "text-cni-primary",
      isDark: false
    },
    {
      slug: "turismo",
      iconImg: "/img/sectores/Turismo 1.png",
      hexColor: "#57d0e1",
      name: locale === "es" ? "Turismo" : "Tourism",
      desc: locale === "es" ? "Destino de clase mundial para ecoturismo, arqueología y playas vírgenes con incentivos fiscales." : "World-class destination for ecotourism, archaeology, and pristine beaches with fiscal incentives.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuClUWl0qeuPq74UIDN7WdqhNWQZ3ys4DM8pasJvHdmhRDvW2LaCBpG2FyhwAIrsrzEJZmAK1iRDdo5LOB6TFICf8xocqQVKF7eh6UcCIMIWrExqWEzTdOBksyWftmlaPKu-v1uKjc9Lkh66WjJ_DwEQkgVp8aq7DTCOwfyfTMTFqcRW93tPYuCSvkjvSZKGZ_iuEVfkHBzi4Jv1097p_gHEkE71LuJYh2tun2mFLxnOopKgAak9giyVWxsZiO18yH6wmwXeGKLTTOU",
      href: getSectorHref(locale, "turismo"),
      span: "md:col-span-8",
      bgClass: "bg-white hover:bg-cni-surface-low transition-colors duration-500",
      textColor: "text-cni-primary",
      isDark: false
    },
    {
      slug: "infraestructura",
      iconImg: "/img/sectores/Infraestructura 1.png",
      hexColor: "#f98639",
      name: locale === "es" ? "Infraestructura" : "Infrastructure",
      desc: locale === "es" ? "Desarrollo de corredores interoceánicos, modernización portuaria y zonas de empleo especial." : "Development of interoceanic corridors, port modernization, and special employment zones.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBF8ZnKL1oGbIFyqRVDjKbMM7vGT9G5E8IQSy6cIT0XyfYcvPf6xVBrCGc-cC-SBjsKsEGHqZyv3bMMIllRBKgCYd3hVUWJSaeK457yBQTtbPvqynP6GnS8V_8kjSvrDwIMfruvXsjc7Q7w0qJB5bm8BztCpIjpzTsIePU8pRbYspK8SWFSCYZDKA_9PJ1_yyxAU9L44HCMYUbsTDTk-9nxeL0LN-TOzm66VlFRlICgduYUdioeesg1c-gXR9S2SZI-jKqyFulHCd4",
      href: getSectorHref(locale, "infraestructura"),
      span: "md:col-span-4",
      bgClass: "bg-white hover:bg-cni-surface-low transition-colors duration-500",
      textColor: "text-cni-primary",
      isDark: false
    }
  ];

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
    <div className="flex flex-1 flex-col bg-white overflow-hidden">

      {/* 1. Animated Hero */}
      <section className="relative h-[85vh] flex items-center overflow-hidden bg-cni-primary -mt-[5.25rem] pt-[5.25rem]">
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
          <h1 className="text-white text-6xl md:text-[60px] lg:text-[80px] font-display font-extrabold tracking-tighter leading-[0.9] mb-10 uppercase">
            {hc.hero.titleLine1} <br />
            <span className="text-cni-gold">{hc.hero.titleGrow}</span>
          </h1>
          <p className="text-white/60 text-lg md:text-xl font-body font-light leading-relaxed mb-12 max-w-2xl">
            {hc.hero.subtitle}
          </p>

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
            <span className="inline-flex items-center gap-2 font-headline font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-full bg-cni-gold text-cni-primary group-hover:bg-white group-hover:scale-105 transition-all duration-500 shadow-md">
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

      {/* 3. Project Submission */}
      <section className="py-28 px-8 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2">
            <h2 className="text-cni-primary font-display text-5xl font-extrabold tracking-tight uppercase mb-8 leading-[1.1]">
              {locale === "es" ? (
                <>¿TIENES UN PROYECTO <br /><span className="text-cni-gold">DE INVERSIÓN?</span></>
              ) : (
                <>Project <br /><span className="text-cni-gold">Submission</span></>
              )}
            </h2>
            <p className="text-on-surface-variant font-body text-lg mb-10 leading-relaxed">
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

      {/* 4. Quick Access Grid */}
      <section className="py-16 bg-cni-surface-low border-y border-cni-surface-low/50">
        <div className="max-w-screen-2xl mx-auto px-8">
          <h2 className="text-cni-primary font-display text-4xl font-extrabold text-center uppercase tracking-tight mb-12">
            {hc.enlacesRapidos.sectionTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "menu_book", title: hc.enlacesRapidos.guia, href: "https://online.flippingbook.com/view/972979540/", target: "_blank" },
              { icon: "import_contacts", title: hc.enlacesRapidos.memoria, href: "https://online.flippingbook.com/view/975450084/", target: "_blank" },
              { icon: "language", title: hc.enlacesRapidos.portal, href: "https://pdihonduras.gob.hn/consulta", target: "_blank" },
              { icon: "query_stats", title: hc.enlacesRapidos.estudios, href: "/recursos/estudios", target: "_self" }
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href.startsWith("http") ? item.href : L(item.href)}
                target={item.target}
                className="group flex flex-col items-center justify-center text-center bg-white hover:bg-cni-primary border border-cni-primary/10 rounded-2xl p-8 transition-all duration-300 shadow-sm hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="w-16 h-16 mb-4 bg-cni-primary/5 group-hover:bg-cni-gold/20 rounded-full flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-cni-primary group-hover:text-cni-gold text-3xl transition-colors">
                    {item.icon}
                  </span>
                </div>
                <h3 className="font-headline font-bold text-cni-primary group-hover:text-white text-sm uppercase tracking-wide leading-tight transition-colors">
                  {item.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
              <p className="font-headline text-xs font-extrabold uppercase tracking-[0.4em] text-cni-gold mb-4">
                {dCopy.eyebrow}
              </p>
              <h2 className="text-cni-primary font-display text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-tight mb-6">
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
                  backgroundImage: "radial-gradient(circle at 2px 2px, rgba(233, 193, 118, 0.2) 1px, transparent 0)",
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
                    <h3 className="font-display text-3xl font-extrabold text-white uppercase leading-none mb-6">
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
                        <span className="material-symbols-outlined text-green-400 text-sm">trending_up</span>
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
      <section className="relative py-32 bg-cni-primary overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, rgba(233, 193, 118, 0.1) 1px, transparent 0)",
              backgroundSize: "40px 40px"
            }}
          ></div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-4">
              <div className="border-l border-white/20 pl-8">
                <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter uppercase text-white leading-tight">
                  <span className="text-cni-gold block mb-2">Honduras</span>
                  {locale === "es" ? "en cifras" : "in figures"}
                </h2>
                <div className="h-1.5 w-24 bg-cni-gold mt-8"></div>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[
                  { 
                    value: "112,777", 
                    label: "Km² de Extensión Territorial", 
                    icon: "map",
                    backText: "Honduras se destaca como el segundo país más grande de Centroamérica, ofreciendo una ubicación estratégica, vastos recursos naturales y un entorno ideal para la inversión."
                  },
                  { 
                    value: "Más de 9.89 M", 
                    label: "de Habitantes. fuerza laboral joven y dinámica", 
                    icon: "groups",
                    backText: "Honduras cuenta con una fuerza laboral joven y dinámica, con una edad promedio de 31 años y 7.0 millones de personas en edad de trabajar, lista para impulsar el crecimiento empresarial."
                  },
                  { 
                    value: "Más de 108,250 Egresados", 
                    label: "En educación superior(2021 - 2024)", 
                    icon: "school",
                    backText: "Con 21 instituciones de educación superior, Honduras forma talento diversificado en ciencias sociales (28 %), ciencias administrativas (20 %), ingenierías y TIC (15 %), y en ciencias de la salud (8 %), además de otras áreas, posgrados y técnicos altamente capacitados."
                  },
                  { 
                    value: "Más del 58.6%", 
                    label: "de la energía proviene de fuentes renovables", 
                    icon: "energy_savings_leaf",
                    backText: "Honduras cuenta con una matriz diversificada que incluye 10 tipos de energéticos para la generación eléctrica."
                  },
                  { 
                    value: "En 2024 el 35.3%", 
                    label: "de las exportaciones totales correspondieron a productos textiles", 
                    icon: "category",
                    backText: "Honduras cuenta con una matriz diversificada que incluye 10 tipos de energéticos para la generación eléctrica."
                  },
                  { 
                    value: "11 tratados de Libre Comercio", 
                    label: "que abarcan 45 naciones", 
                    icon: "directions_boat",
                    backText: "Honduras exporta más de 3,200 productos al año a más de 120 países en todo el mundo, respaldado por 11 tratados de libre comercio que abarcan más de 45 naciones, facilitando el acceso a mercados globales estratégicos."
                  }
                ].map((stat, i) => (
                  <div key={i} className="flip-card w-full h-[300px] md:h-[340px]">
                    <div className="flip-card-inner shadow-xl rounded-xl">
                      
                      {/* Front */}
                      <div className="flip-card-front bg-white/5 p-6 md:p-8 border border-white/10 rounded-xl flex flex-col items-center justify-center text-center">
                        <span className="material-symbols-outlined text-cni-gold text-5xl md:text-6xl mb-6">
                          {stat.icon}
                        </span>
                        <span className="font-display text-3xl md:text-4xl font-extrabold text-white mb-3">
                          {stat.value}
                        </span>
                        <p className="font-headline text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/60 px-2">
                          {stat.label}
                        </p>
                      </div>

                      {/* Back */}
                      <div className="flip-card-back bg-cni-gold p-8 md:p-10 rounded-xl flex flex-col items-center justify-center text-center overflow-hidden">
                        {/* Background Watermark Icon */}
                        <span className="material-symbols-outlined absolute inset-0 m-auto flex items-center justify-center text-[120px] text-cni-primary/10 pointer-events-none select-none z-0">
                          {stat.icon}
                        </span>
                        
                        {/* Content */}
                        <p className="font-body text-cni-primary font-medium text-sm md:text-[15px] leading-relaxed relative z-10 px-2">
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

      {/* 8. Sectors Grid (Asymmetric Navigation) */}
      <section className="py-32 px-8 bg-white">
        <div className="max-w-screen-2xl mx-auto">

          <div className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h2 className="text-cni-primary font-display text-4xl font-extrabold tracking-tight uppercase mb-4">
                {locale === "es" ? "Sectores Estratégicos" : "Strategic Sectors"}
              </h2>
              <div className="h-1.5 w-28 bg-cni-gold"></div>
            </div>
            <Link
              href={L("/invertir")}
              className="text-cni-primary font-headline font-extrabold text-[11px] uppercase tracking-[0.2em] border-b-2 border-cni-gold/30 pb-2 hover:border-cni-gold transition-all"
            >
              {locale === "es" ? "Ver todos los sectores" : "View all sectors"}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-1 h-auto bg-cni-surface-low p-1">
            {sectorsData.map((s) => (
              <div
                key={s.slug}
                className={`relative overflow-hidden p-12 flex flex-col justify-end min-h-[350px] group ${s.span} ${s.bgClass} ${s.textColor}`}
                style={{ 
                  borderBottom: `4px solid ${s.hexColor}`,
                  '--sector-color': s.hexColor 
                } as React.CSSProperties}
              >
                {/* Background Image on Hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 md:group-hover:opacity-30 transition-all duration-700 pointer-events-none">
                  <Image
                    alt={s.name}
                    className="object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                    src={s.img}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                <div className="relative w-16 h-16 mb-8 group-hover:-translate-y-2 transition-transform duration-300 z-10">
                  <Image src={s.iconImg} alt={s.name} fill className="object-contain" />
                </div>

                <h3 
                  className="font-display text-2xl font-extrabold uppercase mb-3 relative z-10 drop-shadow-sm text-[var(--sector-color)] group-hover:text-cni-primary transition-colors duration-500"
                >
                  {s.name}
                </h3>

                <p className={`font-body text-sm mb-8 leading-relaxed max-w-lg relative z-10 ${s.isDark ? "text-white/70" : "text-cni-on-surface-variant"}`}>
                  {s.desc}
                </p>

                <Link
                  href={s.href}
                  style={{ color: s.hexColor }}
                  className="font-headline font-extrabold text-[11px] uppercase tracking-[0.15em] flex items-center gap-3 group-hover:gap-5 transition-all relative z-10 hover:brightness-110"
                >
                  {locale === "es" ? "Ver Detalles" : "View Details"}
                  <span className="material-symbols-outlined text-[16px]">north_east</span>
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8.5. Socio Estratégico (Color Matched Layout) */}
      <section className="py-32 bg-cni-surface-low border-y border-cni-surface-low/50">
        <div className="max-w-screen-2xl mx-auto px-8">
          
          <div className="text-center mb-20 flex flex-col items-center">
            <h2 className="text-cni-primary font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Tu socio estratégico para <span className="text-cni-secondary">invertir y crecer</span> en Honduras
            </h2>
            <div className="h-1.5 w-24 bg-cni-gold"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: 'diversity_3', title: 'Acompañamiento Integral', desc: 'Asesoría de principio a fin para asegurar que tu inversión despegue sin fricciones en el mercado hondureño.' },
              { icon: 'person_pin_circle', title: 'Punto de Contacto Único', desc: 'Centralizamos tus trámites y consultas para brindar una respuesta ágil y directa a tus necesidades.' },
              { icon: 'manage_search', title: 'Información Actualizada', desc: 'Inteligencia de negocios y datos macroeconómicos precisos para apoyar decisiones estratégicas.' },
              { icon: 'cases', title: 'Portafolio Exclusivo', desc: 'Acceso a proyectos de inversión de alto impacto y rentabilidad en sectores priorizados.' },
              { icon: 'assured_workload', title: 'Respaldo Gubernamental', desc: 'Garantía institucional para la seguridad jurídica y protección de tus inversiones.' },
              { icon: 'hub', title: 'Conexiones Estratégicas', desc: 'Networking de alto nivel y vinculación con actores clave del sector público y privado.' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-[24px] p-10 flex flex-col items-start gap-6 border border-cni-primary/5 hover:border-cni-gold/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-16 h-16 rounded-full bg-cni-surface-low flex items-center justify-center shadow-sm text-cni-primary group-hover:bg-cni-primary group-hover:text-cni-gold transition-colors duration-300">
                  <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                </div>
                <div>
                  <h3 className="font-headline text-xl font-extrabold text-cni-primary mb-3">{item.title}</h3>
                  <p className="font-body text-sm text-cni-on-surface-variant leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Two-Level Partners Carousel */}
      <section className="py-24 bg-cni-surface-low overflow-hidden border-y border-cni-surface-low/50">
          <div className="text-center mb-20 flex flex-col items-center">
            <h2 className="text-cni-primary font-display text-3xl md:text-4xl font-extrabold tracking-tight uppercase">
              {locale === "es" ? "Nuestros Aliados Estratégicos" : "Our Strategic Allies"}
            </h2>
            <div className="h-1.5 w-24 bg-cni-gold mt-6"></div>
          </div>

        <div className="space-y-16">
          {/* Row 1 */}
          <div className="flex overflow-hidden">
            {/* Group 1 */}
            <div className="flex shrink-0 animate-marquee items-center gap-24 pr-24">
              {Array.from({ length: 13 }, (_, i) => `/img/aliados/nivel_1/${i + 1}.png`).map((src, idx) => (
                <div key={idx} className="relative flex items-center justify-center w-56 h-28 select-none">
                  <Image src={src} alt={`Aliado Nivel 1 - ${idx + 1}`} fill className="object-contain" />
                </div>
              ))}
            </div>
            {/* Group 2 (Clone) */}
            <div aria-hidden="true" className="flex shrink-0 animate-marquee items-center gap-24 pr-24">
              {Array.from({ length: 13 }, (_, i) => `/img/aliados/nivel_1/${i + 1}.png`).map((src, idx) => (
                <div key={`rep-${idx}`} className="relative flex items-center justify-center w-56 h-28 select-none">
                  <Image src={src} alt={`Aliado Nivel 1 - ${idx + 1}`} fill className="object-contain" />
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex overflow-hidden">
            {/* Group 1 */}
            <div className="flex shrink-0 animate-marquee-reverse items-center gap-24 pr-24">
              {Array.from({ length: 13 }, (_, i) => `/img/aliados/nivel_2/${i + 1}.png`).map((src, idx) => (
                <div key={idx} className="relative flex items-center justify-center w-48 h-24 select-none">
                  <Image src={src} alt={`Aliado Nivel 2 - ${idx + 1}`} fill className="object-contain" />
                </div>
              ))}
            </div>
            {/* Group 2 (Clone) */}
            <div aria-hidden="true" className="flex shrink-0 animate-marquee-reverse items-center gap-24 pr-24">
              {Array.from({ length: 13 }, (_, i) => `/img/aliados/nivel_2/${i + 1}.png`).map((src, idx) => (
                <div key={`rep-${idx}`} className="relative flex items-center justify-center w-48 h-24 select-none">
                  <Image src={src} alt={`Aliado Nivel 2 - ${idx + 1}`} fill className="object-contain" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 10. Casos de Éxito (Success Stories Carousel) */}
      <section className="py-32 bg-white overflow-hidden border-t border-cni-surface-low/50">
        <div className="max-w-screen-2xl mx-auto px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
            <div>
              <h2 className="text-cni-primary font-display text-4xl font-extrabold tracking-tight uppercase mb-4">
                {locale === "es" ? "Casos de Éxito" : "Success Stories"}
              </h2>
              <div className="h-1.5 w-24 bg-cni-gold"></div>
            </div>
            <Link
              href={L("/casos-de-exito")}
              className="text-cni-primary font-headline font-extrabold text-[11px] uppercase tracking-[0.2em] border-b-2 border-cni-gold/30 pb-2 hover:border-cni-gold transition-all flex items-center gap-2"
            >
              {locale === "es" ? "Ver todos los casos" : "View all cases"}
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-8 pb-12 no-scrollbar">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="min-w-[340px] md:min-w-0 md:flex-1 shrink-0 snap-center bg-cni-surface-low p-10 rounded-[24px] flex flex-col justify-between border border-cni-primary/5 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <div>
                  {/* Company Logo Placeholder */}
                  <div className="relative w-32 h-10 mb-8 opacity-60 grayscale">
                    <img src="/logo.png" alt="Company Logo" className="w-full h-full object-contain object-left" />
                  </div>
                  
                  {/* Quote */}
                  <p className="font-display text-lg md:text-[22px] font-light italic text-cni-primary leading-[1.6] mb-12">
                    &quot;La ubicación estratégica de Honduras y el acompañamiento constante del CNI fueron fundamentales para establecer nuestra planta de operaciones en tiempo récord.&quot;
                  </p>
                </div>

                <div className="mt-auto border-t border-cni-primary/10 pt-8">
                  {/* Person Info & Photo */}
                  <div className="flex items-center gap-5 mb-8">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-cni-gold shadow-sm">
                      <img src={`https://i.pravatar.cc/150?img=${item * 11}`} alt="Persona" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-headline font-extrabold text-cni-primary text-[12px] uppercase tracking-[0.15em] mb-1">
                        Nombre del Inversor
                      </p>
                      <p className="font-body text-[11px] text-cni-primary/60 uppercase tracking-widest font-medium">
                        Cargo en la Empresa
                      </p>
                    </div>
                  </div>

                  {/* View Case Button */}
                  <Link
                    href={L(`/casos-de-exito/caso-${item}`)}
                    className="inline-flex items-center justify-center w-full py-4 bg-white text-cni-primary border border-cni-primary/10 rounded-xl font-headline font-extrabold text-[10px] uppercase tracking-[0.2em] hover:bg-cni-primary hover:text-white transition-all group"
                  >
                    {locale === "es" ? "Ver caso completo" : "View full case"}
                    <span className="material-symbols-outlined text-[14px] ml-3 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </section>

      {/* 11. CNI al Día (Color Matched Layout) */}
      <section className="py-32 px-8 bg-white border-t border-cni-surface-low/50">
        <div className="max-w-screen-xl mx-auto">
          {/* Centered Title */}
          <div className="text-center mb-16 flex flex-col items-center">
            <h2 className="text-cni-primary font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-2 uppercase">
              CNI al día
            </h2>
            <h3 className="text-cni-secondary font-display text-2xl md:text-3xl font-bold">
              Consejo Nacional de Inversiones Honduras
            </h3>
            <div className="h-1.5 w-24 bg-cni-gold mt-6"></div>
          </div>

          {/* Main Layout Container */}
          <div className="bg-cni-surface-low rounded-[32px] p-8 lg:p-12 flex flex-col lg:flex-row gap-12 border border-cni-primary/5">
            
            {/* Left Column: List of 4 recent news */}
            <div className="w-full lg:w-5/12 flex flex-col justify-center gap-2">
              {[
                { date: "09-06-2026", title: "Friendshoring farmacéutico" },
                { date: "05-06-2026", title: "Fomento a la Inversión extranjera" },
                { date: "05-06-2026", title: "Lanzamiento Estratégia País 2027-2031" },
                { date: "05-06-2026", title: "Nueva regulación HAND CARRIER" }
              ].map((item, idx) => (
                <div key={idx} className={`py-6 flex flex-col gap-3 ${idx !== 3 ? 'border-b border-cni-primary/10' : ''}`}>
                  <span className="text-cni-primary/50 font-body text-xs tracking-wider">{item.date}</span>
                  <Link href={L("/prensa")} className="flex items-center gap-4 group">
                    <span className="material-symbols-outlined text-cni-primary/30 group-hover:text-cni-secondary transition-colors text-[22px]">radio_button_checked</span>
                    <h4 className="font-headline font-bold text-cni-primary text-lg group-hover:text-cni-secondary transition-colors">
                      {item.title}
                    </h4>
                  </Link>
                </div>
              ))}
            </div>

            {/* Right Column: Featured News */}
            <div className="w-full lg:w-7/12">
              <div className="bg-white rounded-3xl overflow-hidden shadow-xl group flex flex-col h-full border border-cni-primary/5">
                {/* Image */}
                <div className="relative w-full aspect-[4/3] lg:aspect-auto lg:flex-1 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
                    alt="Noticia principal" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                {/* Primary blue content box */}
                <div className="bg-cni-primary p-8 md:p-10 flex flex-col items-start gap-6 relative z-10">
                  <p className="text-white/90 font-body text-base md:text-lg leading-relaxed line-clamp-3">
                    CNI impulsa promoción del sector ciencias de la vida y fortalece agenda de friendshoring farmacéutico en Foro EE. UU.–Triángulo Norte...
                  </p>
                  <Link
                    href={L("/prensa")}
                    className="px-8 py-2.5 rounded-full border border-cni-gold text-cni-gold font-headline font-bold text-xs uppercase tracking-widest hover:bg-cni-gold hover:text-cni-primary transition-colors mt-2"
                  >
                    Leer Más
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

import type { Locale } from "@/src/i18n/config";

type SectorStudy = {
  id: string;
  name: string;
  icon: string;
  downloadUrl: string;
};

const esSectors: ReadonlyArray<SectorStudy> = [
  {
    id: "turismo",
    name: "Turismo",
    icon: "flight",
    downloadUrl: "https://cni.hn/wp-content/uploads/2026/05/Trifolio-Resultados-Investigacion-Sectores-Turismo.pdf.pdf",
  },
  {
    id: "energia",
    name: "Energía",
    icon: "bolt",
    downloadUrl: "https://cni.hn/wp-content/uploads/2026/05/Trifolio-Resultados-Investigacion-Sectores-Energia.pdf.pdf",
  },
  {
    id: "infraestructura",
    name: "Infraestructura",
    icon: "architecture",
    downloadUrl: "https://cni.hn/wp-content/uploads/2026/05/Trifolio-Resultados-Investigacion-Sectores-Infraestructura.pdf.pdf",
  },
  {
    id: "agroindustria",
    name: "Agroindustria",
    icon: "agriculture",
    downloadUrl: "https://cni.hn/wp-content/uploads/2026/05/Trifolio-Resultados-Investigacion-Sectores-Agroindustria.pdf.pdf",
  },
  {
    id: "manufactura",
    name: "Manufactura",
    icon: "factory",
    downloadUrl: "https://cni.hn/wp-content/uploads/2026/05/Trifolio-Resultados-Investigacion-Sectores-Manufactura.pdf.pdf",
  },
];

const enSectors: ReadonlyArray<SectorStudy> = [
  {
    id: "turismo",
    name: "Tourism",
    icon: "flight",
    downloadUrl: "https://cni.hn/wp-content/uploads/2026/05/Trifolio-Resultados-Investigacion-Sectores-Turismo.pdf.pdf",
  },
  {
    id: "energia",
    name: "Energy",
    icon: "bolt",
    downloadUrl: "https://cni.hn/wp-content/uploads/2026/05/Trifolio-Resultados-Investigacion-Sectores-Energia.pdf.pdf",
  },
  {
    id: "infraestructura",
    name: "Infrastructure",
    icon: "architecture",
    downloadUrl: "https://cni.hn/wp-content/uploads/2026/05/Trifolio-Resultados-Investigacion-Sectores-Infraestructura.pdf.pdf",
  },
  {
    id: "agroindustria",
    name: "Agroindustry",
    icon: "agriculture",
    downloadUrl: "https://cni.hn/wp-content/uploads/2026/05/Trifolio-Resultados-Investigacion-Sectores-Agroindustria.pdf.pdf",
  },
  {
    id: "manufactura",
    name: "Manufacturing",
    icon: "factory",
    downloadUrl: "https://cni.hn/wp-content/uploads/2026/05/Trifolio-Resultados-Investigacion-Sectores-Manufactura.pdf.pdf",
  },
];

export const estudiosPageCopy: Record<
  Locale,
  {
    heroEyebrow: string;
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
    exploreLabel: string;
    gridTitle: string;
    downloadBtn: string;
    ctaTitle: string;
    ctaBtn: string;
    sectors: ReadonlyArray<SectorStudy>;
  }
> = {
  es: {
    heroEyebrow: "CNI Estudios Estratégicos",
    heroTitle: "Estudios CNI",
    heroSubtitle: "Estudios sectoriales para impulsar nuevas oportunidades de inversión.",
    heroDescription: "Cada estudio fue desarrollado con una metodología adaptada a las dinámicas y necesidades específicas de cada sector priorizado, integrando análisis técnico, evaluación de mercado y perspectivas estratégicas para identificar oportunidades de inversión con alto potencial en Honduras.",
    exploreLabel: "Explorar estudios",
    gridTitle: "Sectores priorizados de inversión",
    downloadBtn: "Descargar estudio",
    ctaTitle: "Acelera tu proceso de inversión en Honduras",
    ctaBtn: "Contacta al CNI para asistencia gratuita",
    sectors: esSectors,
  },
  en: {
    heroEyebrow: "CNI Strategic Studies",
    heroTitle: "CNI Studies",
    heroSubtitle: "Sectoral studies to drive new investment opportunities.",
    heroDescription: "Each study was developed with a methodology adapted to the dynamics and specific needs of each prioritized sector, integrating technical analysis, market evaluation, and strategic perspectives to identify high-potential investment opportunities in Honduras.",
    exploreLabel: "Explore studies",
    gridTitle: "Prioritized investment sectors",
    downloadBtn: "Download study",
    ctaTitle: "Accelerate your investment process in Honduras",
    ctaBtn: "Contact CNI for free assistance",
    sectors: enSectors,
  },
};

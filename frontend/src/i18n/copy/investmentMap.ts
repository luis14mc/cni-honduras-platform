import type { Locale } from "@/src/i18n/config";

export type InvestmentMapCopy = {
  eyebrow: string;
  title: string;
  description: string;
  filterLabel: string;
  allSectors: string;
  loadingMap: string;
  loadingData: string;
  loadingProjects: string;
  mapError: string;
  summaryError: string;
  projectsError: string;
  noGeometry: string;
  selectDepartment: string;
  selectedDepartment: string;
  clear: string;
  projects: string;
  opportunities: string;
  investment: string;
  jobs: string;
  activeSectors: string;
  projectList: string;
  noResults: string;
  noProjects: string;
  noSummary: string;
  stage: Record<string, string>;
  withActivity: string;
  noPublicData: string;
  selected: string;
  filtered: string;
  attribution: string;
};

export const investmentMapCopy: Record<Locale, InvestmentMapCopy> = {
  es: {
    eyebrow: "Inteligencia territorial · CNI Honduras",
    title: "El mapa de la inversión",
    description: "Explore el pulso de inversión de Honduras por departamento y sector estratégico.",
    filterLabel: "Filtrar por sector",
    allSectors: "Todos los sectores",
    loadingMap: "Cargando cartografía nacional…",
    loadingData: "Cargando indicadores territoriales…",
    loadingProjects: "Cargando proyectos…",
    mapError: "No se pudo cargar la cartografía. Intente de nuevo más tarde.",
    summaryError: "Los indicadores territoriales no están disponibles por ahora.",
    projectsError: "No se pudo cargar la lista de proyectos.",
    noGeometry: "No hay geometrías de departamentos disponibles.",
    selectDepartment: "Seleccione un departamento para explorar sus oportunidades y proyectos de inversión.",
    selectedDepartment: "Departamento seleccionado",
    clear: "Limpiar selección",
    projects: "Proyectos",
    opportunities: "Oportunidades",
    investment: "Inversión total",
    jobs: "Empleos estimados",
    activeSectors: "Sectores activos",
    projectList: "Proyectos del departamento",
    noResults: "No hay proyectos u oportunidades disponibles para este filtro.",
    noProjects: "No hay proyectos posicionados para este departamento y filtro.",
    noSummary: "No hay indicadores disponibles para este departamento.",
    stage: { promotion: "Promoción", announced: "Anunciado", startup: "Arranque", implementing: "Implementando", stalled: "En pausa", finished: "Finalizado", cancelled: "Cancelado" },
    withActivity: "Con actividad",
    noPublicData: "Sin datos públicos",
    selected: "Seleccionado",
    filtered: "Fuera del filtro",
    attribution: "© OpenStreetMap contributors",
  },
  en: {
    eyebrow: "Territorial intelligence · CNI Honduras",
    title: "The investment map",
    description: "Explore Honduras's investment pulse by department and strategic sector.",
    filterLabel: "Filter by sector",
    allSectors: "All sectors",
    loadingMap: "Loading national cartography…",
    loadingData: "Loading territorial indicators…",
    loadingProjects: "Loading projects…",
    mapError: "Cartography could not be loaded. Please try again later.",
    summaryError: "Territorial indicators are unavailable right now.",
    projectsError: "The project list could not be loaded.",
    noGeometry: "No department geometries are available.",
    selectDepartment: "Select a department to explore its investment opportunities and projects.",
    selectedDepartment: "Selected department",
    clear: "Clear selection",
    projects: "Projects",
    opportunities: "Opportunities",
    investment: "Total investment",
    jobs: "Estimated jobs",
    activeSectors: "Active sectors",
    projectList: "Department projects",
    noResults: "No projects or opportunities are available for this filter.",
    noProjects: "No positioned projects are available for this department and filter.",
    noSummary: "No indicators are available for this department.",
    stage: { promotion: "Promotion", announced: "Announced", startup: "Start-up", implementing: "Implementing", stalled: "On hold", finished: "Finished", cancelled: "Cancelled" },
    withActivity: "With activity",
    noPublicData: "No public data",
    selected: "Selected",
    filtered: "Outside filter",
    attribution: "© OpenStreetMap contributors",
  },
};

import type { Locale } from "@/src/i18n/config";

export type InvestmentMapCopy = {
  eyebrow: string;
  title: string;
  description: string;
  filterLabel: string;
  allSectors: string;
  loadingMap: string;
  loadingData: string;
  loadingMunicipalities: string;
  loadingProjects: string;
  mapError: string;
  summaryError: string;
  municipalitiesError: string;
  projectsError: string;
  noGeometry: string;
  noMunicipalities: string;
  selectDepartment: string;
  selectedDepartment: string;
  selectedMunicipality: string;
  selectedProject: string;
  clear: string;
  clearProject: string;
  clearMunicipality: string;
  projects: string;
  opportunities: string;
  investment: string;
  jobs: string;
  activeSectors: string;
  projectList: string;
  geolocatedProjects: string;
  noResults: string;
  noProjects: string;
  noGeolocatedProjectsDepartment: string;
  noGeolocatedProjectsMunicipality: string;
  noSummary: string;
  stage: Record<string, string>;
  withActivity: string;
  noPublicData: string;
  selected: string;
  filtered: string;
  attribution: string;
  infrastructureLayers: string;
  ports: string;
  airports: string;
  layerLoading: string;
  layerError: string;
  selectedInfrastructure: string;
  clearInfrastructure: string;
  infrastructureType: string;
  operator: string;
  status: string;
  source: string;
  viewSource: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchNoResults: string;
  clearSearch: string;
  searchResults: string;
  panelEyebrow: string;
  searchGroups: Record<"department" | "municipality" | "project", string>;
  clearFilters: string;
  currentFilters: string;
  activeLayersCount: string;
  visibleProjectsCount: string;
  loadedMunicipalitiesCount: string;
  legend: string;
  legendDepartment: string;
  legendMunicipality: string;
  legendProject: string;
  legendSelectedProject: string;
  mapAriaLabel: string;
  mapInstructions: string;
  stageLabel: string;
  zoomIn: string;
  zoomOut: string;
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
    loadingMunicipalities: "Cargando municipios…",
    loadingProjects: "Cargando proyectos…",
    mapError: "No se pudo cargar la cartografía. Intente de nuevo más tarde.",
    summaryError: "Los indicadores territoriales no están disponibles por ahora.",
    municipalitiesError: "No se pudieron cargar los municipios de este departamento.",
    projectsError: "No se pudo cargar la lista de proyectos.",
    noGeometry: "No hay geometrías de departamentos disponibles.",
    noMunicipalities: "No hay municipios disponibles.",
    selectDepartment: "Seleccione un departamento para explorar sus oportunidades y proyectos de inversión.",
    selectedDepartment: "Departamento seleccionado",
    selectedMunicipality: "Municipio seleccionado",
    selectedProject: "Proyecto seleccionado",
    clear: "Limpiar departamento",
    clearProject: "Limpiar proyecto",
    clearMunicipality: "Limpiar municipio",
    projects: "Proyectos",
    opportunities: "Oportunidades",
    investment: "Inversión total",
    jobs: "Empleos estimados",
    activeSectors: "Sectores activos",
    projectList: "Proyectos del departamento",
    geolocatedProjects: "Proyectos georreferenciados",
    noResults: "No hay proyectos u oportunidades disponibles para este filtro.",
    noProjects: "No hay proyectos posicionados para este departamento y filtro.",
    noGeolocatedProjectsDepartment: "No hay proyectos georreferenciados en este departamento.",
    noGeolocatedProjectsMunicipality: "No hay proyectos georreferenciados para este municipio.",
    noSummary: "No hay indicadores disponibles para este departamento.",
    stage: { promotion: "Promoción", announced: "Anunciado", startup: "Arranque", implementing: "Implementando", stalled: "En pausa", finished: "Finalizado", cancelled: "Cancelado" },
    withActivity: "Con actividad",
    noPublicData: "Sin datos públicos",
    selected: "Seleccionado",
    filtered: "Fuera del filtro",
    attribution: "Datos geográficos CNI Honduras",
    infrastructureLayers: "Infraestructura estratégica",
    ports: "Puertos",
    airports: "Aeropuertos",
    layerLoading: "Cargando",
    layerError: "No disponible",
    selectedInfrastructure: "Infraestructura seleccionada",
    clearInfrastructure: "Limpiar infraestructura",
    infrastructureType: "Tipo",
    operator: "Operador",
    status: "Estado",
    source: "Fuente",
    viewSource: "Consultar fuente",
    searchLabel: "Buscar en el mapa",
    searchPlaceholder: "Buscar departamento, municipio o proyecto",
    searchNoResults: "No hay resultados cargados para esta búsqueda.",
    clearSearch: "Limpiar búsqueda",
    searchResults: "Resultados de búsqueda del mapa",
    panelEyebrow: "CNI · Honduras",
    searchGroups: { department: "Departamentos", municipality: "Municipios cargados", project: "Proyectos cargados" },
    clearFilters: "Limpiar filtros",
    currentFilters: "Filtros activos",
    activeLayersCount: "Capas activas",
    visibleProjectsCount: "Proyectos visibles",
    loadedMunicipalitiesCount: "Municipios cargados",
    legend: "Leyenda",
    legendDepartment: "Departamento",
    legendMunicipality: "Municipio",
    legendProject: "Proyecto",
    legendSelectedProject: "Proyecto seleccionado",
    mapAriaLabel: "Mapa interactivo de inversión de Honduras",
    mapInstructions: "Use los controles de zoom o seleccione un resultado de búsqueda para navegar el mapa.",
    stageLabel: "Etapa",
    zoomIn: "Acercar mapa",
    zoomOut: "Alejar mapa",
  },
  en: {
    eyebrow: "Territorial intelligence · CNI Honduras",
    title: "The investment map",
    description: "Explore Honduras's investment pulse by department and strategic sector.",
    filterLabel: "Filter by sector",
    allSectors: "All sectors",
    loadingMap: "Loading national cartography…",
    loadingData: "Loading territorial indicators…",
    loadingMunicipalities: "Loading municipalities…",
    loadingProjects: "Loading projects…",
    mapError: "Cartography could not be loaded. Please try again later.",
    summaryError: "Territorial indicators are unavailable right now.",
    municipalitiesError: "Municipalities for this department could not be loaded.",
    projectsError: "The project list could not be loaded.",
    noGeometry: "No department geometries are available.",
    noMunicipalities: "No municipalities are available.",
    selectDepartment: "Select a department to explore its investment opportunities and projects.",
    selectedDepartment: "Selected department",
    selectedMunicipality: "Selected municipality",
    selectedProject: "Selected project",
    clear: "Clear department",
    clearProject: "Clear project",
    clearMunicipality: "Clear municipality",
    projects: "Projects",
    opportunities: "Opportunities",
    investment: "Total investment",
    jobs: "Estimated jobs",
    activeSectors: "Active sectors",
    projectList: "Department projects",
    geolocatedProjects: "Georeferenced projects",
    noResults: "No projects or opportunities are available for this filter.",
    noProjects: "No positioned projects are available for this department and filter.",
    noGeolocatedProjectsDepartment: "No georeferenced projects in this department.",
    noGeolocatedProjectsMunicipality: "No georeferenced projects for this municipality.",
    noSummary: "No indicators are available for this department.",
    stage: { promotion: "Promotion", announced: "Announced", startup: "Start-up", implementing: "Implementing", stalled: "On hold", finished: "Finished", cancelled: "Cancelled" },
    withActivity: "With activity",
    noPublicData: "No public data",
    selected: "Selected",
    filtered: "Outside filter",
    attribution: "CNI Honduras geographic data",
    infrastructureLayers: "Strategic infrastructure",
    ports: "Ports",
    airports: "Airports",
    layerLoading: "Loading",
    layerError: "Unavailable",
    selectedInfrastructure: "Selected infrastructure",
    clearInfrastructure: "Clear infrastructure",
    infrastructureType: "Type",
    operator: "Operator",
    status: "Status",
    source: "Source",
    viewSource: "View source",
    searchLabel: "Search the map",
    searchPlaceholder: "Search department, municipality or project",
    searchNoResults: "No loaded results match this search.",
    clearSearch: "Clear search",
    searchResults: "Map search results",
    panelEyebrow: "CNI · Honduras",
    searchGroups: { department: "Departments", municipality: "Loaded municipalities", project: "Loaded projects" },
    clearFilters: "Clear filters",
    currentFilters: "Active filters",
    activeLayersCount: "Active layers",
    visibleProjectsCount: "Visible projects",
    loadedMunicipalitiesCount: "Loaded municipalities",
    legend: "Legend",
    legendDepartment: "Department",
    legendMunicipality: "Municipality",
    legendProject: "Project",
    legendSelectedProject: "Selected project",
    mapAriaLabel: "Interactive investment map of Honduras",
    mapInstructions: "Use the zoom controls or select a search result to navigate the map.",
    stageLabel: "Stage",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
  },
};

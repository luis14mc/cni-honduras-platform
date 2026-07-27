/**
 * Architectural Ledger — CNI institutional palette
 *
 * PRIMARY (mantener):
 * #252A58  button navy   — botones, CTAs, ancla principal
 * #24436B  navy          — zonas oscuras, autoridad
 *
 * VERDES INSTITUCIONALES:
 * #29AB85  green sea      — acento principal en hero y títulos
 * #0E7A7C  green deep     — estructura, profundidad, tarjetas
 * #35A963  green mid      — líneas, badges, dots, métricas
 * #8DC046  green lime     — acentos claros, hovers, gradientes
 *
 * NEUTROS:
 * #B6C2D3  mist           — bordes, líneas suaves
 * #00ADEE  sky            — acento puntual en oscuro (secundario)
 */

export const architecturalLedger = {
  colors: {
    buttonNavy: "#252A58",
    navy: "#24436B",
    greenSea: "#29AB85",
    greenDeep: "#0E7A7C",
    greenMid: "#35A963",
    greenLime: "#8DC046",
    mist: "#B6C2D3",
    sky: "#00ADEE",

    surface: "#f8f9ff",
    surfaceContainerLowest: "#ffffff",
    surfaceContainerLow: "#eff4ff",
    surfaceContainer: "#e5eeff",
    onSurface: "#252A58",
    onSurfaceVariant: "#0E7A7C",
    onBackground: "#252A58",
    background: "#f8f9ff",

    primary: "#252A58",
    onPrimary: "#ffffff",
    primaryContainer: "#24436B",
    onPrimaryContainer: "#B6C2D3",

    outline: "#B6C2D3",
    outlineVariant: "#dce9ff",

    error: "#ba1a1a",
    onError: "#ffffff",
    errorContainer: "#ffdad6",
    onErrorContainer: "#93000a",
  },

  gradients: {
    accentLine: "linear-gradient(90deg, #0E7A7C 0%, #29AB85 50%, #8DC046 100%)",
    navy: "linear-gradient(135deg, #252A58 0%, #24436B 100%)",
    institutional: "linear-gradient(135deg, #0E7A7C 0%, #252A58 55%, #24436B 100%)",
    hero: "linear-gradient(120deg, #29AB85 0%, #0E7A7C 38%, #252A58 72%, #24436B 100%)",
    surface: "linear-gradient(180deg, #f8f9ff 0%, #e5eeff 100%)",
  },

  spacing: {
    base: 4,
    unit: 8,
    xs: 8,
    sm: 16,
    md: 24,
    lg: 40,
    xl: 64,
    gutter: 24,
    containerMax: 1440,
    marginDesktop: 48,
    marginTablet: 32,
    marginMobile: 20,
  },

  radius: {
    sm: "0.25rem",
    DEFAULT: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    full: "9999px",
  },

  shadow: {
    ambient: "0 10px 30px rgba(37, 42, 88, 0.1)",
    cardHover: "0 10px 30px rgba(37, 42, 88, 0.1)",
  },

  typography: {
    display: "var(--font-aptos), system-ui, sans-serif",
    body: "var(--font-montserrat), system-ui, sans-serif",
  },
} as const;

export const ledgerChartStops = {
  buttonNavy: "#252A58",
  navy: "#24436B",
  greenDeep: "#0E7A7C",
  greenSea: "#29AB85",
  greenMid: "#35A963",
  greenLime: "#8DC046",
  mist: "#B6C2D3",
  sky: "#00ADEE",
} as const;

export function ledgerChartPalette(locale: "es" | "en") {
  const c = ledgerChartStops;
  return {
    ied: {
      labels: ["2020", "2021", "2022", "2023", "2024", "2025"],
      datasets: [
        {
          label: "Total",
          data: [418.6, 738.7, 822.6, 1076, 993.9],
          color: c.greenSea,
          backgroundColor: "rgba(41, 171, 133, 0.82)",
        },
        {
          label: locale === "es" ? "I Semestre" : "1st Semester",
          data: [289.6, 366.8, 459.9, 492.5, 470.1, 500.4],
          color: c.buttonNavy,
          backgroundColor: "rgba(37, 42, 88, 0.88)",
        },
      ],
    },
    pib: {
      labels: ["2024", "2025", "2026", "2027", "2028", "2029"],
      datasets: [
        { label: "Honduras", data: [3.6, 3.5, 3.7, 3.8, 3.85, 3.85], color: c.greenMid },
        { label: "Costa Rica", data: [4.0, 3.5, 3.5, 3.5, 3.49, 3.45], color: c.greenSea },
        { label: "El Salvador", data: [3.0, 3.0, 2.8, 2.8, 2.8, 2.8], color: c.mist },
        { label: "Guatemala", data: [3.41, 3.6, 3.7, 3.75, 3.75, 3.75], color: c.navy },
      ],
    },
    clima: {
      labels: ["2022", "2023", "2024"],
      datasets: [
        { label: "Panamá", data: [35, 27, 39], color: c.greenDeep, backgroundColor: "rgba(14, 122, 124, 0.78)" },
        { label: "Guatemala", data: [36, 37, 44], color: c.navy, backgroundColor: "rgba(36, 67, 107, 0.82)" },
        { label: "El Salvador", data: [44, 44, 50], color: c.mist, backgroundColor: "rgba(182, 194, 211, 0.85)" },
        { label: "Costa Rica", data: [45, 45, 51], color: c.greenSea, backgroundColor: "rgba(41, 171, 133, 0.72)" },
        { label: "Nicaragua", data: [18, 26, 53], color: c.buttonNavy, backgroundColor: "rgba(37, 42, 88, 0.88)" },
        { label: "Honduras", data: [47, 47, 60], color: c.greenLime, backgroundColor: "rgba(141, 192, 70, 0.78)" },
      ],
    },
  };
}

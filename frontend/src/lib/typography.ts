/**
 * Escala tipográfica institucional CNI — usar en Home, Por qué Honduras y páginas nuevas.
 * Aptos (display/headline) + Montserrat (body).
 */
export const type = {
  /** Overline de sección — verde institucional */
  eyebrow: "font-headline text-[11px] font-bold uppercase tracking-[0.22em] text-[#29AB85]",

  /** Overline sobre fondos oscuros */
  eyebrowOnDark: "font-headline text-[11px] font-bold uppercase tracking-[0.22em] text-[#29AB85]",

  /** Badge en hero de página interior */
  heroEyebrow:
    "inline-flex items-center rounded-sm border border-[#35A963]/40 bg-[#252A58]/20 px-3 py-1 font-headline text-[11px] font-bold uppercase tracking-[0.22em] text-[#35A963] backdrop-blur-sm",

  /** H1 de hero interior (PageHero) */
  heroTitle:
    "font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl",

  /** Lead / descripción bajo hero */
  heroLead: "font-body text-base font-light leading-relaxed md:text-lg",

  /** H2 de sección — título principal de bloque */
  h2: "font-display text-3xl font-extrabold tracking-tight text-cni-primary md:text-4xl",

  /** H2 de sección en mayúsculas (home, banners) */
  h2Upper:
    "font-display text-3xl font-extrabold uppercase tracking-tight text-cni-primary md:text-4xl",

  /** H2 sobre fondo oscuro */
  h2OnDark: "font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl",

  /** H3 de subsección o bloque destacado */
  h3: "font-display text-xl font-extrabold text-cni-primary md:text-2xl",

  /** H3 en tarjetas y listas */
  h3Card: "font-display text-lg font-extrabold text-cni-primary",

  /** Párrafo introductorio de sección */
  lead: "font-body text-base leading-relaxed text-cni-on-surface-variant md:text-lg",

  /** Cuerpo estándar */
  body: "font-body text-base leading-relaxed text-[#64748B]",

  /** Cuerpo pequeño — listas, metadatos */
  bodySm: "font-body text-sm leading-relaxed text-[#64748B]",

  /** Fuente / caption / atribución */
  caption: "font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-[#64748B]",

  /** Caption sobre fondo oscuro */
  captionOnDark: "font-headline text-[11px] leading-relaxed text-white/45",

  /** Valor numérico destacado (métricas) */
  metricValue: "font-display text-4xl font-extrabold text-cni-primary",

  /** Etiqueta de métrica */
  metricLabel: "font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-cni-secondary",

  /** Regla decorativa bajo títulos */
  sectionRule: "h-1 w-16 bg-[#29AB85]",

  /** Botón / CTA institucional */
  button: "font-headline text-[11px] font-bold uppercase tracking-[0.16em]",
} as const;

/** Contenedor estándar de sección */
export const layout = {
  section: "py-20 md:py-24",
  container: "mx-auto max-w-screen-2xl px-6 md:px-10",
  containerNarrow: "mx-auto max-w-4xl px-6 md:px-10",
} as const;

import type { Locale } from "@/src/i18n/config";

const IMG = {
  ag: "https://lh3.googleusercontent.com/aida-public/AB6AXuDt53nZwCSZLm8h8xxBUNh_uGo8ut5uUCVGp9kTBBCcX25NY8HCP43IfYeDlZZiuPTGmnDqdK-6Vb-efRfe6u6yWKlHebWXujw4J_rM8HnME0qphBB24Xo-te7q_EOMk8FlcZkKL6Nx-EVm5B0q5OXJTzHSlpulIg94XfcffYcefYpA4cwm3gUY25UdS_dPGyCnlbkQj0k0-ZTrxi-pKIbfN5BB89obMTwKkjzZ1IsguYskp-q176BGhQXarPowqlnWqknjP7n9POkv",
  mfg: "https://lh3.googleusercontent.com/aida-public/AB6AXuADsdW8hzklIiRLjcrSfs-ib798UIAXSbLMTolVY65H1ICOiZY0TMkGaJbrCCH9j8VkiyZ6i37gzGxnyGUlj8NSGUyil2lqV9M0BkwOv4hcaKYUG9Ve6JN1RE1p6eHEfq9VkCQfMUuIWaNhSgfuKJ_c0TEoDlH03nhzPOkOE14Kw9OmOmRr8SRkmY3bANDC5PsrEGlHT8tIIIXqI6Tmrd57UHy6j3hq_LPH2DHY7ZoLuulsFhZp7NbqNWTUZRhrAAyUMPUqueI03q5w",
  tour: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxpZeGXYKTRux4tvYfEl37kJxRCOKI1UeNfc-7UYNueQMN2KW-e5nSznvHdM-8rQo9UoNIzGqCjrkXGDo0y-NMEsxu8LJg1gHzqB0EhjMud3o3JJqmJsfbmmDa_JZuLfGpWuAvnok-isB1YPcqrzelvKWrhjzI3l1ZXwI_HxdGfg2vrf_2UpQAKOBAYOmEHZdDeIO6zDMHdSNCkLqG-JnPyEv6p9GX_ThVSJRbpg9HeZGgHHo-TTPYv2SR-eZQ-_TBhz5vfGtyJgvC",
  ene: "https://lh3.googleusercontent.com/aida-public/AB6AXuC7uz1v0pqw-FxB1gaTgyslCVx0XZsGJggLMP3ZuuBU4XXxLuZN_ZdeE4D3NPJ9RGrEq_A5d4B9gB3OnHWAsuj4cxm9QmvTqLl4PbWseLqPWYO-TR2iadoPYlUsloBStG4697O893hyUI1rVzOq2z-lVcMt5OPv8_5tiCm20vCDomPT2_Uk3qMXvHtKAEp3g4nLspla25unBGJVGj77lcmGT7butTItcu7xRoS2R__X9dn01fDPYQ6gQQfQa9q5br7iyETwj1xZbzJo",
  bpo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCXOOlNGhnl9ZG_4ziUTjkLWeq7r8eN6V2rRUQ8ymMOLmWIaHt5tgQwY4MtkwG0qIKZsJWthYi6T5NlnHhAGcSGLXfM0ojyHdUk5iyAIb2BgyP7b2jcICLg9bRM7bc1bOCN8eXcOXVkR34WrF8bJi1UgKU6-kRe79sCMUHuM8xeFhI_KE54XbEzEaPq6I6OLGCeESgJ_KX5owxgzTDkUQ3GG5bpvB-djusBPfnknD8h8RZlVLLoY4liRjMGQ5D1TyHTAvuz4nKltHBJ",
} as const;

type SectorCopy = {
  slug: string;
  name: string;
  short: string;
  fullText: string;
  highlights: readonly string[];
  image: string;
};

const esSectores: ReadonlyArray<SectorCopy> = [
  {
    slug: "agroindustria",
    name: "Agroindustria Premium",
    short: "Clima fértil los 365 días. Café, cacao, tabaco.",
    fullText:
      "Aprovechando la diversidad ecológica y las rutas comerciales estratégicas para diseñar la próxima generación de inversión agrícola global de alto rendimiento.",
    highlights: ["Café de especialidad", "Cacao fino de aroma", "Tabaco premium", "Aceite de palma sostenible"],
    image: IMG.ag,
  },
  {
    slug: "manufactura",
    name: "Manufactura y Textil",
    short: "Liderazgo en nearshoring, beneficios 'Zero-Duty' hacia EE.UU.",
    fullText:
      "Hub de clase mundial para confección, ensamble ligero y componentes automotrices destinados a Norteamérica, con un ecosistema maduro de zonas libres y logística automatizada.",
    highlights: ["Nearshoring CAFTA-DR", "Zonas Libres (ZOLI)", "Logística multimodal", "Talento técnico"],
    image: IMG.mfg,
  },
  {
    slug: "turismo",
    name: "Turismo Sustentable",
    short: "Islas de la Bahía, arrecifes y arqueología Maya.",
    fullText:
      "Activos naturales sin igual, proximidad geográfica estratégica e incentivos institucionales para la hospitalidad de alta gama y eco-lujo certificado.",
    highlights: ["Roatán y Utila", "Ruinas de Copán", "Eco-lodges", "Marinas y cruceros"],
    image: IMG.tour,
  },
  {
    slug: "energia",
    name: "Energía Renovable",
    short: "Matriz 60% limpia. Proyectos solares, eólicos e hidroeléctricos.",
    fullText:
      "Transición acelerada hacia energías 100% renovables, con apertura en producción solar, eólica e hidrógeno verde, y demanda eléctrica creciente al 3.5–4% anual.",
    highlights: ["Solar y eólico", "Hidroeléctricas", "Hidrógeno verde", "Hub regional de red"],
    image: IMG.ene,
  },
  {
    slug: "bpo",
    name: "BPO / Call Centers",
    short: "Talento joven y bilingüe de alto rendimiento.",
    fullText:
      "Ventaja demográfica con la fuerza laboral más joven de Centroamérica y dominio del inglés en centros urbanos para operaciones nearshore de alto valor.",
    highlights: ["90% fluidez en inglés", "Edad mediana 24", "Costos competitivos", "Centros tecnológicos urbanos"],
    image: IMG.bpo,
  },
];

const enSectores: ReadonlyArray<SectorCopy> = [
  {
    slug: "agroindustria",
    name: "Premium agribusiness",
    short: "Fertile climate year-round. Coffee, cocoa, tobacco.",
    fullText:
      "Leveraging ecological diversity and strategic trade routes to design the next generation of high-yield global agricultural investment.",
    highlights: ["Specialty coffee", "Fine aroma cocoa", "Premium tobacco", "Sustainable palm oil"],
    image: IMG.ag,
  },
  {
    slug: "manufactura",
    name: "Manufacturing & textiles",
    short: "Nearshoring leadership, Zero-Duty benefits to the U.S.",
    fullText:
      "World-class hub for apparel, light assembly, and automotive components bound for North America, with mature free zones and automated logistics.",
    highlights: ["CAFTA-DR nearshoring", "Free Zones (ZOLI)", "Multimodal logistics", "Technical talent"],
    image: IMG.mfg,
  },
  {
    slug: "turismo",
    name: "Sustainable tourism",
    short: "Bay Islands, reefs, and Maya archaeology.",
    fullText:
      "Unmatched natural assets, strategic geography, and institutional incentives for high-end hospitality and certified eco-luxury.",
    highlights: ["Roatán & Utila", "Copán ruins", "Eco-lodges", "Marinas & cruises"],
    image: IMG.tour,
  },
  {
    slug: "energia",
    name: "Renewable energy",
    short: "~60% clean matrix. Solar, wind, and hydro projects.",
    fullText:
      "Accelerated transition toward 100% renewable generation, with openings in solar, wind, and green hydrogen, and power demand growing ~3.5–4% annually.",
    highlights: ["Solar & wind", "Hydro", "Green hydrogen", "Regional grid hub"],
    image: IMG.ene,
  },
  {
    slug: "bpo",
    name: "BPO / call centers",
    short: "Young, high-performing bilingual talent.",
    fullText:
      "Demographic advantage with Central America’s youngest workforce and English proficiency in urban centers for high-value nearshore operations.",
    highlights: ["~90% English fluency", "Median age 24", "Competitive costs", "Urban tech hubs"],
    image: IMG.bpo,
  },
];

export const invertirPageCopy: Record<
  Locale,
  {
    heroEyebrow: string;
    heroTitleBefore: string;
    heroTitleAccent: string;
    heroTitleAfter: string;
    heroDescription: string;
    heroImageAlt: string;
    stickySector: string;
    sectionEyebrow: string;
    sectionTitle: string;
    sectionDescription: string;
    sectorBadge: string;
    viewDetail: string;
    ctaAdvisor: string;
    ctaGuide: string;
    ctaTitle: string;
    ctaBody: string;
    ctaAdvisory: string;
    ctaCni: string;
    sectors: ReadonlyArray<SectorCopy>;
  }
> = {
  es: {
    heroEyebrow: "Marco Nacional de Inversión",
    heroTitleBefore: "Sectores",
    heroTitleAccent: "Estratégicos",
    heroTitleAfter: "de Inversión",
    heroDescription:
      "Aprovechando la ventaja geográfica única de Honduras y un marco económico estable para ofrecer oportunidades de alto rendimiento en cinco industrias prioritarias.",
    heroImageAlt: "Paisaje industrial y agrícola",
    stickySector: "Sector",
    sectionEyebrow: "Cinco motores de la economía hondureña",
    sectionTitle: "Sectores Estratégicos",
    sectionDescription:
      "Cada sector es respaldado por el CNI bajo los regímenes LPPI y ZOLI, con servicios legales, técnicos y de inteligencia de datos sin costo para el inversionista.",
    sectorBadge: "Sector",
    viewDetail: "Ver detalle",
    ctaAdvisor: "Conversar con un asesor",
    ctaGuide: "Descargar guía",
    ctaTitle: "¿Listo para activar su tesis de inversión en Honduras?",
    ctaBody:
      "Nuestros asesores institucionales atienden solicitudes específicas: análisis de prefactibilidad, marco legal, visitas in situ y conexión con el ecosistema público-privado.",
    ctaAdvisory: "Asesoría gratuita",
    ctaCni: "Servicios del CNI",
    sectors: esSectores,
  },
  en: {
    heroEyebrow: "National investment framework",
    heroTitleBefore: "Strategic",
    heroTitleAccent: "investment",
    heroTitleAfter: "sectors",
    heroDescription:
      "Leveraging Honduras’ unique geography and a stable economic framework to deliver high-return opportunities across five priority industries.",
    heroImageAlt: "Industrial and agricultural landscape",
    stickySector: "Sector",
    sectionEyebrow: "Five engines of the Honduran economy",
    sectionTitle: "Strategic sectors",
    sectorBadge: "Sector",
    sectionDescription:
      "Each sector is backed by the CNI under LPPI and ZOLI regimes, with legal, technical, and data intelligence services at no cost to the investor.",
    viewDetail: "View details",
    ctaAdvisor: "Talk to an advisor",
    ctaGuide: "Download guide",
    ctaTitle: "Ready to activate your investment thesis in Honduras?",
    ctaBody:
      "Our institutional advisors handle specific requests: pre-feasibility analysis, legal framework, site visits, and connections across the public-private ecosystem.",
    ctaAdvisory: "Free advisory",
    ctaCni: "CNI services",
    sectors: enSectores,
  },
};

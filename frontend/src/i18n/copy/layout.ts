import type { Locale } from "@/src/i18n/config";

export const layoutCopy: Record<
  Locale,
  {
    skipToContent: string;
    nav: {
      brandSubtitle: string;
      home: string;
      invertir: string;
      crecer: string;
      cni: string;
      vivir: string;
      recursos: string;
      openMenu: string;
      closeMenu: string;
      learnMore: string;
      top: { press: string; advisory: string; procedures: string };
      dropdowns: {
        invertir: { label: string; sectors: string };
        crecer: {
          label: string;
          portfolio: string;
          cases: string;
          pdi: string;
        };
        cni: {
          label: string;
          legal: string;
          technical: string;
          data: string;
        };
      };
    };
    footer: {
      tagline: string;
      institutional: string;
      resources: string;
      contact: string;
      links: {
        theCni: string;
        legalServices: string;
        dataIntel: string;
        pressRoom: string;
        onlineProcedures: string;
        pdi: string;
      };
      copyright: string;
    };
    language: { es: string; en: string; aria: string };
  }
> = {
  es: {
    skipToContent: "Saltar al contenido",
    nav: {
      brandSubtitle: "Consejo Nacional de Inversiones",
      home: "Inicio",
      invertir: "Invertir en Honduras",
      crecer: "Crecer en Honduras",
      cni: "CNI",
      vivir: "Vivir en Honduras",
      recursos: "Recursos",
      openMenu: "Abrir menú",
      closeMenu: "Cerrar menú",
      learnMore: "Saber más",
      top: { press: "Sala de Prensa", advisory: "Asesoría Gratuita", procedures: "Trámites en Línea" },
      dropdowns: {
        invertir: {
          label: "Invertir en Honduras",
          sectors: "Sectores de Inversión (Agroindustria, Manufactura, Turismo, Energía, BPO)",
        },
        crecer: {
          label: "Crecer en Honduras",
          portfolio: "Portafolio de Inversiones",
          cases: "Casos de Éxito",
          pdi: "Portal Digital de Inversiones",
        },
        cni: {
          label: "CNI",
          legal: "Servicios Legales",
          technical: "Servicios Técnicos",
          data: "Inteligencia de Datos",
        },
      },
    },
    footer: {
      tagline: "Promoviendo y protegiendo la Inversión Extranjera Directa en la República de Honduras.",
      institutional: "Institucional",
      resources: "Recursos",
      contact: "Contacto",
      links: {
        theCni: "El CNI",
        legalServices: "Servicios Legales",
        dataIntel: "Inteligencia de Datos",
        pressRoom: "Sala de Prensa",
        onlineProcedures: "Trámites en Línea",
        pdi: "Portal Digital de Inversiones",
      },
      copyright: "Todos los derechos reservados.",
    },
    language: { es: "ES", en: "EN", aria: "Idioma" },
  },
  en: {
    skipToContent: "Skip to content",
    nav: {
      brandSubtitle: "National Investment Council",
      home: "Home",
      invertir: "Invest in Honduras",
      crecer: "Grow in Honduras",
      cni: "CNI",
      vivir: "Live in Honduras",
      recursos: "Resources",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      learnMore: "Learn more",
      top: { press: "Press Room", advisory: "Free Advisory", procedures: "Online Procedures" },
      dropdowns: {
        invertir: {
          label: "Invest in Honduras",
          sectors: "Investment sectors (Agribusiness, Manufacturing, Tourism, Energy, BPO)",
        },
        crecer: {
          label: "Grow in Honduras",
          portfolio: "Investment portfolio",
          cases: "Success stories",
          pdi: "Digital Investment Portal",
        },
        cni: {
          label: "CNI",
          legal: "Legal services",
          technical: "Technical services",
          data: "Data intelligence",
        },
      },
    },
    footer: {
      tagline: "Promoting and protecting foreign direct investment in the Republic of Honduras.",
      institutional: "Institutional",
      resources: "Resources",
      contact: "Contact",
      links: {
        theCni: "The CNI",
        legalServices: "Legal services",
        dataIntel: "Data intelligence",
        pressRoom: "Press room",
        onlineProcedures: "Online procedures",
        pdi: "Digital Investment Portal",
      },
      copyright: "All rights reserved.",
    },
    language: { es: "ES", en: "EN", aria: "Language" },
  },
};

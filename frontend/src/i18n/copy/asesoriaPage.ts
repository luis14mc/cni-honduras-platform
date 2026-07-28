import type { Locale } from "@/src/i18n/config";

export const asesoriaPageCopy: Record<
  Locale,
  {
    welcomeTitlePrefix: string;
    welcomeTitleHighlight: string;
    welcomeTitleSuffix: string;
    welcomeDescription: string;
    formSectionTitle: string;
    formSectionDescription: string;
    formEyebrow: string;
    formTitle: string;
    formDescription: string;
    labels: {
      name: string;
      org: string;
      email: string;
      phone: string;
      sector: string;
      message: string;
    };
    sectorInterest: string;
    sectors: readonly string[];
    messagePlaceholder: string;
    submit: string;
    privacyNote: string;
    contactOptionsTitle: string;
    contactOptions: {
      whatsapp: { title: string; cta: string; href: string };
      phone: { title: string; display: string; href: string };
      visit: { title: string; address: string };
    };
    hqTitle: string;
    hqAddress: string;
    hqPhone: string;
    hqEmail: string;
    spsTitle: string;
    spsBody: string;
    spsEmail: string;
    spsPhone: string;
  }
> = {
  es: {
    welcomeTitlePrefix: "Bienvenido al",
    welcomeTitleHighlight: "Centro de Apoyo al Inversionista",
    welcomeTitleSuffix: "del CNI",
    welcomeDescription:
      "El CNI está comprometido en facilitar la inversión en Honduras. Nuestro equipo de profesionales está a la orden para brindar asistencia especializada a los inversionistas que están evaluando invertir o crecer en Honduras.",
    formSectionTitle: "Solicitud de asistencia personalizada",
    formSectionDescription:
      "Para facilitar el procesamiento de tu solicitud de asistencia necesitamos que nos proveas la siguiente información:",
    formEyebrow: "Formulario institucional",
    formTitle: "Cuéntenos sobre su proyecto",
    formDescription: "Conectaremos a un especialista del CNI según el sector, la región y la etapa de su proyecto.",
    labels: {
      name: "Nombre completo",
      org: "Empresa u organización",
      email: "Correo profesional",
      phone: "Teléfono",
      sector: "Sector de interés",
      message: "Mensaje",
    },
    sectorInterest: "Sector de interés",
    sectors: [
      "Agroindustria",
      "Manufactura y Textil",
      "Turismo Sustentable",
      "Energía Renovable",
      "Infraestructura",
      "BPO / Call Centers",
      "Otro",
    ],
    messagePlaceholder: "Describa brevemente su proyecto, ubicación y necesidades de acompañamiento.",
    submit: "Enviar solicitud",
    privacyNote:
      "Sus datos son tratados de forma confidencial bajo la Ley de Protección de Datos de Honduras y no serán compartidos sin su autorización.",
    contactOptionsTitle: "Otras opciones de contacto",
    contactOptions: {
      whatsapp: {
        title: "Conversar con nuestro equipo por WhatsApp",
        cta: "Abrir WhatsApp",
        href: "https://api.whatsapp.com/send?phone=50487848706&text=Hola,%20me%20gustaria%20Obtener%20m%C3%A1s%20informaci%C3%B3n",
      },
      phone: {
        title: "Llamando",
        display: "(504) 2242-8955",
        href: "tel:+50422428955",
      },
      visit: {
        title: "Visítanos",
        address: "Centro Cívico Gubernamental, Torre 1, Nivel 12, Tegucigalpa, Honduras",
      },
    },
    hqTitle: "Sede principal · Tegucigalpa",
    hqAddress: "Centro Cívico Gubernamental (CCG), Torre 1, Piso 12. Tegucigalpa, Honduras.",
    hqPhone: "(504) 2242-8955",
    hqEmail: "seguimiento@cni.hn",
    spsTitle: "San Pedro Sula",
    spsBody:
      "Cámara de Comercio e Industria de Cortés. Col. Las Brisas, 22 y 24 calle entre 1 y 4ª avenida Junior.",
    spsEmail: "oficinasps@cni.hn",
    spsPhone: "(504) 2561-6100 ext. 109",
  },
  en: {
    welcomeTitlePrefix: "Welcome to the CNI",
    welcomeTitleHighlight: "Investor Support Center",
    welcomeTitleSuffix: "",
    welcomeDescription:
      "The CNI is committed to facilitating investment in Honduras. Our team of professionals is ready to provide specialized assistance to investors evaluating opportunities to invest or grow in the country.",
    formSectionTitle: "Personalized assistance request",
    formSectionDescription:
      "To process your assistance request efficiently, please provide the following information:",
    formEyebrow: "Institutional form",
    formTitle: "Tell us about your project",
    formDescription: "We will connect you with a CNI specialist based on sector, region, and project stage.",
    labels: {
      name: "Full name",
      org: "Company or organization",
      email: "Work email",
      phone: "Phone",
      sector: "Sector of interest",
      message: "Message",
    },
    sectorInterest: "Sector of interest",
    sectors: [
      "Agribusiness",
      "Manufacturing & textiles",
      "Sustainable tourism",
      "Renewable energy",
      "Infrastructure",
      "BPO / call centers",
      "Other",
    ],
    messagePlaceholder: "Briefly describe your project, location, and support needs.",
    submit: "Send request",
    privacyNote:
      "Your data is handled confidentially under Honduras's Data Protection Law and will not be shared without authorization.",
    contactOptionsTitle: "Other contact options",
    contactOptions: {
      whatsapp: {
        title: "Chat with our team on WhatsApp",
        cta: "Open WhatsApp",
        href: "https://api.whatsapp.com/send?phone=50487848706&text=Hello,%20I%20would%20like%20to%20get%20more%20information",
      },
      phone: {
        title: "Call us",
        display: "(504) 2242-8955",
        href: "tel:+50422428955",
      },
      visit: {
        title: "Visit us",
        address: "Government Civic Center, Tower 1, Level 12, Tegucigalpa, Honduras",
      },
    },
    hqTitle: "Headquarters · Tegucigalpa",
    hqAddress: "Government Civic Center (CCG), Tower 1, 12th floor. Tegucigalpa, Honduras.",
    hqPhone: "(504) 2242-8955",
    hqEmail: "seguimiento@cni.hn",
    spsTitle: "San Pedro Sula",
    spsBody:
      "Cortés Chamber of Commerce and Industry. Las Brisas neighborhood, 22nd & 24th streets between 1st and 4th Junior avenues.",
    spsEmail: "oficinasps@cni.hn",
    spsPhone: "(504) 2561-6100 ext. 109",
  },
};

import type { Locale } from "@/src/i18n/config";

export const asesoriaPageCopy: Record<
  Locale,
  {
    heroEyebrow: string;
    heroTitle: string;
    heroDescription: string;
    formEyebrow: string;
    formTitle: string;
    formDescription: string;
    labels: { name: string; org: string; email: string; phone: string; sector: string; message: string };
    sectorInterest: string;
    sectors: readonly string[];
    messagePlaceholder: string;
    submit: string;
    hqTitle: string;
    spsTitle: string;
    spsBody: string;
  }
> = {
  es: {
    heroEyebrow: "Asesoría sin costo",
    heroTitle: "Hable con un ejecutivo del CNI",
    heroDescription: "Formulario de contacto directo con asesores institucionales. Le respondemos en menos de 24 horas hábiles.",
    formEyebrow: "Solicitud de asesoría",
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
      "BPO / Call Centers",
      "Otro",
    ],
    messagePlaceholder: "Describa brevemente su proyecto, ubicación y necesidades de acompañamiento.",
    submit: "Enviar solicitud",
    hqTitle: "Sede principal",
    spsTitle: "San Pedro Sula",
    spsBody:
      "Cámara de Comercio e Industria de Cortés. Col. Las Brisas, 22 y 24 calle entre 1 y 4ª avenida Junior.",
  },
  en: {
    heroEyebrow: "Free advisory",
    heroTitle: "Speak with a CNI executive",
    heroDescription: "Direct contact form for institutional advisors. We respond within one business day.",
    formEyebrow: "Advisory request",
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
      "BPO / call centers",
      "Other",
    ],
    messagePlaceholder: "Briefly describe your project, location, and support needs.",
    submit: "Send request",
    hqTitle: "Headquarters",
    spsTitle: "San Pedro Sula",
    spsBody:
      "Cortés Chamber of Commerce and Industry. Las Brisas neighborhood, 22nd & 24th streets between 1st and 4th Junior avenues.",
  },
};

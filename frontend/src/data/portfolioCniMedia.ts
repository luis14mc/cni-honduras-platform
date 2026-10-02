/** Published CNI media from the public catalog widget (cni.hn / Unsplash). */

const WP = "https://cni.hn/wp-content/uploads/2026/09";
const ZW = "\u200B";

export type PortfolioCniMedia = {
  image: string;
  file?: string;
};

export const PORTFOLIO_CNI_MEDIA: Record<string, PortfolioCniMedia> = {
  "empacadora-de-frutas-y-vegetales": {
    image: `${WP}/EMPACADORA-DE-FRUTAS-Y-VEGETALES.jpg`,
  },
  "red-de-ecoparques-agroindustriales-master-plan-estrategico": {
    image: `${WP}/RED-DE-ECOPARQUES-AGROINDUSTRIALES${ZW}.jpg`,
  },
  "e-agribusiness-park-agalteca": {
    image: `${WP}/PARQUE-AGROINDUSTRIAL-AGALTECA${ZW}.jpg`,
  },
  "eco-parque-agroindustrial-san-lorenzo": {
    image: `${WP}/ECO-PARQUE-AGROINDUSTRIAL-SAN-LORENZO${ZW}.jpg`,
  },
  "planta-agroindustrial-de-jugo-de-pina-nfc-lago-de-yojoa": {
    image: `${WP}/Planta-Agroindustrial-de-Jugo-de-Pina.jpg`,
  },
  "torre-elegance": {
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  },
  "quintara-5": {
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
  },
  "distrito-palmerola": {
    image: `${WP}/Distrito-Palmerola.jpg`,
  },
  "centro-de-acopio-y-transferencia-de-materiales-reciclables-lago-de-yojoa": {
    image: `${WP}/Centro-de-Acopio.jpg`,
  },
  "nuevos-horizontes-logistics-park": {
    image: `${WP}/PARQUE-LOGISTICO-NUEVOS-HORIZONTES${ZW}.jpg`,
  },
  "sky-legacy-tower": {
    image: `${WP}/Sky-Legacy.jpg`,
  },
  "sigua-park": {
    image: `${WP}/Siguapark.jpg`,
  },
  "plaza-naba": {
    image: `${WP}/Plaza-Naba.jpg`,
  },
  "complejo-turistico-integral-sostenible-lago-de-yojoa": {
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  },
  "desarrollo-turistico-bahia-de-tela-eco-resort": {
    image: `${WP}/INDURA-_-Eco-Resort.jpg`,
  },
  "desarrollo-turistico-bahia-de-tela-resort-familiar-all-inclusive": {
    image: `${WP}/INDURA-_-Resort-Familiar-All-Inclusive${ZW}.jpg`,
  },
  "hotel-tru-by-hilton": {
    image: `${WP}/TRU-BY-HILTON${ZW}.jpg`,
  },
  "desarrollo-turistico-bahia-de-tela-master-plan-20252045": {
    image: `${WP}/INDURA.jpg`,
  },
  "fabrica-de-empaques-y-embalajes-de-exportacion": {
    image: `${WP}/Manufactura.jpeg`,
  },
  "ojo-de-agua-2": {
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1200&q=80",
  },
  "san-marcos-wind-energy-honduras": {
    image: `${WP}/san-marcos-wind-energy.jpeg`,
  },
  "genesis-terminal-de-gnl": {
    image: `${WP}/genesis-terminal.jpeg`,
  },
  "el-tornillito": {
    image: `${WP}/tornillito.jpeg`,
  },
  "la-vegona-ii-sistema-hibrido-de-bombeo-almacenamiento-solar-fv": {
    image: `${WP}/vegona-II.jpeg`,
  },
  "brassavola-central-termica": {
    image: `${WP}/brassavola-central-termica.jpeg`,
  },

  "aguacate-hass-fresco-y-aceite-extra-virgen": {
    image: `${WP}/OPPORTUNITY-CARD-OC-CNI-A007-_-Aguacate.jpg`,
    file: `${WP}/OPPORTUNITY-CARD-OC-CNI-A007.pdf`,
  },
  "pina-planta-de-procesamiento-de-pulpa-y-jugos": {
    image: `${WP}/OPPORTUNITY-CARD-OC-CNI-A008-_-Pina.jpg`,
    file: `${WP}/OPPORTUNITY-CARD-OC-CNI-A008.pdf`,
  },
  "limon-planta-de-proceso-para-jugo-aseptico": {
    image: `${WP}/OPPORTUNITY-CARD-OC-CNI-A009-_-Limon.jpg`,
    file: `${WP}/OPPORTUNITY-CARD-OC-CNI-A009.pdf`,
  },
  "cardamomo-organico-con-valor-agregado": {
    image: `${WP}/OPPORTUNITY-CARD-OC-CNI-A010-_Cardamomo.jpg`,
    file: `${WP}/OPPORTUNITY-CARD-OC-CNI-A010.pdf`,
  },
  "cafe-tostado-de-especialidad-con-trazabilidad": {
    image: `${WP}/OPPORTUNITY-CARD-OC-CNI-A011-_-Cafe.jpg`,
    file: `${WP}/OPPORTUNITY-CARD-OC-CNI-A011.pdf`,
  },
  "cacao-organico-con-valor-agregado": {
    image: `${WP}/OPPORTUNITY-CARD-OC-CNI-A012-_-Cacao.jpg`,
    file: `${WP}/OPPORTUNITY-CARD-OC-CNI-A012.pdf`,
  },
  "camote-harina-organica-planta-de-procesamiento": {
    image: `${WP}/OPPORTUNITY-CARD-OC-CNI-A013-_-Camote.jpg`,
    file: `${WP}/OPPORTUNITY-CARD-OC-CNI-A013.pdf`,
  },
  "centro-de-acopio-y-transferencia-de-residuos-reciclables": {
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80",
    file: `${WP}/OC-CNI-I008-Opportunity-Card-2026-Centro-de-Acopio-BAJA.pdf`,
  },
  "centro-de-convenciones-lago-de-yojoa": {
    image: `${WP}/Centro-convenciones-Lago-yojoa.png`,
    file: `${WP}/OC-CNI-I009-Opportunity-Card-2026-Centro-de-Convenciones-BAJA.pdf`,
  },
  "desarrollo-habitacional-en-valle-de-naco": {
    image: `${WP}/I010.png`,
    file: `${WP}/OC-CNI-I010-Opportunity-Card-2026-Desarrollo-Habitacional-Naco-BAJA.pdf`,
  },
  "desarrollo-habitacional-en-el-lago-de-yojoa": {
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    file: `${WP}/OC-CNI-I010-Opportunity-Card-2026-Desarrollo-Habitacional-BAJA.pdf`,
  },
  "paseo-san-juan-canal-seco-centro-comercial-y-de-servicios": {
    image: `${WP}/I012.png`,
    file: `${WP}/OC-CNI-I012-Opportunity-Card-2026-Centro-de-Acopio-BAJA.pdf`,
  },
  "centro-de-acopio-agrologistico": {
    image: `${WP}/I013-scaled.png`,
    file: `${WP}/OC-CNI-I013-Opportunity-Card-2026-Centro-de-Acopio-Agro-BAJA.pdf`,
  },
  "centro-de-convenciones-zona-sur": {
    image: `${WP}/I014-scaled.png`,
    file: `${WP}/OC-CNI-I014-Opportunity-Card-2026-Centro-de-Convenciones-Sur-BAJA.pdf`,
  },
  "complejo-ecoturistico-el-cajon": {
    image: `${WP}/T002-scaled.png`,
    file: `${WP}/OC-CNI-T002-Opportunity-Card-UE-2026-EcoTur-El-Cajon-BAJA.pdf`,
  },
  "complejo-ecoturistico-lago-de-yojoa": {
    image: `${WP}/T002-scaled.png`,
    file: `${WP}/OC-CNI-T003-Opportunity-Card-2026-EcoTur-Yojoa-Lake-BAJA.pdf`,
  },
  "complejo-hotelero-gastronomico-lago-de-yojoa": {
    image: `${WP}/T04.png`,
    file: `${WP}/OC-CNI-T004-Opportunity-Card-UE-2026-Hotel-Gastro-Yojoa-Lake-BAJA.pdf`,
  },
};

export function getPortfolioCniMedia(slug: string): PortfolioCniMedia | null {
  return PORTFOLIO_CNI_MEDIA[slug] ?? null;
}

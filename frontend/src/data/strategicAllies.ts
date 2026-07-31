export type StrategicAllyLogo = {
  src: string;
  name: string;
};

export const strategicAllyLogoSize = {
  width: 230,
  height: 130,
} as const;

/** @deprecated Use strategicAllyLogoSize */
export const strategicAlliesLevel1Size = strategicAllyLogoSize;

/** Aliados estratégicos nivel 1 — public/home_index/aliados-estrategicos/uno/ */
export const strategicAlliesLevel1: readonly StrategicAllyLogo[] = [
  { src: "/home_index/aliados-estrategicos/uno/AHACI.png", name: "AHACI" },
  { src: "/home_index/aliados-estrategicos/uno/AHER.png", name: "AHER" },
  { src: "/home_index/aliados-estrategicos/uno/AHPEE.png", name: "AHPEE" },
  { src: "/home_index/aliados-estrategicos/uno/AHM.png", name: "AHM" },
  { src: "/home_index/aliados-estrategicos/uno/andi.png", name: "ANDI" },
  { src: "/home_index/aliados-estrategicos/uno/ashda.png", name: "ASHDA" },
  { src: "/home_index/aliados-estrategicos/uno/BID.png", name: "BID" },
  { src: "/home_index/aliados-estrategicos/uno/Canaturh.png", name: "CANATURH" },
  { src: "/home_index/aliados-estrategicos/uno/Chico.png", name: "Chico" },
  { src: "/home_index/aliados-estrategicos/uno/cohep.png", name: "COHEP" },
  { src: "/home_index/aliados-estrategicos/uno/fenagh.png", name: "FENAGH" },
  { src: "/home_index/aliados-estrategicos/uno/Gobierno.png", name: "Gobierno de Honduras" },
  { src: "/home_index/aliados-estrategicos/uno/Meta.png", name: "Meta" },
  { src: "/home_index/aliados-estrategicos/uno/UE.png", name: "Unión Europea" },
  { src: "/home_index/aliados-estrategicos/uno/Waipa.png", name: "WAIPA" },
];

/** Aliados estratégicos nivel 2 — public/home_index/aliados-estrategicos/dos/ */
export const strategicAlliesLevel2: readonly StrategicAllyLogo[] = [
  { src: "/home_index/aliados-estrategicos/dos/ahk.png", name: "AHK" },
  { src: "/home_index/aliados-estrategicos/dos/Abu%20Dhabi.png", name: "Abu Dhabi" },
  { src: "/home_index/aliados-estrategicos/dos/CCBHA.png", name: "CCBHA" },
  { src: "/home_index/aliados-estrategicos/dos/ccic.png", name: "CCIC" },
  { src: "/home_index/aliados-estrategicos/dos/cooperacion.png", name: "Cooperación Alemana" },
  { src: "/home_index/aliados-estrategicos/dos/desarrollo-economico.png", name: "Desarrollo Económico" },
  { src: "/home_index/aliados-estrategicos/dos/fedecamara.png", name: "Fedecámaras" },
  { src: "/home_index/aliados-estrategicos/dos/investmadrid.png", name: "Invest Madrid" },
  { src: "/home_index/aliados-estrategicos/dos/municipalidad-choloma.png", name: "Municipalidad de Choloma" },
  { src: "/home_index/aliados-estrategicos/dos/pro-dominicana.png", name: "Pro Dominicana" },
  { src: "/home_index/aliados-estrategicos/dos/procolombia.png", name: "ProColombia" },
  { src: "/home_index/aliados-estrategicos/dos/SPS_Municipalidad.png", name: "Municipalidad SPS" },
  { src: "/home_index/aliados-estrategicos/dos/swiss-contact.png", name: "Swiss Contact" },
  { src: "/home_index/aliados-estrategicos/dos/uae.png", name: "UAE" },
  { src: "/home_index/aliados-estrategicos/dos/valle-de-sula.png", name: "Valle de Sula" },
];

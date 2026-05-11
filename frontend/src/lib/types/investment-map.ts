/**
 * Tipos del mapa de inversiones (legacy mock).
 * Separados de server actions para no acoplar componentes a Drizzle/DB.
 */

export interface InvestmentNode {
    id: number;
    slug: string;
    title: string;
    lat: number;
    lng: number;
    capexUsd: string;
    sectorName: string;
    sectorColor: string;
    sectorIcon: string;
}

export interface MapActionSuccess {
    success: true;
    data: InvestmentNode[];
}

export interface MapActionError {
    success: false;
    error: string;
}

export type MapActionResult = MapActionSuccess | MapActionError;

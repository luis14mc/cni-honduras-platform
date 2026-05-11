"use server";

import type { MapActionResult } from "@/src/lib/types/investment-map";

type Locale = "es" | "en";

/**
 * MVP: sin capa Drizzle en el frontend todavía.
 * Cuando exista `src/db`, reconectar la consulta aquí.
 */
export async function getInvestmentNodes(
    _locale: Locale = "es",
): Promise<MapActionResult> {
    return { success: true, data: [] };
}

export type {
    InvestmentNode,
    MapActionResult,
} from "@/src/lib/types/investment-map";

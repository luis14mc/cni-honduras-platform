"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L, { type PathOptions } from "leaflet";
import { GeoJSON, MapContainer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { apiGet } from "@/src/lib/api";
import type {
  DepartmentApiItem,
  DepartmentFeatureCollection,
  DepartmentProperties,
  MapDepartmentSummary,
  MapSector,
} from "@/src/lib/types/investment-map";
import {
  departmentsToFeatureCollection,
  formatMapInvestment,
  formatMapJobs,
  hasPublicInvestmentActivity,
} from "@/src/lib/types/investment-map";

const HONDURAS_CENTER: [number, number] = [14.63, -86.24];
const DEFAULT_ZOOM = 7;
const CNI_BLUE = "#334E88";
const CNI_GREEN = "#32B372";
const CNI_SKY = "#5fb3d9";
const CNI_GOLD = "#ffdea5";
const HONDURAS_BOUNDS: L.LatLngBoundsExpression = [
  [12.6, -90.4],
  [17.0, -82.4],
];

type LoadState = "loading" | "error" | "ready";
type ActiveSector = "all" | string;

function collectSectors(summaries: MapDepartmentSummary[]): MapSector[] {
  const bySlug = new Map<string, MapSector>();
  for (const item of summaries) {
    for (const sector of item.sectors) {
      if (!bySlug.has(sector.slug)) {
        bySlug.set(sector.slug, sector);
      }
    }
  }
  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

function departmentMatchesSector(
  summary: MapDepartmentSummary | undefined,
  activeSector: ActiveSector,
) {
  if (activeSector === "all") return true;
  return summary?.sectors?.some((sector) => sector.slug === activeSector) ?? false;
}

function sumInvestment(summaries: MapDepartmentSummary[]) {
  return summaries.reduce((total, item) => {
    const amount = Number(item.total_investment ?? 0);
    return Number.isNaN(amount) ? total : total + amount;
  }, 0);
}

export default function HondurasMap() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<DepartmentFeatureCollection | null>(null);
  const [mapSummary, setMapSummary] = useState<MapDepartmentSummary[]>([]);
  const [selected, setSelected] = useState<DepartmentProperties | null>(null);
  const [activeSectorSlug, setActiveSectorSlug] = useState<ActiveSector>("all");
  const geoJsonRef = useRef<L.GeoJSON | null>(null);
  const previousSectorRef = useRef<ActiveSector>("all");
  const getFeatureStyleRef = useRef<(props: DepartmentProperties) => PathOptions>(() => ({}));

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadState("loading");
      setError(null);

      try {
        const [departmentList, summaryList] = await Promise.all([
          apiGet<DepartmentApiItem[]>("/geo/departments/"),
          apiGet<MapDepartmentSummary[]>("/investment/map-summary/"),
        ]);

        if (cancelled) return;

        setDepartments(departmentsToFeatureCollection(departmentList));
        setMapSummary(summaryList);
        setLoadState("ready");
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Error desconocido";
        setError(`No se pudo cargar el mapa: ${message}`);
        setLoadState("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const summaryBySlug = useMemo(() => {
    const map = new Map<string, MapDepartmentSummary>();
    for (const item of mapSummary) {
      map.set(item.department.slug, item);
    }
    return map;
  }, [mapSummary]);

  const sectorOptions = useMemo(() => collectSectors(mapSummary), [mapSummary]);

  const activeSector = useMemo(
    () =>
      activeSectorSlug === "all"
        ? null
        : sectorOptions.find((sector) => sector.slug === activeSectorSlug) ?? null,
    [sectorOptions, activeSectorSlug],
  );

  const selectedSummary = selected ? summaryBySlug.get(selected.slug) : undefined;
  const selectedSlug = selected?.slug ?? null;
  const departmentCount = departments?.features.length ?? 0;
  const filteredSummaries = useMemo(
    () =>
      mapSummary.filter((summary) =>
        departmentMatchesSector(summary, activeSectorSlug),
      ),
    [activeSectorSlug, mapSummary],
  );
  const nationalTotals = useMemo(
    () => ({
      departmentsWithActivity: filteredSummaries.filter((summary) =>
        hasPublicInvestmentActivity(summary),
      ).length,
      projects: filteredSummaries.reduce((total, item) => total + item.projects_count, 0),
      opportunities: filteredSummaries.reduce(
        (total, item) => total + item.opportunities_count,
        0,
      ),
      investment: sumInvestment(filteredSummaries),
      jobs: filteredSummaries.reduce(
        (total, item) => total + (item.estimated_jobs ?? 0),
        0,
      ),
    }),
    [filteredSummaries],
  );

  useEffect(() => {
    if (previousSectorRef.current === activeSectorSlug) return;
    previousSectorRef.current = activeSectorSlug;

    if (!selected || activeSectorSlug === "all") return;

    const summary = summaryBySlug.get(selected.slug);
    if (!departmentMatchesSector(summary, activeSectorSlug)) {
      const clearSelection = window.setTimeout(() => setSelected(null), 0);
      return () => window.clearTimeout(clearSelection);
    }
  }, [activeSectorSlug, selected, summaryBySlug]);

  const getFeatureStyle = useCallback((props: DepartmentProperties): PathOptions => {
    const summary = summaryBySlug.get(props.slug);
    const hasData = hasPublicInvestmentActivity(summary);
    const isSelected = selectedSlug === props.slug;
    const matchesSector = departmentMatchesSector(summary, activeSectorSlug);
    const dimmed = activeSectorSlug !== "all" && !matchesSector;

    if (isSelected) {
      return {
        color: CNI_GOLD,
        weight: 3,
        opacity: 1,
        fillColor: CNI_GREEN,
        fillOpacity: 0.72,
      };
    }

    if (activeSectorSlug !== "all" && matchesSector) {
      return {
        color: CNI_GOLD,
        weight: 2.4,
        opacity: 1,
        fillColor: CNI_GREEN,
        fillOpacity: 0.62,
      };
    }

    if (dimmed) {
      return {
        color: CNI_SKY,
        weight: 1,
        opacity: 0.28,
        fillColor: CNI_BLUE,
        fillOpacity: 0.08,
      };
    }

    if (hasData) {
      const activity = (summary?.projects_count ?? 0) + (summary?.opportunities_count ?? 0);
      return {
        color: CNI_SKY,
        weight: 1.6,
        opacity: 0.95,
        fillColor: CNI_GREEN,
        fillOpacity: Math.min(0.7, 0.38 + activity * 0.035),
      };
    }

    return {
      color: CNI_SKY,
      weight: 1.2,
      opacity: 0.8,
      fillColor: CNI_BLUE,
      fillOpacity: 0.38,
    };
  }, [activeSectorSlug, selectedSlug, summaryBySlug]);

  useEffect(() => {
    getFeatureStyleRef.current = getFeatureStyle;
  }, [getFeatureStyle]);

  useEffect(() => {
    geoJsonRef.current?.eachLayer((layer) => {
      const feature = (layer as L.Layer & { feature?: GeoJSON.Feature }).feature;
      const props = (feature?.properties || {}) as DepartmentProperties;
      if (!props.slug || !("setStyle" in layer)) return;

      (layer as L.Path).setStyle(getFeatureStyle(props));
    });
  }, [getFeatureStyle]);

  return (
    <div className="space-y-4 bg-[#001a33]/80 p-4 text-white sm:p-5 lg:p-6">
      <div className="rounded-2xl border border-white/10 bg-[#002147]/70 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#ffdea5]">
          Filtrar por sector
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveSectorSlug("all")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition active:scale-95 ${
              activeSectorSlug === "all"
                ? "bg-[#ffdea5] text-[#110a00] shadow-[0_0_24px_rgba(255,222,165,0.22)]"
                : "border border-white/10 bg-white/5 text-[#d5e3ff] hover:border-[#ffdea5]/40 hover:text-white"
            }`}
          >
            Todos
          </button>
          {sectorOptions.map((sector) => {
            const isActive = activeSectorSlug === sector.slug;
            const chipColor = sector.color_hex || CNI_BLUE;
            return (
              <button
                key={sector.slug}
                type="button"
                onClick={() => setActiveSectorSlug(sector.slug)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition active:scale-95 ${
                  isActive
                    ? "text-[#000a1e] shadow-[0_0_24px_rgba(50,179,114,0.26)]"
                    : "border border-white/10 bg-white/5 text-[#d5e3ff] hover:border-[#ffdea5]/40 hover:text-white"
                }`}
                style={isActive ? { backgroundColor: chipColor || CNI_GREEN } : undefined}
              >
                {sector.name}
              </button>
            );
          })}
          {loadState === "ready" && sectorOptions.length === 0 ? (
            <span className="text-sm text-[#708ab5]">Sin sectores en el resumen territorial.</span>
          ) : null}
        </div>
        <p className="mt-3 text-xs font-medium text-[#d5e3ff]/65">
          {activeSectorSlug === "all"
            ? "Mostrando todos los sectores."
            : "Departamentos destacados por sector seleccionado."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#000a1e] shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(95,179,217,0.24),transparent_30%),linear-gradient(135deg,rgba(0,33,71,0.72),rgba(0,10,30,0.95))]" />
          {loadState === "loading" ? (
            <div className="relative flex min-h-[620px] items-center justify-center lg:min-h-[680px]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ffdea5]">
                Cargando mapa
              </p>
            </div>
          ) : loadState === "error" ? (
            <div className="relative flex min-h-[620px] items-center justify-center p-6 lg:min-h-[680px]">
              <p className="rounded-xl border border-red-300/20 bg-red-950/30 p-4 text-sm text-red-100">
                {error}
              </p>
            </div>
          ) : departmentCount === 0 ? (
            <div className="relative flex min-h-[620px] items-center justify-center p-6 lg:min-h-[680px]">
              <p className="text-sm text-[#d5e3ff]">
                No hay geometrías de departamentos disponibles.
              </p>
            </div>
          ) : (
            <MapContainer
              center={HONDURAS_CENTER}
              zoom={DEFAULT_ZOOM}
              minZoom={6}
              maxZoom={9}
              zoomSnap={0.25}
              maxBounds={HONDURAS_BOUNDS}
              maxBoundsViscosity={0.85}
              scrollWheelZoom
              zoomControl={false}
              attributionControl={false}
              className="relative z-10 h-full w-full bg-[#000a1e]"
              style={{ minHeight: "680px", background: "#000a1e" }}
            >
              <FitBounds data={departments} />

              {departments ? (
                <GeoJSON
                  ref={geoJsonRef}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  data={departments as any}
                  style={(feature) => {
                    const props = (feature?.properties || {}) as DepartmentProperties;
                    return getFeatureStyle(props);
                  }}
                  onEachFeature={(feature, layer) => {
                    const pathLayer = layer as L.Path;
                    layer.on({
                      click: () => {
                        const props = (feature.properties || {}) as DepartmentProperties;
                        setSelected(props);
                      },
                      mouseover: () => {
                        pathLayer.setStyle({
                          color: CNI_GOLD,
                          weight: 3,
                          opacity: 1,
                          fillOpacity: 0.75,
                        });
                        pathLayer.bringToFront();
                      },
                      mouseout: () => {
                        const props = (feature.properties || {}) as DepartmentProperties;
                        pathLayer.setStyle(getFeatureStyleRef.current(props));
                      },
                    });
                  }}
                />
              ) : null}
            </MapContainer>
          )}
        </div>

        <aside className="rounded-[1.5rem] border border-white/10 bg-[#002147]/75 p-5 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ffdea5]">
                {selected ? "Departamento seleccionado" : "Resumen nacional"}
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
                {selected?.name ?? "Resumen nacional"}
              </h2>
              <p className="mt-1 text-sm text-[#d5e3ff]/70">
                {selected
                  ? "Resumen de inversión del departamento seleccionado."
                  : "Selecciona un departamento para ver el detalle territorial."}
              </p>
            </div>
            {selected ? (
              <button
                type="button"
                className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-sm font-semibold text-[#d5e3ff] hover:border-[#ffdea5]/40 hover:text-white"
                onClick={() => setSelected(null)}
              >
                Limpiar
              </button>
            ) : null}
          </div>

          {activeSector ? (
            <p className="mt-3 text-sm text-[#d5e3ff]/70">
              Sector activo:{" "}
              <span className="font-semibold" style={{ color: activeSector.color_hex || CNI_GREEN }}>
                {activeSector.name}
              </span>
            </p>
          ) : null}

          <div className="mt-4 space-y-3">
            {error && loadState !== "error" ? (
              <div className="rounded-lg border border-red-300/20 bg-red-950/30 p-3 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            {selected ? (
              <DepartmentSummaryPanel
                properties={selected}
                summary={selectedSummary}
              />
            ) : (
              <div className="space-y-4 text-sm text-[#d5e3ff]/70">
                {loadState === "loading" ? (
                  <p>Cargando datos territoriales…</p>
                ) : loadState === "error" ? (
                  <p>No se pudo cargar el resumen territorial.</p>
                ) : (
                  <NationalSummaryPanel
                    activeSector={activeSector}
                    departmentCount={departmentCount}
                    totals={nationalTotals}
                  />
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      <MapLegend />
    </div>
  );
}

function DepartmentSummaryPanel({
  properties,
  summary,
}: {
  properties: DepartmentProperties;
  summary: MapDepartmentSummary | undefined;
}) {
  const hasActivity = hasPublicInvestmentActivity(summary);

  return (
    <div className="space-y-4">
      {properties.code ? (
        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-[#d5e3ff]">
          Código: {properties.code}
        </span>
      ) : null}

      {!summary || !hasActivity ? (
        <p className="rounded-xl border border-white/10 bg-[#000a1e]/40 p-4 text-sm text-[#d5e3ff]/70">
          Sin proyectos u oportunidades públicas registradas todavía.
        </p>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <SummaryStat label="Proyectos" value={String(summary.projects_count)} />
            <SummaryStat label="Oportunidades" value={String(summary.opportunities_count)} />
            <SummaryStat
              label="Inversión total"
              value={formatMapInvestment(summary.total_investment)}
              className="col-span-2"
            />
            <SummaryStat
              label="Empleos estimados"
              value={formatMapJobs(summary.estimated_jobs)}
              className="col-span-2"
            />
          </dl>

          {summary.sectors.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#708ab5]">
                Sectores relacionados
              </p>
              <ul className="flex flex-wrap gap-2">
                {summary.sectors.map((sector) => (
                  <li
                    key={sector.slug}
                    className="rounded-full px-3 py-1 text-xs font-semibold text-[#000a1e] shadow-[0_0_18px_rgba(50,179,114,0.2)]"
                    style={{ backgroundColor: sector.color_hex || CNI_GREEN }}
                  >
                    {sector.name}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}

      {properties.description ? (
        <p className="text-sm leading-relaxed text-[#d5e3ff]/70">{properties.description}</p>
      ) : null}
    </div>
  );
}

function NationalSummaryPanel({
  activeSector,
  departmentCount,
  totals,
}: {
  activeSector: MapSector | null;
  departmentCount: number;
  totals: {
    departmentsWithActivity: number;
    projects: number;
    opportunities: number;
    investment: number;
    jobs: number;
  };
}) {
  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <SummaryStat
          label={activeSector ? "Deptos. con actividad" : "Departamentos"}
          value={String(activeSector ? totals.departmentsWithActivity : departmentCount)}
        />
        <SummaryStat label="Proyectos" value={String(totals.projects)} />
        <SummaryStat label="Oportunidades" value={String(totals.opportunities)} />
        <SummaryStat label="Empleos estimados" value={formatMapJobs(totals.jobs)} />
        <SummaryStat
          label="Inversión total"
          value={formatMapInvestment(String(totals.investment))}
          className="col-span-2"
        />
      </dl>

      <p className="rounded-xl border border-white/10 bg-[#000a1e]/40 p-4 text-sm leading-relaxed text-[#d5e3ff]/70">
        Selecciona un departamento para ver el detalle territorial.
      </p>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-white/10 bg-[#000a1e]/40 p-3 ${className}`}>
      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[#708ab5]">{label}</dt>
      <dd className="mt-1 text-base font-extrabold text-white">{value}</dd>
    </div>
  );
}

function FitBounds({ data }: { data: DepartmentFeatureCollection | null }) {
  const map = useMap();

  useEffect(() => {
    if (!data || data.features.length === 0) return;

    const layer = L.geoJSON(data as GeoJSON.FeatureCollection);
    const bounds = layer.getBounds();

    if (!bounds.isValid()) return;

    map.fitBounds(bounds, {
      padding: [8, 8],
      maxZoom: 8,
      animate: false,
    });

    const fittedZoom = map.getZoom();
    map.setZoom(Math.min(map.getMaxZoom(), fittedZoom + 0.5), { animate: false });
    map.setMaxBounds(bounds.pad(0.18));
  }, [data, map]);

  return null;
}

function MapLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#002147]/70 px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur">
      <LegendItem color="bg-[#32B372]" label="Con inversión" />
      <LegendItem color="bg-[#334E88]/80" label="Sin datos públicos" />
      <LegendItem color="bg-[#ffdea5]" label="Seleccionado" />
      <LegendItem color="bg-[#334E88]/25" label="Atenuado por filtro" />
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#d5e3ff]/70">
        {label}
      </span>
    </div>
  );
}

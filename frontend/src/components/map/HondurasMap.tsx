"use client";

import React, { useEffect, useMemo, useState } from "react";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type DepartmentProperties = {
  name: string;
  slug: string;
  code?: string;
  description?: string;
  center_lat?: number | null;
  center_lng?: number | null;
  is_active?: boolean;
};

type DepartmentsFC = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: unknown;
    properties: DepartmentProperties;
  }>;
};

const HONDURAS_CENTER: [number, number] = [14.63, -86.24];
const DEFAULT_ZOOM = 7;

function getApiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
}

export default function HondurasMap() {
  const [data, setData] = useState<DepartmentsFC | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<DepartmentProperties | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const url = `${getApiBase()}/api/geo/departments/`;

    async function load() {
      try {
        setError(null);
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as DepartmentsFC;
        setData(json);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError(`No se pudo cargar el mapa: ${(e as Error).message}`);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const selectedSlug = selected?.slug ?? null;

  const baseStyle = useMemo(
    () => ({
      color: "#1d4ed8",
      weight: 1,
      opacity: 0.9,
      fillColor: "#60a5fa",
      fillOpacity: 0.15,
    }),
    [],
  );

  const selectedStyle = useMemo(
    () => ({
      color: "#059669",
      weight: 2,
      opacity: 1,
      fillColor: "#34d399",
      fillOpacity: 0.25,
    }),
    [],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <MapContainer
          center={HONDURAS_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom
          className="h-full w-full"
          style={{ minHeight: "520px" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {data && (
            <GeoJSON
              key={selectedSlug ?? "all"}
              data={data as unknown as any}
              style={(feature) => {
                const props = (feature?.properties || {}) as DepartmentProperties;
                if (selectedSlug && props.slug === selectedSlug) return selectedStyle;
                return baseStyle;
              }}
              onEachFeature={(feature, layer) => {
                layer.on("click", () => {
                  const props = (feature.properties || {}) as DepartmentProperties;
                  setSelected(props);
                });
              }}
            />
          )}
        </MapContainer>
      </div>

      <aside className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
              {selected?.name ?? "Departamentos"}
            </h2>
            <p className="text-sm text-slate-500">
              {selected
                ? "Haz click en otro departamento para cambiar la selección."
                : "Haz click en un departamento para ver detalles básicos."}
            </p>
          </div>
          {selected && (
            <button
              type="button"
              className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => setSelected(null)}
            >
              Limpiar
            </button>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {selected ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {selected.code ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    Código: {selected.code}
                  </span>
                ) : null}
              </div>
              {selected.description ? (
                <p className="text-sm leading-relaxed text-slate-700">
                  {selected.description}
                </p>
              ) : (
                <p className="text-sm text-slate-500">Sin descripción.</p>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-600">
              {data?.features?.length
                ? `Cargados: ${data.features.length} departamentos.`
                : "Cargando geometrías…"}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}


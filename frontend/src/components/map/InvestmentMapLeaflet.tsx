"use client";

import { useEffect, useRef } from "react";
import L, { type PathOptions } from "leaflet";
import { GeoJSON, MapContainer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import type {
  DepartmentFeatureCollection,
  DepartmentProperties,
  MapDepartmentSummary,
} from "@/src/lib/types/investment-map";

const HONDURAS_CENTER: [number, number] = [14.63, -86.24];
const HONDURAS_BOUNDS: L.LatLngBoundsExpression = [
  [12.6, -90.4],
  [17, -82.4],
];
const STROKE = "#334E88";
const FILL_BASE = "#E8F1FA";
const FILL_ACTIVE = "#C5DCF0";
const HOVER_FILL = "#32B372";
const SELECTED_FILL = "#32B372";
const SELECTED_STROKE = "#334E88";

type Props = {
  data: DepartmentFeatureCollection;
  summaries: Map<string, MapDepartmentSummary>;
  activeSector: string;
  selectedSlug: string | null;
  onSelect: (properties: DepartmentProperties) => void;
  onHover: (properties: DepartmentProperties | null) => void;
};

function styleDepartment(
  properties: DepartmentProperties,
  summaries: Map<string, MapDepartmentSummary>,
  activeSector: string,
  selectedSlug: string | null,
): PathOptions {
  const summary = summaries.get(properties.slug);
  const hasActivity = Boolean(
    summary && summary.projects_count + summary.opportunities_count > 0,
  );
  const matches =
    activeSector === "all" ||
    (summary?.sectors?.some((sector) => sector.slug === activeSector) ?? false);
  const selected = properties.slug === selectedSlug;

  if (selected) {
    return {
      color: SELECTED_STROKE,
      weight: 3,
      opacity: 1,
      fillColor: SELECTED_FILL,
      fillOpacity: 0.72,
    };
  }

  if (activeSector !== "all" && matches) {
    return {
      color: STROKE,
      weight: 2.2,
      opacity: 1,
      fillColor: HOVER_FILL,
      fillOpacity: 0.58,
    };
  }

  if (activeSector !== "all" && !matches) {
    return {
      color: STROKE,
      weight: 1,
      opacity: 0.28,
      fillColor: FILL_BASE,
      fillOpacity: 0.35,
    };
  }

  if (hasActivity) {
    const activity = (summary?.projects_count ?? 0) + (summary?.opportunities_count ?? 0);
    return {
      color: STROKE,
      weight: 1.6,
      opacity: 1,
      fillColor: FILL_ACTIVE,
      fillOpacity: Math.min(0.78, 0.48 + activity * 0.03),
    };
  }

  return {
    color: STROKE,
    weight: 1.3,
    opacity: 0.95,
    fillColor: FILL_BASE,
    fillOpacity: 0.82,
  };
}

function ViewportController({
  data,
  selectedSlug,
}: {
  data: DepartmentFeatureCollection;
  selectedSlug: string | null;
}) {
  const map = useMap();
  const initialFit = useRef(false);

  useEffect(() => {
    if (initialFit.current || data.features.length === 0) return;
    const bounds = L.geoJSON(data as unknown as GeoJSON.GeoJsonObject).getBounds();
    if (!bounds.isValid()) return;
    map.fitBounds(bounds, { padding: [12, 12], maxZoom: 8, animate: false });
    map.setMaxBounds(bounds.pad(0.12));
    initialFit.current = true;
  }, [data, map]);

  useEffect(() => {
    if (!selectedSlug) return;
    const feature = data.features.find((item) => item.properties.slug === selectedSlug);
    if (!feature) return;
    const bounds = L.geoJSON(feature as unknown as GeoJSON.GeoJsonObject).getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 8, animate: true });
  }, [data, map, selectedSlug]);

  return null;
}

export function InvestmentMapLeaflet({
  data,
  summaries,
  activeSector,
  selectedSlug,
  onSelect,
  onHover,
}: Props) {
  const layerRef = useRef<L.GeoJSON | null>(null);
  const styleRef = useRef(styleDepartment);

  useEffect(() => {
    styleRef.current = styleDepartment;
  }, [summaries, activeSector, selectedSlug]);

  useEffect(() => {
    layerRef.current?.eachLayer((layer) => {
      const feature = (layer as L.Layer & { feature?: GeoJSON.Feature }).feature;
      const properties = feature?.properties as DepartmentProperties | undefined;
      if (properties && "setStyle" in layer) {
        (layer as L.Path).setStyle(styleDepartment(properties, summaries, activeSector, selectedSlug));
      }
    });
  }, [activeSector, selectedSlug, summaries]);

  return (
    <MapContainer
      center={HONDURAS_CENTER}
      zoom={7}
      minZoom={6}
      maxZoom={9}
      maxBounds={HONDURAS_BOUNDS}
      maxBoundsViscosity={0.92}
      scrollWheelZoom={false}
      zoomControl={false}
      attributionControl={false}
      className="h-full min-h-[440px] w-full bg-white sm:min-h-[600px]"
      style={{ background: "#ffffff" }}
      aria-label="Interactive map of Honduras investment departments"
    >
      <ViewportController data={data} selectedSlug={selectedSlug} />
      <GeoJSON
        ref={layerRef}
        data={data as unknown as GeoJSON.GeoJsonObject}
        style={(feature) => {
          const properties = feature?.properties as DepartmentProperties;
          return styleDepartment(properties, summaries, activeSector, selectedSlug);
        }}
        onEachFeature={(feature, layer) => {
          const properties = feature.properties as DepartmentProperties;
          const pathLayer = layer as L.Path;
          layer.bindTooltip(properties.name, { sticky: true, direction: "top", opacity: 0.92 });
          layer.on({
            click: () => onSelect(properties),
            mouseover: () => {
              onHover(properties);
              pathLayer.setStyle({
                color: STROKE,
                weight: 2.8,
                opacity: 1,
                fillColor: HOVER_FILL,
                fillOpacity: 0.68,
              });
              pathLayer.bringToFront();
            },
            mouseout: () => {
              onHover(null);
              pathLayer.setStyle(styleRef.current(properties, summaries, activeSector, selectedSlug));
            },
          });
        }}
      />
    </MapContainer>
  );
}

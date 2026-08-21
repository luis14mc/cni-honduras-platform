"use client";

import { useEffect, useRef } from "react";
import L, { type PathOptions } from "leaflet";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
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
  const matches = activeSector === "all" || hasActivity;
  const selected = properties.slug === selectedSlug;

  if (selected) {
    return { color: "#F7BF06", weight: 3, fillColor: "#35A963", fillOpacity: 0.78 };
  }
  if (activeSector !== "all" && matches) {
    return { color: "#35A963", weight: 2, fillColor: "#35A963", fillOpacity: 0.55 };
  }
  if (activeSector !== "all" && !matches) {
    return { color: "#8EA7C7", weight: 1, fillColor: "#24436B", fillOpacity: 0.16 };
  }
  if (hasActivity) {
    return { color: "#8DC046", weight: 1.5, fillColor: "#35A963", fillOpacity: 0.42 };
  }
  return { color: "#8EA7C7", weight: 1.1, fillColor: "#24436B", fillOpacity: 0.3 };
}

function ViewportController({ data, selectedSlug }: { data: DepartmentFeatureCollection; selectedSlug: string | null }) {
  const map = useMap();
  const initialFit = useRef(false);

  useEffect(() => {
    if (initialFit.current || data.features.length === 0) return;
    const bounds = L.geoJSON(data as unknown as GeoJSON.GeoJsonObject).getBounds();
    if (!bounds.isValid()) return;
    map.fitBounds(bounds, { padding: [12, 12], maxZoom: 8, animate: false });
    map.setMaxBounds(bounds.pad(0.18));
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
      maxZoom={10}
      maxBounds={HONDURAS_BOUNDS}
      maxBoundsViscosity={0.86}
      scrollWheelZoom
      className="h-full min-h-[440px] w-full bg-[#dce9ff] sm:min-h-[600px]"
      aria-label="Interactive map of Honduras investment departments"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
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
          layer.bindTooltip(properties.name, { sticky: true, direction: "top", opacity: 0.92 });
          layer.on({
            click: () => onSelect(properties),
            mouseover: () => {
              onHover(properties);
              if ("setStyle" in layer) {
                (layer as L.Path).setStyle({ weight: 3, color: "#F7BF06", fillOpacity: 0.7 });
                (layer as L.Path).bringToFront();
              }
            },
            mouseout: () => {
              onHover(null);
              if ("setStyle" in layer) {
                (layer as L.Path).setStyle(styleDepartment(properties, summaries, activeSector, selectedSlug));
              }
            },
          });
        }}
      />
    </MapContainer>
  );
}

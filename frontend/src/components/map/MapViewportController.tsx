import { useEffect, useRef } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";

import type {
  DepartmentFeatureCollection,
  MunicipalityFeatureCollection,
  TerritorialRegionFeature,
} from "@/src/lib/types/investment-map";

export function ViewportController({
  data,
  selectedDepartmentSlug,
  selectedMunicipalitySlug,
  municipalities,
  selectedProjectPosition,
  projectFocusKey,
  zoomInLabel,
  zoomOutLabel,
  selectedRegion,
}: {
  data: DepartmentFeatureCollection;
  selectedDepartmentSlug: string | null;
  selectedMunicipalitySlug: string | null;
  municipalities: MunicipalityFeatureCollection | null;
  selectedProjectPosition: [number, number] | null;
  projectFocusKey: number;
  zoomInLabel: string;
  zoomOutLabel: string;
  selectedRegion: TerritorialRegionFeature | null;
}) {
  const map = useMap();
  const initialFit = useRef(false);
  const previousDepartment = useRef<string | null>(null);
  const previousRegion = useRef<string | null>(null);

  useEffect(() => {
    const container = map.getContainer();
    const zoomIn = container.querySelector<HTMLElement>(".leaflet-control-zoom-in");
    const zoomOut = container.querySelector<HTMLElement>(".leaflet-control-zoom-out");
    zoomIn?.setAttribute("aria-label", zoomInLabel);
    zoomIn?.setAttribute("title", zoomInLabel);
    zoomOut?.setAttribute("aria-label", zoomOutLabel);
    zoomOut?.setAttribute("title", zoomOutLabel);
  }, [map, zoomInLabel, zoomOutLabel]);

  useEffect(() => {
    if (initialFit.current || data.features.length === 0) return;
    const bounds = L.geoJSON(data as unknown as GeoJSON.GeoJsonObject).getBounds();
    if (!bounds.isValid()) return;
    map.fitBounds(bounds, { padding: [12, 12], maxZoom: 8, animate: false });
    map.setMaxBounds(bounds.pad(0.12));
    initialFit.current = true;
  }, [data, map]);

  useEffect(() => {
    map.setMaxZoom(12);
  }, [map]);

  useEffect(() => {
    if (selectedMunicipalitySlug && municipalities) {
      const feature = municipalities.features.find(
        (item) => item.properties.slug === selectedMunicipalitySlug,
      );
      if (!feature?.geometry) return;
      const bounds = L.geoJSON(feature as unknown as GeoJSON.GeoJsonObject).getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [36, 36], maxZoom: 11, animate: true });
      }
      return;
    }

    if (selectedDepartmentSlug) {
      const feature = data.features.find((item) => item.properties.slug === selectedDepartmentSlug);
      if (!feature) return;
      const bounds = L.geoJSON(feature as unknown as GeoJSON.GeoJsonObject).getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 9, animate: true });
      previousDepartment.current = selectedDepartmentSlug;
      return;
    }

    if (previousDepartment.current) {
      const bounds = L.geoJSON(data as unknown as GeoJSON.GeoJsonObject).getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [12, 12], maxZoom: 8, animate: true });
      }
      previousDepartment.current = null;
    }
  }, [data, map, municipalities, selectedDepartmentSlug, selectedMunicipalitySlug]);

  useEffect(() => {
    const code = selectedRegion?.properties.code ?? null;
    if (code === previousRegion.current) return;
    const target = selectedRegion?.geometry ? selectedRegion : previousRegion.current ? data : null;
    previousRegion.current = code;
    if (!target) return;
    const bounds = L.geoJSON(target as unknown as GeoJSON.GeoJsonObject).getBounds();
    if (bounds.isValid()) {
      map.fitBounds(
        bounds,
        selectedRegion
          ? { padding: [28, 28], maxZoom: 9, animate: true }
          : { padding: [12, 12], maxZoom: 8, animate: true },
      );
    }
  }, [data, map, selectedRegion]);

  useEffect(() => {
    if (!selectedProjectPosition || projectFocusKey === 0) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.flyTo(selectedProjectPosition, 10, {
      animate: !reducedMotion,
      duration: reducedMotion ? 0 : 0.7,
    });
  }, [map, projectFocusKey, selectedProjectPosition]);

  return null;
}

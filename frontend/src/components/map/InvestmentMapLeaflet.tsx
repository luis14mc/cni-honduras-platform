"use client";

import { MapContainer } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import { HONDURAS_CENTER, HONDURAS_BOUNDS } from "./mapLeafletVisuals";
import type { LeafletMapProps } from "./leafletMapProps";
import { ViewportController } from "./MapViewportController";
import { MapLayer } from "./MapLayer";
import { MapMarkerLayers } from "./MapMarkerLayers";

export function InvestmentMapLeaflet(props: LeafletMapProps) {
  const { data, selectedDepartmentSlug, selectedMunicipalitySlug, municipalities,
    selectedProjectPosition, projectFocusKey, zoomInLabel, zoomOutLabel,
    mapAriaLabel, mapInstructions, regionMode, regions, selectedRegionCode } = props;
  const selectedRegion = regionMode && selectedRegionCode
    ? regions?.features.find((feature) => feature.properties.code === selectedRegionCode) ?? null
    : null;

  const maxZoom = 12;
  return (
    <MapContainer
      center={HONDURAS_CENTER}
      zoom={7}
      minZoom={6}
      maxZoom={maxZoom}
      maxBounds={HONDURAS_BOUNDS}
      maxBoundsViscosity={0.92}
      scrollWheelZoom={false}
      zoomControl
      attributionControl={false}
      className="h-full min-h-[440px] w-full bg-white sm:min-h-[600px]"
      style={{ background: "#ffffff" }}
      aria-label={mapAriaLabel}
      aria-description={mapInstructions}
    >
      <ViewportController
        data={data}
        selectedDepartmentSlug={selectedDepartmentSlug}
        selectedMunicipalitySlug={selectedMunicipalitySlug}
        municipalities={municipalities}
        selectedProjectPosition={selectedProjectPosition}
        projectFocusKey={projectFocusKey}
        zoomInLabel={zoomInLabel}
        zoomOutLabel={zoomOutLabel}
        selectedRegion={selectedRegion}
      />
      <MapLayer {...props} />
      <MapMarkerLayers {...props} />
    </MapContainer>
  );
}

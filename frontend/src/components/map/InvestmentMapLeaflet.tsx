"use client";

import { useEffect, useRef } from "react";
import L, { type PathOptions } from "leaflet";
import { CircleMarker, GeoJSON, MapContainer, Marker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import type {
  DepartmentFeatureCollection,
  DepartmentProperties,
  MapDepartmentSummary,
  MapInvestmentProject,
  MunicipalityFeatureCollection,
  MunicipalityProperties,
  InfrastructureFeature,
} from "@/src/lib/types/investment-map";
import { toLeafletPointPosition, toLeafletProjectPosition } from "@/src/lib/types/investment-map";

const HONDURAS_CENTER: [number, number] = [14.63, -86.24];
const HONDURAS_BOUNDS: L.LatLngBoundsExpression = [
  [12.6, -90.4],
  [17, -82.4],
];
const STROKE = "#334E88";
const MUNICIPALITY_STROKE = "#7BA3D4";
const FILL_BASE = "#E8F1FA";
const FILL_ACTIVE = "#C5DCF0";
const HOVER_FILL = "#32B372";
const SELECTED_FILL = "#32B372";
const SELECTED_STROKE = "#334E88";
const MARKER_FILL = "#32B372";
const MARKER_SELECTED = "#F7BF06";

type Props = {
  data: DepartmentFeatureCollection;
  summaries: Map<string, MapDepartmentSummary>;
  activeSector: string;
  selectedDepartmentSlug: string | null;
  municipalities: MunicipalityFeatureCollection | null;
  selectedMunicipalitySlug: string | null;
  markerProjects: MapInvestmentProject[];
  selectedProjectId: number | null;
  selectedProjectPosition: [number, number] | null;
  projectFocusKey: number;
  mapAriaLabel: string;
  mapInstructions: string;
  zoomInLabel: string;
  zoomOutLabel: string;
  onSelectDepartment: (properties: DepartmentProperties) => void;
  onSelectMunicipality: (properties: MunicipalityProperties) => void;
  onSelectProject: (project: MapInvestmentProject) => void;
  onHoverDepartment: (properties: DepartmentProperties | null) => void;
  onHoverMunicipality: (properties: MunicipalityProperties | null) => void;
  infrastructure: InfrastructureFeature[];
  selectedInfrastructureId: number | null;
  onSelectInfrastructure: (feature: InfrastructureFeature) => void;
};

function styleDepartment(
  properties: DepartmentProperties,
  summaries: Map<string, MapDepartmentSummary>,
  activeSector: string,
  selectedDepartmentSlug: string | null,
): PathOptions {
  const summary = summaries.get(properties.slug);
  const hasActivity = Boolean(
    summary && summary.projects_count + summary.opportunities_count > 0,
  );
  const matches =
    activeSector === "all" ||
    (summary?.sectors?.some((sector) => sector.slug === activeSector) ?? false);
  const selected = properties.slug === selectedDepartmentSlug;

  if (selected) {
    return {
      color: SELECTED_STROKE,
      weight: 3,
      opacity: 1,
      fillColor: FILL_ACTIVE,
      fillOpacity: 0.45,
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

function styleMunicipality(
  properties: MunicipalityProperties,
  selectedMunicipalitySlug: string | null,
): PathOptions {
  const selected = properties.slug === selectedMunicipalitySlug;
  if (selected) {
    return {
      color: SELECTED_STROKE,
      weight: 2,
      opacity: 1,
      fillColor: SELECTED_FILL,
      fillOpacity: 0.78,
    };
  }
  return {
    color: MUNICIPALITY_STROKE,
    weight: 0.9,
    opacity: 0.95,
    fillColor: FILL_BASE,
    fillOpacity: 0.72,
  };
}

function ViewportController({
  data,
  selectedDepartmentSlug,
  selectedMunicipalitySlug,
  municipalities,
  selectedProjectPosition,
  projectFocusKey,
  zoomInLabel,
  zoomOutLabel,
}: {
  data: DepartmentFeatureCollection;
  selectedDepartmentSlug: string | null;
  selectedMunicipalitySlug: string | null;
  municipalities: MunicipalityFeatureCollection | null;
  selectedProjectPosition: [number, number] | null;
  projectFocusKey: number;
  zoomInLabel: string;
  zoomOutLabel: string;
}) {
  const map = useMap();
  const initialFit = useRef(false);
  const previousDepartment = useRef<string | null>(null);

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
    map.setMaxZoom(selectedDepartmentSlug ? 12 : 9);
  }, [map, selectedDepartmentSlug]);

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
    if (!selectedProjectPosition || projectFocusKey === 0) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.flyTo(selectedProjectPosition, Math.min(Math.max(map.getZoom(), 9), 10), {
      animate: !reducedMotion,
      duration: reducedMotion ? 0 : 0.7,
    });
  }, [map, projectFocusKey, selectedProjectPosition]);

  return null;
}

export function InvestmentMapLeaflet({
  data,
  summaries,
  activeSector,
  selectedDepartmentSlug,
  municipalities,
  selectedMunicipalitySlug,
  markerProjects,
  selectedProjectId,
  selectedProjectPosition,
  projectFocusKey,
  mapAriaLabel,
  mapInstructions,
  zoomInLabel,
  zoomOutLabel,
  onSelectDepartment,
  onSelectMunicipality,
  onSelectProject,
  onHoverDepartment,
  onHoverMunicipality,
  infrastructure,
  selectedInfrastructureId,
  onSelectInfrastructure,
}: Props) {
  const departmentLayerRef = useRef<L.GeoJSON | null>(null);
  const municipalityLayerRef = useRef<L.GeoJSON | null>(null);
  const departmentStyleRef = useRef(styleDepartment);
  const municipalityStyleRef = useRef(styleMunicipality);

  useEffect(() => {
    departmentStyleRef.current = styleDepartment;
  }, [summaries, activeSector, selectedDepartmentSlug]);

  useEffect(() => {
    municipalityStyleRef.current = styleMunicipality;
  }, [selectedMunicipalitySlug]);

  useEffect(() => {
    departmentLayerRef.current?.eachLayer((layer) => {
      const feature = (layer as L.Layer & { feature?: GeoJSON.Feature }).feature;
      const properties = feature?.properties as DepartmentProperties | undefined;
      if (properties && "setStyle" in layer) {
        (layer as L.Path).setStyle(
          styleDepartment(properties, summaries, activeSector, selectedDepartmentSlug),
        );
      }
    });
  }, [activeSector, selectedDepartmentSlug, summaries]);

  useEffect(() => {
    municipalityLayerRef.current?.eachLayer((layer) => {
      const feature = (layer as L.Layer & { feature?: GeoJSON.Feature }).feature;
      const properties = feature?.properties as MunicipalityProperties | undefined;
      if (properties && "setStyle" in layer) {
        (layer as L.Path).setStyle(styleMunicipality(properties, selectedMunicipalitySlug));
      }
    });
  }, [selectedMunicipalitySlug]);

  const maxZoom = selectedDepartmentSlug ? 12 : 9;

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
      />
      <GeoJSON
        ref={departmentLayerRef}
        data={data as unknown as GeoJSON.GeoJsonObject}
        style={(feature) => {
          const properties = feature?.properties as DepartmentProperties;
          return styleDepartment(properties, summaries, activeSector, selectedDepartmentSlug);
        }}
        onEachFeature={(feature, layer) => {
          const properties = feature.properties as DepartmentProperties;
          const pathLayer = layer as L.Path;
          layer.bindTooltip(properties.name, { sticky: true, direction: "top", opacity: 0.92 });
          layer.on({
            click: () => onSelectDepartment(properties),
            mouseover: () => {
              onHoverDepartment(properties);
              if (properties.slug !== selectedDepartmentSlug) {
                pathLayer.setStyle({
                  color: STROKE,
                  weight: 2.8,
                  opacity: 1,
                  fillColor: HOVER_FILL,
                  fillOpacity: 0.68,
                });
              }
              pathLayer.bringToFront();
            },
            mouseout: () => {
              onHoverDepartment(null);
              pathLayer.setStyle(
                departmentStyleRef.current(
                  properties,
                  summaries,
                  activeSector,
                  selectedDepartmentSlug,
                ),
              );
            },
          });
        }}
      />
      {municipalities && municipalities.features.length > 0 ? (
        <GeoJSON
          key={selectedDepartmentSlug ?? "none"}
          ref={municipalityLayerRef}
          data={municipalities as unknown as GeoJSON.GeoJsonObject}
          style={(feature) => {
            const properties = feature?.properties as MunicipalityProperties;
            return styleMunicipality(properties, selectedMunicipalitySlug);
          }}
          onEachFeature={(feature, layer) => {
            const properties = feature.properties as MunicipalityProperties;
            const pathLayer = layer as L.Path;
            layer.bindTooltip(properties.name, { sticky: true, direction: "top", opacity: 0.92 });
            layer.on({
              click: () => onSelectMunicipality(properties),
              mouseover: () => {
                onHoverMunicipality(properties);
                pathLayer.setStyle({
                  color: SELECTED_STROKE,
                  weight: 1.6,
                  opacity: 1,
                  fillColor: HOVER_FILL,
                  fillOpacity: 0.72,
                });
                pathLayer.bringToFront();
              },
              mouseout: () => {
                onHoverMunicipality(null);
                pathLayer.setStyle(
                  municipalityStyleRef.current(properties, selectedMunicipalitySlug),
                );
              },
            });
          }}
        />
      ) : null}
      {markerProjects.map((project) => {
        const position = toLeafletProjectPosition(project);
        if (!position) return null;
        const selected = project.id === selectedProjectId;
        return (
          <CircleMarker
            key={project.id}
            center={position}
            radius={selected ? 9 : 7}
            pathOptions={{
              color: STROKE,
              weight: selected ? 3 : 2,
              fillColor: selected || project.featured ? MARKER_SELECTED : MARKER_FILL,
              fillOpacity: 0.95,
            }}
            eventHandlers={{
              click: () => onSelectProject(project),
            }}
          ><Tooltip direction="top">{project.title}</Tooltip></CircleMarker>
        );
      })}
      {infrastructure.map((feature) => {
        const position = toLeafletPointPosition(feature.geometry.coordinates);
        if (!position) return null;
        const selected = feature.properties.id === selectedInfrastructureId;
        const icon = L.divIcon({
          className: "",
          iconSize: [selected ? 34 : 30, selected ? 34 : 30],
          iconAnchor: [selected ? 17 : 15, selected ? 17 : 15],
          html: `<span style="display:grid;place-items:center;width:100%;height:100%;border-radius:50%;background:#F7BF06;color:#001a33;border:${selected ? "3" : "2"}px solid white;box-shadow:0 2px 8px rgba(0,26,51,.35)" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 9.5 14.5M15 5l4 4M2 16l6 1 1 5 3-7 7-3-5-1-1-5Z"/></svg></span>`,
        });
        return <Marker key={`${feature.properties.infrastructure_type}-${feature.properties.id}`} position={position} icon={icon} eventHandlers={{ click: () => onSelectInfrastructure(feature) }} keyboard riseOnHover title={feature.properties.name}><Tooltip direction="top">{feature.properties.name}</Tooltip></Marker>;
      })}
    </MapContainer>
  );
}

"use client";

import { useEffect, useRef } from "react";
import L, { type PathOptions } from "leaflet";
import { CircleMarker, GeoJSON, MapContainer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import type {
  DepartmentFeatureCollection,
  DepartmentProperties,
  MapDepartmentSummary,
  MapInvestmentProject,
  MunicipalityFeatureCollection,
  MunicipalityProperties,
} from "@/src/lib/types/investment-map";

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
  onSelectDepartment: (properties: DepartmentProperties) => void;
  onSelectMunicipality: (properties: MunicipalityProperties) => void;
  onSelectProject: (project: MapInvestmentProject) => void;
  onHoverDepartment: (properties: DepartmentProperties | null) => void;
  onHoverMunicipality: (properties: MunicipalityProperties | null) => void;
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
}: {
  data: DepartmentFeatureCollection;
  selectedDepartmentSlug: string | null;
  selectedMunicipalitySlug: string | null;
  municipalities: MunicipalityFeatureCollection | null;
}) {
  const map = useMap();
  const initialFit = useRef(false);
  const previousDepartment = useRef<string | null>(null);

  useEffect(() => {
    if (initialFit.current || data.features.length === 0) return;
    const bounds = L.geoJSON(data as unknown as GeoJSON.GeoJsonObject).getBounds();
    if (!bounds.isValid()) return;
    map.fitBounds(bounds, { padding: [12, 12], maxZoom: 8, animate: false });
    map.setMaxBounds(bounds.pad(0.12));
    initialFit.current = true;
  }, [data, map]);

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
  onSelectDepartment,
  onSelectMunicipality,
  onSelectProject,
  onHoverDepartment,
  onHoverMunicipality,
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
      zoomControl={false}
      attributionControl={false}
      className="h-full min-h-[440px] w-full bg-white sm:min-h-[600px]"
      style={{ background: "#ffffff" }}
      aria-label="Interactive map of Honduras investment departments"
    >
      <ViewportController
        data={data}
        selectedDepartmentSlug={selectedDepartmentSlug}
        selectedMunicipalitySlug={selectedMunicipalitySlug}
        municipalities={municipalities}
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
        if (project.latitude == null || project.longitude == null) return null;
        const selected = project.id === selectedProjectId;
        return (
          <CircleMarker
            key={project.id}
            center={[project.latitude, project.longitude]}
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
          />
        );
      })}
    </MapContainer>
  );
}

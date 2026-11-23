import { useEffect, useRef } from "react";
import L from "leaflet";
import { AttributionControl, GeoJSON, Pane } from "react-leaflet";

import type {
  DepartmentProperties,
  MunicipalityProperties,
  RoadCorridorFeature,
  RoadCorridorProperties,
  TerritorialRegionProperties,
} from "@/src/lib/types/investment-map";
import { formatRoadLabel } from "@/src/lib/types/investment-map";

import {
  STROKE,
  HOVER_FILL,
  SELECTED_STROKE,
  REGIONS_PANE_Z,
  ROADS_PANE_Z,
  OSM_COPYRIGHT_URL,
  styleRoad,
  styleRoadCasing,
  escapeHtml,
  regionTooltipHtml,
  styleRegion,
  styleDepartment,
  styleMunicipality,
} from "./mapLeafletVisuals";
import type { LeafletMapProps } from "./leafletMapProps";

export function MapLayer({
  data,
  summaries,
  activeSector,
  selectedDepartmentSlug,
  municipalities,
  selectedMunicipalitySlug,
  onSelectDepartment,
  onSelectMunicipality,
  onHoverDepartment,
  onHoverMunicipality,
  roads = null,
  selectedRoadCode = null,
  onSelectRoad,
  roadAttribution = "© OpenStreetMap contributors",
  regions,
  regionTooltipCopy,
  regionMode = false,
  selectedRegionCode = null,
  onSelectRegion,
}: LeafletMapProps) {
  const regionLevel = regions?.features[0]?.properties.level ?? "none";
  const regionLayerRef = useRef<L.GeoJSON | null>(null);
  // onEachFeature handlers are bound once per layer mount; read the latest values from refs.
  const selectedRegionCodeRef = useRef(selectedRegionCode);
  const onSelectRegionRef = useRef(onSelectRegion);
  const onSelectRoadRef = useRef(onSelectRoad);
  useEffect(() => {
    selectedRegionCodeRef.current = selectedRegionCode;
    onSelectRegionRef.current = onSelectRegion;
    onSelectRoadRef.current = onSelectRoad;
  }, [onSelectRegion, onSelectRoad, selectedRegionCode]);

  useEffect(() => {
    regionLayerRef.current?.eachLayer((layer) => {
      const properties = (layer as L.Layer & { feature?: GeoJSON.Feature }).feature?.properties as TerritorialRegionProperties | undefined;
      if (properties && "setStyle" in layer) {
        const path = layer as L.Path;
        path.setStyle(styleRegion(properties, selectedRegionCode));
        if (properties.code === selectedRegionCode) path.bringToFront();
      }
    });
  }, [regions, selectedRegionCode]);
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

  return <>
      {!regionMode ? (
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
      ) : null}
      {!regionMode && municipalities && municipalities.features.length > 0 ? (
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
      {regionMode && regions && regionTooltipCopy && regions.features.length > 0 ? (
        <Pane name="cni-regions" style={{ zIndex: REGIONS_PANE_Z }}>
          <GeoJSON
            key={regionLevel}
            ref={regionLayerRef}
            data={regions as unknown as GeoJSON.GeoJsonObject}
            style={(feature) => styleRegion(feature?.properties as TerritorialRegionProperties, selectedRegionCodeRef.current)}
            onEachFeature={(feature, layer) => {
              const properties = feature.properties as TerritorialRegionProperties;
              const pathLayer = layer as L.Path;
              layer.bindTooltip(regionTooltipHtml(properties, regionTooltipCopy), {
                sticky: true,
                direction: "top",
                opacity: 0.95,
              });
              layer.on({
                click: () => onSelectRegionRef.current?.(properties.code),
                mouseover: () => {
                  pathLayer.setStyle({ weight: 3, fillOpacity: 0.75 });
                  pathLayer.bringToFront();
                },
                mouseout: () => {
                  pathLayer.setStyle(styleRegion(properties, selectedRegionCodeRef.current));
                  regionLayerRef.current?.eachLayer((other) => {
                    const code = ((other as L.Layer & { feature?: GeoJSON.Feature }).feature?.properties as TerritorialRegionProperties | undefined)?.code;
                    if (code && code === selectedRegionCodeRef.current) (other as L.Path).bringToFront();
                  });
                },
              });
            }}
          />
        </Pane>
      ) : null}
      {roads && roads.features.length > 0 ? (
        <Pane name="cni-roads" style={{ zIndex: ROADS_PANE_Z }}>
          <AttributionControl position="bottomright" prefix={false} />
          <GeoJSON
            data={{ ...roads, features: roads.features.filter((feature) => feature.properties.is_strategic || feature.properties.road_class === "secundaria") } as unknown as GeoJSON.GeoJsonObject}
            interactive={false}
            style={(feature) => styleRoadCasing(feature?.properties as RoadCorridorProperties)}
          />
          <GeoJSON
            key={selectedRoadCode ?? "none"}
            data={roads as unknown as GeoJSON.GeoJsonObject}
            attribution={`<a href="${OSM_COPYRIGHT_URL}" target="_blank" rel="noopener noreferrer">${escapeHtml(roadAttribution)}</a>`}
            style={(feature) => styleRoad(feature?.properties as RoadCorridorProperties, selectedRoadCode)}
            onEachFeature={(feature, layer) => {
              const properties = feature.properties as RoadCorridorProperties;
              const pathLayer = layer as L.Path;
              layer.bindTooltip(escapeHtml(formatRoadLabel(properties)), { sticky: true, direction: "top", opacity: 0.95 });
              layer.on({
                click: () => onSelectRoadRef.current?.(feature as unknown as RoadCorridorFeature),
                mouseover: () => {
                  const base = styleRoad(properties, selectedRoadCode);
                  pathLayer.setStyle({ weight: (base.weight ?? 2) + 1.5, opacity: 1 });
                },
                mouseout: () => pathLayer.setStyle(styleRoad(properties, selectedRoadCode)),
              });
            }}
          />
        </Pane>
      ) : null}
  </>;
}

import L from "leaflet";
import { Marker, Pane, Tooltip } from "react-leaflet";

import type { PortCategory } from "@/src/lib/types/investment-map";
import { localizeInfrastructure, toLeafletPointPosition } from "@/src/lib/types/investment-map";
import { groupMarkersByPosition } from "@/src/lib/mapMarkers";

import {
  MARKER_FILL,
  MARKER_SELECTED,
  MARKER_OPPORTUNITY,
  MARKER_STROKE,
  PROJECTS_PANE_Z,
  INFRASTRUCTURE_MARKERS,
  clusterDivIcon,
} from "./mapLeafletVisuals";
import type { LeafletMapProps } from "./leafletMapProps";

function markerSelection(select: () => void): L.LeafletEventHandlerFnMap {
  return {
    click: select,
    keydown: ({ originalEvent }) => {
      if (originalEvent.key !== "Enter" && originalEvent.key !== " ") return;
      originalEvent.preventDefault();
      originalEvent.stopPropagation();
      if (!originalEvent.repeat) select();
    },
  };
}

export function MapMarkerLayers({
  markerProjects,
  selectedProjectId,
  onSelectProject,
  hoveredProjectId = null,
  onSelectCluster,
  clusterTooltip,
  infrastructure,
  selectedInfrastructureId,
  onSelectInfrastructure,
  infrastructureCopy,
}: LeafletMapProps) {
  return <>
      <Pane name="cni-projects" style={{ zIndex: PROJECTS_PANE_Z }}>
      {groupMarkersByPosition(markerProjects).map((group) => {
        const highlighted = group.items.some(
          (item) => item.id === selectedProjectId || item.id === hoveredProjectId,
        );
        const place =
          group.items[0]?.municipality?.name ||
          group.items[0]?.locationText ||
          group.items[0]?.department?.name ||
          "";
        if (group.items.length === 1) {
          const project = group.items[0];
          const color = project.kind === "opportunity" ? MARKER_OPPORTUNITY : MARKER_FILL;
          const border = highlighted ? MARKER_SELECTED : MARKER_STROKE;
          const size = highlighted ? 22 : 14;
          const icon = L.divIcon({
            className: "",
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            html: `<span style="display:block;width:100%;height:100%;border-radius:50%;background:${color};border:${highlighted ? 3 : 2}px solid ${border}"></span>`,
          });
          return (
            <Marker
              key={group.key}
              position={[group.latitude, group.longitude]}
              icon={icon}
              title={project.title}
              keyboard
              eventHandlers={markerSelection(() => onSelectProject(project))}
            >
              <Tooltip direction="top">{project.title}</Tooltip>
            </Marker>
          );
        }
        const projectCount = group.items.filter((item) => (item.kind ?? "project") === "project").length;
        const opportunityCount = group.items.length - projectCount;
        const icon = clusterDivIcon(group.items.length, highlighted, projectCount, opportunityCount);
        const title = clusterTooltip ? clusterTooltip(group.items.length, place) : `${group.items.length} · ${place}`;
        return (
          <Marker
            key={group.key}
            position={[group.latitude, group.longitude]}
            icon={icon}
            title={title}
            keyboard
            eventHandlers={markerSelection(() => {
              if (onSelectCluster) onSelectCluster(group);
              else onSelectProject(group.items[0]);
            })}
          >
            <Tooltip direction="top">
              {title}
            </Tooltip>
          </Marker>
        );
      })}
      </Pane>
      {infrastructure.map((feature) => {
        const position = toLeafletPointPosition(feature.geometry.coordinates);
        if (!position) return null;
        const selected = feature.properties.id === selectedInfrastructureId;
        const marker = INFRASTRUCTURE_MARKERS[feature.properties.infrastructure_type] ?? INFRASTRUCTURE_MARKERS.airport;
        const icon = L.divIcon({
          className: "",
          iconSize: [selected ? 34 : 30, selected ? 34 : 30],
          iconAnchor: [selected ? 17 : 15, selected ? 17 : 15],
          html: `<span style="display:grid;place-items:center;width:100%;height:100%;border-radius:50%;background:${marker.background};color:${marker.color};border:${selected ? "3" : "2"}px solid white;box-shadow:0 2px 8px rgba(0,26,51,.35)" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${marker.svg}</svg></span>`,
        });
        const localized = localizeInfrastructure(feature.properties, infrastructureCopy?.locale ?? "es");
        const category = feature.properties.details?.category;
        const isPort = feature.properties.infrastructure_type === "port";
        return (
          <Marker key={`${feature.properties.infrastructure_type}-${feature.properties.id}`} position={position} icon={icon} eventHandlers={markerSelection(() => onSelectInfrastructure(feature))} keyboard riseOnHover title={localized.name}>
            <Tooltip direction="top">
              {isPort && infrastructureCopy ? (
                <span className="block max-w-[240px] whitespace-normal">
                  <strong>{localized.name}</strong>
                  <br />
                  {[category ? infrastructureCopy.portCategories[category as PortCategory] ?? category : null, localized.coast].filter(Boolean).join(" · ")}
                  {feature.properties.operator ? <><br />{infrastructureCopy.operator}: {feature.properties.operator}</> : null}
                  {localized.description ? <><br /><span className="text-[11px]">{localized.description}</span></> : null}
                </span>
              ) : localized.name}
            </Tooltip>
          </Marker>
        );
      })}
  </>;
}

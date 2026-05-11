"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { InvestmentNode } from "@/src/lib/types/investment-map";

// ---------------------------------------------------------------------------
// Fix Leaflet default icon paths (Webpack chunks break them)
// ---------------------------------------------------------------------------
const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface DynamicLeafletMapProps {
    nodes: InvestmentNode[];
}

// ---------------------------------------------------------------------------
// Honduras centre coordinates & default zoom
// ---------------------------------------------------------------------------
const HONDURAS_CENTER: [number, number] = [14.63, -86.24];
const DEFAULT_ZOOM = 7;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function DynamicLeafletMap({ nodes }: DynamicLeafletMapProps) {
    return (
        <MapContainer
            center={HONDURAS_CENTER}
            zoom={DEFAULT_ZOOM}
            scrollWheelZoom
            className="h-full w-full rounded-xl"
            style={{ minHeight: "500px" }}
        >
            {/* CARTO Dark Basemap */}
            <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {nodes.map((node) => (
                <Marker
                    key={node.id}
                    position={[node.lat, node.lng]}
                    icon={defaultIcon}
                >
                    <Popup>
                        <div className="min-w-[200px] space-y-2 p-1">
                            {/* Sector badge */}
                            <span
                                className="inline-block rounded-full px-3 py-0.5 text-xs font-semibold text-white"
                                style={{ backgroundColor: node.sectorColor }}
                            >
                                {node.sectorName}
                            </span>

                            {/* Project title */}
                            <h3 className="text-sm font-bold leading-tight text-gray-900">
                                {node.title}
                            </h3>

                            {/* CAPEX */}
                            <p className="text-xs text-gray-500">
                                CAPEX:{" "}
                                <span className="font-semibold text-emerald-600">
                                    $
                                    {Number(node.capexUsd).toLocaleString("en-US", {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                    })}
                                </span>
                            </p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

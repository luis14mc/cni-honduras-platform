"use client";

import dynamic from "next/dynamic";
import type { InvestmentNode } from "@/src/lib/types/investment-map";

// ---------------------------------------------------------------------------
// Dynamically import the Leaflet map – SSR disabled to avoid
// "window is not defined" errors from Leaflet's DOM dependency.
// ---------------------------------------------------------------------------
const LeafletMap = dynamic(
    () => import("@/src/components/map/DynamicLeafletMap"),
    {
        ssr: false,
        loading: () => <MapSkeleton />,
    },
);

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------
function MapSkeleton() {
    return (
        <div className="flex h-[500px] w-full items-center justify-center rounded-xl bg-gray-900/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
                {/* Pulse ring animation */}
                <div className="relative h-12 w-12">
                    <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/40" />
                    <span className="absolute inset-2 animate-pulse rounded-full bg-emerald-500/70" />
                </div>
                <p className="animate-pulse text-sm font-medium tracking-wide text-gray-300">
                    Cargando mapa…
                </p>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------
interface MapWrapperProps {
    nodes: InvestmentNode[];
}

export default function MapWrapper({ nodes }: MapWrapperProps) {
    return (
        <section className="w-full overflow-hidden rounded-xl border border-white/10 shadow-2xl">
            <LeafletMap nodes={nodes} />
        </section>
    );
}

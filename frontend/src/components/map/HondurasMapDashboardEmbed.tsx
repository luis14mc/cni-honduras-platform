"use client";

import dynamic from "next/dynamic";

const HondurasMap = dynamic(() => import("@/src/components/map/HondurasMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[560px] w-full items-center justify-center rounded-[2rem] border border-white/10 bg-[#00142f]/80 shadow-2xl backdrop-blur">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#35A963]">
        Cargando mapa
      </p>
    </div>
  ),
});

export function HondurasMapDashboardEmbed() {
  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#001a33]/80 p-3 shadow-[0_0_70px_rgba(0,33,71,0.65)] backdrop-blur">
      <div className="overflow-hidden rounded-[1.5rem] bg-white text-white [&_.leaflet-container]:min-h-[620px] lg:[&_.leaflet-container]:min-h-[680px] [&_.leaflet-container]:rounded-[1.35rem] [&_.leaflet-container]:bg-white">
        <HondurasMap />
      </div>
    </div>
  );
}

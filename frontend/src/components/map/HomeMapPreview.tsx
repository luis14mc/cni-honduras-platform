"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/src/i18n/config";
import { investmentMapCopy } from "@/src/i18n/copy/investmentMap";
import { resolveHref } from "@/src/config/siteNavigation";
import { getDepartmentGeoJson } from "@/src/services/investmentMap";
import type { DepartmentFeatureCollection, MapDepartmentSummary } from "@/src/lib/types/investment-map";

// Mismo lienzo que el mapa completo (/portafolio/mapa, MAP-002), sin paneles ni búsqueda.
const InvestmentMapLeaflet = dynamic(
  () => import("@/src/components/map/InvestmentMapLeaflet").then((mod) => mod.InvestmentMapLeaflet),
  { ssr: false },
);

const EMPTY_SUMMARIES = new Map<string, MapDepartmentSummary>();
const noop = () => {};

type State =
  | { status: "loading" }
  | { status: "ready"; data: DepartmentFeatureCollection }
  | { status: "error" };

/**
 * Vista previa del mapa de inversión para la portada.
 * Al seleccionar un departamento abre el mapa completo ya enfocado en él.
 */
export function HomeMapPreview({ locale }: { locale: Locale }) {
  const copy = investmentMapCopy[locale];
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    getDepartmentGeoJson()
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fullMap = resolveHref(locale, "/portafolio/mapa");

  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#001a33]/80 p-3 shadow-[0_0_70px_rgba(0,33,71,0.65)] backdrop-blur">
      <div className="relative h-[420px] overflow-hidden rounded-[1.5rem] bg-white md:h-[520px] [&_.leaflet-container]:h-full">
        {state.status === "ready" ? (
          <InvestmentMapLeaflet
            data={state.data}
            summaries={EMPTY_SUMMARIES}
            activeSector="all"
            selectedDepartmentSlug={null}
            municipalities={null}
            selectedMunicipalitySlug={null}
            markerProjects={[]}
            selectedProjectId={null}
            selectedProjectPosition={null}
            projectFocusKey={0}
            mapAriaLabel={copy.mapAriaLabel}
            mapInstructions={copy.mapInstructions}
            zoomInLabel={copy.zoomIn}
            zoomOutLabel={copy.zoomOut}
            onSelectDepartment={(dept) => router.push(`${fullMap}?department=${encodeURIComponent(dept.slug)}`)}
            onSelectMunicipality={noop}
            onSelectProject={noop}
            onHoverDepartment={noop}
            onHoverMunicipality={noop}
            infrastructure={[]}
            selectedInfrastructureId={null}
            onSelectInfrastructure={noop}
          />
        ) : (
          <div
            role={state.status === "error" ? "alert" : "status"}
            className="flex h-full items-center justify-center px-6 text-center text-sm font-semibold uppercase tracking-[0.18em] text-[#35A963]"
          >
            {state.status === "error" ? copy.mapError : copy.loadingMap}
          </div>
        )}
      </div>
    </div>
  );
}

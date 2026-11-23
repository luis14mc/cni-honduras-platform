"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Anchor, Plane, Route, Search, X } from "lucide-react";
import type { InfrastructureLayer, TerritorialRegionLevel } from "@/src/lib/types/investment-map";
import { InvestmentMapPanel } from "@/src/components/map/InvestmentMapPanel";

import { MapFiltersBar } from "./MapFiltersBar";
import { useInvestmentMapDashboard } from "./useInvestmentMapDashboard";

const InvestmentMapLeaflet = dynamic(
  () => import("@/src/components/map/InvestmentMapLeaflet").then((mod) => mod.InvestmentMapLeaflet),
  { ssr: false },
);

type RegionLayerChoice = "none" | TerritorialRegionLevel;
const REGION_LAYER_CHOICES: RegionLayerChoice[] = ["none", "macro", "sub", "polo"];
const INFRASTRUCTURE_LAYER_OPTIONS: { layer: InfrastructureLayer; Icon: typeof Plane }[] = [
  { layer: "airport", Icon: Plane },
  { layer: "port", Icon: Anchor },
];

export function InvestmentMapDashboard(props: Parameters<typeof useInvestmentMapDashboard>[0]) {
  const canvas = useRef<HTMLDivElement>(null);
  const [canvasRequested, setCanvasRequested] = useState(false);
  useEffect(() => {
    if (!canvas.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      setCanvasRequested(true);
    }, { rootMargin: "160px" });
    observer.observe(canvas.current);
    return () => observer.disconnect();
  }, []);

  const {
    stage, setStage, minInvestment, setMinInvestment, maxInvestment, setMaxInvestment,
    copy,
    activeSector,
    selectedDepartment,
    selectedMunicipality,
    selectedProject,
    kindFilter,
    setKindFilter,
    hoveredProjectId,
    setHoveredProjectId,
    hoveredDepartment,
    setHoveredDepartment,
    hoveredMunicipality,
    setHoveredMunicipality,
    activeInfrastructureLayers,
    infrastructureCache,
    infrastructureStatus,
    selectedInfrastructure,
    setSelectedInfrastructure,
    roadsActive,
    roads,
    roadsStatus,
    selectedRoad,
    setSelectedRoad,
    regionLayer,
    regionMode,
    search,
    setSearch,
    searchOpen,
    setSearchOpen,
    activeSearchIndex,
    setActiveSearchIndex,
    projectFocusKey,
    handleSelectDepartment,
    handleToggleInfrastructure,
    handleToggleRoads,
    handleSelectRoad,
    handleSelectRegion,
    handleSelectProject,
    handleSelectCluster,
    handleSelectInfrastructure,
    handleClearDepartment,
    handleSelectRegionLayer,
    handleClearMunicipality,
    handleClearProject,
    handleClearCluster,
    handleSelectMunicipality,
    handleSectorChange,
    handleResetFilters,
    summaries,
    selectedSummary,
    summaryLoading,
    municipalitiesLoading,
    municipalitiesForMap,
    municipalitiesError,
    municipalitiesEmpty,
    activeRegions,
    activeRegionStatus,
    selectedRegion,
    projectsLoading,
    activeCluster,
    listedProjects,
    markerProjects,
    listPlace,
    searchResults,
    regionLegendItems,
    regionTooltipCopy,
    infrastructureTooltipCopy,
    infrastructureLabels,
    activeInfrastructureLabels,
    counts,
    selectedSectorName,
    projectFocusPosition,
    chooseSearchResult,
    geo,
    summary,
    sectors,
    sectorError,
    projects,
    locale,
  } = useInvestmentMapDashboard(props);
  return (
    <section className="relative overflow-hidden bg-[#001a33] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(141,192,70,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(141,192,70,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="relative mx-auto max-w-[1520px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <header className="max-w-4xl">
          <p className="font-headline text-[10px] font-bold uppercase tracking-[0.24em] text-[#8DC046]">{copy.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[0.96] tracking-[-0.04em] sm:text-6xl">{copy.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#d5e3ff]/75 sm:text-lg">{copy.description}</p>
        </header>

        <div className="mt-10 rounded-2xl border border-white/10 bg-[#24436B]/65 p-4 shadow-2xl backdrop-blur sm:p-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor="investment-map-sector" className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-[#8DC046]">{copy.filterLabel}</label>
              <select id="investment-map-sector" value={activeSector} onChange={(event) => handleSectorChange(event.target.value)} className="mt-2 block w-full max-w-xl rounded-xl border border-white/15 bg-[#001a33] px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-[#F7BF06] focus:ring-2 focus:ring-[#F7BF06]/30">
                <option value="all">{copy.allSectors}</option>
                {sectors.map((sector) => <option key={sector.slug} value={sector.slug}>{sector.name}</option>)}
              </select>
              {sectorError ? <p className="mt-2 text-xs text-[#d5e3ff]/70">{copy.allSectors}</p> : null}
            </div>
            <div className="relative min-w-0">
              <label htmlFor="investment-map-search" className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-[#8DC046]">{copy.searchLabel}</label>
               <div className="relative mt-2"><Search className="pointer-events-none absolute left-3 top-3.5 text-[#8DC046]" size={18} aria-hidden="true" /><input id="investment-map-search" role="combobox" aria-autocomplete="list" aria-expanded={searchOpen} aria-controls="investment-map-results" aria-activedescendant={activeSearchIndex >= 0 ? searchResults[activeSearchIndex]?.id : undefined} value={search} placeholder={copy.searchPlaceholder} onFocus={() => setSearchOpen(Boolean(search))} onChange={(event) => { setSearch(event.target.value); setSearchOpen(Boolean(event.target.value)); setActiveSearchIndex(-1); }} onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); setSearchOpen(true); setActiveSearchIndex((index) => Math.min(index + 1, searchResults.length - 1)); } else if (event.key === "ArrowUp") { event.preventDefault(); setActiveSearchIndex((index) => Math.max(index - 1, 0)); } else if (event.key === "Enter" && activeSearchIndex >= 0) { event.preventDefault(); chooseSearchResult(searchResults[activeSearchIndex]); } else if (event.key === "Escape") { setSearchOpen(false); setActiveSearchIndex(-1); } }} className="block w-full rounded-xl border border-white/15 bg-[#001a33] py-3 pl-10 pr-10 text-sm font-semibold text-white outline-none placeholder:text-[#d5e3ff]/55 focus:border-[#F7BF06] focus:ring-2 focus:ring-[#F7BF06]/30" />{search ? <button type="button" aria-label={copy.clearSearch} onClick={() => { setSearch(""); setSearchOpen(false); }} className="absolute right-1.5 top-1.5 grid min-h-9 min-w-9 place-items-center rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F7BF06]"><X size={17} aria-hidden="true" /></button> : null}</div>
              {searchOpen ? <div id="investment-map-results" role="listbox" aria-label={copy.searchResults} className="absolute z-[700] mt-2 max-h-72 w-full overflow-auto rounded-xl border border-[#334E88]/20 bg-white p-1 text-[#001a33] shadow-2xl">{searchResults.length ? (["department", "municipality", "project"] as const).map((type) => { const groupedResults = searchResults.map((result, index) => ({ result, index })).filter(({ result }) => result.type === type); if (!groupedResults.length) return null; return <div key={type} role="group" aria-label={copy.searchGroups[type]}><p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-[#334E88]" aria-hidden="true">{copy.searchGroups[type]}</p>{groupedResults.map(({ result, index }) => <div key={result.id} id={result.id} role="option" aria-selected={index === activeSearchIndex} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseSearchResult(result)} className={`min-h-11 cursor-pointer rounded-lg px-3 py-2 font-semibold ${index === activeSearchIndex ? "bg-[#E8F1FA]" : "hover:bg-[#E8F1FA]"}`}>{result.label}</div>)}</div>; }) : <p className="p-3 text-sm" role="status">{copy.searchNoResults}</p>}</div> : null}
            </div>
          </div>
          <MapFiltersBar
            locale={locale} stage={stage} stages={copy.stage}
            minInvestment={minInvestment} maxInvestment={maxInvestment}
            departments={geo.data?.features.map(({ properties }) => properties) ?? []}
            department={selectedDepartment}
            regions={regionMode ? activeRegions?.features ?? [] : null} region={selectedRegion}
            onDepartment={(department) => department ? handleSelectDepartment(department) : handleClearDepartment()}
            onRegion={handleSelectRegion} onStage={setStage}
            onMinInvestment={setMinInvestment} onMaxInvestment={setMaxInvestment}
          />
          <div className="mt-4" role="group" aria-labelledby="investment-map-view-label">
            <p id="investment-map-view-label" className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-[#8DC046]">{copy.mapViewLabel}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {REGION_LAYER_CHOICES.map((choice) => {
                const active = regionLayer === choice;
                return (
                  <button key={choice} type="button" aria-pressed={active} onClick={() => handleSelectRegionLayer(choice)} className={`min-h-9 rounded-full border px-4 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7BF06] ${active ? "border-[#F7BF06] bg-[#F7BF06] text-[#001a33]" : "border-white/20 bg-[#001a33]/60 text-white hover:border-[#8DC046]"}`}>
                    {choice === "none" ? copy.regionModeDepartments : copy.regionLevels[choice]}
                  </button>
                );
              })}
              {activeRegionStatus === "loading" ? <span role="status" className="text-xs text-[#d5e3ff]/75">{copy.layerLoading}</span> : null}
              {activeRegionStatus === "error" ? <span role="alert" className="text-xs text-red-200">{copy.layerError}</span> : null}
              {activeRegionStatus === "ready" && activeRegions?.features.length === 0 ? <span role="status" className="text-xs text-[#d5e3ff]/75">{copy.regionsEmpty}</span> : null}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs"><span className="rounded-full border border-white/15 px-3 py-2">{copy.currentFilters}: {selectedSectorName}{selectedDepartment ? ` · ${selectedDepartment.name}` : ""}{selectedMunicipality ? ` · ${selectedMunicipality.name}` : ""}{activeInfrastructureLabels.map((label) => ` · ${label}`).join("")}{regionLayer !== "none" ? ` · ${copy.regionLevels[regionLayer]}` : ""}{selectedRegion ? ` · ${selectedRegion.properties.name}` : ""}</span><button type="button" onClick={handleResetFilters} className="min-h-9 rounded-full border border-[#8DC046]/50 px-3 font-bold text-[#d8ef9f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F7BF06]">{copy.clearFilters}</button></div>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#d5e3ff]/75"><span>{counts.visibleProjects} {copy.visibleProjectsCount}</span><span>·</span><span>{counts.loadedMunicipalities} {copy.loadedMunicipalitiesCount}</span><span>·</span><span>{counts.activeLayers} {copy.activeLayersCount}</span></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <details className="rounded-xl border border-white/10 bg-[#001a33]/45 p-3"><summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-[#8DC046]">{copy.infrastructureLayers}</summary>{INFRASTRUCTURE_LAYER_OPTIONS.map(({ layer, Icon }) => <label key={layer} className="mt-3 flex min-h-8 cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={activeInfrastructureLayers.has(layer)} onChange={() => handleToggleInfrastructure(layer)} className="h-4 w-4 accent-[#32B372]" /><Icon aria-hidden="true" size={16} /><span>{infrastructureLabels[layer]}</span>{infrastructureStatus[layer] === "loading" ? <span role="status">{copy.layerLoading}</span> : null}{infrastructureStatus[layer] === "error" ? <span role="alert" className="text-red-200">{copy.layerError}</span> : null}</label>)}<label className="mt-3 flex min-h-8 cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={roadsActive} onChange={handleToggleRoads} className="h-4 w-4 accent-[#32B372]" /><Route aria-hidden="true" size={16} /><span>{copy.roadNetwork}</span>{roadsStatus === "loading" ? <span role="status">{copy.layerLoading}</span> : null}{roadsStatus === "error" ? <span role="alert" className="text-red-200">{copy.layerError}</span> : null}</label></details>
            <details className="rounded-xl border border-white/10 bg-[#001a33]/45 p-3"><summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-[#8DC046]">{copy.legend}</summary><ul className="mt-3 grid grid-cols-2 gap-2 text-xs">{!regionMode ? <><LegendItem shape="square" label={copy.legendDepartment} /><LegendItem shape="outline" label={copy.legendMunicipality} /></> : null}<LegendItem shape="dot" label={copy.legendProject} /><LegendItem shape="opportunity" label={copy.legendOpportunity} /><LegendItem shape="cluster" label={copy.legendCluster} /><LegendItem shape="selected" label={copy.legendSelectedProject} />{INFRASTRUCTURE_LAYER_OPTIONS.filter(({ layer }) => activeInfrastructureLayers.has(layer)).map(({ layer, Icon }) => <li key={layer} className="flex items-center gap-2"><Icon size={15} aria-hidden="true" />{infrastructureLabels[layer]}</li>)}{roadsActive ? <><LegendItem shape="road-primary" label={copy.legendPrimaryRoad} /><LegendItem shape="road-secondary" label={copy.legendSecondaryRoad} /></> : null}</ul><p className="mt-3 text-[11px] italic text-[#d5e3ff]/70">{copy.approximateMunicipalityNote}</p>{regionLegendItems.length ? <div className="mt-3 border-t border-white/10 pt-3"><p className="text-[10px] font-bold uppercase tracking-wider text-[#d5e3ff]/75">{copy.regionLevels[regionLayer]}</p><ul className="mt-2 grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2">{regionLegendItems.map((item) => <li key={item.key} className="flex items-center gap-2"><span aria-hidden="true" className="h-3.5 w-4 shrink-0 rounded-sm border border-white/70" style={{ backgroundColor: item.color }} />{item.label}</li>)}</ul>{regionLayer === "polo" ? <p className="mt-2 text-[11px] italic text-[#d5e3ff]/70">{copy.approximateBoundary}</p> : null}</div> : null}</details>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div ref={canvas} id="investment-map-canvas" className="relative isolate z-0 min-h-[440px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-white shadow-2xl sm:min-h-[600px]">
            {geo.status === "loading" || !canvasRequested ? <MapLoading copy={copy.loadingMap} /> : null}
            {geo.status === "error" ? <MapMessage alert>{copy.mapError}</MapMessage> : null}
            {geo.status === "ready" && geo.data?.features.length === 0 ? <MapMessage>{copy.noGeometry}</MapMessage> : null}
            {canvasRequested && geo.data && geo.data.features.length > 0 ? (
              <InvestmentMapLeaflet
                data={geo.data}
                summaries={summaries}
                activeSector={activeSector}
                selectedDepartmentSlug={selectedDepartment?.slug ?? null}
                municipalities={municipalitiesForMap}
                selectedMunicipalitySlug={selectedMunicipality?.slug ?? null}
                markerProjects={markerProjects}
                selectedProjectId={selectedProject?.id ?? null}
                selectedProjectPosition={projectFocusPosition}
                projectFocusKey={projectFocusKey}
                hoveredProjectId={hoveredProjectId}
                onSelectCluster={handleSelectCluster}
                clusterTooltip={copy.clusterTooltip}
                mapAriaLabel={copy.mapAriaLabel}
                mapInstructions={copy.mapInstructions}
                zoomInLabel={copy.zoomIn}
                zoomOutLabel={copy.zoomOut}
                onSelectDepartment={handleSelectDepartment}
                onSelectMunicipality={handleSelectMunicipality}
                onSelectProject={handleSelectProject}
                infrastructure={Array.from(activeInfrastructureLayers).flatMap(
                  (layer) => infrastructureCache[layer]?.features ?? [],
                )}
                selectedInfrastructureId={selectedInfrastructure?.properties.id ?? null}
                onSelectInfrastructure={handleSelectInfrastructure}
                infrastructureCopy={infrastructureTooltipCopy}
                roads={roadsActive ? roads : null}
                selectedRoadCode={selectedRoad?.properties.code ?? null}
                onSelectRoad={handleSelectRoad}
                roadAttribution={copy.osmAttribution}
                onHoverDepartment={setHoveredDepartment}
                onHoverMunicipality={setHoveredMunicipality}
                regions={activeRegions}
                regionTooltipCopy={regionTooltipCopy}
                regionMode={regionMode}
                selectedRegionCode={selectedRegion?.properties.code ?? null}
                onSelectRegion={handleSelectRegion}
              />
            ) : null}
            {municipalitiesLoading ? (
              <div className="pointer-events-none absolute right-4 top-4 z-[500] rounded-lg bg-[#001a33]/90 px-3 py-2 text-xs font-bold text-white shadow-lg" role="status">
                {copy.loadingMunicipalities}
              </div>
            ) : null}
            {!regionMode && hoveredMunicipality && selectedDepartment && !selectedMunicipality ? (
              <div className="pointer-events-none absolute bottom-4 left-4 z-[500] rounded-lg bg-[#001a33]/90 px-3 py-2 text-xs font-bold text-white shadow-lg">{hoveredMunicipality.name}</div>
            ) : null}
            {!regionMode && hoveredDepartment && !selectedDepartment ? (
              <div className="pointer-events-none absolute bottom-4 left-4 z-[500] rounded-lg bg-[#001a33]/90 px-3 py-2 text-xs font-bold text-white shadow-lg">{hoveredDepartment.name}</div>
            ) : null}
          </div>
          <InvestmentMapPanel
            locale={locale}
            copy={copy}
            department={selectedDepartment}
            municipality={selectedMunicipality}
            project={selectedProject}
            infrastructure={selectedInfrastructure}
            summary={selectedSummary}
            projects={listedProjects}
            projectsLoading={projectsLoading}
            projectsError={projects.status === "error"}
            municipalitiesLoading={municipalitiesLoading}
            municipalitiesError={municipalitiesError}
            municipalitiesEmpty={municipalitiesEmpty}
            onClearDepartment={handleClearDepartment}
            onClearMunicipality={handleClearMunicipality}
            onClearProject={handleClearProject}
            onClearInfrastructure={() => setSelectedInfrastructure(null)}
            road={selectedRoad}
            onClearRoad={() => setSelectedRoad(null)}
            onSelectProject={handleSelectProject}
            regionMode={regionMode}
            region={selectedRegion}
            onClearRegion={() => handleSelectRegion(null)}
            kindFilter={kindFilter}
            onKindFilterChange={setKindFilter}
            onHoverProject={setHoveredProjectId}
            listPlace={listPlace}
            clusterActive={Boolean(activeCluster)}
            onClearCluster={handleClearCluster}
          />
        </div>

        {summaryLoading ? <p className="mt-4 text-sm text-[#d5e3ff]/70">{copy.loadingData}</p> : null}
        {summary.status === "error" && !summaryLoading ? <p role="alert" className="mt-4 rounded-xl border border-red-200/20 bg-red-950/25 p-4 text-sm text-red-100">{copy.summaryError}</p> : null}
        <div className="mt-5 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-[#d5e3ff]/55">{copy.attribution}</div>
      </div>
    </section>
  );
}

function MapLoading({ copy }: { copy: string }) { return <div className="absolute inset-0 z-10 flex items-center justify-center bg-white"><div className="rounded-xl bg-[#001a33]/90 px-5 py-4 text-sm font-bold text-white shadow-xl" role="status">{copy}</div></div>; }
function MapMessage({ children, alert = false }: { children: string; alert?: boolean }) { return <div role={alert ? "alert" : undefined} className="absolute inset-0 z-10 flex items-center justify-center bg-white p-6 text-center text-sm font-semibold text-[#252A58]">{children}</div>; }
function LegendItem({ shape, label }: { shape: "square" | "outline" | "dot" | "opportunity" | "cluster" | "selected" | "road-primary" | "road-secondary"; label: string }) {
  const style = shape === "road-primary" ? "h-1 w-6 rounded-full bg-[#F7BF06] ring-2 ring-[#001a33]" : shape === "road-secondary" ? "h-0.5 w-6 rounded-full bg-white ring-1 ring-[#334E88]/60" : shape === "square" ? "h-4 w-5 rounded-sm border border-[#7BA3D4] bg-[#C5DCF0]" : shape === "outline" ? "h-4 w-5 rounded-sm border-2 border-[#7BA3D4]" : shape === "selected" ? "h-4 w-4 rounded-full border-2 border-white bg-[#F7BF06]" : shape === "opportunity" ? "h-4 w-4 rounded-full border-2 border-white bg-[#F7BF06]" : shape === "cluster" ? "grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-[#334E88] text-[9px] font-bold text-white" : "h-4 w-4 rounded-full border-2 border-white bg-[#32B372]";
  return <li className="flex items-center gap-2"><span aria-hidden="true" className={style}>{shape === "cluster" ? "12" : null}</span>{label}</li>;
}

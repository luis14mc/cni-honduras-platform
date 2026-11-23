import { useMemo } from "react";
import {
  filterMapProjectsByDepartment,
  filterMapProjectsByKind,
  filterMapProjectsByMunicipality,
  filterMapProjectsByRegion,
  filterMapProjectsBySector,
  sortMapProjectsByAmount,
  type DepartmentProperties,
  type MapInvestmentProject,
  type MapKindFilter,
  type MunicipalityProperties,
  type TerritorialRegionFeature,
} from "@/src/lib/types/investment-map";
import { matchesInvestmentFilters } from "./mapInvestmentFilters";

type Filters = {
  activeSector: string;
  catalogReady: boolean;
  kindFilter: MapKindFilter;
  stage: string;
  minInvestment: string;
  maxInvestment: string;
  regionMode: boolean;
  selectedDepartment: DepartmentProperties | null;
  selectedMunicipality: MunicipalityProperties | null;
  selectedRegion: TerritorialRegionFeature | null;
};

export function useMapFilters(catalog: MapInvestmentProject[], {
  activeSector, catalogReady, kindFilter, stage, minInvestment, maxInvestment,
  regionMode, selectedDepartment, selectedMunicipality, selectedRegion,
}: Filters) {
  const department = selectedDepartment?.slug ?? null;
  const municipality = selectedMunicipality?.slug ?? null;
  return useMemo(() => {
    if (!catalogReady) return [];
    const inArea = regionMode
      ? filterMapProjectsByRegion(catalog, selectedRegion)
      : filterMapProjectsByMunicipality(filterMapProjectsByDepartment(catalog, department), municipality);
    const inSector = filterMapProjectsBySector(inArea, activeSector === "all" ? null : activeSector);
    const inKind = filterMapProjectsByKind(inSector, kindFilter);
    return sortMapProjectsByAmount(inKind.filter((item) =>
      matchesInvestmentFilters(item, stage, minInvestment, maxInvestment)));
  }, [activeSector, catalog, catalogReady, department, kindFilter, maxInvestment, minInvestment,
    municipality, regionMode, selectedRegion, stage]);
}

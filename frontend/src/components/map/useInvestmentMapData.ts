import { useEffect, useState } from "react";
import type { Locale } from "@/src/i18n/config";
import type {
  DepartmentProperties,
  MapDepartmentSummary,
  MapInvestmentProject,
  MunicipalityFeatureCollection,
  MunicipalityProperties,
  MapQueryState,
} from "@/src/lib/types/investment-map";
import {
  getDepartmentGeoJson,
  getInvestmentMapItems,
  getMapSummary,
  getMunicipalityGeoJson,
  getSectors,
} from "@/src/services/investmentMap";
import type { DepartmentFeatureCollection } from "@/src/lib/types/investment-map";
import type { Sector } from "@/src/types/investment";

import type { Dispatch, RefObject, SetStateAction } from "react";

type AsyncState<T> = { status: "loading" | "ready" | "error"; data: T };

type Options = {
  locale: Locale;
  initialQueryRef: RefObject<MapQueryState>;
  activeSector: string;
  setActiveSector: Dispatch<SetStateAction<string>>;
  selectedDepartment: DepartmentProperties | null;
  setSelectedDepartment: Dispatch<SetStateAction<DepartmentProperties | null>>;
  setSelectedMunicipality: Dispatch<SetStateAction<MunicipalityProperties | null>>;
};

export function useInvestmentMapData({
  locale, initialQueryRef, activeSector, setActiveSector, selectedDepartment,
  setSelectedDepartment, setSelectedMunicipality,
}: Options) {
  const [geo, setGeo] = useState<AsyncState<DepartmentFeatureCollection | null>>({ status: "loading", data: null });
  const [summary, setSummary] = useState<AsyncState<MapDepartmentSummary[]>>({ status: "loading", data: [] });
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [sectorsLoaded, setSectorsLoaded] = useState(false);
  const [sectorError, setSectorError] = useState(false);
  const [summarySector, setSummarySector] = useState<string | null>(null);
  const [municipalities, setMunicipalities] = useState<AsyncState<MunicipalityFeatureCollection | null>>({
    status: "ready",
    data: null,
  });
  const [municipalitiesKey, setMunicipalitiesKey] = useState<string | null>(null);
  const [projects, setProjects] = useState<AsyncState<MapInvestmentProject[]>>({ status: "loading", data: [] });
  const [projectsKey, setProjectsKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDepartmentGeoJson()
      .then((data) => {
        if (cancelled) return;
        setGeo({ status: "ready", data });
        const slug = initialQueryRef.current.department;
        const department = data.features.find((item) => item.properties.slug === slug)?.properties ?? null;
        initialQueryRef.current.department = null;
        if (department) setSelectedDepartment(department);
        else initialQueryRef.current.municipality = null;
      })
      .catch(() => !cancelled && setGeo({ status: "error", data: null }));
    getSectors({ locale })
      .then((data) => {
        if (cancelled) return;
        setSectors(data);
        const slug = initialQueryRef.current.sector;
        if (slug && !data.some((sector) => sector.slug === slug)) setActiveSector("all");
        initialQueryRef.current.sector = null;
      })
      .catch(() => { if (!cancelled) { setSectorError(true); setActiveSector("all"); initialQueryRef.current.sector = null; } })
      .finally(() => { if (!cancelled) setSectorsLoaded(true); });
    return () => { cancelled = true; };
  }, [initialQueryRef, locale, setActiveSector, setSelectedDepartment]);

  useEffect(() => {
    let cancelled = false;
    getMapSummary(activeSector === "all" ? undefined : activeSector, locale)
      .then((data) => {
        if (cancelled) return;
        setSummary({ status: "ready", data });
        setSummarySector(activeSector);
      })
      .catch(() => {
        if (cancelled) return;
        setSummary((current) => ({ status: "error", data: current.data }));
        setSummarySector(activeSector);
      });
    return () => { cancelled = true; };
  }, [activeSector, locale]);

  useEffect(() => {
    if (!selectedDepartment) return;
    let cancelled = false;
    const requestKey = selectedDepartment.slug;
    getMunicipalityGeoJson(selectedDepartment.slug)
      .then((data) => {
        if (cancelled) return;
        setMunicipalities({ status: "ready", data });
        setMunicipalitiesKey(requestKey);
        const slug = initialQueryRef.current.municipality;
        const municipality = data.features.find((item) => item.properties.slug === slug)?.properties ?? null;
        initialQueryRef.current.municipality = null;
        if (municipality) {
          setSelectedMunicipality(municipality);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setMunicipalities({ status: "error", data: null });
        setMunicipalitiesKey(requestKey);
      });
    return () => { cancelled = true; };
  }, [initialQueryRef, selectedDepartment, setSelectedMunicipality]);

  useEffect(() => {
    let cancelled = false;
    const requestKey = locale;
    getInvestmentMapItems(locale)
      .then((data) => {
        if (cancelled) return;
        setProjects({ status: "ready", data });
        setProjectsKey(requestKey);
      })
      .catch(() => {
        if (cancelled) return;
        setProjects({ status: "error", data: [] });
        setProjectsKey(requestKey);
      });
    return () => { cancelled = true; };
  }, [locale]);

  return { geo, summary, summarySector, sectors, sectorError, sectorsLoaded, municipalities, municipalitiesKey, setMunicipalities, setMunicipalitiesKey, projects, projectsKey };
}

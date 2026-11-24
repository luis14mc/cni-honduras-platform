import { useRef } from "react";
import { trackEvent } from "@/src/lib/analytics";
import { MAP_INVESTMENT_AMOUNT } from "@/src/lib/types/investment-map";
import type { Locale } from "@/src/i18n/config";
import type { DepartmentProperties, TerritorialRegionFeature } from "@/src/lib/types/investment-map";

const selectStyle = "mt-2 block w-full rounded-xl border border-white/15 bg-[#001a33] px-3 py-2 text-sm text-white focus-visible:outline-[#F7BF06]";

type Props = {
  locale: Locale;
  stage: string;
  stages: Record<string, string>;
  minInvestment: string;
  maxInvestment: string;
  departments: DepartmentProperties[];
  department: DepartmentProperties | null;
  regions: TerritorialRegionFeature[] | null;
  region: TerritorialRegionFeature | null;
  onDepartment: (department: DepartmentProperties | null) => void;
  onRegion: (code: string | null) => void;
  onStage: (stage: string) => void;
  onMinInvestment: (amount: string) => void;
  onMaxInvestment: (amount: string) => void;
};

export function MapFiltersBar({
  locale, stage, stages, minInvestment, maxInvestment, departments, department,
  regions, region, onDepartment, onRegion, onStage, onMinInvestment, onMaxInvestment,
}: Props) {
  const amountOnFocus = useRef("");
  const en = locale === "en";
  const invalidRange = Boolean(minInvestment && maxInvestment && Number(minInvestment) > Number(maxInvestment));
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="text-sm font-semibold">
        {regions ? (en ? "Region" : "Región") : (en ? "Department" : "Departamento")}
        {regions ? (
          <select className={selectStyle} value={region?.properties.code ?? ""} onChange={(e) => onRegion(e.target.value || null)}>
            <option value="">{en ? "All regions" : "Todas las regiones"}</option>
            {regions.map(({ properties }) => <option key={properties.code} value={properties.code}>{properties.name}</option>)}
          </select>
        ) : (
          <select className={selectStyle} value={department?.slug ?? ""} onChange={(e) => onDepartment(departments.find((item) => item.slug === e.target.value) ?? null)}>
            <option value="">{en ? "All departments" : "Todos los departamentos"}</option>
            {departments.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
          </select>
        )}
      </label>
      <label className="text-sm font-semibold">
        {en ? "Stage" : "Etapa"}
        <select className={selectStyle} value={stage} onChange={(e) => onStage(e.target.value)}>
          <option value="">{en ? "All stages" : "Todas las etapas"}</option>
          {Object.entries(stages).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
        </select>
      </label>
      {([
        ["min_investment", en ? "Minimum investment (USD)" : "Inversión mínima (USD)", minInvestment, onMinInvestment],
        ["max_investment", en ? "Maximum investment (USD)" : "Inversión máxima (USD)", maxInvestment, onMaxInvestment],
      ] as const).map(([filter, label, value, update]) => (
        <label key={label} className="text-sm font-semibold">
          {label}
          <input type="number" min="0" step="0.01" value={value}
            aria-invalid={invalidRange} aria-describedby={invalidRange ? "investment-range-error" : undefined}
            onFocus={() => { amountOnFocus.current = value; }}
            onChange={(e) => update(e.target.value)}
            onBlur={() => {
              if (!invalidRange && amountOnFocus.current !== value &&
                (!value || MAP_INVESTMENT_AMOUNT.test(value))) {
                trackEvent("map_filter", { filter, value: value || "all" });
              }
            }} className={selectStyle} />
        </label>
      ))}
      {invalidRange ? (
        <p id="investment-range-error" role="alert" className="text-sm text-red-200 sm:col-span-2 lg:col-span-4">
          {en ? "Minimum investment must not exceed the maximum." : "La inversión mínima no puede superar la máxima."}
        </p>
      ) : null}
    </div>
  );
}

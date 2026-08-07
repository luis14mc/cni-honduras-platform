"use client";

import type { ReactNode } from "react";
import { CmsSearchInput } from "@/src/components/cms/editor/CmsSearchInput";
import type { PublishStatus } from "@/src/lib/cms/editorial/types";
import { cn } from "@/src/lib/utils";

const STATUS_OPTIONS: { value: "" | PublishStatus; label: string }[] = [
  { value: "", label: "Todos los estados" },
  { value: "draft", label: "Borrador" },
  { value: "published", label: "Publicado" },
  { value: "archived", label: "Archivado" },
];

interface CmsFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status?: "" | PublishStatus;
  onStatusChange?: (value: "" | PublishStatus) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
  className?: string;
}

export function CmsFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  searchPlaceholder,
  children,
  className,
}: CmsFilterBarProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center", className)}>
      <CmsSearchInput
        value={search}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        className="sm:min-w-[220px] sm:flex-1"
      />
      {onStatusChange ? (
        <select
          value={status ?? ""}
          onChange={(e) => onStatusChange(e.target.value as "" | PublishStatus)}
          className="rounded-lg border border-[#334E88]/20 bg-white px-3 py-2 text-sm text-[#252A58] focus:border-[#334E88] focus:outline-none focus:ring-2 focus:ring-[#334E88]/20"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : null}
      {children}
    </div>
  );
}

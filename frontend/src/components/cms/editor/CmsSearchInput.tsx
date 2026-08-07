"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface CmsSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CmsSearchInput({
  value,
  onChange,
  placeholder = "Buscar…",
  className,
}: CmsSearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#334E88]/50"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#334E88]/20 bg-white py-2 pl-9 pr-9 text-sm text-[#252A58] placeholder:text-[#252A58]/40 focus:border-[#334E88] focus:outline-none focus:ring-2 focus:ring-[#334E88]/20"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#334E88]/50 hover:text-[#334E88]"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

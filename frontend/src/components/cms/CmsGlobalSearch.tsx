"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import {
  SEARCH_TYPE_LABELS,
  cmsSearch,
  searchResultHref,
  type SearchResultType,
} from "@/src/lib/cms/editorial/search";
import type { SearchResultItem } from "@/src/lib/cms/editorial/types";

interface FlatResult {
  type: SearchResultType;
  item: SearchResultItem;
}

function flattenResults(data: Awaited<ReturnType<typeof cmsSearch>>): FlatResult[] {
  const out: FlatResult[] = [];
  (Object.keys(SEARCH_TYPE_LABELS) as SearchResultType[]).forEach((type) => {
    for (const item of data[type]) {
      out.push({ type, item });
    }
  });
  return out;
}

export function CmsGlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FlatResult[]>([]);
  const [searchError, setSearchError] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), 300);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!debounced) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async search updates after fetch
    setLoading(true);
    setSearchError(false);
    cmsSearch(debounced)
      .then((data) => {
        if (!cancelled) setResults(flattenResults(data));
      })
      .catch(() => {
        if (!cancelled) {
          setResults([]);
          setSearchError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const displayResults = debounced ? results : [];
  const showDropdown = open && debounced.length > 0;

  return (
    <div ref={wrapRef} className="relative hidden md:block md:min-w-[240px] md:flex-1 md:max-w-md">
      <div className="flex items-center gap-2 rounded-lg border border-[#334E88]/15 bg-white px-3 py-1.5 focus-within:border-[#334E88]/40 focus-within:ring-2 focus-within:ring-[#334E88]/10">
        <Search className="h-4 w-4 shrink-0 text-[#252A58]/40" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar contenido…"
          className="w-full bg-transparent text-sm text-[#252A58] placeholder:text-[#252A58]/40 focus:outline-none"
          aria-label="Búsqueda global del CMS"
          aria-autocomplete="list"
          aria-controls={showDropdown ? "cms-global-search-results" : undefined}
        />
        {loading ? <Loader2 className="h-4 w-4 animate-spin text-[#334E88]/50" aria-hidden /> : null}
      </div>

      {showDropdown ? (
        <div
          id="cms-global-search-results"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-lg border border-[#334E88]/15 bg-white py-1 shadow-lg"
        >
          {searchError ? (
            <p className="px-3 py-2 text-sm text-red-600">Error al buscar. Intente de nuevo.</p>
          ) : displayResults.length === 0 && !loading ? (
            <p className="px-3 py-2 text-sm text-[#252A58]/50">Sin resultados</p>
          ) : (
            displayResults.map(({ type, item }) => (
              <button
                key={`${type}-${item.id}`}
                type="button"
                className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-[#334E88]/5"
                onClick={() => {
                  setOpen(false);
                  router.push(searchResultHref(type, item.id));
                }}
              >
                <span className="font-medium text-[#252A58]">{item.label}</span>
                <span className="text-xs text-[#252A58]/50">{SEARCH_TYPE_LABELS[type]}</span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

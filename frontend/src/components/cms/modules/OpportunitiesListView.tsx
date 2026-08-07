"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { CmsDataTable } from "@/src/components/cms/editor/CmsDataTable";
import type { CmsColumn } from "@/src/components/cms/editor/CmsDataTable";
import { CmsFilterBar } from "@/src/components/cms/editor/CmsFilterBar";
import { CmsPagination } from "@/src/components/cms/editor/CmsPagination";
import { CmsSectionHeader } from "@/src/components/cms/CmsSectionHeader";
import { useCmsAuth } from "@/src/lib/cms/AuthProvider";
import { listOpportunities } from "@/src/lib/cms/editorial/opportunities";
import { listSectors } from "@/src/lib/cms/editorial/sectors";
import type { OpportunityItem, OpportunityStatus, SectorItem } from "@/src/lib/cms/editorial/types";
import { canAdd } from "@/src/lib/cms/permissions";
import { cn } from "@/src/lib/utils";

const PAGE_SIZE = 20;

const STATUS_OPTIONS: { value: "" | OpportunityStatus; label: string }[] = [
  { value: "", label: "Todos los estados" },
  { value: "open", label: "Abierta" },
  { value: "in_progress", label: "En progreso" },
  { value: "closed", label: "Cerrada" },
];

const STATUS_LABELS: Record<OpportunityStatus, string> = {
  open: "Abierta",
  in_progress: "En progreso",
  closed: "Cerrada",
};

const FEATURED_OPTIONS = [
  { value: "", label: "Destacado: todos" },
  { value: "true", label: "Solo destacadas" },
  { value: "false", label: "No destacadas" },
];

export function OpportunitiesListView() {
  const router = useRouter();
  const { user } = useCmsAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sector, setSector] = useState("");
  const [status, setStatus] = useState<"" | OpportunityStatus>("");
  const [featured, setFeatured] = useState<"" | "true" | "false">("");
  const [sectors, setSectors] = useState<SectorItem[]>([]);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<OpportunityItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    listSectors({ page_size: 200 })
      .then((data) => setSectors(data.results))
      .catch(() => setSectors([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await listOpportunities({
        page,
        page_size: PAGE_SIZE,
        search: debouncedSearch || undefined,
        sector: sector || undefined,
        status: status || undefined,
        is_featured: featured === "" ? "" : featured === "true",
      });
      setRows(data.results);
      setTotal(data.count);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, sector, status, featured]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const columns: CmsColumn<OpportunityItem>[] = [
    {
      key: "title",
      header: "Título",
      render: (row) => <span className="font-medium">{row.title || "Sin título"}</span>,
    },
    {
      key: "sector",
      header: "Sector",
      render: (row) => row.sector_detail?.name ?? "—",
    },
    {
      key: "status",
      header: "Estado",
      render: (row) => STATUS_LABELS[row.status] ?? row.status,
    },
    {
      key: "public",
      header: "Visibilidad",
      render: (row) => (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
            row.is_public
              ? "bg-[#32B372]/15 text-[#1a7a4a]"
              : "bg-[#334E88]/10 text-[#334E88]",
          )}
        >
          {row.is_public ? "Pública" : "Borrador"}
        </span>
      ),
    },
    {
      key: "featured",
      header: "Destacada",
      render: (row) => (row.is_featured ? "Sí" : "No"),
    },
    {
      key: "updated",
      header: "Actualizado",
      render: (row) => new Date(row.updated_at).toLocaleDateString("es-HN"),
    },
  ];

  return (
    <>
      <CmsSectionHeader
        title="Oportunidades"
        description="Oportunidades de inversión publicadas en el portal."
        actions={
          canAdd(user, "investment", "investmentopportunity") ? (
            <Link
              href="/cms/oportunidades/nueva"
              className="inline-flex items-center gap-2 rounded-lg bg-[#32B372] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2a9962]"
            >
              <Plus className="h-4 w-4" />
              Nueva oportunidad
            </Link>
          ) : null
        }
      />

      <CmsFilterBar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Buscar oportunidades…"
      >
        <select
          value={sector}
          onChange={(e) => {
            setSector(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[#334E88]/20 bg-white px-3 py-2 text-sm text-[#252A58] focus:border-[#334E88] focus:outline-none focus:ring-2 focus:ring-[#334E88]/20"
        >
          <option value="">Todos los sectores</option>
          {sectors.map((s) => (
            <option key={s.id} value={String(s.id)}>
              {s.name_es || s.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as "" | OpportunityStatus);
            setPage(1);
          }}
          className="rounded-lg border border-[#334E88]/20 bg-white px-3 py-2 text-sm text-[#252A58] focus:border-[#334E88] focus:outline-none focus:ring-2 focus:ring-[#334E88]/20"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={featured}
          onChange={(e) => {
            setFeatured(e.target.value as "" | "true" | "false");
            setPage(1);
          }}
          className="rounded-lg border border-[#334E88]/20 bg-white px-3 py-2 text-sm text-[#252A58] focus:border-[#334E88] focus:outline-none focus:ring-2 focus:ring-[#334E88]/20"
        >
          {FEATURED_OPTIONS.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </CmsFilterBar>

      <CmsDataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        loading={loading}
        error={error}
        onRetry={() => void load()}
        onRowClick={(row) => router.push(`/cms/oportunidades/${row.id}`)}
        emptyTitle="Sin oportunidades"
        emptyDescription="Registre oportunidades de inversión para el mapa del país."
      />

      <CmsPagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </>
  );
}

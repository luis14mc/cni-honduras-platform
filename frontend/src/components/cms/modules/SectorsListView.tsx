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
import { listSectors } from "@/src/lib/cms/editorial/sectors";
import type { SectorItem } from "@/src/lib/cms/editorial/types";
import { canAdd } from "@/src/lib/cms/permissions";
import { cn } from "@/src/lib/utils";

const PAGE_SIZE = 20;

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        active ? "bg-[#32B372]/15 text-[#1a7a4a]" : "bg-[#252A58]/10 text-[#252A58]/70",
      )}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

export function SectorsListView() {
  const router = useRouter();
  const { user } = useCmsAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<SectorItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await listSectors({
        page,
        page_size: PAGE_SIZE,
        search: debouncedSearch || undefined,
      });
      setRows(data.results);
      setTotal(data.count);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const columns: CmsColumn<SectorItem>[] = [
    {
      key: "name",
      header: "Nombre",
      render: (row) => (
        <span className="font-medium">{row.name_es || row.name || "Sin nombre"}</span>
      ),
    },
    {
      key: "slug",
      header: "Slug",
      render: (row) => row.slug || "—",
    },
    {
      key: "order",
      header: "Orden",
      render: (row) => row.order,
    },
    {
      key: "active",
      header: "Estado",
      render: (row) => <ActiveBadge active={row.is_active} />,
    },
    {
      key: "featured",
      header: "Destacado",
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
        title="Sectores"
        description="Sectores estratégicos de inversión en Honduras."
        actions={
          canAdd(user, "investment", "sector") ? (
            <Link
              href="/cms/sectores/nuevo"
              className="inline-flex items-center gap-2 rounded-lg bg-[#32B372] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2a9962]"
            >
              <Plus className="h-4 w-4" />
              Nuevo sector
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
        searchPlaceholder="Buscar sectores…"
      />

      <CmsDataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        loading={loading}
        error={error}
        onRetry={() => void load()}
        onRowClick={(row) => router.push(`/cms/sectores/${row.id}`)}
        emptyTitle="Sin sectores"
        emptyDescription="Registre sectores estratégicos para el mapa de inversión."
        emptyAction={
          canAdd(user, "investment", "sector") ? (
            <Link
              href="/cms/sectores/nuevo"
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#334E88] px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Nuevo sector
            </Link>
          ) : undefined
        }
      />

      <CmsPagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </>
  );
}

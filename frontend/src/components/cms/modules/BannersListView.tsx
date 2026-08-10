"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { CmsDataTable } from "@/src/components/cms/editor/CmsDataTable";
import type { CmsColumn } from "@/src/components/cms/editor/CmsDataTable";
import { CmsFilterBar } from "@/src/components/cms/editor/CmsFilterBar";
import { CmsPagination } from "@/src/components/cms/editor/CmsPagination";
import { CmsStatusBadge } from "@/src/components/cms/editor/CmsStatusBadge";
import { CmsSectionHeader } from "@/src/components/cms/CmsSectionHeader";
import { useCmsAuth } from "@/src/lib/cms/AuthProvider";
import { listBanners } from "@/src/lib/cms/editorial/banners";
import type { BannerItem, PublishStatus } from "@/src/lib/cms/editorial/types";
import { canAdd } from "@/src/lib/cms/permissions";

const PAGE_SIZE = 20;

const PLACEMENT_LABELS: Record<string, string> = {
  site_top: "Barra superior",
  footer: "Footer",
  // Legacy placement — no longer used for public page heroes
  home_hero: "Hero (legacy — no usar)",
};

export function BannersListView() {
  const router = useRouter();
  const { user } = useCmsAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<"" | PublishStatus>("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<BannerItem[]>([]);
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
      const data = await listBanners({
        page,
        page_size: PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: status || undefined,
      });
      setRows(data.results);
      setTotal(data.count);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const columns: CmsColumn<BannerItem>[] = [
    {
      key: "title",
      header: "Título",
      render: (row) => (
        <span className="font-medium">{row.title_es || row.title || "Sin título"}</span>
      ),
    },
    {
      key: "placement",
      header: "Ubicación",
      render: (row) => PLACEMENT_LABELS[row.placement] ?? row.placement,
    },
    {
      key: "priority",
      header: "Prioridad",
      render: (row) => row.priority,
    },
    {
      key: "status",
      header: "Estado",
      render: (row) => <CmsStatusBadge status={row.status} />,
    },
  ];

  return (
    <>
      <CmsSectionHeader
        title="Banners"
        description="Anuncios temporales y barras promocionales del sitio."
        actions={
          canAdd(user, "cms", "sitebanner") ? (
            <Link
              href="/cms/banners/nuevo"
              className="inline-flex items-center gap-2 rounded-lg bg-[#32B372] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2a9962]"
            >
              <Plus className="h-4 w-4" />
              Nuevo banner
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
        status={status}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        searchPlaceholder="Buscar banners…"
      />

      <CmsDataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        loading={loading}
        error={error}
        onRetry={() => void load()}
        onRowClick={(row) => router.push(`/cms/banners/${row.id}`)}
        emptyTitle="Sin banners"
        emptyDescription="Cree banners para comunicar mensajes temporales."
      />

      <CmsPagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </>
  );
}

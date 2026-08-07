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
import { listSuccessStories } from "@/src/lib/cms/editorial/successStories";
import type { PublishStatus, SuccessStoryItem } from "@/src/lib/cms/editorial/types";
import { canAdd } from "@/src/lib/cms/permissions";

const PAGE_SIZE = 20;

export function SuccessStoriesListView() {
  const router = useRouter();
  const { user } = useCmsAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<"" | PublishStatus>("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<SuccessStoryItem[]>([]);
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
      const data = await listSuccessStories({
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

  const columns: CmsColumn<SuccessStoryItem>[] = [
    {
      key: "title",
      header: "Título",
      render: (row) => (
        <span className="font-medium">{row.title_es || row.title || "Sin título"}</span>
      ),
    },
    {
      key: "company",
      header: "Empresa",
      render: (row) => row.company_name || "—",
    },
    {
      key: "sector",
      header: "Sector",
      render: (row) => row.sector_detail?.name ?? "—",
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
        title="Casos de éxito"
        description="Historias de inversión y testimonios destacados."
        actions={
          canAdd(user, "investment", "successstory") ? (
            <Link
              href="/cms/casos-exito/nuevo"
              className="inline-flex items-center gap-2 rounded-lg bg-[#32B372] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2a9962]"
            >
              <Plus className="h-4 w-4" />
              Nuevo caso
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
        searchPlaceholder="Buscar casos de éxito…"
      />

      <CmsDataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        loading={loading}
        error={error}
        onRetry={() => void load()}
        onRowClick={(row) => router.push(`/cms/casos-exito/${row.id}`)}
        emptyTitle="Sin casos de éxito"
        emptyDescription="Documente historias de inversión exitosa en Honduras."
      />

      <CmsPagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </>
  );
}

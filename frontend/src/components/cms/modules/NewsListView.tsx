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
import { listNews } from "@/src/lib/cms/editorial/news";
import type { NewsItem, PublishStatus } from "@/src/lib/cms/editorial/types";
import { canAdd } from "@/src/lib/cms/permissions";

const PAGE_SIZE = 20;

const CATEGORY_LABELS: Record<string, string> = {
  news: "Noticia",
  press_release: "Comunicado",
  event: "Evento",
  announcement: "Anuncio",
  article: "Artículo",
};

export function NewsListView() {
  const router = useRouter();
  const { user } = useCmsAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<"" | PublishStatus>("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<NewsItem[]>([]);
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
      const data = await listNews({
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
    // Fetch when filters change; state updates after the async request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const columns: CmsColumn<NewsItem>[] = [
    {
      key: "title",
      header: "Título",
      render: (row) => (
        <span className="font-medium">{row.title_es || row.title || "Sin título"}</span>
      ),
    },
    {
      key: "category",
      header: "Categoría",
      render: (row) => CATEGORY_LABELS[row.category] ?? row.category,
    },
    {
      key: "status",
      header: "Estado",
      render: (row) => <CmsStatusBadge status={row.status} />,
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
        title="Noticias"
        description="Gestione comunicados, artículos y anuncios del CNI."
        actions={
          canAdd(user, "cms", "news") ? (
            <Link
              href="/cms/noticias/nueva"
              className="inline-flex items-center gap-2 rounded-lg bg-[#32B372] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2a9962]"
            >
              <Plus className="h-4 w-4" />
              Nueva noticia
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
        searchPlaceholder="Buscar noticias…"
      />

      <CmsDataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        loading={loading}
        error={error}
        onRetry={() => void load()}
        onRowClick={(row) => router.push(`/cms/noticias/${row.id}`)}
        emptyTitle="Sin noticias"
        emptyDescription="Cree su primera noticia para publicarla en el sitio."
        emptyAction={
          canAdd(user, "cms", "news") ? (
            <Link
              href="/cms/noticias/nueva"
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#334E88] px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Nueva noticia
            </Link>
          ) : undefined
        }
      />

      <CmsPagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </>
  );
}

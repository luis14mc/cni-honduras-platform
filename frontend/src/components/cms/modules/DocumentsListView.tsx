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
import { listDocuments } from "@/src/lib/cms/editorial/documents";
import type { DocumentItem, PublishStatus } from "@/src/lib/cms/editorial/types";
import { canAdd } from "@/src/lib/cms/permissions";

const PAGE_SIZE = 20;

export function DocumentsListView() {
  const router = useRouter();
  const { user } = useCmsAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<"" | PublishStatus>("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<DocumentItem[]>([]);
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
      const data = await listDocuments({
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

  const columns: CmsColumn<DocumentItem>[] = [
    {
      key: "cover",
      header: "Portada",
      render: (row) =>
        row.cover_image_detail?.file_url || row.cover_image_detail?.file ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={row.cover_image_detail.file_url || row.cover_image_detail.file || ""}
            alt=""
            className="h-10 w-10 rounded object-cover"
          />
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      key: "title",
      header: "Título",
      render: (row) => (
        <span className="font-medium">{row.title || row.title_es || "Sin título"}</span>
      ),
    },
    {
      key: "language",
      header: "Idioma",
      render: (row) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
            row.language === "en" ? "bg-sky-100 text-sky-800" : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {(row.language || "es").toUpperCase()}
        </span>
      ),
    },
    {
      key: "category",
      header: "Categoría",
      render: (row) => row.category,
    },
    {
      key: "resource_key",
      header: "Grupo / Recurso",
      render: (row) => (
        <span className="font-mono text-xs text-slate-600">{row.resource_key || "—"}</span>
      ),
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
        title="Documentos"
        description="Biblioteca de documentos institucionales y técnicos."
        actions={
          canAdd(user, "cms", "document") ? (
            <Link
              href="/cms/documentos/nuevo"
              className="inline-flex items-center gap-2 rounded-lg bg-[#32B372] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2a9962]"
            >
              <Plus className="h-4 w-4" />
              Nuevo documento
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
        searchPlaceholder="Buscar documentos…"
      />

      <CmsDataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        loading={loading}
        error={error}
        onRetry={() => void load()}
        onRowClick={(row) => router.push(`/cms/documentos/${row.id}`)}
        emptyTitle="Sin documentos"
        emptyDescription="Agregue PDFs, estudios o material institucional."
      />

      <CmsPagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </>
  );
}

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
import { resolveMediaFileUrl } from "@/src/lib/mediaUrl";

const PAGE_SIZE = 20;

function LanguageBadge({ language }: { language: string }) {
  const isEn = language === "en";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
        isEn ? "bg-sky-100 text-sky-800" : "bg-emerald-100 text-emerald-800"
      }`}
    >
      {(language || "es").toUpperCase()}
    </span>
  );
}

function SiblingIndicator({ row }: { row: DocumentItem }) {
  const langs = new Set(row.sibling_languages ?? [row.language]);
  const hasEs = langs.has("es");
  const hasEn = langs.has("en");
  if (row.language === "en") {
    return (
      <span className={`text-xs font-medium ${hasEs ? "text-emerald-700" : "text-amber-700"}`}>
        EN | {hasEs ? "ES disponible" : "ES pendiente"}
      </span>
    );
  }
  return (
    <span className={`text-xs font-medium ${hasEn ? "text-emerald-700" : "text-amber-700"}`}>
      ES | {hasEn ? "EN disponible" : "EN pendiente"}
    </span>
  );
}

export function DocumentsListView() {
  const router = useRouter();
  const { user } = useCmsAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<"" | PublishStatus>("");
  const [language, setLanguage] = useState<"" | "es" | "en">("");
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
        language: language || undefined,
      });
      setRows(data.results);
      setTotal(data.count);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, language]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const columns: CmsColumn<DocumentItem>[] = [
    {
      key: "cover",
      header: "Portada",
      render: (row) => {
        const src = resolveMediaFileUrl(
          row.cover_image_detail?.file_url || row.cover_image_detail?.file,
        );
        return src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="h-10 w-10 rounded object-cover" />
        ) : (
          <span className="text-xs text-slate-400">—</span>
        );
      },
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
      render: (row) => <LanguageBadge language={row.language || "es"} />,
    },
    {
      key: "category",
      header: "Categoría",
      render: (row) => row.category,
    },
    {
      key: "status",
      header: "Estado",
      render: (row) => <CmsStatusBadge status={row.status} />,
    },
    {
      key: "resource_key",
      header: "Grupo / Recurso",
      render: (row) => (
        <div className="space-y-1">
          <div className="font-mono text-xs text-slate-600">{row.resource_key || "—"}</div>
          <SiblingIndicator row={row} />
        </div>
      ),
    },
    {
      key: "updated",
      header: "Actualizado",
      render: (row) => new Date(row.updated_at).toLocaleDateString("es-HN"),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (row) => (
        <button
          type="button"
          className="text-sm font-semibold text-[#35A963] hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/cms/documentos/${row.id}`);
          }}
        >
          Editar
        </button>
      ),
    },
  ];

  return (
    <>
      <CmsSectionHeader
        title="Documentos"
        description="Cada idioma es un registro independiente (resource_key compartido)."
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
      >
        <select
          value={language}
          onChange={(e) => {
            setLanguage((e.target.value || "") as "" | "es" | "en");
            setPage(1);
          }}
          className="rounded-lg border border-[#334E88]/20 bg-white px-3 py-2 text-sm text-[#252A58] focus:border-[#334E88] focus:outline-none focus:ring-2 focus:ring-[#334E88]/20"
        >
          <option value="">Todos los idiomas</option>
          <option value="es">ES</option>
          <option value="en">EN</option>
        </select>
      </CmsFilterBar>

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

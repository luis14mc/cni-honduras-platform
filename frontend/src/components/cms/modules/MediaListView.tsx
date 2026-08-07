"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Trash2, Upload } from "lucide-react";
import { CmsConfirmDialog } from "@/src/components/cms/editor/CmsConfirmDialog";
import { CmsDataTable } from "@/src/components/cms/editor/CmsDataTable";
import type { CmsColumn } from "@/src/components/cms/editor/CmsDataTable";
import { CmsFilterBar } from "@/src/components/cms/editor/CmsFilterBar";
import { CmsPagination } from "@/src/components/cms/editor/CmsPagination";
import { useCmsToast } from "@/src/components/cms/editor/CmsToast";
import { CmsSectionHeader } from "@/src/components/cms/CmsSectionHeader";
import { useCmsAuth } from "@/src/lib/cms/AuthProvider";
import { CmsApiError } from "@/src/lib/cms/api";
import { deleteMedia, listMedia, uploadMedia } from "@/src/lib/cms/editorial/media";
import type { MediaAsset, MediaType } from "@/src/lib/cms/editorial/types";
import { canAdd, canDelete } from "@/src/lib/cms/permissions";

const PAGE_SIZE = 20;

export function MediaListView() {
  const { user } = useCmsAuth();
  const toast = useCmsToast();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [mediaType, setMediaType] = useState<"" | MediaType>("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<MediaAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await listMedia({
        page,
        page_size: PAGE_SIZE,
        search: debouncedSearch || undefined,
        media_type: mediaType || undefined,
      });
      setRows(data.results);
      setTotal(data.count);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, mediaType]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadMedia({ file, title: file.name });
      }
      toast.success("Archivo(s) subido(s) correctamente.");
      setPage(1);
      await load();
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "Error al subir.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMedia(deleteTarget.id);
      toast.success("Archivo eliminado.");
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "No se pudo eliminar.");
    } finally {
      setDeleting(false);
    }
  };

  const columns: CmsColumn<MediaAsset>[] = [
    {
      key: "thumb",
      header: "",
      className: "w-14",
      render: (row) =>
        row.media_type === "image" && row.file_url ? (
          <div className="relative h-10 w-10 overflow-hidden rounded">
            <Image src={row.file_url} alt="" fill className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded bg-[#334E88]/10 text-xs">
            {row.media_type}
          </div>
        ),
    },
    {
      key: "title",
      header: "Título",
      render: (row) => <span className="font-medium">{row.title}</span>,
    },
    {
      key: "type",
      header: "Tipo",
      render: (row) => row.media_type,
    },
    {
      key: "size",
      header: "Tamaño",
      render: (row) =>
        row.file_size_bytes
          ? `${(row.file_size_bytes / 1024).toFixed(0)} KB`
          : "—",
    },
    {
      key: "date",
      header: "Fecha",
      render: (row) => new Date(row.created_at).toLocaleDateString("es-HN"),
    },
    {
      key: "actions",
      header: "",
      className: "w-12 text-right",
      render: (row) =>
        canDelete(user, "media_library", "mediaasset") ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
            className="rounded p-1.5 text-red-600 hover:bg-red-50"
            aria-label={`Eliminar ${row.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null,
    },
  ];

  return (
    <>
      <CmsSectionHeader
        title="Multimedia"
        description="Biblioteca central de imágenes, videos y archivos."
        actions={
          canAdd(user, "media_library", "mediaasset") ? (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#32B372] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2a9962]">
              <Upload className="h-4 w-4" />
              {uploading ? "Subiendo…" : "Subir archivo"}
              <input
                type="file"
                multiple
                className="hidden"
                disabled={uploading}
                onChange={(e) => void handleUpload(e.target.files)}
              />
            </label>
          ) : null
        }
      />

      <CmsFilterBar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Buscar por título o texto alternativo…"
      >
        <select
          value={mediaType}
          onChange={(e) => {
            setMediaType(e.target.value as "" | MediaType);
            setPage(1);
          }}
          className="rounded-lg border border-[#334E88]/20 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todos los tipos</option>
          <option value="image">Imágenes</option>
          <option value="video">Videos</option>
          <option value="file">Archivos</option>
        </select>
      </CmsFilterBar>

      <CmsDataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        loading={loading}
        error={error}
        onRetry={() => void load()}
        emptyTitle="Biblioteca vacía"
        emptyDescription="Suba imágenes o archivos para usarlos en noticias, banners y más."
      />

      <CmsPagination
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
      />

      <CmsConfirmDialog
        open={!!deleteTarget}
        title="Eliminar archivo"
        description={`¿Eliminar "${deleteTarget?.title}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

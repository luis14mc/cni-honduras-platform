"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  FileIcon,
  Grid3X3,
  List,
  Loader2,
  Search,
  Upload,
  X,
} from "lucide-react";
import { CmsPagination } from "@/src/components/cms/editor/CmsPagination";
import { useCmsToast } from "@/src/components/cms/editor/CmsToast";
import { CmsApiError } from "@/src/lib/cms/api";
import { listMedia, uploadMedia } from "@/src/lib/cms/editorial/media";
import type { MediaAsset, MediaType } from "@/src/lib/cms/editorial/types";
import { cn } from "@/src/lib/utils";

interface CmsMediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
  acceptTypes?: MediaType[];
  title?: string;
}

const TYPE_FILTERS: { value: "" | MediaType; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "image", label: "Imágenes" },
  { value: "video", label: "Videos" },
  { value: "file", label: "Archivos" },
];

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDimensions(asset: MediaAsset): string | null {
  if (asset.width && asset.height) return `${asset.width}×${asset.height}px`;
  return null;
}

function describeAsset(asset: MediaAsset): string {
  const parts = [asset.media_type, formatBytes(asset.file_size_bytes)];
  const dims = formatDimensions(asset);
  if (dims) parts.push(dims);
  return parts.filter(Boolean).join(" · ");
}

export function CmsMediaPicker({
  open,
  onClose,
  onSelect,
  acceptTypes,
  title = "Biblioteca multimedia",
}: CmsMediaPickerProps) {
  const toast = useCmsToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [mediaType, setMediaType] = useState<"" | MediaType>("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [preview, setPreview] = useState<MediaAsset | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const pageSize = 12;

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const data = await listMedia({
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
        media_type: mediaType || undefined,
      });
      let results = data.results;
      if (acceptTypes?.length) {
        results = results.filter((a) => acceptTypes.includes(a.media_type));
      }
      setItems(results);
      setTotal(data.count);
    } catch (error) {
      const msg =
        error instanceof CmsApiError ? error.message : "No se pudo cargar la biblioteca.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [open, page, debouncedSearch, mediaType, acceptTypes, toast]);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleUpload = async (files: FileList | File[]) => {
    if (uploading) return;
    const list = Array.from(files);
    if (!list.length) return;
    setUploading(true);
    try {
      for (const file of list) {
        const asset = await uploadMedia({ file, title: file.name });
        toast.success(`"${asset.title}" subido correctamente.`);
      }
      setPage(1);
      await load();
    } catch (error) {
      const msg = error instanceof CmsApiError ? error.message : "Error al subir el archivo.";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) void handleUpload(e.dataTransfer.files);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#252A58]/50 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-labelledby="media-picker-title"
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-[#334E88]/15 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#334E88]/10 px-5 py-4">
          <h2 id="media-picker-title" className="text-lg font-bold text-[#252A58]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[#334E88] hover:bg-[#334E88]/10"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-[#334E88]/10 px-5 py-3">
          <div className="relative min-w-[180px] flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#334E88]/50" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar…"
              className="w-full rounded-lg border border-[#334E88]/20 py-1.5 pl-8 pr-3 text-sm focus:border-[#334E88] focus:outline-none"
            />
          </div>
          <select
            value={mediaType}
            onChange={(e) => {
              setMediaType(e.target.value as "" | MediaType);
              setPage(1);
            }}
            className="rounded-lg border border-[#334E88]/20 px-3 py-1.5 text-sm"
          >
            {TYPE_FILTERS.map((f) => (
              <option key={f.value || "all"} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <div className="flex rounded-lg border border-[#334E88]/20 p-0.5">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={cn(
                "rounded p-1.5",
                view === "grid" ? "bg-[#334E88] text-white" : "text-[#334E88]",
              )}
              aria-label="Vista cuadrícula"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={cn(
                "rounded p-1.5",
                view === "list" ? "bg-[#334E88] text-white" : "text-[#334E88]",
              )}
              aria-label="Vista lista"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          className={cn(
            "mx-5 mt-3 flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition",
            dragOver ? "border-[#32B372] bg-[#32B372]/5" : "border-[#334E88]/25 bg-[#f5f7fc]",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <Upload className="mb-2 h-6 w-6 text-[#334E88]" aria-hidden />
          <p className="text-sm text-[#252A58]">
            Arrastre archivos aquí o{" "}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="font-semibold text-[#334E88] underline"
              disabled={uploading}
            >
              seleccione desde su equipo
            </button>
          </p>
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && void handleUpload(e.target.files)}
          />
          {uploading ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-[#334E88]">
              <Loader2 className="h-4 w-4 animate-spin" /> Subiendo…
            </p>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#334E88]" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#252A58]/60">No hay archivos.</p>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((asset) => (
                <MediaTile
                  key={asset.id}
                  asset={asset}
                  selected={preview?.id === asset.id}
                  onPreview={() => setPreview(asset)}
                  onSelect={() => {
                    onSelect(asset);
                    onClose();
                  }}
                />
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-[#334E88]/10">
              {items.map((asset) => (
                <li key={asset.id}>
                  <button
                    type="button"
                    onClick={() => setPreview(asset)}
                    onDoubleClick={() => {
                      onSelect(asset);
                      onClose();
                    }}
                    className="flex w-full items-center gap-3 px-2 py-2 text-left hover:bg-[#334E88]/5"
                  >
                    <MediaThumb asset={asset} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#252A58]">{asset.title}</p>
                      <p className="text-xs text-[#252A58]/50">{describeAsset(asset)}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-[#334E88]/10 px-5 py-3">
          <CmsPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </div>

        {preview ? (
          <div className="flex items-center justify-between gap-4 border-t border-[#334E88]/10 bg-[#f5f7fc] px-5 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <MediaThumb asset={preview} size={48} />
              <div className="min-w-0">
                <p className="truncate font-medium text-[#252A58]">{preview.title}</p>
                <p className="text-xs text-[#252A58]/50">{describeAsset(preview)}</p>
                <p className="text-xs text-[#252A58]/50">{preview.alt_text || "Sin texto alternativo"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onSelect(preview);
                onClose();
              }}
              className="shrink-0 rounded-lg bg-[#32B372] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2a9962]"
            >
              Seleccionar
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MediaThumb({ asset, size }: { asset: MediaAsset; size: number }) {
  const url = asset.file_url;
  if (asset.media_type === "image" && url) {
    return (
      <div
        className="relative shrink-0 overflow-hidden rounded bg-[#334E88]/10"
        style={{ width: size, height: size }}
      >
        <Image src={url} alt={asset.alt_text || asset.title} fill className="object-cover" unoptimized />
      </div>
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded bg-[#334E88]/10 text-[#334E88]"
      style={{ width: size, height: size }}
    >
      <FileIcon className="h-5 w-5" />
    </div>
  );
}

function MediaTile({
  asset,
  selected,
  onPreview,
  onSelect,
}: {
  asset: MediaAsset;
  selected: boolean;
  onPreview: () => void;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPreview}
      onDoubleClick={onSelect}
      className={cn(
        "overflow-hidden rounded-lg border text-left transition hover:border-[#334E88]/40",
        selected ? "border-[#32B372] ring-2 ring-[#32B372]/30" : "border-[#334E88]/15",
      )}
    >
      <div className="relative aspect-square bg-[#334E88]/5">
        {asset.media_type === "image" && asset.file_url ? (
          <Image
            src={asset.file_url}
            alt={asset.alt_text || asset.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#334E88]/50">
            <FileIcon className="h-8 w-8" />
          </div>
        )}
      </div>
      <p className="truncate px-2 py-1.5 text-xs font-medium text-[#252A58]">{asset.title}</p>
    </button>
  );
}

/** Inline preview + picker trigger for editor forms. */
export function CmsMediaField({
  label,
  asset,
  onSelect,
  onClear,
  acceptTypes = ["image"],
}: {
  label: string;
  asset: MediaAsset | null;
  onSelect: (asset: MediaAsset) => void;
  onClear?: () => void;
  acceptTypes?: MediaType[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-[#252A58]">{label}</p>
      {asset ? (
        <div className="flex items-center gap-3 rounded-lg border border-[#334E88]/15 bg-white p-3">
          <MediaThumb asset={asset} size={64} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{asset.title}</p>
            <p className="text-xs text-[#252A58]/50">{describeAsset(asset)}</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="text-xs font-semibold text-[#334E88] hover:underline"
              >
                Cambiar
              </button>
              {onClear ? (
                <button
                  type="button"
                  onClick={onClear}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Quitar
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#334E88]/25 py-8 text-sm font-medium text-[#334E88] hover:border-[#334E88]/40 hover:bg-[#334E88]/5"
        >
          <Upload className="h-5 w-5" />
          Seleccionar imagen
        </button>
      )}
      <CmsMediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onSelect={onSelect}
        acceptTypes={acceptTypes}
      />
    </div>
  );
}

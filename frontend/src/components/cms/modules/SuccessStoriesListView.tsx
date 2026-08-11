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
import { useCmsToast } from "@/src/components/cms/editor/CmsToast";
import { useCmsAuth } from "@/src/lib/cms/AuthProvider";
import { CmsApiError } from "@/src/lib/cms/api";
import {
  archiveSuccessStory,
  listSuccessStories,
  publishSuccessStory,
  unpublishSuccessStory,
} from "@/src/lib/cms/editorial/successStories";
import type { PublishStatus, SuccessStoryItem } from "@/src/lib/cms/editorial/types";
import { canAdd, canChange, canPublish } from "@/src/lib/cms/permissions";
import { resolveMediaFileUrl } from "@/src/lib/mediaUrl";

const PAGE_SIZE = 20;

function thumbUrl(row: SuccessStoryItem): string | null {
  return resolveMediaFileUrl(
    row.featured_image_detail?.file_url ||
      row.featured_image_detail?.file ||
      row.image_url ||
      row.logo_detail?.file_url ||
      row.logo_detail?.file ||
      row.image,
  );
}

export function SuccessStoriesListView() {
  const router = useRouter();
  const { user } = useCmsAuth();
  const toast = useCmsToast();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<"" | PublishStatus>("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<SuccessStoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

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

  const runAction = async (
    id: number,
    action: "publish" | "archive" | "unpublish",
  ) => {
    setBusyId(id);
    try {
      if (action === "publish") await publishSuccessStory(id);
      if (action === "archive") await archiveSuccessStory(id);
      if (action === "unpublish") await unpublishSuccessStory(id);
      toast.success(
        action === "publish"
          ? "Caso publicado."
          : action === "archive"
            ? "Caso archivado."
            : "Caso despublicado.",
      );
      await load();
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "No se pudo completar la acción.");
    } finally {
      setBusyId(null);
    }
  };

  const userCanChange = canChange(user, "investment", "successstory");
  const userCanPublish = canPublish(user);

  const columns: CmsColumn<SuccessStoryItem>[] = [
    {
      key: "thumb",
      header: "Miniatura",
      render: (row) => {
        const src = thumbUrl(row);
        return src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="h-10 w-14 rounded object-cover" />
        ) : (
          <span className="text-xs text-slate-400">—</span>
        );
      },
    },
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
      key: "status",
      header: "Estado",
      render: (row) => <CmsStatusBadge status={row.status} />,
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
        <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="text-sm font-semibold text-[#35A963] hover:underline"
            onClick={() => router.push(`/cms/casos-exito/${row.id}`)}
          >
            Editar
          </button>
          {userCanPublish && row.status !== "published" ? (
            <button
              type="button"
              disabled={busyId === row.id}
              className="text-sm font-semibold text-[#252A58] hover:underline disabled:opacity-50"
              onClick={() => void runAction(row.id, "publish")}
            >
              Publicar
            </button>
          ) : null}
          {userCanPublish && row.status === "published" ? (
            <button
              type="button"
              disabled={busyId === row.id}
              className="text-sm font-semibold text-amber-700 hover:underline disabled:opacity-50"
              onClick={() => void runAction(row.id, "unpublish")}
            >
              Despublicar
            </button>
          ) : null}
          {userCanChange && row.status !== "archived" ? (
            <button
              type="button"
              disabled={busyId === row.id}
              className="text-sm font-semibold text-slate-600 hover:underline disabled:opacity-50"
              onClick={() => void runAction(row.id, "archive")}
            >
              Archivar
            </button>
          ) : null}
        </div>
      ),
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

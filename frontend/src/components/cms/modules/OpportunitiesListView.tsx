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
  archiveOpportunity,
  listOpportunities,
  publishOpportunity,
  unpublishOpportunity,
} from "@/src/lib/cms/editorial/opportunities";
import type { OpportunityItem, PublishStatus, SectorItem } from "@/src/lib/cms/editorial/types";
import { listSectors } from "@/src/lib/cms/editorial/sectors";
import { canAdd, canChange, canPublish } from "@/src/lib/cms/permissions";

const PAGE_SIZE = 20;

const STATUS_OPTIONS: { value: "" | PublishStatus; label: string }[] = [
  { value: "", label: "Todos los estados" },
  { value: "draft", label: "Borrador" },
  { value: "published", label: "Publicado" },
  { value: "archived", label: "Archivado" },
];

export function OpportunitiesListView() {
  const router = useRouter();
  const { user } = useCmsAuth();
  const toast = useCmsToast();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sector, setSector] = useState("");
  const [status, setStatus] = useState<"" | PublishStatus>("");
  const [sectors, setSectors] = useState<SectorItem[]>([]);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<OpportunityItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

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
      });
      setRows(data.results);
      setTotal(data.count);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, sector, status]);

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
      if (action === "publish") await publishOpportunity(id);
      if (action === "archive") await archiveOpportunity(id);
      if (action === "unpublish") await unpublishOpportunity(id);
      toast.success(
        action === "publish"
          ? "Oportunidad publicada."
          : action === "archive"
            ? "Oportunidad archivada."
            : "Oportunidad despublicada.",
      );
      await load();
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "No se pudo completar la acción.");
    } finally {
      setBusyId(null);
    }
  };

  const columns: CmsColumn<OpportunityItem>[] = [
    {
      key: "code",
      header: "Código",
      render: (row) => <span className="font-mono text-xs">{row.code || "—"}</span>,
    },
    {
      key: "title",
      header: "Título",
      render: (row) => (
        <span className="font-medium">{row.title_es || row.title || "Sin título"}</span>
      ),
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
    {
      key: "actions",
      header: "Acciones",
      render: (row) => {
        const canEdit = canChange(user, "investment", "investmentopportunity");
        const busy = busyId === row.id;
        return (
          <div className="flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="rounded px-2 py-1 text-xs font-semibold text-[#334E88] hover:bg-[#334E88]/10"
              onClick={() => router.push(`/cms/oportunidades/${row.id}`)}
            >
              Editar
            </button>
            {canEdit && canPublish(user) && row.status !== "published" ? (
              <button
                type="button"
                disabled={busy}
                className="rounded px-2 py-1 text-xs font-semibold text-[#1a7a4a] hover:bg-[#32B372]/15 disabled:opacity-50"
                onClick={() => void runAction(row.id, "publish")}
              >
                Publicar
              </button>
            ) : null}
            {canEdit && canPublish(user) && row.status === "published" ? (
              <button
                type="button"
                disabled={busy}
                className="rounded px-2 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-50"
                onClick={() => void runAction(row.id, "unpublish")}
              >
                Despublicar
              </button>
            ) : null}
            {canEdit && canPublish(user) && row.status !== "archived" ? (
              <button
                type="button"
                disabled={busy}
                className="rounded px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                onClick={() => void runAction(row.id, "archive")}
              >
                Archivar
              </button>
            ) : null}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <CmsSectionHeader
        title="Oportunidades"
        description="Fichas de oportunidades de inversión (Opportunity Cards)."
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
        searchPlaceholder="Buscar por código, título…"
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
            setStatus(e.target.value as "" | PublishStatus);
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
        emptyDescription="Registre fichas estructuradas (código, métricas, CAPEX)."
      />

      <CmsPagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </>
  );
}

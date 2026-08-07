"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { CmsConfirmDialog } from "@/src/components/cms/editor/CmsConfirmDialog";
import { CmsSectionHeader } from "@/src/components/cms/CmsSectionHeader";
import { cmsInputClass, cmsSelectClass, CmsFormField } from "@/src/components/cms/editor/CmsFormField";
import { useCmsToast } from "@/src/components/cms/editor/CmsToast";
import { CmsErrorState, CmsLoadingState, CmsUnauthorizedState } from "@/src/components/cms/states";
import { useCmsAuth } from "@/src/lib/cms/AuthProvider";
import { CmsApiError } from "@/src/lib/cms/api";
import {
  createInstitutionalLink,
  deleteInstitutionalLink,
  listInstitutionalLinks,
  updateInstitutionalLink,
} from "@/src/lib/cms/editorial/institutionalLinks";
import type { InstitutionalLinkItem } from "@/src/lib/cms/editorial/types";

const SECTION_OPTIONS = [
  { value: "home_interest", label: "Home — Enlaces de interés" },
  { value: "footer_external", label: "Footer — Externos" },
  { value: "tramites", label: "Trámites en línea" },
  { value: "top_bar", label: "Barra superior" },
];

interface LinkRow {
  id: number | null;
  section: string;
  title_es: string;
  url: string;
  is_active: boolean;
  order: number;
  isNew?: boolean;
}

function itemToRow(item: InstitutionalLinkItem): LinkRow {
  return {
    id: item.id,
    section: item.section,
    title_es: item.title_es || item.title,
    url: item.url,
    is_active: item.is_active,
    order: item.order,
  };
}

const emptyRow = (): LinkRow => ({
  id: null,
  section: "home_interest",
  title_es: "",
  url: "",
  is_active: true,
  order: 0,
  isNew: true,
});

export function ConfigView() {
  const { user } = useCmsAuth();
  const toast = useCmsToast();
  const [rows, setRows] = useState<LinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [savingId, setSavingId] = useState<number | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LinkRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const data = await listInstitutionalLinks({ page_size: 500 });
      setRows(data.results.map(itemToRow));
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const patchRow = (index: number, partial: Partial<LinkRow>) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...partial } : row)));
  };

  const handleSaveRow = async (index: number) => {
    const row = rows[index];
    if (!row.title_es.trim() || !row.url.trim()) {
      toast.error("Título y URL son obligatorios.");
      return;
    }

    const payload = {
      section: row.section,
      title_es: row.title_es,
      url: row.url,
      is_active: row.is_active,
      order: row.order,
    };

    setSavingId(row.isNew ? "new" : row.id);
    try {
      if (row.isNew || row.id === null) {
        const created = await createInstitutionalLink(payload);
        setRows((prev) => prev.map((r, i) => (i === index ? itemToRow(created) : r)));
        toast.success("Enlace creado.");
      } else {
        const updated = await updateInstitutionalLink(row.id, payload);
        setRows((prev) => prev.map((r, i) => (i === index ? itemToRow(updated) : r)));
        toast.success("Enlace actualizado.");
      }
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "No se pudo guardar.");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) {
      setRows((prev) => prev.filter((r) => r !== deleteTarget));
      setDeleteTarget(null);
      return;
    }
    setDeleting(true);
    try {
      await deleteInstitutionalLink(deleteTarget.id);
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      toast.success("Enlace eliminado.");
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "No se pudo eliminar.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (!user?.is_superuser) {
    return <CmsUnauthorizedState />;
  }

  if (loading) return <CmsLoadingState label="Cargando configuración…" />;
  if (loadError) return <CmsErrorState onRetry={() => void load()} />;

  return (
    <>
      <CmsSectionHeader
        title="Configuración"
        description="Enlaces institucionales mostrados en el sitio público."
        actions={
          <button
            type="button"
            onClick={() => setRows((prev) => [...prev, emptyRow()])}
            className="inline-flex items-center gap-2 rounded-lg bg-[#32B372] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2a9962]"
          >
            <Plus className="h-4 w-4" />
            Nuevo enlace
          </button>
        }
      />

      <div className="space-y-4">
        {rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#334E88]/25 bg-white/60 py-10 text-center text-sm text-[#252A58]/60">
            No hay enlaces registrados. Agregue uno con el botón superior.
          </p>
        ) : (
          rows.map((row, index) => (
            <div
              key={row.id ?? `new-${index}`}
              className="grid gap-3 rounded-xl border border-[#334E88]/10 bg-white p-4 md:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1.5fr_auto_auto_auto]"
            >
              <CmsFormField label="Sección">
                <select
                  value={row.section}
                  onChange={(e) => patchRow(index, { section: e.target.value })}
                  className={cmsSelectClass}
                >
                  {SECTION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </CmsFormField>

              <CmsFormField label="Título (ES)">
                <input
                  value={row.title_es}
                  onChange={(e) => patchRow(index, { title_es: e.target.value })}
                  className={cmsInputClass}
                />
              </CmsFormField>

              <CmsFormField label="URL">
                <input
                  value={row.url}
                  onChange={(e) => patchRow(index, { url: e.target.value })}
                  className={cmsInputClass}
                  placeholder="https://"
                />
              </CmsFormField>

              <CmsFormField label="Orden">
                <input
                  type="number"
                  min={0}
                  value={row.order}
                  onChange={(e) => patchRow(index, { order: Number(e.target.value) || 0 })}
                  className={cmsInputClass}
                />
              </CmsFormField>

              <CmsFormField label="Activo">
                <label className="mt-2 flex items-center gap-2 text-sm text-[#252A58]">
                  <input
                    type="checkbox"
                    checked={row.is_active}
                    onChange={(e) => patchRow(index, { is_active: e.target.checked })}
                    className="rounded border-[#334E88]/30"
                  />
                  {row.is_active ? "Sí" : "No"}
                </label>
              </CmsFormField>

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => void handleSaveRow(index)}
                  disabled={savingId === row.id || (row.isNew && savingId === "new")}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#334E88] px-3 py-2 text-sm font-semibold text-white hover:bg-[#252A58] disabled:opacity-50"
                >
                  {(savingId === row.id || (row.isNew && savingId === "new")) && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  )}
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(row)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <CmsConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar enlace"
        description="¿Confirma que desea eliminar este enlace institucional?"
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

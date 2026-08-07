"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CmsConfirmDialog } from "@/src/components/cms/editor/CmsConfirmDialog";
import { CmsEditorLayout } from "@/src/components/cms/editor/CmsEditorLayout";
import { CmsEditorSidebar } from "@/src/components/cms/editor/CmsEditorSidebar";
import {
  cmsInputClass,
  cmsSelectClass,
  cmsTextareaClass,
  CmsFormField,
} from "@/src/components/cms/editor/CmsFormField";
import { CmsSaveBar } from "@/src/components/cms/editor/CmsSaveBar";
import { useCmsToast } from "@/src/components/cms/editor/CmsToast";
import { CmsLoadingState, CmsErrorState } from "@/src/components/cms/states";
import { useCmsAuth } from "@/src/lib/cms/AuthProvider";
import { CmsApiError } from "@/src/lib/cms/api";
import {
  createOpportunity,
  deleteOpportunity,
  getOpportunity,
  publishOpportunity,
  unpublishOpportunity,
  updateOpportunity,
  type OpportunityWritePayload,
} from "@/src/lib/cms/editorial/opportunities";
import { listSectors } from "@/src/lib/cms/editorial/sectors";
import type { OpportunityItem, OpportunityStatus, SectorItem } from "@/src/lib/cms/editorial/types";
import { canAdd, canChange, canDelete, canPublish } from "@/src/lib/cms/permissions";
import { cn } from "@/src/lib/utils";

const STATUS_OPTIONS: { value: OpportunityStatus; label: string }[] = [
  { value: "open", label: "Abierta" },
  { value: "in_progress", label: "En progreso" },
  { value: "closed", label: "Cerrada" },
];

interface OpportunityFormState {
  title: string;
  slug: string;
  summary: string;
  description: string;
  sector: number | null;
  estimated_investment: string;
  estimated_jobs: number | null;
  status: OpportunityStatus;
  is_public: boolean;
  is_featured: boolean;
  updated_at: string | null;
}

const emptyForm = (): OpportunityFormState => ({
  title: "",
  slug: "",
  summary: "",
  description: "",
  sector: null,
  estimated_investment: "",
  estimated_jobs: null,
  status: "open",
  is_public: false,
  is_featured: false,
  updated_at: null,
});

function opportunityToForm(item: OpportunityItem): OpportunityFormState {
  return {
    title: item.title ?? "",
    slug: item.slug ?? "",
    summary: item.summary ?? "",
    description: item.description ?? "",
    sector: item.sector,
    estimated_investment: item.estimated_investment ?? "",
    estimated_jobs: item.estimated_jobs,
    status: item.status,
    is_public: item.is_public,
    is_featured: item.is_featured,
    updated_at: item.updated_at,
  };
}

function formToPayload(form: OpportunityFormState): OpportunityWritePayload {
  return {
    title: form.title,
    slug: form.slug,
    summary: form.summary,
    description: form.description,
    sector: form.sector ?? undefined,
    estimated_investment: form.estimated_investment || null,
    estimated_jobs: form.estimated_jobs,
    status: form.status,
    is_featured: form.is_featured,
  };
}

interface OpportunityEditorViewProps {
  opportunityId?: number;
}

export function OpportunityEditorView({ opportunityId }: OpportunityEditorViewProps) {
  const router = useRouter();
  const { user } = useCmsAuth();
  const toast = useCmsToast();
  const isNew = opportunityId === undefined;

  const [form, setForm] = useState<OpportunityFormState>(emptyForm);
  const [sectors, setSectors] = useState<SectorItem[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    listSectors({ page_size: 200, is_active: true })
      .then((data) => setSectors(data.results))
      .catch(() => setSectors([]));
  }, []);

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const item = await getOpportunity(opportunityId);
        if (!cancelled) setForm(opportunityToForm(item));
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isNew, opportunityId]);

  const patch = useCallback((partial: Partial<OpportunityFormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  const persist = async (): Promise<number> => {
    if (!form.title.trim()) throw new Error("El título es obligatorio.");
    if (!form.sector) throw new Error("Seleccione un sector.");
    const payload = formToPayload(form);
    if (isNew) {
      const created = await createOpportunity(payload);
      return created.id;
    }
    await updateOpportunity(opportunityId!, payload);
    return opportunityId!;
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const id = await persist();
      toast.success("Oportunidad guardada.");
      if (isNew) router.replace(`/cms/oportunidades/${id}`);
      else setForm(opportunityToForm(await getOpportunity(id)));
    } catch (err) {
      toast.error(err instanceof CmsApiError || err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const id = await persist();
      const published = await publishOpportunity(id);
      setForm(opportunityToForm(published));
      toast.success("Oportunidad publicada.");
      if (isNew) router.replace(`/cms/oportunidades/${id}`);
    } catch (err) {
      toast.error(err instanceof CmsApiError || err instanceof Error ? err.message : "No se pudo publicar.");
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!opportunityId) return;
    setPublishing(true);
    try {
      const updated = await unpublishOpportunity(opportunityId);
      setForm(opportunityToForm(updated));
      toast.success("Oportunidad despublicada.");
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "No se pudo despublicar.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!opportunityId) return;
    setDeleting(true);
    try {
      await deleteOpportunity(opportunityId);
      toast.success("Oportunidad eliminada.");
      router.push("/cms/oportunidades");
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "No se pudo eliminar.");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) return <CmsLoadingState label="Cargando oportunidad…" />;
  if (loadError) return <CmsErrorState onRetry={() => router.refresh()} />;

  const userCanSave = isNew
    ? canAdd(user, "investment", "investmentopportunity")
    : canChange(user, "investment", "investmentopportunity");
  const userCanPublish = canPublish(user) && !form.is_public;
  const userCanDelete = !isNew && canDelete(user, "investment", "investmentopportunity");
  const userCanUnpublish = !isNew && canChange(user, "investment", "investmentopportunity") && form.is_public;

  return (
    <>
      <CmsEditorLayout
        title={isNew ? "Nueva oportunidad" : "Editar oportunidad"}
        description={form.title || "Complete los datos de la oportunidad de inversión."}
        backHref="/cms/oportunidades"
        sidebar={
          <CmsEditorSidebar updatedAt={form.updated_at}>
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-[#252A58]/50">
                Visibilidad
              </p>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  form.is_public
                    ? "bg-[#32B372]/15 text-[#1a7a4a]"
                    : "bg-[#334E88]/10 text-[#334E88]",
                )}
              >
                {form.is_public ? "Pública" : "Borrador"}
              </span>
            </div>

            <CmsFormField label="Sector" required htmlFor="opp-sector">
              <select
                id="opp-sector"
                value={form.sector ?? ""}
                onChange={(e) => patch({ sector: e.target.value ? Number(e.target.value) : null })}
                className={cmsSelectClass}
              >
                <option value="">Seleccione un sector</option>
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_es || s.name}
                  </option>
                ))}
              </select>
            </CmsFormField>

            <CmsFormField label="Estado" htmlFor="opp-status">
              <select
                id="opp-status"
                value={form.status}
                onChange={(e) => patch({ status: e.target.value as OpportunityStatus })}
                className={cmsSelectClass}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </CmsFormField>

            <CmsFormField label="Inversión estimada" htmlFor="opp-investment">
              <input
                id="opp-investment"
                value={form.estimated_investment}
                onChange={(e) => patch({ estimated_investment: e.target.value })}
                className={cmsInputClass}
                placeholder="USD 1,000,000"
              />
            </CmsFormField>

            <CmsFormField label="Empleos estimados" htmlFor="opp-jobs">
              <input
                id="opp-jobs"
                type="number"
                min={0}
                value={form.estimated_jobs ?? ""}
                onChange={(e) =>
                  patch({ estimated_jobs: e.target.value ? Number(e.target.value) : null })
                }
                className={cmsInputClass}
              />
            </CmsFormField>

            <label className="flex items-center gap-2 text-sm text-[#252A58]">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => patch({ is_featured: e.target.checked })}
                className="rounded border-[#334E88]/30"
              />
              Destacada
            </label>

            {userCanUnpublish ? (
              <button
                type="button"
                onClick={() => void handleUnpublish()}
                disabled={publishing || saving}
                className="w-full rounded-lg border border-[#334E88]/30 px-3 py-2 text-sm font-semibold text-[#334E88] transition hover:bg-[#334E88]/5 disabled:opacity-50"
              >
                Despublicar
              </button>
            ) : null}
          </CmsEditorSidebar>
        }
      >
        <div className="space-y-4 rounded-xl border border-[#334E88]/10 bg-white p-5">
          <CmsFormField label="Título" required htmlFor="opp-title">
            <input
              id="opp-title"
              value={form.title}
              onChange={(e) => patch({ title: e.target.value })}
              className={cmsInputClass}
            />
          </CmsFormField>

          <CmsFormField label="Slug" htmlFor="opp-slug">
            <input
              id="opp-slug"
              value={form.slug}
              onChange={(e) => patch({ slug: e.target.value })}
              className={cmsInputClass}
            />
          </CmsFormField>

          <CmsFormField label="Resumen" htmlFor="opp-summary">
            <textarea
              id="opp-summary"
              value={form.summary}
              onChange={(e) => patch({ summary: e.target.value })}
              className={cmsTextareaClass}
              rows={3}
            />
          </CmsFormField>

          <CmsFormField label="Descripción" htmlFor="opp-description">
            <textarea
              id="opp-description"
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
              className={cmsTextareaClass}
              rows={6}
            />
          </CmsFormField>
        </div>

        <CmsSaveBar
          onSaveDraft={() => void handleSaveDraft()}
          onPublish={() => void handlePublish()}
          onDelete={() => setConfirmDelete(true)}
          saving={saving}
          publishing={publishing}
          canSave={userCanSave}
          canPublish={userCanPublish}
          canDelete={userCanDelete}
          statusLabel={
            form.is_public
              ? "Esta oportunidad es visible en el sitio."
              : "Guarde y publique para hacerla pública."
          }
        />
      </CmsEditorLayout>

      <CmsConfirmDialog
        open={confirmDelete}
        title="Eliminar oportunidad"
        description="¿Confirma que desea eliminar esta oportunidad?"
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

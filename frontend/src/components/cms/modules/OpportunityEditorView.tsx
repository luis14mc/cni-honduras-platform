"use client";

import { LIFECYCLE_OPTIONS } from "./useOpportunityEditor";
import { CmsConfirmDialog } from "@/src/components/cms/editor/CmsConfirmDialog";
import { CmsEditorLayout } from "@/src/components/cms/editor/CmsEditorLayout";
import { CmsEditorSidebar } from "@/src/components/cms/editor/CmsEditorSidebar";
import {
  cmsInputClass,
  cmsSelectClass,
  cmsTextareaClass,
  CmsFormField,
} from "@/src/components/cms/editor/CmsFormField";
import { CmsLocaleTabs } from "@/src/components/cms/editor/CmsLocaleTabs";
import { CmsSaveBar } from "@/src/components/cms/editor/CmsSaveBar";
import { CmsLoadingState, CmsErrorState } from "@/src/components/cms/states";
import type { OpportunityLifecycleStatus } from "@/src/lib/cms/editorial/types";
import { useOpportunityEditor, type OpportunityEditorViewProps } from "./useOpportunityEditor";
import { OpportunityFundUses } from "./OpportunityFundUses";
import { OpportunityMetrics } from "./OpportunityMetrics";

export function OpportunityEditorView(props: OpportunityEditorViewProps) {
  const {
    router,
    isNew,
    form,
    locale,
    setLocale,
    sectors,
    loading,
    loadError,
    saving,
    publishing,
    archiving,
    deleting,
    confirmDelete,
    setConfirmDelete,
    dirty,
    patch,
    handleSaveDraft,
    handlePublish,
    handleArchive,
    handleDelete,
    titleField,
    summaryField,
    descriptionField,
    targetField,
    marketField,
    valueField,
    userCanSave,
    userCanPublish,
    userCanDelete
  } = useOpportunityEditor(props);

  if (loading) return <CmsLoadingState label="Cargando oportunidad…" />;
  if (loadError) return <CmsErrorState onRetry={() => router.refresh()} />;

  return (
    <>
      <CmsEditorLayout
        title={isNew ? "Nueva oportunidad" : "Editar oportunidad"}
        description={form.code || form.title_es || undefined}
        backHref="/cms/oportunidades"
        dirty={dirty}
        sidebar={
          <CmsEditorSidebar
            status={form.status}
            updatedAt={form.updated_at}
            updatedBy={form.updated_by_name}
          >
            <CmsFormField label="Estado del deal" htmlFor="opp-lifecycle">
              <select
                id="opp-lifecycle"
                value={form.lifecycle_status}
                onChange={(e) =>
                  patch({ lifecycle_status: e.target.value as OpportunityLifecycleStatus })
                }
                className={cmsSelectClass}
              >
                {LIFECYCLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </CmsFormField>
            <CmsFormField label="Orden" htmlFor="opp-order">
              <input
                id="opp-order"
                type="number"
                min={0}
                value={form.order}
                onChange={(e) => patch({ order: Number(e.target.value) || 0 })}
                className={cmsInputClass}
              />
            </CmsFormField>
            <label className="mt-3 flex items-center gap-2 text-sm text-[#252A58]">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => patch({ is_featured: e.target.checked })}
                className="rounded border-[#334E88]/30"
              />
              Destacada
            </label>
            {!isNew && userCanSave && userCanPublish ? (
              <button
                type="button"
                disabled={archiving || form.status === "archived"}
                onClick={() => void handleArchive()}
                className="mt-3 w-full rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-50"
              >
                {archiving ? "Archivando…" : "Archivar"}
              </button>
            ) : null}
            {userCanDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="mt-2 w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                Eliminar
              </button>
            ) : null}
          </CmsEditorSidebar>
        }
      >
        <CmsLocaleTabs locale={locale} onChange={setLocale} />

        <div className="mt-4 space-y-6">
          <section className="space-y-4 rounded-xl border border-[#334E88]/10 bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#252A58]">
              Información general
            </h2>
            <CmsFormField label="Código" htmlFor="opp-code" required>
              <input
                id="opp-code"
                value={form.code}
                onChange={(e) => patch({ code: e.target.value })}
                className={cmsInputClass}
                placeholder="OC-CNI-T002"
              />
            </CmsFormField>
            <CmsFormField label="Sector" htmlFor="opp-sector" required>
              <select
                id="opp-sector"
                value={form.sector ?? ""}
                onChange={(e) =>
                  patch({ sector: e.target.value ? Number(e.target.value) : null })
                }
                className={cmsSelectClass}
              >
                <option value="">Seleccionar…</option>
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_es || s.name}
                  </option>
                ))}
              </select>
            </CmsFormField>
            <CmsFormField label={`Título (${locale.toUpperCase()})`} required htmlFor="opp-title">
              <input
                id="opp-title"
                value={form[titleField] as string}
                onChange={(e) => patch({ [titleField]: e.target.value })}
                className={cmsInputClass}
              />
            </CmsFormField>
            <CmsFormField label="Slug" htmlFor="opp-slug">
              <input
                id="opp-slug"
                value={form.slug}
                onChange={(e) => patch({ slug: e.target.value })}
                className={cmsInputClass}
                placeholder="se genera desde el título si se deja vacío"
              />
            </CmsFormField>
          </section>

          <section className="space-y-4 rounded-xl border border-[#334E88]/10 bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#252A58]">Oportunidad</h2>
            <CmsFormField
              label={`Descripción (${locale.toUpperCase()})`}
              htmlFor="opp-description"
              required
            >
              <textarea
                id="opp-description"
                rows={5}
                value={form[descriptionField] as string}
                onChange={(e) => patch({ [descriptionField]: e.target.value })}
                className={cmsTextareaClass}
              />
            </CmsFormField>
            <CmsFormField
              label={`Resumen breve (${locale.toUpperCase()})`}
              htmlFor="opp-summary"
            >
              <textarea
                id="opp-summary"
                rows={3}
                value={form[summaryField] as string}
                onChange={(e) => patch({ [summaryField]: e.target.value })}
                className={cmsTextareaClass}
              />
            </CmsFormField>
            <CmsFormField
              label={`Cliente / comprador objetivo (${locale.toUpperCase()})`}
              htmlFor="opp-target"
            >
              <textarea
                id="opp-target"
                rows={4}
                value={form[targetField] as string}
                onChange={(e) => patch({ [targetField]: e.target.value })}
                className={cmsTextareaClass}
              />
            </CmsFormField>
            <CmsFormField
              label={`Mercado / demanda (${locale.toUpperCase()})`}
              htmlFor="opp-market"
            >
              <textarea
                id="opp-market"
                rows={5}
                value={form[marketField] as string}
                onChange={(e) => patch({ [marketField]: e.target.value })}
                className={cmsTextareaClass}
              />
            </CmsFormField>
            <CmsFormField
              label={`Propuesta de valor (${locale.toUpperCase()})`}
              htmlFor="opp-value"
            >
              <textarea
                id="opp-value"
                rows={5}
                value={form[valueField] as string}
                onChange={(e) => patch({ [valueField]: e.target.value })}
                className={cmsTextareaClass}
              />
            </CmsFormField>
          </section>

          <OpportunityMetrics form={form} locale={locale} patch={patch} />

          <OpportunityFundUses form={form} locale={locale} patch={patch} />
        </div>

        <CmsSaveBar
          saving={saving}
          publishing={publishing}
          canSave={userCanSave}
          canPublish={userCanPublish}
          onSaveDraft={() => void handleSaveDraft()}
          onPublish={() => void handlePublish()}
          statusLabel={
            form.status === "published"
              ? "Publicada — guardar no la despublica"
              : form.status === "archived"
                ? "Archivada"
                : "Borrador"
          }
        />
      </CmsEditorLayout>

      <CmsConfirmDialog
        open={confirmDelete}
        title="Eliminar oportunidad"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDelete(false)}
        loading={deleting}
        variant="danger"
      />
    </>
  );
}

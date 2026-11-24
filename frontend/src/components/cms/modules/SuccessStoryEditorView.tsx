"use client";

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
import { CmsMediaField } from "@/src/components/cms/editor/CmsMediaPicker";
import { CmsRichTextEditor } from "@/src/components/cms/editor/CmsRichTextEditor";
import { CmsSaveBar } from "@/src/components/cms/editor/CmsSaveBar";
import { CmsLoadingState, CmsErrorState } from "@/src/components/cms/states";
import { canDelete, canPublish } from "@/src/lib/cms/permissions";
import { useSuccessStoryEditor, type SuccessStoryEditorViewProps } from "./useSuccessStoryEditor";
export { formToPayload } from "./useSuccessStoryEditor";

export function SuccessStoryEditorView(props: SuccessStoryEditorViewProps) {
  const {
    router,
    user,
    isNew,
    locale,
    setLocale,
    form,
    dirty,
    loading,
    loadError,
    saving,
    publishing,
    archiving,
    confirmDelete,
    setConfirmDelete,
    deleting,
    sectors,
    patch,
    handleSaveDraft,
    handlePublish,
    handleArchive,
    handleDelete,
    titleField,
    summaryField,
    contentField,
    quoteField,
    authorField,
    userCanSave
  } = useSuccessStoryEditor(props);

  if (loading) return <CmsLoadingState label="Cargando caso de éxito…" />;
  if (loadError) return <CmsErrorState onRetry={() => router.refresh()} />;

  return (
    <>
      <CmsEditorLayout
        title={isNew ? "Nuevo caso de éxito" : "Editar caso de éxito"}
        description={form.company_name || form.title_es || undefined}
        backHref="/cms/casos-exito"
        dirty={dirty}
        sidebar={
          <CmsEditorSidebar
            status={form.status}
            updatedAt={form.updated_at}
            updatedBy={form.updated_by_name}
          >
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Identidad</p>
            <CmsMediaField
              label="Logo"
              asset={form.logo_detail}
              onSelect={(asset) => patch({ logo: asset.id, logo_detail: asset })}
              onClear={() => patch({ logo: null, logo_detail: null })}
            />
            <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
              Imagen principal
            </p>
            <CmsMediaField
              label="Featured image"
              asset={form.featured_image_detail}
              onSelect={(asset) =>
                patch({ featured_image: asset.id, featured_image_detail: asset })
              }
              onClear={() => patch({ featured_image: null, featured_image_detail: null })}
            />
            <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
              Testimonio
            </p>
            <CmsMediaField
              label="Foto de la persona"
              asset={form.person_photo_detail}
              onSelect={(asset) =>
                patch({ person_photo: asset.id, person_photo_detail: asset })
              }
              onClear={() => patch({ person_photo: null, person_photo_detail: null })}
            />
            <CmsFormField label="Nombre de la persona" htmlFor="story-person-name">
              <input
                id="story-person-name"
                value={form.person_name}
                onChange={(e) => patch({ person_name: e.target.value })}
                className={cmsInputClass}
              />
            </CmsFormField>
            <CmsFormField label="Cargo / rol" htmlFor="story-person-role">
              <input
                id="story-person-role"
                value={form.person_role}
                onChange={(e) => patch({ person_role: e.target.value })}
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
              Destacado en home
            </label>
            {!isNew && userCanSave ? (
              <button
                type="button"
                disabled={archiving || form.status === "archived"}
                onClick={() => void handleArchive()}
                className="mt-3 w-full rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-50"
              >
                {archiving ? "Archivando…" : "Archivar"}
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
            <CmsFormField label={`Título (${locale.toUpperCase()})`} required htmlFor="story-title">
              <input
                id="story-title"
                value={form[titleField] as string}
                onChange={(e) => patch({ [titleField]: e.target.value })}
                className={cmsInputClass}
              />
            </CmsFormField>
            <CmsFormField label="Slug" htmlFor="story-slug">
              <input
                id="story-slug"
                value={form.slug}
                onChange={(e) => patch({ slug: e.target.value })}
                className={cmsInputClass}
                placeholder="se genera desde el título si se deja vacío"
              />
            </CmsFormField>
            <CmsFormField label="Empresa" htmlFor="story-company">
              <input
                id="story-company"
                value={form.company_name}
                onChange={(e) => patch({ company_name: e.target.value })}
                className={cmsInputClass}
              />
            </CmsFormField>
            <CmsFormField label="Sector" htmlFor="story-sector">
              <select
                id="story-sector"
                value={form.sector ?? ""}
                onChange={(e) =>
                  patch({ sector: e.target.value ? Number(e.target.value) : null })
                }
                className={cmsSelectClass}
              >
                <option value="">Sin sector</option>
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_es || s.name}
                  </option>
                ))}
              </select>
            </CmsFormField>
            <CmsFormField label="País de origen" htmlFor="story-country">
              <input
                id="story-country"
                value={form.country_origin}
                onChange={(e) => patch({ country_origin: e.target.value })}
                className={cmsInputClass}
              />
            </CmsFormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <CmsFormField label="Inversión (USD)" htmlFor="story-investment">
                <input
                  id="story-investment"
                  value={form.investment_amount}
                  onChange={(e) => patch({ investment_amount: e.target.value })}
                  className={cmsInputClass}
                  inputMode="decimal"
                />
              </CmsFormField>
              <CmsFormField label="Empleos generados" htmlFor="story-jobs">
                <input
                  id="story-jobs"
                  type="number"
                  min={0}
                  value={form.jobs_generated ?? ""}
                  onChange={(e) =>
                    patch({
                      jobs_generated: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  className={cmsInputClass}
                />
              </CmsFormField>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-[#334E88]/10 bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#252A58]">
              Contenido ({locale.toUpperCase()})
            </h2>
            <CmsFormField label="Resumen" htmlFor="story-summary">
              <textarea
                id="story-summary"
                value={form[summaryField] as string}
                onChange={(e) => patch({ [summaryField]: e.target.value })}
                className={cmsTextareaClass}
                rows={3}
              />
            </CmsFormField>
            <CmsFormField label="Contenido">
              <CmsRichTextEditor
                value={form[contentField] as string}
                onChange={(html) => patch({ [contentField]: html })}
              />
            </CmsFormField>
            <CmsFormField label="Cita / testimonio" htmlFor="story-quote">
              <textarea
                id="story-quote"
                value={form[quoteField] as string}
                onChange={(e) => patch({ [quoteField]: e.target.value })}
                className={cmsTextareaClass}
                rows={2}
              />
            </CmsFormField>
            <CmsFormField label="Autor del testimonio (traducible)" htmlFor="story-author">
              <input
                id="story-author"
                value={form[authorField] as string}
                onChange={(e) => patch({ [authorField]: e.target.value })}
                className={cmsInputClass}
              />
            </CmsFormField>
          </section>
        </div>

        <CmsSaveBar
          onSaveDraft={() => void handleSaveDraft()}
          onPublish={() => void handlePublish()}
          onDelete={() => setConfirmDelete(true)}
          saving={saving}
          publishing={publishing}
          canSave={userCanSave}
          canPublish={canPublish(user)}
          canDelete={!isNew && canDelete(user, "investment", "successstory")}
          statusLabel={
            form.status === "published"
              ? "Este caso está publicado. Guardar no lo despublica."
              : "Los cambios se guardan como borrador."
          }
        />
      </CmsEditorLayout>

      <CmsConfirmDialog
        open={confirmDelete}
        title="Eliminar caso de éxito"
        description="¿Confirma que desea eliminar este registro?"
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

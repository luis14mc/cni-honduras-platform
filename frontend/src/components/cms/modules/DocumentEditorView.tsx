"use client";

import { CATEGORY_OPTIONS } from "./useDocumentEditor";
import { CmsConfirmDialog } from "@/src/components/cms/editor/CmsConfirmDialog";
import { CmsEditorLayout } from "@/src/components/cms/editor/CmsEditorLayout";
import { CmsEditorSidebar } from "@/src/components/cms/editor/CmsEditorSidebar";
import {
  cmsInputClass,
  cmsSelectClass,
  cmsTextareaClass,
  CmsFormField,
} from "@/src/components/cms/editor/CmsFormField";
import { CmsMediaField } from "@/src/components/cms/editor/CmsMediaPicker";
import { CmsSaveBar } from "@/src/components/cms/editor/CmsSaveBar";
import { CmsLoadingState, CmsErrorState } from "@/src/components/cms/states";
import { useDocumentEditor, type DocumentEditorViewProps } from "./useDocumentEditor";

export function DocumentEditorView(props: DocumentEditorViewProps) {
  const {
    router,
    isNew,
    fileRef,
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
    pendingFile,
    setPendingFile,
    clearExistingFile,
    setClearExistingFile,
    creatingSibling,
    resourceMode,
    setResourceMode,
    patch,
    handleSaveDraft,
    handlePublish,
    handleArchive,
    handleCreateSibling,
    handleDelete,
    userCanSave,
    userCanPublish,
    userCanDelete,
    langLabel,
    otherLang,
    hasSibling,
    resolvedFileUrl
  } = useDocumentEditor(props);

  if (loading) return <CmsLoadingState label="Cargando documento…" />;
  if (loadError) return <CmsErrorState onRetry={() => router.refresh()} />;

  return (
    <>
      <CmsEditorLayout
        title={isNew ? "Nuevo documento" : "Editar documento"}
        description={isNew ? "Una versión por idioma (ES o EN)." : form.title}
        backHref="/cms/documentos"
        dirty={dirty}
        sidebar={
          <CmsEditorSidebar
            status={form.status}
            updatedAt={form.updated_at}
            updatedBy={form.updated_by_name}
          >
            <CmsMediaField
              label="Portada"
              asset={form.cover_image_detail}
              onSelect={(asset) => patch({ cover_image: asset.id, cover_image_detail: asset })}
              onClear={() => patch({ cover_image: null, cover_image_detail: null })}
            />
            <CmsFormField label="Categoría" htmlFor="doc-category">
              <select
                id="doc-category"
                value={form.category}
                onChange={(e) => patch({ category: e.target.value })}
                className={cmsSelectClass}
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </CmsFormField>
            <CmsFormField label="Orden" htmlFor="doc-order">
              <input
                id="doc-order"
                type="number"
                min={0}
                value={form.order}
                onChange={(e) => patch({ order: Number(e.target.value) || 0 })}
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
              Destacado
            </label>
            {!isNew ? (
              <div className="mt-3 space-y-2 rounded-lg border border-[#334E88]/15 bg-slate-50 p-3 text-sm">
                <p className="font-semibold text-[#252A58]">Versión relacionada</p>
                {hasSibling ? (
                  <button
                    type="button"
                    onClick={() => router.push(`/cms/documentos/${form.sibling_id}`)}
                    className="w-full rounded-lg border border-[#252A58]/20 bg-white px-3 py-2 text-sm font-semibold text-[#252A58] hover:bg-slate-50"
                  >
                    Abrir versión {otherLang}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={creatingSibling}
                    onClick={() => void handleCreateSibling()}
                    className="w-full rounded-lg border border-[#252A58]/20 bg-white px-3 py-2 text-sm font-semibold text-[#252A58] hover:bg-slate-50 disabled:opacity-50"
                  >
                    {creatingSibling
                      ? "Creando…"
                      : form.language === "es"
                        ? "Crear versión en inglés"
                        : "Crear versión en español"}
                  </button>
                )}
              </div>
            ) : null}
            {!isNew && userCanSave ? (
              <button
                type="button"
                disabled={archiving || form.status === "archived"}
                onClick={() => void handleArchive()}
                className="mt-2 w-full rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-50"
              >
                {archiving ? "Archivando…" : "Archivar"}
              </button>
            ) : null}
          </CmsEditorSidebar>
        }
      >
        <div className="space-y-4 rounded-xl border border-[#334E88]/10 bg-white p-5">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[#252A58] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              {form.language === "en" ? "EN" : "ES"} · {langLabel}
            </span>
            {form.resource_key ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                resource_key: {form.resource_key}
              </span>
            ) : null}
            {!isNew ? (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  hasSibling ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}
              >
                {hasSibling ? `${otherLang} disponible` : `${otherLang} pendiente`}
              </span>
            ) : null}
          </div>

          {isNew ? (
            <CmsFormField label="Idioma" htmlFor="doc-lang">
              <select
                id="doc-lang"
                value={form.language}
                onChange={(e) => patch({ language: e.target.value === "en" ? "en" : "es" })}
                className={cmsSelectClass}
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </CmsFormField>
          ) : null}

          <CmsFormField label="resource_key / grupo" htmlFor="doc-key">
            <input
              id="doc-key"
              value={form.resource_key}
              onChange={(e) => patch({ resource_key: e.target.value })}
              className={cmsInputClass}
              placeholder="estudio-turismo-2026"
              disabled={!isNew && Boolean(form.resource_key)}
            />
          </CmsFormField>

          <CmsFormField label="Título" required htmlFor="doc-title">
            <input
              id="doc-title"
              value={form.title}
              onChange={(e) => patch({ title: e.target.value })}
              className={cmsInputClass}
            />
          </CmsFormField>

          <CmsFormField label="Slug" htmlFor="doc-slug">
            <input
              id="doc-slug"
              value={form.slug}
              onChange={(e) => patch({ slug: e.target.value })}
              className={cmsInputClass}
              placeholder="se genera desde el título si se deja vacío"
            />
          </CmsFormField>

          <CmsFormField label="Descripción" htmlFor="doc-desc">
            <textarea
              id="doc-desc"
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
              className={cmsTextareaClass}
              rows={4}
            />
          </CmsFormField>

          <div className="space-y-3 rounded-lg border border-[#334E88]/15 p-4">
            <p className="text-sm font-semibold text-[#252A58]">Recurso</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["file", "Subir archivo"],
                  ["url", "URL externa"],
                  ["none", "Sin recurso (borrador)"],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setResourceMode(mode);
                    if (mode === "file") {
                      patch({ external_url: "" });
                    }
                    if (mode === "url") {
                      setPendingFile(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }
                    if (mode === "none") {
                      setPendingFile(null);
                      if (fileRef.current) fileRef.current.value = "";
                      patch({ external_url: "" });
                      if (form.file_url) setClearExistingFile(true);
                    }
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    resourceMode === mode
                      ? "bg-[#252A58] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {resourceMode === "file" ? (
              <CmsFormField label="Archivo PDF / documento" htmlFor="doc-file">
                <input
                  id="doc-file"
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.docx,.xlsx,.pptx,.zip"
                  onChange={(e) => {
                    setPendingFile(e.target.files?.[0] ?? null);
                    setClearExistingFile(false);
                    patch({ external_url: "" });
                  }}
                  className="block w-full text-sm"
                />
                {resolvedFileUrl && !pendingFile && !clearExistingFile ? (
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                    <a
                      href={resolvedFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#35A963] underline"
                    >
                      Ver archivo actual
                    </a>
                    <button
                      type="button"
                      className="text-red-600 underline"
                      onClick={() => {
                        setClearExistingFile(true);
                        setPendingFile(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                    >
                      Quitar archivo
                    </button>
                  </div>
                ) : null}
                {clearExistingFile && !pendingFile ? (
                  <p className="mt-2 text-xs text-amber-700">El archivo se eliminará al guardar.</p>
                ) : null}
              </CmsFormField>
            ) : null}

            {resourceMode === "url" ? (
              <CmsFormField label="URL externa" htmlFor="doc-url">
                <input
                  id="doc-url"
                  value={form.external_url}
                  onChange={(e) => {
                    patch({ external_url: e.target.value });
                    if (form.file_url) setClearExistingFile(true);
                  }}
                  className={cmsInputClass}
                  placeholder="https://"
                />
              </CmsFormField>
            ) : null}

            <p className="text-xs text-slate-500">
              Use archivo o URL externa — nunca ambos. El borrador puede guardarse sin recurso.
            </p>
          </div>
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
            form.status === "published"
              ? "Este documento está publicado. Guardar no lo despublica."
              : "Los cambios se guardan como borrador."
          }
        />
      </CmsEditorLayout>

      <CmsConfirmDialog
        open={confirmDelete}
        title="Eliminar documento"
        description="¿Confirma que desea eliminar esta versión del documento?"
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { CmsMediaField } from "@/src/components/cms/editor/CmsMediaPicker";
import { CmsSaveBar } from "@/src/components/cms/editor/CmsSaveBar";
import { useCmsToast } from "@/src/components/cms/editor/CmsToast";
import { CmsLoadingState, CmsErrorState } from "@/src/components/cms/states";
import { useCmsAuth } from "@/src/lib/cms/AuthProvider";
import { CmsApiError } from "@/src/lib/cms/api";
import {
  archiveDocument,
  createDocument,
  createEnglishDocumentVersion,
  createSpanishDocumentVersion,
  deleteDocument,
  documentResourceConflict,
  getDocument,
  publishDocument,
  updateDocument,
  type DocumentWritePayload,
} from "@/src/lib/cms/editorial/documents";
import type { DocumentItem, MediaAsset } from "@/src/lib/cms/editorial/types";
import { useEditorDirty } from "@/src/lib/cms/useEditorDirty";
import { canAdd, canChange, canDelete, canPublish } from "@/src/lib/cms/permissions";
import { resolveMediaFileUrl } from "@/src/lib/mediaUrl";

const CATEGORY_OPTIONS = [
  { value: "institucional", label: "Institucional" },
  { value: "tecnicos", label: "Técnicos" },
  { value: "biblioteca", label: "Biblioteca" },
  { value: "estudios", label: "Estudios" },
];

type ResourceMode = "file" | "url" | "none";

interface DocFormState {
  language: "es" | "en";
  resource_key: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  external_url: string;
  document_date: string;
  is_featured: boolean;
  order: number;
  cover_image: number | null;
  cover_image_detail: MediaAsset | null;
  status: DocumentItem["status"];
  updated_at: string | null;
  updated_by_name: string | null;
  file_url: string | null;
  sibling_id: number | null;
  sibling_languages: string[];
}

const emptyForm = (): DocFormState => ({
  language: "es",
  resource_key: "",
  title: "",
  slug: "",
  description: "",
  category: "biblioteca",
  external_url: "",
  document_date: "",
  is_featured: false,
  order: 0,
  cover_image: null,
  cover_image_detail: null,
  status: "draft",
  updated_at: null,
  updated_by_name: null,
  file_url: null,
  sibling_id: null,
  sibling_languages: [],
});

function docToForm(item: DocumentItem): DocFormState {
  return {
    language: item.language || "es",
    resource_key: item.resource_key || "",
    title: item.title || item.title_es || item.title_en || "",
    slug: item.slug || "",
    description: item.description || item.description_es || item.description_en || "",
    category: item.category,
    external_url: item.external_url || "",
    document_date: item.document_date ?? "",
    is_featured: item.is_featured,
    order: item.order ?? 0,
    cover_image: item.cover_image,
    cover_image_detail: item.cover_image_detail,
    status: item.status,
    updated_at: item.updated_at,
    updated_by_name: item.updated_by_name,
    file_url: item.file_url,
    sibling_id: item.sibling_id ?? null,
    sibling_languages: item.sibling_languages ?? [],
  };
}

function formToPayload(
  form: DocFormState,
  opts: { clearFile?: boolean; forceDraft?: boolean } = {},
): DocumentWritePayload {
  const payload: DocumentWritePayload = {
    language: form.language,
    resource_key: form.resource_key || undefined,
    title: form.title,
    slug: form.slug || undefined,
    description: form.description,
    category: form.category,
    external_url: form.external_url,
    document_date: form.document_date || null,
    is_featured: form.is_featured,
    order: form.order,
    cover_image: form.cover_image,
  };
  if (opts.clearFile) payload.clear_file = true;
  // Never force-draft a published document on content save.
  if (opts.forceDraft && form.status !== "published") {
    payload.status = "draft";
  }
  return payload;
}

interface DocumentEditorViewProps {
  documentId?: number;
}

export function DocumentEditorView({ documentId }: DocumentEditorViewProps) {
  const router = useRouter();
  const { user } = useCmsAuth();
  const toast = useCmsToast();
  const isNew = documentId === undefined;
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<DocFormState>(emptyForm);
  const { dirty, markClean } = useEditorDirty(form);
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [clearExistingFile, setClearExistingFile] = useState(false);
  const [creatingSibling, setCreatingSibling] = useState(false);
  const [resourceMode, setResourceMode] = useState<ResourceMode>("none");

  useEffect(() => {
    if (isNew) markClean(emptyForm());
  }, [isNew, markClean]);

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const item = await getDocument(documentId);
        if (!cancelled) {
          const next = docToForm(item);
          setForm(next);
          markClean(next);
          setPendingFile(null);
          setClearExistingFile(false);
          if (item.file_url) setResourceMode("file");
          else if (item.external_url) setResourceMode("url");
          else setResourceMode("none");
        }
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isNew, documentId, markClean]);

  const patch = useCallback((partial: Partial<DocFormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  const hasActiveFile = Boolean(pendingFile || (form.file_url && !clearExistingFile));

  const persist = async (forceDraft = true): Promise<number> => {
    const switchingToUrl = resourceMode === "url" && Boolean(form.external_url.trim());
    const clearFile = Boolean(clearExistingFile || (switchingToUrl && form.file_url));
    const payload = formToPayload(form, {
      clearFile,
      forceDraft,
    });
    if (pendingFile) {
      payload.external_url = "";
    }
    const files = pendingFile ? { file: pendingFile } : {};
    if (isNew) {
      const created = await createDocument({ status: "draft", ...payload }, files);
      setPendingFile(null);
      setClearExistingFile(false);
      return created.id;
    }
    const updated = await updateDocument(documentId!, payload, files);
    setPendingFile(null);
    setClearExistingFile(false);
    return updated.id;
  };

  const handleSaveDraft = async () => {
    const conflict = documentResourceConflict({
      hasFile: hasActiveFile && resourceMode === "file",
      externalUrl: resourceMode === "url" ? form.external_url : "",
    });
    if (conflict) {
      toast.error(conflict);
      return;
    }
    setSaving(true);
    try {
      const id = await persist(true);
      toast.success("Borrador guardado.");
      if (isNew) {
        router.replace(`/cms/documentos/${id}`);
      } else {
        const refreshed = await getDocument(id);
        const next = docToForm(refreshed);
        setForm(next);
        markClean(next);
        if (refreshed.file_url) setResourceMode("file");
        else if (refreshed.external_url) setResourceMode("url");
        else setResourceMode("none");
      }
    } catch (err) {
      if (err instanceof CmsApiError) {
        const fieldKey = Object.keys(err.fieldErrors)[0];
        toast.error(fieldKey ? `${fieldKey}: ${err.fieldErrors[fieldKey]?.[0] ?? err.message}` : err.message);
      } else {
        toast.error("No se pudo guardar.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!form.title.trim()) {
      toast.error("El título es obligatorio para publicar.");
      return;
    }
    const hasResource =
      (resourceMode === "file" && hasActiveFile) ||
      (resourceMode === "url" && form.external_url.trim());
    if (!hasResource) {
      toast.error("Un documento publicado necesita archivo o URL externa.");
      return;
    }
    const conflict = documentResourceConflict({
      hasFile: hasActiveFile && resourceMode === "file",
      externalUrl: resourceMode === "url" ? form.external_url : "",
    });
    if (conflict) {
      toast.error(conflict);
      return;
    }
    setPublishing(true);
    try {
      const id = await persist(false);
      const published = await publishDocument(id);
      const next = docToForm(published);
      setForm(next);
      markClean(next);
      toast.success("Documento publicado.");
      if (isNew) router.replace(`/cms/documentos/${id}`);
    } catch (err) {
      if (err instanceof CmsApiError) {
        const fieldKey = Object.keys(err.fieldErrors)[0];
        toast.error(fieldKey ? `${fieldKey}: ${err.fieldErrors[fieldKey]?.[0] ?? err.message}` : err.message);
      } else {
        toast.error("No se pudo publicar.");
      }
    } finally {
      setPublishing(false);
    }
  };

  const handleArchive = async () => {
    if (!documentId) return;
    setArchiving(true);
    try {
      if (dirty) await persist(false);
      const archived = await archiveDocument(documentId);
      const next = docToForm(archived);
      setForm(next);
      markClean(next);
      toast.success("Documento archivado.");
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "No se pudo archivar.");
    } finally {
      setArchiving(false);
    }
  };

  const handleCreateSibling = async () => {
    if (!documentId) return;
    setCreatingSibling(true);
    try {
      const sibling =
        form.language === "es"
          ? await createEnglishDocumentVersion(documentId)
          : await createSpanishDocumentVersion(documentId);
      toast.success(
        form.language === "es"
          ? "Versión EN creada (sin copiar PDF/portada)."
          : "Versión ES creada (sin copiar PDF/portada).",
      );
      router.push(`/cms/documentos/${sibling.id}`);
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "No se pudo crear la versión.");
    } finally {
      setCreatingSibling(false);
    }
  };

  const handleDelete = async () => {
    if (!documentId) return;
    setDeleting(true);
    try {
      await deleteDocument(documentId);
      toast.success("Documento eliminado.");
      router.push("/cms/documentos");
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "No se pudo eliminar.");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) return <CmsLoadingState label="Cargando documento…" />;
  if (loadError) return <CmsErrorState onRetry={() => router.refresh()} />;

  const userCanSave = isNew ? canAdd(user, "cms", "document") : canChange(user, "cms", "document");
  const userCanPublish = canPublish(user);
  const userCanDelete = !isNew && canDelete(user, "cms", "document");
  const langLabel = form.language === "en" ? "English" : "Español";
  const otherLang = form.language === "es" ? "EN" : "ES";
  const hasSibling = Boolean(form.sibling_id);
  const resolvedFileUrl = resolveMediaFileUrl(form.file_url);

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

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
import { CmsLocaleTabs, localeField, type CmsLocale } from "@/src/components/cms/editor/CmsLocaleTabs";
import { CmsMediaField } from "@/src/components/cms/editor/CmsMediaPicker";
import { CmsSaveBar } from "@/src/components/cms/editor/CmsSaveBar";
import { useCmsToast } from "@/src/components/cms/editor/CmsToast";
import { CmsLoadingState, CmsErrorState } from "@/src/components/cms/states";
import { useCmsAuth } from "@/src/lib/cms/AuthProvider";
import { CmsApiError } from "@/src/lib/cms/api";
import {
  createDocument,
  deleteDocument,
  getDocument,
  publishDocument,
  updateDocument,
  type DocumentWritePayload,
} from "@/src/lib/cms/editorial/documents";
import type { DocumentItem, MediaAsset } from "@/src/lib/cms/editorial/types";
import { useEditorDirty } from "@/src/lib/cms/useEditorDirty";
import { canAdd, canChange, canDelete, canPublish } from "@/src/lib/cms/permissions";

const CATEGORY_OPTIONS = [
  { value: "institucional", label: "Institucional" },
  { value: "tecnicos", label: "Técnicos" },
  { value: "biblioteca", label: "Biblioteca" },
  { value: "estudios", label: "Estudios" },
];

interface DocFormState {
  title_es: string;
  title_en: string;
  description_es: string;
  description_en: string;
  category: string;
  external_url: string;
  document_date: string;
  is_featured: boolean;
  cover_image: number | null;
  cover_image_detail: MediaAsset | null;
  status: DocumentItem["status"];
  updated_at: string | null;
  updated_by_name: string | null;
  file_url: string | null;
}

const emptyForm = (): DocFormState => ({
  title_es: "",
  title_en: "",
  description_es: "",
  description_en: "",
  category: "biblioteca",
  external_url: "",
  document_date: "",
  is_featured: false,
  cover_image: null,
  cover_image_detail: null,
  status: "draft",
  updated_at: null,
  updated_by_name: null,
  file_url: null,
});

function docToForm(item: DocumentItem): DocFormState {
  return {
    title_es: item.title_es ?? "",
    title_en: item.title_en ?? "",
    description_es: item.description_es ?? "",
    description_en: item.description_en ?? "",
    category: item.category,
    external_url: item.external_url ?? "",
    document_date: item.document_date ?? "",
    is_featured: item.is_featured,
    cover_image: item.cover_image,
    cover_image_detail: item.cover_image_detail,
    status: item.status,
    updated_at: item.updated_at,
    updated_by_name: item.updated_by_name,
    file_url: item.file_url,
  };
}

function formToPayload(form: DocFormState): DocumentWritePayload {
  return {
    title_es: form.title_es,
    title_en: form.title_en,
    description_es: form.description_es,
    description_en: form.description_en,
    category: form.category,
    external_url: form.external_url,
    document_date: form.document_date || null,
    is_featured: form.is_featured,
    cover_image: form.cover_image,
    status: "draft",
  };
}

interface DocumentEditorViewProps {
  documentId?: number;
}

export function DocumentEditorView({ documentId }: DocumentEditorViewProps) {
  const router = useRouter();
  const { user } = useCmsAuth();
  const toast = useCmsToast();
  const isNew = documentId === undefined;

  const [locale, setLocale] = useState<CmsLocale>("es");
  const [form, setForm] = useState<DocFormState>(emptyForm);
  const { dirty, markClean } = useEditorDirty(form);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isNew) {
      markClean(emptyForm());
    }
  }, [isNew, markClean]);

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const item = await getDocument(documentId);
        if (!cancelled) {
          const next = docToForm(item);
          setForm(next);
          markClean(next);
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

  const persist = async (): Promise<number> => {
    const payload = formToPayload(form);
    if (isNew) {
      const created = await createDocument(payload, file ?? undefined);
      return created.id;
    }
    await updateDocument(documentId!, payload, file ?? undefined);
    return documentId!;
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const id = await persist();
      toast.success("Borrador guardado.");
      if (isNew) router.replace(`/cms/documentos/${id}`);
      else {
        const refreshed = await getDocument(id);
        const next = docToForm(refreshed);
        setForm(next);
        markClean(next);
        setFile(null);
      }
    } catch (err) {
      if (err instanceof CmsApiError) {
        const fieldKey = Object.keys(err.fieldErrors)[0];
        toast.error(fieldKey ? (err.fieldErrors[fieldKey]?.[0] ?? err.message) : err.message);
      } else {
        toast.error("No se pudo guardar.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!form.title_es.trim()) {
      toast.error("El título en español es obligatorio.");
      setLocale("es");
      return;
    }
    if (!file && !form.file_url && !form.external_url.trim()) {
      toast.error("Suba un archivo o indique una URL externa antes de publicar.");
      return;
    }
    setPublishing(true);
    try {
      const id = await persist();
      const published = await publishDocument(id);
      const next = docToForm(published);
      setForm(next);
      markClean(next);
      toast.success("Documento publicado.");
      if (isNew) router.replace(`/cms/documentos/${id}`);
    } catch (err) {
      if (err instanceof CmsApiError) {
        const fieldKey = Object.keys(err.fieldErrors)[0];
        toast.error(fieldKey ? (err.fieldErrors[fieldKey]?.[0] ?? err.message) : err.message);
      } else {
        toast.error("No se pudo publicar.");
      }
    } finally {
      setPublishing(false);
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

  const titleField = localeField("title", locale) as keyof DocFormState;
  const descField = localeField("description", locale) as keyof DocFormState;

  return (
    <>
      <CmsEditorLayout
        title={isNew ? "Nuevo documento" : "Editar documento"}
        backHref="/cms/documentos"
        dirty={dirty}
        sidebar={
          <CmsEditorSidebar
            status={form.status}
            updatedAt={form.updated_at}
            updatedBy={form.updated_by_name}
          >
            <CmsFormField label="Archivo">
              {form.file_url && !file ? (
                <a
                  href={form.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#334E88] underline"
                >
                  Ver archivo actual
                </a>
              ) : null}
              <input
                type="file"
                accept=".pdf,.docx,.xlsx,.pptx,.zip"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mt-2 w-full text-sm"
              />
            </CmsFormField>
            <CmsFormField label="URL externa (alternativa)" htmlFor="doc-url">
              <input
                id="doc-url"
                value={form.external_url}
                onChange={(e) => patch({ external_url: e.target.value })}
                className={cmsInputClass}
                placeholder="https://"
              />
            </CmsFormField>
            <CmsMediaField
              label="Imagen de portada"
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
          </CmsEditorSidebar>
        }
      >
        <CmsLocaleTabs locale={locale} onChange={setLocale} />

        <div className="mt-4 space-y-4 rounded-xl border border-[#334E88]/10 bg-white p-5">
          <CmsFormField label="Título" required htmlFor="doc-title">
            <input
              id="doc-title"
              value={form[titleField] as string}
              onChange={(e) => patch({ [titleField]: e.target.value })}
              className={cmsInputClass}
            />
          </CmsFormField>
          <CmsFormField label="Descripción" htmlFor="doc-desc">
            <textarea
              id="doc-desc"
              value={form[descField] as string}
              onChange={(e) => patch({ [descField]: e.target.value })}
              className={cmsTextareaClass}
              rows={4}
            />
          </CmsFormField>
        </div>

        <CmsSaveBar
          onSaveDraft={() => void handleSaveDraft()}
          onPublish={() => void handlePublish()}
          onDelete={() => setConfirmDelete(true)}
          saving={saving}
          publishing={publishing}
          canSave={isNew ? canAdd(user, "cms", "document") : canChange(user, "cms", "document")}
          canPublish={canPublish(user)}
          canDelete={!isNew && canDelete(user, "cms", "document")}
        />
      </CmsEditorLayout>

      <CmsConfirmDialog
        open={confirmDelete}
        title="Eliminar documento"
        description="¿Confirma que desea eliminar este documento?"
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

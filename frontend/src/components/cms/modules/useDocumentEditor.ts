"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCmsToast } from "@/src/components/cms/editor/CmsToast";
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

export const CATEGORY_OPTIONS = [
  { value: "institucional", label: "Institucional" },
  { value: "tecnicos", label: "Técnicos" },
  { value: "biblioteca", label: "Biblioteca" },
  { value: "estudios", label: "Estudios" },
];

export type ResourceMode = "file" | "url" | "none";

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

export interface DocumentEditorViewProps {
  documentId?: number;
}

export function useDocumentEditor({ documentId }: DocumentEditorViewProps) {
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

  const userCanSave = isNew ? canAdd(user, "cms", "document") : canChange(user, "cms", "document");
  const userCanPublish = canPublish(user);
  const userCanDelete = !isNew && canDelete(user, "cms", "document");
  const langLabel = form.language === "en" ? "English" : "Español";
  const otherLang = form.language === "es" ? "EN" : "ES";
  const hasSibling = Boolean(form.sibling_id);
  const resolvedFileUrl = resolveMediaFileUrl(form.file_url);

  return {
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
  };
}

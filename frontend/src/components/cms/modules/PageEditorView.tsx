"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { CmsConfirmDialog } from "@/src/components/cms/editor/CmsConfirmDialog";
import { CmsEditorLayout } from "@/src/components/cms/editor/CmsEditorLayout";
import { CmsEditorSidebar } from "@/src/components/cms/editor/CmsEditorSidebar";
import {
  cmsInputClass,
  cmsTextareaClass,
  CmsFormField,
} from "@/src/components/cms/editor/CmsFormField";
import { CmsLocaleTabs, localeField, type CmsLocale } from "@/src/components/cms/editor/CmsLocaleTabs";
import { CmsMediaField } from "@/src/components/cms/editor/CmsMediaPicker";
import { CmsRichTextEditor } from "@/src/components/cms/editor/CmsRichTextEditor";
import { CmsSaveBar } from "@/src/components/cms/editor/CmsSaveBar";
import { useCmsToast } from "@/src/components/cms/editor/CmsToast";
import { CmsLoadingState, CmsErrorState } from "@/src/components/cms/states";
import { useCmsAuth } from "@/src/lib/cms/AuthProvider";
import { CmsApiError } from "@/src/lib/cms/api";
import {
  deletePage,
  getPage,
  publishPage,
  updatePage,
  type PageWritePayload,
} from "@/src/lib/cms/editorial/pages";
import type { MediaAsset, PageItem } from "@/src/lib/cms/editorial/types";
import { canChange, canDelete, canPublish } from "@/src/lib/cms/permissions";

interface PageFormState {
  title_es: string;
  title_en: string;
  slug: string;
  content_es: string;
  content_en: string;
  excerpt_es: string;
  excerpt_en: string;
  featured_image: number | null;
  featured_image_detail: MediaAsset | null;
  seo_title_es: string;
  seo_title_en: string;
  seo_description_es: string;
  seo_description_en: string;
  status: PageItem["status"];
  is_protected: boolean;
  updated_at: string | null;
  updated_by_name: string | null;
}

function pageToForm(item: PageItem): PageFormState {
  return {
    title_es: item.title_es ?? "",
    title_en: item.title_en ?? "",
    slug: item.slug ?? "",
    content_es: item.content_es ?? "",
    content_en: item.content_en ?? "",
    excerpt_es: item.excerpt_es ?? "",
    excerpt_en: item.excerpt_en ?? "",
    featured_image: item.featured_image,
    featured_image_detail: item.featured_image_detail,
    seo_title_es: item.seo_title_es ?? "",
    seo_title_en: item.seo_title_en ?? "",
    seo_description_es: item.seo_description_es ?? "",
    seo_description_en: item.seo_description_en ?? "",
    status: item.status,
    is_protected: item.is_protected,
    updated_at: item.updated_at,
    updated_by_name: item.updated_by_name,
  };
}

function formToPayload(form: PageFormState): PageWritePayload {
  return {
    title_es: form.title_es,
    title_en: form.title_en,
    slug: form.slug,
    content_es: form.content_es,
    content_en: form.content_en,
    excerpt_es: form.excerpt_es,
    excerpt_en: form.excerpt_en,
    featured_image: form.featured_image,
    seo_title_es: form.seo_title_es,
    seo_title_en: form.seo_title_en,
    seo_description_es: form.seo_description_es,
    seo_description_en: form.seo_description_en,
    status: "draft",
  };
}

interface PageEditorViewProps {
  pageId: number;
}

export function PageEditorView({ pageId }: PageEditorViewProps) {
  const router = useRouter();
  const { user } = useCmsAuth();
  const toast = useCmsToast();

  const [locale, setLocale] = useState<CmsLocale>("es");
  const [form, setForm] = useState<PageFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const item = await getPage(pageId);
        if (!cancelled) setForm(pageToForm(item));
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pageId]);

  const patch = useCallback((partial: Partial<PageFormState>) => {
    setForm((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  const persist = async (): Promise<void> => {
    if (!form) return;
    if (!form.title_es.trim()) throw new Error("El título en español es obligatorio.");
    await updatePage(pageId, formToPayload(form));
  };

  const handleSaveDraft = async () => {
    if (!form) return;
    if (!form.title_es.trim()) {
      toast.error("El título en español es obligatorio.");
      setLocale("es");
      return;
    }
    setSaving(true);
    try {
      await persist();
      toast.success("Borrador guardado.");
      setForm(pageToForm(await getPage(pageId)));
    } catch (err) {
      toast.error(err instanceof CmsApiError || err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!form) return;
    if (!form.title_es.trim()) {
      toast.error("El título en español es obligatorio para publicar.");
      setLocale("es");
      return;
    }
    setPublishing(true);
    try {
      await persist();
      const published = await publishPage(pageId);
      setForm(pageToForm(published));
      toast.success("Página publicada.");
    } catch (err) {
      toast.error(err instanceof CmsApiError || err instanceof Error ? err.message : "No se pudo publicar.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePage(pageId);
      toast.success("Página eliminada.");
      router.push("/cms/paginas");
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "No se pudo eliminar.");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) return <CmsLoadingState label="Cargando página…" />;
  if (loadError || !form) return <CmsErrorState onRetry={() => router.refresh()} />;

  const titleField = localeField("title", locale) as keyof PageFormState;
  const contentField = localeField("content", locale) as keyof PageFormState;
  const excerptField = localeField("excerpt", locale) as keyof PageFormState;
  const seoTitleField = localeField("seo_title", locale) as keyof PageFormState;
  const seoDescField = localeField("seo_description", locale) as keyof PageFormState;

  const userCanSave = canChange(user, "cms", "page");
  const userCanPublish = canPublish(user);
  const userCanDelete = !form.is_protected && canDelete(user, "cms", "page");

  return (
    <>
      <CmsEditorLayout
        title="Editar página"
        description={form.title_es || form.title_en}
        backHref="/cms/paginas"
        sidebar={
          <CmsEditorSidebar
            status={form.status}
            updatedAt={form.updated_at}
            updatedBy={form.updated_by_name}
          >
            {form.is_protected ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#334E88]/10 px-2.5 py-0.5 text-xs font-semibold text-[#334E88]">
                <Shield className="h-3 w-3" aria-hidden />
                Página protegida
              </span>
            ) : null}
            <CmsFormField label="Slug" htmlFor="page-slug">
              <input
                id="page-slug"
                value={form.slug}
                onChange={(e) => patch({ slug: e.target.value })}
                className={cmsInputClass}
                disabled={form.is_protected}
              />
            </CmsFormField>
            <CmsMediaField
              label="Imagen destacada"
              asset={form.featured_image_detail}
              onSelect={(asset) =>
                patch({ featured_image: asset.id, featured_image_detail: asset })
              }
              onClear={() => patch({ featured_image: null, featured_image_detail: null })}
            />
          </CmsEditorSidebar>
        }
      >
        <CmsLocaleTabs locale={locale} onChange={setLocale} />

        <div className="mt-4 space-y-4 rounded-xl border border-[#334E88]/10 bg-white p-5">
          <CmsFormField label="Título" required={locale === "es"} htmlFor="page-title">
            <input
              id="page-title"
              value={form[titleField] as string}
              onChange={(e) => patch({ [titleField]: e.target.value })}
              className={cmsInputClass}
            />
          </CmsFormField>

          <CmsFormField label="Extracto" htmlFor="page-excerpt">
            <textarea
              id="page-excerpt"
              value={form[excerptField] as string}
              onChange={(e) => patch({ [excerptField]: e.target.value })}
              className={cmsTextareaClass}
              rows={3}
            />
          </CmsFormField>

          <CmsFormField label="Contenido">
            <CmsRichTextEditor
              value={form[contentField] as string}
              onChange={(html) => patch({ [contentField]: html })}
              placeholder="Escriba el contenido de la página…"
            />
          </CmsFormField>
        </div>

        <div className="mt-6 space-y-4 rounded-xl border border-[#334E88]/10 bg-white p-5">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[#252A58]/60">SEO</h3>
          <CmsFormField label="Título SEO" htmlFor="page-seo-title">
            <input
              id="page-seo-title"
              value={form[seoTitleField] as string}
              onChange={(e) => patch({ [seoTitleField]: e.target.value })}
              className={cmsInputClass}
            />
          </CmsFormField>
          <CmsFormField label="Descripción SEO" htmlFor="page-seo-desc">
            <textarea
              id="page-seo-desc"
              value={form[seoDescField] as string}
              onChange={(e) => patch({ [seoDescField]: e.target.value })}
              className={cmsTextareaClass}
              rows={3}
            />
          </CmsFormField>
        </div>

        <CmsSaveBar
          onSaveDraft={() => void handleSaveDraft()}
          onPublish={() => void handlePublish()}
          onDelete={form.is_protected ? undefined : () => setConfirmDelete(true)}
          saving={saving}
          publishing={publishing}
          canSave={userCanSave}
          canPublish={userCanPublish}
          canDelete={userCanDelete}
          statusLabel={
            form.is_protected
              ? "Esta página institucional está protegida y no puede eliminarse."
              : form.status === "published"
                ? "Esta página está publicada."
                : "Los cambios se guardan como borrador."
          }
        />
      </CmsEditorLayout>

      <CmsConfirmDialog
        open={confirmDelete}
        title="Eliminar página"
        description="¿Confirma que desea eliminar esta página?"
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

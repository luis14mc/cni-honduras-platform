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
import { NewsBlockEditor } from "@/src/components/cms/editor/NewsBlockEditor";
import { CmsSaveBar } from "@/src/components/cms/editor/CmsSaveBar";
import { useCmsToast } from "@/src/components/cms/editor/CmsToast";
import { CmsLoadingState, CmsErrorState } from "@/src/components/cms/states";
import { useCmsAuth } from "@/src/lib/cms/AuthProvider";
import { CmsApiError } from "@/src/lib/cms/api";
import {
  createNews,
  deleteNews,
  getNews,
  publishNews,
  updateNews,
  type NewsWritePayload,
} from "@/src/lib/cms/editorial/news";
import type { MediaAsset, NewsItem } from "@/src/lib/cms/editorial/types";
import {
  ensureBlocks,
  serializeBlocksForSave,
  type NewsBlock,
} from "@/src/lib/newsBlocks";
import { useEditorDirty } from "@/src/lib/cms/useEditorDirty";
import { canAdd, canChange, canDelete, canPublish } from "@/src/lib/cms/permissions";
import { slugifyFromTitle } from "@/src/lib/cms/slugify";

const CATEGORY_OPTIONS = [
  { value: "news", label: "Noticia" },
  { value: "press_release", label: "Comunicado" },
  { value: "event", label: "Evento" },
  { value: "announcement", label: "Anuncio" },
  { value: "article", label: "Artículo" },
];

interface NewsFormState {
  title_es: string;
  title_en: string;
  slug: string;
  summary_es: string;
  summary_en: string;
  content_es: string;
  content_en: string;
  content_blocks_es: NewsBlock[];
  content_blocks_en: NewsBlock[];
  category: string;
  author_name: string;
  source: string;
  external_url: string;
  is_featured: boolean;
  featured_image: number | null;
  featured_image_detail: MediaAsset | null;
  status: NewsItem["status"];
  updated_at: string | null;
  updated_by_name: string | null;
  slugManual: boolean;
}

const emptyForm = (): NewsFormState => ({
  title_es: "",
  title_en: "",
  slug: "",
  summary_es: "",
  summary_en: "",
  content_es: "",
  content_en: "",
  content_blocks_es: [],
  content_blocks_en: [],
  category: "news",
  author_name: "",
  source: "CNI",
  external_url: "",
  is_featured: false,
  featured_image: null,
  featured_image_detail: null,
  status: "draft",
  updated_at: null,
  updated_by_name: null,
  slugManual: false,
});

function newsToForm(item: NewsItem): NewsFormState {
  return {
    title_es: item.title_es ?? "",
    title_en: item.title_en ?? "",
    slug: item.slug ?? "",
    summary_es: item.summary_es ?? "",
    summary_en: item.summary_en ?? "",
    content_es: item.content_es ?? "",
    content_en: item.content_en ?? "",
    content_blocks_es: ensureBlocks(item.content_blocks_es),
    content_blocks_en: ensureBlocks(item.content_blocks_en),
    category: item.category,
    author_name: item.author_name ?? "",
    source: item.source ?? "CNI",
    external_url: item.external_url ?? "",
    is_featured: item.is_featured,
    featured_image: item.featured_image,
    featured_image_detail: item.featured_image_detail,
    status: item.status,
    updated_at: item.updated_at,
    updated_by_name: item.updated_by_name,
    slugManual: true,
  };
}

function formToPayload(form: NewsFormState, opts: { forceDraft?: boolean } = {}): NewsWritePayload {
  const payload: NewsWritePayload = {
    title_es: form.title_es,
    title_en: form.title_en,
    summary_es: form.summary_es,
    summary_en: form.summary_en,
    content_es: form.content_es,
    content_en: form.content_en,
    content_blocks_es: serializeBlocksForSave(form.content_blocks_es),
    content_blocks_en: serializeBlocksForSave(form.content_blocks_en),
    category: form.category,
    author_name: form.author_name,
    source: form.source,
    external_url: form.external_url,
    is_featured: form.is_featured,
    featured_image: form.featured_image,
  };
  if (form.slug.trim()) {
    payload.slug = form.slug.trim();
  }
  // Never force-unpublish a live article on content save.
  if (opts.forceDraft || form.status === "draft") {
    payload.status = "draft";
  }
  return payload;
}

function toastCmsError(err: unknown, fallback: string, toast: ReturnType<typeof useCmsToast>) {
  if (err instanceof CmsApiError) {
    const fieldKey = Object.keys(err.fieldErrors)[0];
    const fieldMsg = fieldKey ? err.fieldErrors[fieldKey]?.[0] : undefined;
    toast.error(fieldMsg ? `${fieldKey}: ${fieldMsg}` : err.message || fallback);
    return;
  }
  toast.error(fallback);
}

interface NewsEditorViewProps {
  newsId?: number;
}

export function NewsEditorView({ newsId }: NewsEditorViewProps) {
  const router = useRouter();
  const { user } = useCmsAuth();
  const toast = useCmsToast();
  const isNew = newsId === undefined;

  const [locale, setLocale] = useState<CmsLocale>("es");
  const [form, setForm] = useState<NewsFormState>(emptyForm);
  const { dirty, markClean } = useEditorDirty(form);
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
      setLoadError(false);
      try {
        const item = await getNews(newsId);
        if (!cancelled) {
          const next = newsToForm(item);
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
  }, [isNew, newsId, markClean]);

  const patch = useCallback((partial: Partial<NewsFormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  const onTitleEsChange = (value: string) => {
    setForm((prev) => {
      const next = { ...prev, title_es: value };
      if (!prev.slugManual) {
        next.slug = slugifyFromTitle(value);
      }
      return next;
    });
  };

  const persist = async (opts: { forceDraft?: boolean } = {}): Promise<NewsItem> => {
    const payload = formToPayload(form, opts);
    if (isNew) {
      return createNews({ ...payload, status: "draft" });
    }
    return updateNews(newsId!, payload);
  };

  const handleSaveDraft = async () => {
    if (!form.title_es.trim()) {
      toast.error("title_es: El título en español es obligatorio.");
      setLocale("es");
      return;
    }
    setSaving(true);
    try {
      const saved = await persist({ forceDraft: form.status !== "published" });
      const next = newsToForm(saved);
      setForm(next);
      markClean(next);
      toast.success(form.status === "published" ? "Cambios guardados." : "Borrador guardado.");
      if (isNew) {
        router.replace(`/cms/noticias/${saved.id}`);
      }
    } catch (err) {
      toastCmsError(err, "No se pudo guardar.", toast);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!form.title_es.trim()) {
      toast.error("title_es: El título en español es obligatorio para publicar.");
      setLocale("es");
      return;
    }
    setPublishing(true);
    try {
      // Save content without forcing draft status, then publish action.
      const saved = await persist();
      const published =
        saved.status === "published" ? saved : await publishNews(saved.id);
      const next = newsToForm(published);
      setForm(next);
      markClean(next);
      toast.success("Noticia publicada.");
      if (isNew) router.replace(`/cms/noticias/${published.id}`);
    } catch (err) {
      toastCmsError(err, "No se pudo publicar.", toast);
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!newsId) return;
    setDeleting(true);
    try {
      await deleteNews(newsId);
      toast.success("Noticia eliminada.");
      router.push("/cms/noticias");
    } catch (err) {
      toastCmsError(err, "No se pudo eliminar.", toast);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) return <CmsLoadingState label="Cargando noticia…" />;
  if (loadError) return <CmsErrorState onRetry={() => router.refresh()} />;

  const titleField = localeField("title", locale) as keyof NewsFormState;
  const summaryField = localeField("summary", locale) as keyof NewsFormState;
  const blocksField = locale === "en" ? "content_blocks_en" : "content_blocks_es";

  const userCanSave = isNew ? canAdd(user, "cms", "news") : canChange(user, "cms", "news");
  const userCanPublish = canPublish(user);
  const userCanDelete = !isNew && canDelete(user, "cms", "news");

  return (
    <>
      <CmsEditorLayout
        title={isNew ? "Nueva noticia" : "Editar noticia"}
        description={isNew ? "Complete el contenido en español e inglés." : form.title_es || form.title_en}
        backHref="/cms/noticias"
        dirty={dirty}
        sidebar={
          <CmsEditorSidebar
            status={form.status}
            updatedAt={form.updated_at}
            updatedBy={form.updated_by_name}
          >
            <CmsMediaField
              label="Imagen destacada"
              asset={form.featured_image_detail}
              onSelect={(asset) =>
                patch({ featured_image: asset.id, featured_image_detail: asset })
              }
              onClear={() => patch({ featured_image: null, featured_image_detail: null })}
            />
            <CmsFormField label="Slug" htmlFor="news-slug">
              <input
                id="news-slug"
                value={form.slug}
                onChange={(e) => patch({ slug: e.target.value, slugManual: true })}
                className={cmsInputClass}
                placeholder="se-genera-del-titulo"
              />
            </CmsFormField>
            <CmsFormField label="Categoría" htmlFor="news-category">
              <select
                id="news-category"
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
            <CmsFormField label="Autor" htmlFor="news-author">
              <input
                id="news-author"
                value={form.author_name}
                onChange={(e) => patch({ author_name: e.target.value })}
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
          </CmsEditorSidebar>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CmsLocaleTabs locale={locale} onChange={setLocale} />
        </div>

        <div className="space-y-4 rounded-xl border border-[#334E88]/10 bg-white p-5">
          <CmsFormField label="Título" required={locale === "es"} htmlFor="news-title">
            <input
              id="news-title"
              value={form[titleField] as string}
              onChange={(e) => {
                if (locale === "es") onTitleEsChange(e.target.value);
                else patch({ [titleField]: e.target.value });
              }}
              className={cmsInputClass}
              placeholder={locale === "es" ? "Título de la noticia" : "News title"}
            />
          </CmsFormField>

          <CmsFormField label="Resumen" htmlFor="news-summary">
            <textarea
              id="news-summary"
              value={form[summaryField] as string}
              onChange={(e) => patch({ [summaryField]: e.target.value })}
              className={cmsTextareaClass}
              rows={3}
            />
          </CmsFormField>

          <CmsFormField label={locale === "es" ? "Contenido (bloques ES)" : "Content (EN blocks)"}>
            <NewsBlockEditor
              blocks={form[blocksField]}
              onChange={(next) => patch({ [blocksField]: next })}
            />
          </CmsFormField>
        </div>

        <CmsSaveBar
          onSaveDraft={() => void handleSaveDraft()}
          onPublish={userCanPublish ? () => void handlePublish() : undefined}
          onDelete={() => setConfirmDelete(true)}
          saving={saving}
          publishing={publishing}
          canSave={userCanSave}
          canPublish={userCanPublish}
          canDelete={userCanDelete}
          statusLabel={
            form.status === "published"
              ? "Esta noticia está publicada. Guardar conserva el estado publicado."
              : "Los cambios se guardan como borrador."
          }
        />
      </CmsEditorLayout>

      <CmsConfirmDialog
        open={confirmDelete}
        title="Eliminar noticia"
        description="¿Confirma que desea eliminar esta noticia? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

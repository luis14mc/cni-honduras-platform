"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  createSuccessStory,
  deleteSuccessStory,
  getSuccessStory,
  publishSuccessStory,
  updateSuccessStory,
  type SuccessStoryWritePayload,
} from "@/src/lib/cms/editorial/successStories";
import type { MediaAsset, SuccessStoryItem } from "@/src/lib/cms/editorial/types";
import { useEditorDirty } from "@/src/lib/cms/useEditorDirty";
import { canAdd, canChange, canDelete, canPublish } from "@/src/lib/cms/permissions";

interface StoryFormState {
  title_es: string;
  title_en: string;
  company_name: string;
  summary_es: string;
  summary_en: string;
  content_es: string;
  content_en: string;
  country_origin: string;
  investment_amount: string;
  jobs_generated: number | null;
  testimonial_quote_es: string;
  testimonial_quote_en: string;
  testimonial_author_es: string;
  testimonial_author_en: string;
  is_featured: boolean;
  logo: number | null;
  logo_detail: MediaAsset | null;
  status: SuccessStoryItem["status"];
  updated_at: string | null;
  updated_by_name: string | null;
}

const emptyForm = (): StoryFormState => ({
  title_es: "",
  title_en: "",
  company_name: "",
  summary_es: "",
  summary_en: "",
  content_es: "",
  content_en: "",
  country_origin: "",
  investment_amount: "",
  jobs_generated: null,
  testimonial_quote_es: "",
  testimonial_quote_en: "",
  testimonial_author_es: "",
  testimonial_author_en: "",
  is_featured: false,
  logo: null,
  logo_detail: null,
  status: "draft",
  updated_at: null,
  updated_by_name: null,
});

function storyToForm(item: SuccessStoryItem): StoryFormState {
  return {
    title_es: item.title_es ?? "",
    title_en: item.title_en ?? "",
    company_name: item.company_name ?? "",
    summary_es: item.summary_es ?? "",
    summary_en: item.summary_en ?? "",
    content_es: item.content_es ?? "",
    content_en: item.content_en ?? "",
    country_origin: item.country_origin ?? "",
    investment_amount: item.investment_amount ?? "",
    jobs_generated: item.jobs_generated,
    testimonial_quote_es: item.testimonial_quote_es ?? "",
    testimonial_quote_en: item.testimonial_quote_en ?? "",
    testimonial_author_es: item.testimonial_author_es ?? "",
    testimonial_author_en: item.testimonial_author_en ?? "",
    is_featured: item.is_featured,
    logo: item.logo,
    logo_detail: item.logo_detail,
    status: item.status,
    updated_at: item.updated_at,
    updated_by_name: item.updated_by_name,
  };
}

function formToPayload(form: StoryFormState): SuccessStoryWritePayload {
  return {
    title_es: form.title_es,
    title_en: form.title_en,
    company_name: form.company_name,
    summary_es: form.summary_es,
    summary_en: form.summary_en,
    content_es: form.content_es,
    content_en: form.content_en,
    country_origin: form.country_origin,
    investment_amount: form.investment_amount,
    jobs_generated: form.jobs_generated,
    testimonial_quote_es: form.testimonial_quote_es,
    testimonial_quote_en: form.testimonial_quote_en,
    testimonial_author_es: form.testimonial_author_es,
    testimonial_author_en: form.testimonial_author_en,
    is_featured: form.is_featured,
    logo: form.logo,
    status: "draft",
  };
}

interface SuccessStoryEditorViewProps {
  storyId?: number;
}

export function SuccessStoryEditorView({ storyId }: SuccessStoryEditorViewProps) {
  const router = useRouter();
  const { user } = useCmsAuth();
  const toast = useCmsToast();
  const isNew = storyId === undefined;

  const [locale, setLocale] = useState<CmsLocale>("es");
  const [form, setForm] = useState<StoryFormState>(emptyForm);
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
      try {
        const item = await getSuccessStory(storyId);
        if (!cancelled) {
          const next = storyToForm(item);
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
  }, [isNew, storyId, markClean]);

  const patch = useCallback((partial: Partial<StoryFormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  const persist = async (): Promise<number> => {
    const payload = formToPayload(form);
    if (isNew) {
      const created = await createSuccessStory(payload);
      return created.id;
    }
    await updateSuccessStory(storyId!, payload);
    return storyId!;
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const id = await persist();
      toast.success("Borrador guardado.");
      if (isNew) router.replace(`/cms/casos-exito/${id}`);
      else {
        const next = storyToForm(await getSuccessStory(id));
        setForm(next);
        markClean(next);
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
    setPublishing(true);
    try {
      const id = await persist();
      const published = await publishSuccessStory(id);
      const next = storyToForm(published);
      setForm(next);
      markClean(next);
      toast.success("Caso de éxito publicado.");
      if (isNew) router.replace(`/cms/casos-exito/${id}`);
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
    if (!storyId) return;
    setDeleting(true);
    try {
      await deleteSuccessStory(storyId);
      toast.success("Caso eliminado.");
      router.push("/cms/casos-exito");
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "No se pudo eliminar.");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) return <CmsLoadingState label="Cargando caso de éxito…" />;
  if (loadError) return <CmsErrorState onRetry={() => router.refresh()} />;

  const titleField = localeField("title", locale) as keyof StoryFormState;
  const summaryField = localeField("summary", locale) as keyof StoryFormState;
  const contentField = localeField("content", locale) as keyof StoryFormState;
  const quoteField = localeField("testimonial_quote", locale) as keyof StoryFormState;
  const authorField = localeField("testimonial_author", locale) as keyof StoryFormState;

  return (
    <>
      <CmsEditorLayout
        title={isNew ? "Nuevo caso de éxito" : "Editar caso de éxito"}
        backHref="/cms/casos-exito"
        dirty={dirty}
        sidebar={
          <CmsEditorSidebar
            status={form.status}
            updatedAt={form.updated_at}
            updatedBy={form.updated_by_name}
          >
            <CmsMediaField
              label="Logo / imagen"
              asset={form.logo_detail}
              onSelect={(asset) => patch({ logo: asset.id, logo_detail: asset })}
              onClear={() => patch({ logo: null, logo_detail: null })}
            />
            <CmsFormField label="Empresa" htmlFor="story-company">
              <input
                id="story-company"
                value={form.company_name}
                onChange={(e) => patch({ company_name: e.target.value })}
                className={cmsInputClass}
              />
            </CmsFormField>
            <CmsFormField label="País de origen" htmlFor="story-country">
              <input
                id="story-country"
                value={form.country_origin}
                onChange={(e) => patch({ country_origin: e.target.value })}
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
          </CmsEditorSidebar>
        }
      >
        <CmsLocaleTabs locale={locale} onChange={setLocale} />

        <div className="mt-4 space-y-4 rounded-xl border border-[#334E88]/10 bg-white p-5">
          <CmsFormField label="Título" required htmlFor="story-title">
            <input
              id="story-title"
              value={form[titleField] as string}
              onChange={(e) => patch({ [titleField]: e.target.value })}
              className={cmsInputClass}
            />
          </CmsFormField>
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
          <CmsFormField label="Testimonio" htmlFor="story-quote">
            <textarea
              id="story-quote"
              value={form[quoteField] as string}
              onChange={(e) => patch({ [quoteField]: e.target.value })}
              className={cmsTextareaClass}
              rows={2}
            />
          </CmsFormField>
          <CmsFormField label="Autor del testimonio" htmlFor="story-author">
            <input
              id="story-author"
              value={form[authorField] as string}
              onChange={(e) => patch({ [authorField]: e.target.value })}
              className={cmsInputClass}
            />
          </CmsFormField>
        </div>

        <CmsSaveBar
          onSaveDraft={() => void handleSaveDraft()}
          onPublish={() => void handlePublish()}
          onDelete={() => setConfirmDelete(true)}
          saving={saving}
          publishing={publishing}
          canSave={
            isNew
              ? canAdd(user, "investment", "successstory")
              : canChange(user, "investment", "successstory")
          }
          canPublish={canPublish(user)}
          canDelete={!isNew && canDelete(user, "investment", "successstory")}
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

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { localeField, type CmsLocale } from "@/src/components/cms/editor/CmsLocaleTabs";
import { useCmsToast } from "@/src/components/cms/editor/CmsToast";
import { useCmsAuth } from "@/src/lib/cms/AuthProvider";
import { CmsApiError } from "@/src/lib/cms/api";
import { listSectors } from "@/src/lib/cms/editorial/sectors";
import {
  archiveSuccessStory,
  createSuccessStory,
  deleteSuccessStory,
  getSuccessStory,
  publishSuccessStory,
  successStoryFormToPayload,
  updateSuccessStory,
} from "@/src/lib/cms/editorial/successStories";
import type { MediaAsset, SectorItem, SuccessStoryItem } from "@/src/lib/cms/editorial/types";
import { useEditorDirty } from "@/src/lib/cms/useEditorDirty";
import { canAdd, canChange } from "@/src/lib/cms/permissions";

export interface StoryFormState {
  title_es: string;
  title_en: string;
  slug: string;
  company_name: string;
  sector: number | null;
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
  featured_image: number | null;
  featured_image_detail: MediaAsset | null;
  person_photo: number | null;
  person_photo_detail: MediaAsset | null;
  person_name: string;
  person_role: string;
  status: SuccessStoryItem["status"];
  updated_at: string | null;
  updated_by_name: string | null;
}

const emptyForm = (): StoryFormState => ({
  title_es: "",
  title_en: "",
  slug: "",
  company_name: "",
  sector: null,
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
  featured_image: null,
  featured_image_detail: null,
  person_photo: null,
  person_photo_detail: null,
  person_name: "",
  person_role: "",
  status: "draft",
  updated_at: null,
  updated_by_name: null,
});

function storyToForm(item: SuccessStoryItem): StoryFormState {
  return {
    title_es: item.title_es ?? "",
    title_en: item.title_en ?? "",
    slug: item.slug ?? "",
    company_name: item.company_name ?? "",
    sector: item.sector,
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
    featured_image: item.featured_image,
    featured_image_detail: item.featured_image_detail,
    person_photo: item.person_photo,
    person_photo_detail: item.person_photo_detail,
    person_name: item.person_name ?? "",
    person_role: item.person_role ?? "",
    status: item.status,
    updated_at: item.updated_at,
    updated_by_name: item.updated_by_name,
  };
}

/** Never force draft on published stories — publish is a separate action. */
export function formToPayload(form: StoryFormState) {
  return successStoryFormToPayload(form);
}

function fieldErrorMessage(err: CmsApiError): string {
  const fieldKey = Object.keys(err.fieldErrors)[0];
  if (!fieldKey) return err.message;
  return `${fieldKey}: ${err.fieldErrors[fieldKey]?.[0] ?? err.message}`;
}

export interface SuccessStoryEditorViewProps {
  storyId?: number;
}

export function useSuccessStoryEditor({ storyId }: SuccessStoryEditorViewProps) {
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
  const [archiving, setArchiving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sectors, setSectors] = useState<SectorItem[]>([]);

  useEffect(() => {
    if (isNew) {
      markClean(emptyForm());
    }
  }, [isNew, markClean]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listSectors({ page_size: 100 });
        if (!cancelled) setSectors(data.results);
      } catch {
        /* sector picker optional if list fails */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
      toast.success(
        form.status === "published" ? "Cambios guardados (sigue publicado)." : "Borrador guardado.",
      );
      if (isNew) router.replace(`/cms/casos-exito/${id}`);
      else {
        const next = storyToForm(await getSuccessStory(id));
        setForm(next);
        markClean(next);
      }
    } catch (err) {
      toast.error(err instanceof CmsApiError ? fieldErrorMessage(err) : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!form.title_es.trim()) {
      toast.error("title_es: El título en español es obligatorio.");
      setLocale("es");
      return;
    }
    if (!form.summary_es.trim() && !form.content_es.trim()) {
      toast.error("content: Indique un resumen o contenido mínimo para publicar.");
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
      toast.error(err instanceof CmsApiError ? fieldErrorMessage(err) : "No se pudo publicar.");
    } finally {
      setPublishing(false);
    }
  };

  const handleArchive = async () => {
    if (!storyId) return;
    setArchiving(true);
    try {
      if (dirty) await persist();
      const archived = await archiveSuccessStory(storyId);
      const next = storyToForm(archived);
      setForm(next);
      markClean(next);
      toast.success("Caso archivado.");
    } catch (err) {
      toast.error(err instanceof CmsApiError ? fieldErrorMessage(err) : "No se pudo archivar.");
    } finally {
      setArchiving(false);
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

  const titleField = localeField("title", locale) as keyof StoryFormState;
  const summaryField = localeField("summary", locale) as keyof StoryFormState;
  const contentField = localeField("content", locale) as keyof StoryFormState;
  const quoteField = localeField("testimonial_quote", locale) as keyof StoryFormState;
  const authorField = localeField("testimonial_author", locale) as keyof StoryFormState;
  const userCanSave = isNew
    ? canAdd(user, "investment", "successstory")
    : canChange(user, "investment", "successstory");

  return {
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
  };
}

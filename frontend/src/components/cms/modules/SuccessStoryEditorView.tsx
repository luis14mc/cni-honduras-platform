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
import { CmsRichTextEditor } from "@/src/components/cms/editor/CmsRichTextEditor";
import { CmsSaveBar } from "@/src/components/cms/editor/CmsSaveBar";
import { useCmsToast } from "@/src/components/cms/editor/CmsToast";
import { CmsLoadingState, CmsErrorState } from "@/src/components/cms/states";
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
import { canAdd, canChange, canDelete, canPublish } from "@/src/lib/cms/permissions";

interface StoryFormState {
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

  if (loading) return <CmsLoadingState label="Cargando caso de éxito…" />;
  if (loadError) return <CmsErrorState onRetry={() => router.refresh()} />;

  const titleField = localeField("title", locale) as keyof StoryFormState;
  const summaryField = localeField("summary", locale) as keyof StoryFormState;
  const contentField = localeField("content", locale) as keyof StoryFormState;
  const quoteField = localeField("testimonial_quote", locale) as keyof StoryFormState;
  const authorField = localeField("testimonial_author", locale) as keyof StoryFormState;
  const userCanSave = isNew
    ? canAdd(user, "investment", "successstory")
    : canChange(user, "investment", "successstory");

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

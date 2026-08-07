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
  createBanner,
  deleteBanner,
  getBanner,
  publishBanner,
  updateBanner,
  type BannerWritePayload,
} from "@/src/lib/cms/editorial/banners";
import type { BannerItem, MediaAsset } from "@/src/lib/cms/editorial/types";
import { canAdd, canChange, canDelete, canPublish } from "@/src/lib/cms/permissions";

const PLACEMENT_OPTIONS = [
  { value: "site_top", label: "Barra superior global" },
  { value: "home_hero", label: "Hero del home" },
  { value: "footer", label: "Footer" },
];

interface BannerFormState {
  placement: string;
  title_es: string;
  title_en: string;
  body_es: string;
  body_en: string;
  cta_label_es: string;
  cta_label_en: string;
  link_url: string;
  link_external: boolean;
  dismissible: boolean;
  priority: number;
  background_color: string;
  text_color: string;
  image: number | null;
  image_detail: MediaAsset | null;
  status: BannerItem["status"];
  updated_at: string | null;
  updated_by_name: string | null;
}

const emptyForm = (): BannerFormState => ({
  placement: "site_top",
  title_es: "",
  title_en: "",
  body_es: "",
  body_en: "",
  cta_label_es: "",
  cta_label_en: "",
  link_url: "",
  link_external: false,
  dismissible: true,
  priority: 0,
  background_color: "",
  text_color: "",
  image: null,
  image_detail: null,
  status: "draft",
  updated_at: null,
  updated_by_name: null,
});

function bannerToForm(item: BannerItem): BannerFormState {
  return {
    placement: item.placement,
    title_es: item.title_es ?? "",
    title_en: item.title_en ?? "",
    body_es: item.body_es ?? "",
    body_en: item.body_en ?? "",
    cta_label_es: item.cta_label_es ?? "",
    cta_label_en: item.cta_label_en ?? "",
    link_url: item.link_url ?? "",
    link_external: item.link_external,
    dismissible: item.dismissible,
    priority: item.priority,
    background_color: item.background_color ?? "",
    text_color: item.text_color ?? "",
    image: item.image,
    image_detail: item.image_detail,
    status: item.status,
    updated_at: item.updated_at,
    updated_by_name: item.updated_by_name,
  };
}

function formToPayload(form: BannerFormState): BannerWritePayload {
  return {
    placement: form.placement,
    title_es: form.title_es,
    title_en: form.title_en,
    body_es: form.body_es,
    body_en: form.body_en,
    cta_label_es: form.cta_label_es,
    cta_label_en: form.cta_label_en,
    link_url: form.link_url,
    link_external: form.link_external,
    dismissible: form.dismissible,
    priority: form.priority,
    background_color: form.background_color,
    text_color: form.text_color,
    image: form.image,
    status: "draft",
  };
}

interface BannerEditorViewProps {
  bannerId?: number;
}

export function BannerEditorView({ bannerId }: BannerEditorViewProps) {
  const router = useRouter();
  const { user } = useCmsAuth();
  const toast = useCmsToast();
  const isNew = bannerId === undefined;

  const [locale, setLocale] = useState<CmsLocale>("es");
  const [form, setForm] = useState<BannerFormState>(emptyForm);
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const item = await getBanner(bannerId);
        if (!cancelled) setForm(bannerToForm(item));
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isNew, bannerId]);

  const patch = useCallback((partial: Partial<BannerFormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  const persist = async (): Promise<number> => {
    const payload = formToPayload(form);
    if (isNew) {
      const created = await createBanner(payload);
      return created.id;
    }
    await updateBanner(bannerId!, payload);
    return bannerId!;
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const id = await persist();
      toast.success("Borrador guardado.");
      if (isNew) router.replace(`/cms/banners/${id}`);
      else setForm(bannerToForm(await getBanner(id)));
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "No se pudo guardar.");
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
      const published = await publishBanner(id);
      setForm(bannerToForm(published));
      toast.success("Banner publicado.");
      if (isNew) router.replace(`/cms/banners/${id}`);
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "No se pudo publicar.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!bannerId) return;
    setDeleting(true);
    try {
      await deleteBanner(bannerId);
      toast.success("Banner eliminado.");
      router.push("/cms/banners");
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "No se pudo eliminar.");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) return <CmsLoadingState label="Cargando banner…" />;
  if (loadError) return <CmsErrorState onRetry={() => router.refresh()} />;

  const titleField = localeField("title", locale) as keyof BannerFormState;
  const bodyField = localeField("body", locale) as keyof BannerFormState;
  const ctaField = localeField("cta_label", locale) as keyof BannerFormState;

  return (
    <>
      <CmsEditorLayout
        title={isNew ? "Nuevo banner" : "Editar banner"}
        backHref="/cms/banners"
        sidebar={
          <CmsEditorSidebar
            status={form.status}
            updatedAt={form.updated_at}
            updatedBy={form.updated_by_name}
          >
            <CmsFormField label="Ubicación" htmlFor="banner-placement">
              <select
                id="banner-placement"
                value={form.placement}
                onChange={(e) => patch({ placement: e.target.value })}
                className={cmsSelectClass}
              >
                {PLACEMENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </CmsFormField>
            <CmsMediaField
              label="Imagen"
              asset={form.image_detail}
              onSelect={(asset) => patch({ image: asset.id, image_detail: asset })}
              onClear={() => patch({ image: null, image_detail: null })}
            />
            <CmsFormField label="Prioridad" htmlFor="banner-priority">
              <input
                id="banner-priority"
                type="number"
                value={form.priority}
                onChange={(e) => patch({ priority: Number(e.target.value) })}
                className={cmsInputClass}
              />
            </CmsFormField>
            <CmsFormField label="URL del enlace" htmlFor="banner-link">
              <input
                id="banner-link"
                value={form.link_url}
                onChange={(e) => patch({ link_url: e.target.value })}
                className={cmsInputClass}
              />
            </CmsFormField>
          </CmsEditorSidebar>
        }
      >
        <CmsLocaleTabs locale={locale} onChange={setLocale} />

        <div className="mt-4 space-y-4 rounded-xl border border-[#334E88]/10 bg-white p-5">
          <CmsFormField label="Título" required htmlFor="banner-title">
            <input
              id="banner-title"
              value={form[titleField] as string}
              onChange={(e) => patch({ [titleField]: e.target.value })}
              className={cmsInputClass}
            />
          </CmsFormField>
          <CmsFormField label="Cuerpo" htmlFor="banner-body">
            <textarea
              id="banner-body"
              value={form[bodyField] as string}
              onChange={(e) => patch({ [bodyField]: e.target.value })}
              className={cmsTextareaClass}
              rows={3}
            />
          </CmsFormField>
          <CmsFormField label="Texto del botón (CTA)" htmlFor="banner-cta">
            <input
              id="banner-cta"
              value={form[ctaField] as string}
              onChange={(e) => patch({ [ctaField]: e.target.value })}
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
          canSave={isNew ? canAdd(user, "cms", "sitebanner") : canChange(user, "cms", "sitebanner")}
          canPublish={canPublish(user)}
          canDelete={!isNew && canDelete(user, "cms", "sitebanner")}
        />
      </CmsEditorLayout>

      <CmsConfirmDialog
        open={confirmDelete}
        title="Eliminar banner"
        description="¿Confirma que desea eliminar este banner?"
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

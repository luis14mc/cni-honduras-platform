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
import { CmsSaveBar } from "@/src/components/cms/editor/CmsSaveBar";
import { useCmsToast } from "@/src/components/cms/editor/CmsToast";
import { CmsLoadingState, CmsErrorState } from "@/src/components/cms/states";
import { useCmsAuth } from "@/src/lib/cms/AuthProvider";
import { CmsApiError } from "@/src/lib/cms/api";
import {
  activateSector,
  createSector,
  deactivateSector,
  deleteSector,
  getSector,
  updateSector,
  type SectorWritePayload,
} from "@/src/lib/cms/editorial/sectors";
import type { SectorItem } from "@/src/lib/cms/editorial/types";
import { canAdd, canChange, canDelete } from "@/src/lib/cms/permissions";
import { cn } from "@/src/lib/utils";

interface SectorFormState {
  name_es: string;
  name_en: string;
  short_description_es: string;
  short_description_en: string;
  description_es: string;
  description_en: string;
  slug: string;
  icon: string;
  color_hex: string;
  order: number;
  is_featured: boolean;
  is_active: boolean;
  image_url: string | null;
  updated_at: string | null;
}

const emptyForm = (): SectorFormState => ({
  name_es: "",
  name_en: "",
  short_description_es: "",
  short_description_en: "",
  description_es: "",
  description_en: "",
  slug: "",
  icon: "",
  color_hex: "#334E88",
  order: 0,
  is_featured: false,
  is_active: true,
  image_url: null,
  updated_at: null,
});

function sectorToForm(item: SectorItem): SectorFormState {
  return {
    name_es: item.name_es ?? "",
    name_en: item.name_en ?? "",
    short_description_es: item.short_description_es ?? "",
    short_description_en: item.short_description_en ?? "",
    description_es: item.description_es ?? "",
    description_en: item.description_en ?? "",
    slug: item.slug ?? "",
    icon: item.icon ?? "",
    color_hex: item.color_hex || "#334E88",
    order: item.order ?? 0,
    is_featured: item.is_featured,
    is_active: item.is_active,
    image_url: item.image_url,
    updated_at: item.updated_at,
  };
}

function formToPayload(form: SectorFormState): SectorWritePayload {
  return {
    name_es: form.name_es,
    name_en: form.name_en,
    short_description_es: form.short_description_es,
    short_description_en: form.short_description_en,
    description_es: form.description_es,
    description_en: form.description_en,
    slug: form.slug,
    icon: form.icon,
    color_hex: form.color_hex,
    order: form.order,
    is_featured: form.is_featured,
    is_active: form.is_active,
  };
}

interface SectorEditorViewProps {
  sectorId?: number;
}

export function SectorEditorView({ sectorId }: SectorEditorViewProps) {
  const router = useRouter();
  const { user } = useCmsAuth();
  const toast = useCmsToast();
  const isNew = sectorId === undefined;

  const [locale, setLocale] = useState<CmsLocale>("es");
  const [form, setForm] = useState<SectorFormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const item = await getSector(sectorId);
        if (!cancelled) setForm(sectorToForm(item));
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isNew, sectorId]);

  const patch = useCallback((partial: Partial<SectorFormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  const persist = async (): Promise<number> => {
    if (!form.name_es.trim()) {
      throw new Error("El nombre en español es obligatorio.");
    }
    const payload = formToPayload(form);
    if (isNew) {
      const created = await createSector(payload, imageFile ?? undefined);
      return created.id;
    }
    await updateSector(sectorId!, payload, imageFile ?? undefined);
    return sectorId!;
  };

  const handleSave = async () => {
    if (!form.name_es.trim()) {
      toast.error("El nombre en español es obligatorio.");
      setLocale("es");
      return;
    }
    setSaving(true);
    try {
      const id = await persist();
      toast.success("Sector guardado.");
      if (isNew) {
        router.replace(`/cms/sectores/${id}`);
      } else {
        const refreshed = await getSector(id);
        setForm(sectorToForm(refreshed));
        setImageFile(null);
      }
    } catch (err) {
      toast.error(err instanceof CmsApiError || err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!sectorId) return;
    setTogglingActive(true);
    try {
      const updated = form.is_active
        ? await deactivateSector(sectorId)
        : await activateSector(sectorId);
      setForm(sectorToForm(updated));
      toast.success(form.is_active ? "Sector desactivado." : "Sector activado.");
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "No se pudo cambiar el estado.");
    } finally {
      setTogglingActive(false);
    }
  };

  const handleDelete = async () => {
    if (!sectorId) return;
    setDeleting(true);
    try {
      await deleteSector(sectorId);
      toast.success("Sector eliminado.");
      router.push("/cms/sectores");
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "No se pudo eliminar.");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) return <CmsLoadingState label="Cargando sector…" />;
  if (loadError) return <CmsErrorState onRetry={() => router.refresh()} />;

  const nameField = localeField("name", locale) as keyof SectorFormState;
  const shortDescField = localeField("short_description", locale) as keyof SectorFormState;
  const descField = localeField("description", locale) as keyof SectorFormState;

  const userCanSave = isNew ? canAdd(user, "investment", "sector") : canChange(user, "investment", "sector");
  const userCanDelete = !isNew && canDelete(user, "investment", "sector");
  const userCanToggle = !isNew && canChange(user, "investment", "sector");

  return (
    <>
      <CmsEditorLayout
        title={isNew ? "Nuevo sector" : "Editar sector"}
        description={isNew ? "Complete la información del sector en español e inglés." : form.name_es || form.name_en}
        backHref="/cms/sectores"
        sidebar={
          <CmsEditorSidebar updatedAt={form.updated_at}>
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-[#252A58]/50">
                Estado
              </p>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  form.is_active
                    ? "bg-[#32B372]/15 text-[#1a7a4a]"
                    : "bg-[#252A58]/10 text-[#252A58]/70",
                )}
              >
                {form.is_active ? "Activo" : "Inactivo"}
              </span>
            </div>

            <CmsFormField label="Slug" htmlFor="sector-slug">
              <input
                id="sector-slug"
                value={form.slug}
                onChange={(e) => patch({ slug: e.target.value })}
                className={cmsInputClass}
                placeholder="sector-ejemplo"
              />
            </CmsFormField>

            <CmsFormField label="Icono" htmlFor="sector-icon">
              <input
                id="sector-icon"
                value={form.icon}
                onChange={(e) => patch({ icon: e.target.value })}
                className={cmsInputClass}
                placeholder="factory"
              />
            </CmsFormField>

            <CmsFormField label="Color" htmlFor="sector-color">
              <div className="flex items-center gap-2">
                <input
                  id="sector-color"
                  type="color"
                  value={form.color_hex}
                  onChange={(e) => patch({ color_hex: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded border border-[#334E88]/20"
                />
                <input
                  value={form.color_hex}
                  onChange={(e) => patch({ color_hex: e.target.value })}
                  className={cmsInputClass}
                />
              </div>
            </CmsFormField>

            <CmsFormField label="Orden" htmlFor="sector-order">
              <input
                id="sector-order"
                type="number"
                min={0}
                value={form.order}
                onChange={(e) => patch({ order: Number(e.target.value) || 0 })}
                className={cmsInputClass}
              />
            </CmsFormField>

            <CmsFormField label="Imagen">
              {form.image_url && !imageFile ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.image_url}
                  alt=""
                  className="mb-2 h-24 w-full rounded-lg object-cover"
                />
              ) : null}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm"
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

            {userCanToggle ? (
              <button
                type="button"
                onClick={() => void handleToggleActive()}
                disabled={togglingActive || saving}
                className="w-full rounded-lg border border-[#334E88]/30 px-3 py-2 text-sm font-semibold text-[#334E88] transition hover:bg-[#334E88]/5 disabled:opacity-50"
              >
                {form.is_active ? "Desactivar sector" : "Activar sector"}
              </button>
            ) : null}
          </CmsEditorSidebar>
        }
      >
        <CmsLocaleTabs locale={locale} onChange={setLocale} />

        <div className="mt-4 space-y-4 rounded-xl border border-[#334E88]/10 bg-white p-5">
          <CmsFormField label="Nombre" required={locale === "es"} htmlFor="sector-name">
            <input
              id="sector-name"
              value={form[nameField] as string}
              onChange={(e) => patch({ [nameField]: e.target.value })}
              className={cmsInputClass}
            />
          </CmsFormField>

          <CmsFormField label="Descripción corta" htmlFor="sector-short-desc">
            <textarea
              id="sector-short-desc"
              value={form[shortDescField] as string}
              onChange={(e) => patch({ [shortDescField]: e.target.value })}
              className={cmsTextareaClass}
              rows={2}
            />
          </CmsFormField>

          <CmsFormField label="Descripción" htmlFor="sector-desc">
            <textarea
              id="sector-desc"
              value={form[descField] as string}
              onChange={(e) => patch({ [descField]: e.target.value })}
              className={cmsTextareaClass}
              rows={5}
            />
          </CmsFormField>
        </div>

        <CmsSaveBar
          onSaveDraft={() => void handleSave()}
          onDelete={() => setConfirmDelete(true)}
          saving={saving}
          canSave={userCanSave}
          canDelete={userCanDelete}
          statusLabel="Los cambios se guardan al pulsar Guardar."
        />
      </CmsEditorLayout>

      <CmsConfirmDialog
        open={confirmDelete}
        title="Eliminar sector"
        description="¿Confirma que desea eliminar este sector? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

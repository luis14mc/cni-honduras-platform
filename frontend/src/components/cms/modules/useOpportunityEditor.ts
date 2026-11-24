"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { localeField, type CmsLocale } from "@/src/components/cms/editor/CmsLocaleTabs";
import { useCmsToast } from "@/src/components/cms/editor/CmsToast";
import { useCmsAuth } from "@/src/lib/cms/AuthProvider";
import { CmsApiError } from "@/src/lib/cms/api";
import {
  archiveOpportunity,
  createOpportunity,
  deleteOpportunity,
  emptyOpportunityForm,
  getOpportunity,
  opportunityFormToPayload,
  opportunityToForm,
  publishOpportunity,
  updateOpportunity,
  type OpportunityFormState,
} from "@/src/lib/cms/editorial/opportunities";
import { listSectors } from "@/src/lib/cms/editorial/sectors";
import type { OpportunityLifecycleStatus, SectorItem } from "@/src/lib/cms/editorial/types";
import { useEditorDirty } from "@/src/lib/cms/useEditorDirty";
import { canAdd, canChange, canDelete, canPublish } from "@/src/lib/cms/permissions";

export const LIFECYCLE_OPTIONS: { value: OpportunityLifecycleStatus; label: string }[] = [
  { value: "open", label: "Abierta" },
  { value: "in_progress", label: "En progreso" },
  { value: "closed", label: "Cerrada" },
];

function fieldErrorMessage(err: CmsApiError): string {
  const fields = err.fieldErrors;
  if (fields && Object.keys(fields).length) {
    return Object.entries(fields)
      .map(([k, v]) => `${k}: ${(v || []).join(" ")}`)
      .join(" · ");
  }
  return err.message;
}

export interface OpportunityEditorViewProps {
  opportunityId?: number;
}

export function useOpportunityEditor({ opportunityId }: OpportunityEditorViewProps) {
  const router = useRouter();
  const { user } = useCmsAuth();
  const toast = useCmsToast();
  const isNew = opportunityId == null;
  const [oppId, setOppId] = useState<number | undefined>(opportunityId);
  const [form, setForm] = useState<OpportunityFormState>(emptyOpportunityForm);
  const [locale, setLocale] = useState<CmsLocale>("es");
  const [sectors, setSectors] = useState<SectorItem[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { dirty, markClean } = useEditorDirty(form);

  const patch = useCallback((partial: Partial<OpportunityFormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  useEffect(() => {
    listSectors({ page_size: 200 })
      .then((data) => setSectors(data.results))
      .catch(() => setSectors([]));
  }, []);

  useEffect(() => {
    if (isNew || opportunityId == null) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const item = await getOpportunity(opportunityId);
        if (cancelled) return;
        const next = opportunityToForm(item);
        setForm(next);
        markClean(next);
        setOppId(item.id);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isNew, opportunityId, markClean]);

  const persist = async (): Promise<number> => {
    const payload = opportunityFormToPayload(form);
    if (oppId) {
      const updated = await updateOpportunity(oppId, payload);
      return updated.id;
    }
    const created = await createOpportunity(payload);
    setOppId(created.id);
    return created.id;
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const id = await persist();
      toast.success(
        form.status === "published" ? "Cambios guardados (sigue publicada)." : "Borrador guardado.",
      );
      if (isNew) router.replace(`/cms/oportunidades/${id}`);
      else {
        const next = opportunityToForm(await getOpportunity(id));
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
    if (!form.code.trim()) {
      toast.error("code: El código es obligatorio para publicar.");
      return;
    }
    if (!form.sector) {
      toast.error("sector: El sector es obligatorio para publicar.");
      return;
    }
    if (!form.title_es.trim()) {
      toast.error("title_es: El título en español es obligatorio para publicar.");
      setLocale("es");
      return;
    }
    if (!form.description_es.trim()) {
      toast.error("description_es: La descripción en español es obligatoria para publicar.");
      setLocale("es");
      return;
    }
    setPublishing(true);
    try {
      const id = await persist();
      const published = await publishOpportunity(id);
      const next = opportunityToForm(published);
      setForm(next);
      markClean(next);
      toast.success("Oportunidad publicada.");
      if (isNew) router.replace(`/cms/oportunidades/${id}`);
    } catch (err) {
      toast.error(err instanceof CmsApiError ? fieldErrorMessage(err) : "No se pudo publicar.");
    } finally {
      setPublishing(false);
    }
  };

  const handleArchive = async () => {
    if (!oppId) return;
    setArchiving(true);
    try {
      if (dirty) await persist();
      const archived = await archiveOpportunity(oppId);
      const next = opportunityToForm(archived);
      setForm(next);
      markClean(next);
      toast.success("Oportunidad archivada.");
    } catch (err) {
      toast.error(err instanceof CmsApiError ? fieldErrorMessage(err) : "No se pudo archivar.");
    } finally {
      setArchiving(false);
    }
  };

  const handleDelete = async () => {
    if (!oppId) return;
    setDeleting(true);
    try {
      await deleteOpportunity(oppId);
      toast.success("Oportunidad eliminada.");
      router.push("/cms/oportunidades");
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "No se pudo eliminar.");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const titleField = localeField("title", locale) as keyof OpportunityFormState;
  const summaryField = localeField("summary", locale) as keyof OpportunityFormState;
  const descriptionField = localeField("description", locale) as keyof OpportunityFormState;
  const targetField = localeField("target_customer", locale) as keyof OpportunityFormState;
  const marketField = localeField("market_demand", locale) as keyof OpportunityFormState;
  const valueField = localeField("value_proposition", locale) as keyof OpportunityFormState;

  const userCanSave = isNew
    ? canAdd(user, "investment", "investmentopportunity")
    : canChange(user, "investment", "investmentopportunity");
  const userCanPublish = canPublish(user) && userCanSave;
  const userCanDelete = !isNew && canDelete(user, "investment", "investmentopportunity");

  return {
    router,
    isNew,
    form,
    locale,
    setLocale,
    sectors,
    loading,
    loadError,
    saving,
    publishing,
    archiving,
    deleting,
    confirmDelete,
    setConfirmDelete,
    dirty,
    patch,
    handleSaveDraft,
    handlePublish,
    handleArchive,
    handleDelete,
    titleField,
    summaryField,
    descriptionField,
    targetField,
    marketField,
    valueField,
    userCanSave,
    userCanPublish,
    userCanDelete
  };
}

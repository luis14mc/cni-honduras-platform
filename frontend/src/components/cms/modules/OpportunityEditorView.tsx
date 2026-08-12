"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
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
import { CmsSaveBar } from "@/src/components/cms/editor/CmsSaveBar";
import { useCmsToast } from "@/src/components/cms/editor/CmsToast";
import { CmsLoadingState, CmsErrorState } from "@/src/components/cms/states";
import { useCmsAuth } from "@/src/lib/cms/AuthProvider";
import { CmsApiError } from "@/src/lib/cms/api";
import {
  archiveOpportunity,
  createOpportunity,
  deleteOpportunity,
  emptyFundUse,
  emptyMetric,
  emptyOpportunityForm,
  getOpportunity,
  opportunityFormToPayload,
  opportunityToForm,
  publishOpportunity,
  reorderList,
  updateOpportunity,
  type OpportunityFormState,
} from "@/src/lib/cms/editorial/opportunities";
import { listSectors } from "@/src/lib/cms/editorial/sectors";
import type { OpportunityLifecycleStatus, SectorItem } from "@/src/lib/cms/editorial/types";
import { useEditorDirty } from "@/src/lib/cms/useEditorDirty";
import { canAdd, canChange, canDelete, canPublish } from "@/src/lib/cms/permissions";

const LIFECYCLE_OPTIONS: { value: OpportunityLifecycleStatus; label: string }[] = [
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

interface OpportunityEditorViewProps {
  opportunityId?: number;
}

export function OpportunityEditorView({ opportunityId }: OpportunityEditorViewProps) {
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

  if (loading) return <CmsLoadingState label="Cargando oportunidad…" />;
  if (loadError) return <CmsErrorState onRetry={() => router.refresh()} />;

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

  return (
    <>
      <CmsEditorLayout
        title={isNew ? "Nueva oportunidad" : "Editar oportunidad"}
        description={form.code || form.title_es || undefined}
        backHref="/cms/oportunidades"
        dirty={dirty}
        sidebar={
          <CmsEditorSidebar
            status={form.status}
            updatedAt={form.updated_at}
            updatedBy={form.updated_by_name}
          >
            <CmsFormField label="Estado del deal" htmlFor="opp-lifecycle">
              <select
                id="opp-lifecycle"
                value={form.lifecycle_status}
                onChange={(e) =>
                  patch({ lifecycle_status: e.target.value as OpportunityLifecycleStatus })
                }
                className={cmsSelectClass}
              >
                {LIFECYCLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </CmsFormField>
            <CmsFormField label="Orden" htmlFor="opp-order">
              <input
                id="opp-order"
                type="number"
                min={0}
                value={form.order}
                onChange={(e) => patch({ order: Number(e.target.value) || 0 })}
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
              Destacada
            </label>
            {!isNew && userCanSave && userCanPublish ? (
              <button
                type="button"
                disabled={archiving || form.status === "archived"}
                onClick={() => void handleArchive()}
                className="mt-3 w-full rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-50"
              >
                {archiving ? "Archivando…" : "Archivar"}
              </button>
            ) : null}
            {userCanDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="mt-2 w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                Eliminar
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
            <CmsFormField label="Código" htmlFor="opp-code" required>
              <input
                id="opp-code"
                value={form.code}
                onChange={(e) => patch({ code: e.target.value })}
                className={cmsInputClass}
                placeholder="OC-CNI-T002"
              />
            </CmsFormField>
            <CmsFormField label="Sector" htmlFor="opp-sector" required>
              <select
                id="opp-sector"
                value={form.sector ?? ""}
                onChange={(e) =>
                  patch({ sector: e.target.value ? Number(e.target.value) : null })
                }
                className={cmsSelectClass}
              >
                <option value="">Seleccionar…</option>
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_es || s.name}
                  </option>
                ))}
              </select>
            </CmsFormField>
            <CmsFormField label={`Título (${locale.toUpperCase()})`} required htmlFor="opp-title">
              <input
                id="opp-title"
                value={form[titleField] as string}
                onChange={(e) => patch({ [titleField]: e.target.value })}
                className={cmsInputClass}
              />
            </CmsFormField>
            <CmsFormField label="Slug" htmlFor="opp-slug">
              <input
                id="opp-slug"
                value={form.slug}
                onChange={(e) => patch({ slug: e.target.value })}
                className={cmsInputClass}
                placeholder="se genera desde el título si se deja vacío"
              />
            </CmsFormField>
          </section>

          <section className="space-y-4 rounded-xl border border-[#334E88]/10 bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#252A58]">Oportunidad</h2>
            <CmsFormField
              label={`Descripción (${locale.toUpperCase()})`}
              htmlFor="opp-description"
              required
            >
              <textarea
                id="opp-description"
                rows={5}
                value={form[descriptionField] as string}
                onChange={(e) => patch({ [descriptionField]: e.target.value })}
                className={cmsTextareaClass}
              />
            </CmsFormField>
            <CmsFormField
              label={`Resumen breve (${locale.toUpperCase()})`}
              htmlFor="opp-summary"
            >
              <textarea
                id="opp-summary"
                rows={3}
                value={form[summaryField] as string}
                onChange={(e) => patch({ [summaryField]: e.target.value })}
                className={cmsTextareaClass}
              />
            </CmsFormField>
            <CmsFormField
              label={`Cliente / comprador objetivo (${locale.toUpperCase()})`}
              htmlFor="opp-target"
            >
              <textarea
                id="opp-target"
                rows={4}
                value={form[targetField] as string}
                onChange={(e) => patch({ [targetField]: e.target.value })}
                className={cmsTextareaClass}
              />
            </CmsFormField>
            <CmsFormField
              label={`Mercado / demanda (${locale.toUpperCase()})`}
              htmlFor="opp-market"
            >
              <textarea
                id="opp-market"
                rows={5}
                value={form[marketField] as string}
                onChange={(e) => patch({ [marketField]: e.target.value })}
                className={cmsTextareaClass}
              />
            </CmsFormField>
            <CmsFormField
              label={`Propuesta de valor (${locale.toUpperCase()})`}
              htmlFor="opp-value"
            >
              <textarea
                id="opp-value"
                rows={5}
                value={form[valueField] as string}
                onChange={(e) => patch({ [valueField]: e.target.value })}
                className={cmsTextareaClass}
              />
            </CmsFormField>
          </section>

          <section className="space-y-4 rounded-xl border border-[#334E88]/10 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#252A58]">Métricas</h2>
              <button
                type="button"
                onClick={() =>
                  patch({ metrics: [...form.metrics, emptyMetric(form.metrics.length)] })
                }
                className="inline-flex items-center gap-1 rounded-lg border border-[#334E88]/20 px-3 py-1.5 text-xs font-semibold text-[#334E88] hover:bg-[#334E88]/5"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar métrica
              </button>
            </div>
            {form.metrics.length === 0 ? (
              <p className="text-sm text-slate-500">Sin métricas. Agregue filas dinámicas (IRR, CAPEX, etc.).</p>
            ) : (
              <ul className="space-y-4">
                {form.metrics.map((metric, index) => (
                  <li
                    key={metric.id ?? `m-${index}`}
                    className="rounded-lg border border-[#334E88]/10 bg-[#f8f9ff] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Métrica {index + 1}
                      </span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          aria-label="Subir"
                          disabled={index === 0}
                          onClick={() => patch({ metrics: reorderList(form.metrics, index, index - 1) })}
                          className="rounded p-1 text-slate-600 hover:bg-white disabled:opacity-30"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Bajar"
                          disabled={index === form.metrics.length - 1}
                          onClick={() => patch({ metrics: reorderList(form.metrics, index, index + 1) })}
                          className="rounded p-1 text-slate-600 hover:bg-white disabled:opacity-30"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Eliminar"
                          onClick={() =>
                            patch({
                              metrics: form.metrics
                                .filter((_, i) => i !== index)
                                .map((m, i) => ({ ...m, order: i })),
                            })
                          }
                          className="rounded p-1 text-red-600 hover:bg-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <CmsFormField label={`Etiqueta (${locale.toUpperCase()})`}>
                        <input
                          value={locale === "es" ? metric.label_es : metric.label_en}
                          onChange={(e) => {
                            const next = [...form.metrics];
                            next[index] = {
                              ...metric,
                              [locale === "es" ? "label_es" : "label_en"]: e.target.value,
                            };
                            patch({ metrics: next });
                          }}
                          className={cmsInputClass}
                        />
                      </CmsFormField>
                      <CmsFormField label={`Valor (${locale.toUpperCase()})`}>
                        <input
                          value={locale === "es" ? metric.value_es : metric.value_en}
                          onChange={(e) => {
                            const next = [...form.metrics];
                            next[index] = {
                              ...metric,
                              [locale === "es" ? "value_es" : "value_en"]: e.target.value,
                            };
                            patch({ metrics: next });
                          }}
                          className={cmsInputClass}
                        />
                      </CmsFormField>
                      <CmsFormField label={`Nota (${locale.toUpperCase()})`}>
                        <input
                          value={locale === "es" ? metric.note_es : metric.note_en}
                          onChange={(e) => {
                            const next = [...form.metrics];
                            next[index] = {
                              ...metric,
                              [locale === "es" ? "note_es" : "note_en"]: e.target.value,
                            };
                            patch({ metrics: next });
                          }}
                          className={cmsInputClass}
                        />
                      </CmsFormField>
                      <CmsFormField label="Icono (opcional)">
                        <input
                          value={metric.icon}
                          onChange={(e) => {
                            const next = [...form.metrics];
                            next[index] = { ...metric, icon: e.target.value };
                            patch({ metrics: next });
                          }}
                          className={cmsInputClass}
                          placeholder="p. ej. trending_up"
                        />
                      </CmsFormField>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-4 rounded-xl border border-[#334E88]/10 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#252A58]">
                Uso de fondos / CAPEX
              </h2>
              <button
                type="button"
                onClick={() =>
                  patch({ fund_uses: [...form.fund_uses, emptyFundUse(form.fund_uses.length)] })
                }
                className="inline-flex items-center gap-1 rounded-lg border border-[#334E88]/20 px-3 py-1.5 text-xs font-semibold text-[#334E88] hover:bg-[#334E88]/5"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar fila
              </button>
            </div>
            {form.fund_uses.length === 0 ? (
              <p className="text-sm text-slate-500">Sin filas de CAPEX.</p>
            ) : (
              <ul className="space-y-4">
                {form.fund_uses.map((row, index) => (
                  <li
                    key={row.id ?? `f-${index}`}
                    className="rounded-lg border border-[#334E88]/10 bg-[#f8f9ff] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Componente {index + 1}
                      </span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          aria-label="Subir"
                          disabled={index === 0}
                          onClick={() =>
                            patch({ fund_uses: reorderList(form.fund_uses, index, index - 1) })
                          }
                          className="rounded p-1 text-slate-600 hover:bg-white disabled:opacity-30"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Bajar"
                          disabled={index === form.fund_uses.length - 1}
                          onClick={() =>
                            patch({ fund_uses: reorderList(form.fund_uses, index, index + 1) })
                          }
                          className="rounded p-1 text-slate-600 hover:bg-white disabled:opacity-30"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Eliminar"
                          onClick={() =>
                            patch({
                              fund_uses: form.fund_uses
                                .filter((_, i) => i !== index)
                                .map((f, i) => ({ ...f, order: i })),
                            })
                          }
                          className="rounded p-1 text-red-600 hover:bg-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <CmsFormField label={`Componente (${locale.toUpperCase()})`}>
                        <input
                          value={locale === "es" ? row.component_es : row.component_en}
                          onChange={(e) => {
                            const next = [...form.fund_uses];
                            next[index] = {
                              ...row,
                              [locale === "es" ? "component_es" : "component_en"]: e.target.value,
                            };
                            patch({ fund_uses: next });
                          }}
                          className={cmsInputClass}
                        />
                      </CmsFormField>
                      <CmsFormField label="Monto (USD)">
                        <input
                          value={row.amount}
                          onChange={(e) => {
                            const next = [...form.fund_uses];
                            next[index] = { ...row, amount: e.target.value };
                            patch({ fund_uses: next });
                          }}
                          className={cmsInputClass}
                          placeholder="6300000.00"
                        />
                      </CmsFormField>
                      <CmsFormField
                        label={`Descripción (${locale.toUpperCase()})`}
                        className="md:col-span-2"
                      >
                        <textarea
                          rows={2}
                          value={locale === "es" ? row.description_es : row.description_en}
                          onChange={(e) => {
                            const next = [...form.fund_uses];
                            next[index] = {
                              ...row,
                              [locale === "es" ? "description_es" : "description_en"]:
                                e.target.value,
                            };
                            patch({ fund_uses: next });
                          }}
                          className={cmsTextareaClass}
                        />
                      </CmsFormField>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <CmsSaveBar
          saving={saving}
          publishing={publishing}
          canSave={userCanSave}
          canPublish={userCanPublish}
          onSaveDraft={() => void handleSaveDraft()}
          onPublish={() => void handlePublish()}
          statusLabel={
            form.status === "published"
              ? "Publicada — guardar no la despublica"
              : form.status === "archived"
                ? "Archivada"
                : "Borrador"
          }
        />
      </CmsEditorLayout>

      <CmsConfirmDialog
        open={confirmDelete}
        title="Eliminar oportunidad"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDelete(false)}
        loading={deleting}
        variant="danger"
      />
    </>
  );
}

"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { cmsInputClass, CmsFormField } from "@/src/components/cms/editor/CmsFormField";
import { emptyMetric, reorderList } from "@/src/lib/cms/editorial/opportunities";
import type { useOpportunityEditor } from "./useOpportunityEditor";

export function OpportunityMetrics({ form, locale, patch }: Pick<ReturnType<typeof useOpportunityEditor>, "form" | "locale" | "patch">) {
  return (
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
                      <label className="flex items-center gap-2 text-sm text-[#252A58] md:col-span-2">
                        <input
                          type="checkbox"
                          checked={metric.is_public}
                          onChange={(e) => {
                            const next = [...form.metrics];
                            next[index] = { ...metric, is_public: e.target.checked };
                            patch({ metrics: next });
                          }}
                          className="rounded border-[#334E88]/30"
                        />
                        Mostrar en sitio público (máx. 4 destacadas)
                      </label>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
  );
}

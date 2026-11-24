"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { cmsInputClass, cmsTextareaClass, CmsFormField } from "@/src/components/cms/editor/CmsFormField";
import { emptyFundUse, reorderList } from "@/src/lib/cms/editorial/opportunities";
import type { useOpportunityEditor } from "./useOpportunityEditor";

export function OpportunityFundUses({ form, locale, patch }: Pick<ReturnType<typeof useOpportunityEditor>, "form" | "locale" | "patch">) {
  return (
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
  );
}

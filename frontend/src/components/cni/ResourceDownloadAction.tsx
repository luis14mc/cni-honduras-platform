"use client";

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { Locale } from "@/src/i18n/config";
import { ApiError } from "@/src/lib/api";
import { documentOpenUrl } from "@/src/lib/cmsDocuments";
import { trackDownload, trackEvent } from "@/src/lib/analytics";
import { submitResourceDownload } from "@/src/services/forms";
import type { CmsDocument } from "@/src/types/cms";

const copy = {
  es: {
    gated: "Descargar con formulario", name: "Nombre completo", email: "Correo electrónico",
    company: "Empresa", country: "País", interest: "Interés",
    consent: "Autorizo al CNI a usar estos datos para gestionar mis descargas y dar seguimiento a mi solicitud.",
    cancel: "Cancelar", submit: "Obtener descarga", pending: "Preparando descarga…",
    failed: "No pudimos preparar la descarga. Intente de nuevo.",
    rateLimited: "Ha realizado varias solicitudes. Espere un momento e intente de nuevo.",
  },
  en: {
    gated: "Download with form", name: "Full name", email: "Email address",
    company: "Company", country: "Country", interest: "Interest",
    consent: "I authorize CNI to use this information to manage my downloads and follow up on my request.",
    cancel: "Cancel", submit: "Get download", pending: "Preparing your download…",
    failed: "We could not prepare your download. Please try again.",
    rateLimited: "You have made several requests. Wait a moment and try again.",
  },
} as const;

const STORAGE_KEY = "cni-resource-download";
const SESSION_LIFETIME = 30 * 60 * 1000;

function rememberedToken(): string | null {
  try {
    const session = sessionStorage.getItem(STORAGE_KEY);
    if (!session) return null;
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    return stored?.session === session && stored.expires > Date.now() &&
      typeof stored.token === "string" ? stored.token : null;
  } catch {
    return null;
  }
}

function remember(token: string) {
  try {
    const session = sessionStorage.getItem(STORAGE_KEY) ?? crypto.randomUUID();
    sessionStorage.setItem(STORAGE_KEY, session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      session, token, expires: Date.now() + SESSION_LIFETIME,
    }));
  } catch {
    // Blocking storage must not block the download.
  }
}

type Props = {
  document: CmsDocument;
  locale: Locale;
  label: string;
  className: string;
  icon?: ReactNode;
};

export function ResourceDownloadAction({ document: doc, locale, label, className, icon }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const titleId = useId();
  const t = copy[locale];
  const downloadEvent = { slug: doc.slug, access: doc.access ?? "free" } as const;
  const resourceId = doc.strapi_document_id;
  const resourceLocale = doc.strapi_locale ?? locale;

  if (doc.access !== "gated") {
    const url = documentOpenUrl(doc);
    return url ? (
      <a data-resource-download href={url} target="_blank" rel="noopener noreferrer" className={className}
        onClick={() => trackDownload(downloadEvent)} onAuxClick={(event) => {
          if (event.button === 1) trackDownload(downloadEvent);
        }}>
        {icon}{label}
      </a>
    ) : null;
  }

  if (!resourceId) return null;
  const resource = { strapi_document_id: resourceId, locale: resourceLocale };

  async function download(payload: Parameters<typeof submitResourceDownload>[0], rememberContact: boolean) {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    try {
      const result = await submitResourceDownload(payload);
      const downloadUrl = new URL(result.download_url);
      if (!["https:", "http:"].includes(downloadUrl.protocol)) throw new Error("Invalid download URL");
      if (rememberContact) {
        remember(result.remember_token);
        const event = { form: "resource_download", locale } as const;
        trackEvent("form_submit", event);
        trackEvent("lead_submit", event);
      }
      trackDownload(downloadEvent);
      dialog.current?.close();
      window.location.assign(downloadUrl.href);
    } catch (failure) {
      if (!rememberContact && failure instanceof ApiError && failure.status === 400) {
        try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* Storage may be unavailable. */ }
      } else {
        setError(failure instanceof ApiError && failure.status === 429 ? t.rateLimited : t.failed);
      }
      if (!dialog.current?.open) dialog.current?.showModal();
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  function open() {
    const token = rememberedToken();
    if (token) {
      void download({ ...resource, remember_token: token }, false);
    } else {
      setError("");
      dialog.current?.showModal();
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    void download({
      ...resource,
      full_name: value("full_name"), email: value("email"), company: value("company"),
      country: value("country"), details: value("details"), website: value("website"),
      consent: data.has("consent"),
    }, true);
  }

  const fieldClass = "mt-1 w-full rounded-lg border border-cni-primary/25 bg-white px-3 py-2.5 focus-visible:outline-2 focus-visible:outline-[#168654]";

  return (
    <>
      <button type="button" className={className} onClick={open} disabled={pending}>
        {icon}{pending ? t.pending : t.gated}
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        className="m-auto max-h-[90dvh] w-[min(94vw,38rem)] overflow-y-auto rounded-2xl border border-cni-primary/15 bg-[#f8f9ff] text-cni-primary shadow-2xl backdrop:bg-[#000a1e]/70"
      >
        <div className="border-l-4 border-[#32B372] bg-[#eef7f2] px-6 py-5 sm:px-8">
          <h2 id={titleId} className="font-headline text-xl font-bold">{doc.title}</h2>
        </div>
        <form onSubmit={submit} className="space-y-4 px-6 py-5 text-sm sm:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {([
              ["full_name", t.name, "text", "name", 200],
              ["email", t.email, "email", "email", 254],
              ["company", t.company, "text", "organization", 200],
              ["country", t.country, "text", "country-name", 120],
            ] as const).map(([name, text, type, autoComplete, maxLength]) => (
              <label key={name} className="font-semibold">
                {text}
                <input required name={name} type={type} autoComplete={autoComplete} maxLength={maxLength} className={fieldClass} />
              </label>
            ))}
          </div>
          <label className="block font-semibold">
            {t.interest}
            <textarea name="details" required maxLength={1000} rows={2} className={fieldClass} />
          </label>
          <div className="hidden" aria-hidden="true">
            <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
          </div>
          <label className="flex items-start gap-3">
            <input type="checkbox" name="consent" required className="mt-1 accent-[#168654]" />
            {t.consent}
          </label>
          {error ? <p role="alert" className="text-red-800">{error}</p> : null}
          <div className="flex flex-wrap justify-end gap-3 border-t border-cni-primary/10 pt-4">
            <button type="button" className="rounded-lg border border-cni-primary/20 px-4 py-2 font-semibold" onClick={() => dialog.current?.close()}>
              {t.cancel}
            </button>
            <button type="submit" disabled={pending} className="rounded-lg bg-[#252a58] px-4 py-2 font-bold text-white hover:bg-[#0e7a7c] disabled:opacity-60">
              {pending ? t.pending : t.submit}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

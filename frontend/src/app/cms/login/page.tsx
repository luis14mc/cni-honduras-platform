"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { useCmsAuth } from "@/src/lib/cms/AuthProvider";
import {
  loginErrorMessage,
  validateLogin,
  type LoginFieldErrors,
} from "@/src/lib/cms/session";

export default function CmsLoginPage() {
  const { state, signIn } = useCmsAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in → go to dashboard.
  useEffect(() => {
    if (state.status === "authenticated") {
      router.replace("/cms");
    }
  }, [state.status, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const errors = validateLogin(username, password);
    setFieldErrors(errors);
    if (errors.username || errors.password) return;

    setSubmitting(true);
    try {
      await signIn(username, password);
      router.replace("/cms");
    } catch (error) {
      setFormError(loginErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#252A58] via-[#334E88] to-[#252A58] p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#334E88] text-lg font-black text-white">
            CNI
          </span>
          <h1 className="text-xl font-bold text-[#252A58]">CMS Editorial</h1>
          <p className="mt-1 text-sm text-[#252A58]/60">
            Consejo Nacional de Inversiones
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-[#252A58]">
              Usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-invalid={Boolean(fieldErrors.username)}
              className="w-full rounded-lg border border-[#334E88]/20 px-3 py-2.5 text-[#252A58] outline-none transition focus:border-[#334E88] focus:ring-2 focus:ring-[#334E88]/20"
            />
            {fieldErrors.username ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-[#252A58]">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
              className="w-full rounded-lg border border-[#334E88]/20 px-3 py-2.5 text-[#252A58] outline-none transition focus:border-[#334E88] focus:ring-2 focus:ring-[#334E88]/20"
            />
            {fieldErrors.password ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
            ) : null}
          </div>

          {formError ? (
            <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#334E88] px-4 py-2.5 font-semibold text-white transition hover:bg-[#252A58] disabled:opacity-70"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Lock className="h-4 w-4" aria-hidden />
            )}
            {submitting ? "Ingresando…" : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#252A58]/40">
          Acceso restringido a personal autorizado del CNI.
        </p>
      </div>
    </div>
  );
}

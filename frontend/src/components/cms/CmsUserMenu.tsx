"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { useCmsAuth } from "@/src/lib/cms/AuthProvider";
import { displayName, initials } from "@/src/lib/cms/session";

export function CmsUserMenu() {
  const { user, signOut } = useCmsAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;

  const roleLabel = user.is_superuser
    ? "Superadmin"
    : user.groups[0] ?? (user.is_staff ? "Staff" : "");

  async function handleLogout() {
    setBusy(true);
    await signOut();
    router.push("/cms/login");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-[#334E88]/8"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#334E88] text-sm font-bold text-white">
          {initials(user)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-semibold leading-tight text-[#252A58]">
            {displayName(user)}
          </span>
          {roleLabel ? (
            <span className="block text-xs leading-tight text-[#252A58]/50">{roleLabel}</span>
          ) : null}
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[#334E88]/10 bg-white shadow-lg"
        >
          <div className="border-b border-[#334E88]/10 px-4 py-3">
            <p className="truncate text-sm font-semibold text-[#252A58]">{displayName(user)}</p>
            <p className="truncate text-xs text-[#252A58]/50">{user.email || user.username}</p>
          </div>
          {user.is_superuser ? (
            <div className="flex items-center gap-2 px-4 py-2 text-xs text-[#32B372]">
              <ShieldCheck className="h-4 w-4" aria-hidden /> Acceso total
            </div>
          ) : null}
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={busy}
            className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            {busy ? "Cerrando sesión…" : "Cerrar sesión"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

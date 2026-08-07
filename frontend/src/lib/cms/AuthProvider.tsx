"use client";

// React context that owns the CMS session lifecycle: bootstrap (GET /me/),
// login, logout, and expiry. Components read state via useCmsAuth().

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { CmsApiError } from "@/src/lib/cms/api";
import {
  fetchCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
} from "@/src/lib/cms/session";
import type { CmsAuthState, CmsUser } from "@/src/lib/cms/types";

interface CmsAuthContextValue {
  state: CmsAuthState;
  user: CmsUser | null;
  refresh: () => Promise<void>;
  signIn: (username: string, password: string) => Promise<CmsUser>;
  signOut: () => Promise<void>;
}

const CmsAuthContext = createContext<CmsAuthContextValue | null>(null);

export function CmsAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CmsAuthState>({ status: "loading" });

  const refresh = useCallback(async () => {
    try {
      const user = await fetchCurrentUser();
      setState({ status: "authenticated", user });
    } catch (error) {
      if (error instanceof CmsApiError && (error.status === 401 || error.status === 403)) {
        setState({ status: "unauthenticated" });
      } else {
        setState({
          status: "error",
          message: "No se pudo verificar la sesión.",
        });
      }
    }
  }, []);

  useEffect(() => {
    // Bootstrap the session on mount. State updates happen only after the async
    // request resolves, so there is no synchronous cascade here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const signIn = useCallback(async (username: string, password: string) => {
    const user = await loginRequest(username, password);
    setState({ status: "authenticated", user });
    return user;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setState({ status: "unauthenticated" });
    }
  }, []);

  const value = useMemo<CmsAuthContextValue>(
    () => ({
      state,
      user: state.status === "authenticated" ? state.user : null,
      refresh,
      signIn,
      signOut,
    }),
    [state, refresh, signIn, signOut],
  );

  return <CmsAuthContext.Provider value={value}>{children}</CmsAuthContext.Provider>;
}

export function useCmsAuth(): CmsAuthContextValue {
  const ctx = useContext(CmsAuthContext);
  if (!ctx) {
    throw new Error("useCmsAuth debe usarse dentro de <CmsAuthProvider>.");
  }
  return ctx;
}

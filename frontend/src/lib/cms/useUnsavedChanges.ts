"use client";

import { useCallback, useEffect } from "react";

const LEAVE_MESSAGE = "Hay cambios sin guardar. ¿Desea salir de todos modos?";

/** Warn before leaving the page or navigating away when the form is dirty. */
export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = LEAVE_MESSAGE;
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const confirmLeave = useCallback((): boolean => {
    if (!dirty) return true;
    return window.confirm(LEAVE_MESSAGE);
  }, [dirty]);

  return { confirmLeave, dirty };
}

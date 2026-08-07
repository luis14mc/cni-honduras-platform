"use client";

import { useCallback, useState } from "react";
import { useFormDirty } from "@/src/lib/cms/useFormDirty";

/** Track unsaved editor changes against an explicit saved baseline. */
export function useEditorDirty<T>(form: T) {
  const [baseline, setBaseline] = useState<string | null>(null);
  const dirty = useFormDirty(form, baseline);

  const markClean = useCallback((state: T) => {
    setBaseline(JSON.stringify(state));
  }, []);

  return { dirty, markClean };
}

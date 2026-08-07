"use client";

import { useMemo } from "react";

/** Compare serialized form state against a saved baseline. Pure helper. */
export function isFormDirty<T>(current: T, baseline: string | null): boolean {
  if (baseline === null) return false;
  return JSON.stringify(current) !== baseline;
}

/** Hook: true when current form differs from last saved baseline JSON. */
export function useFormDirty<T>(current: T, baseline: string | null): boolean {
  return useMemo(() => isFormDirty(current, baseline), [current, baseline]);
}

"use client";

import { useCallback, useState } from "react";
import { slugifyFromTitle } from "@/src/lib/cms/slugify";

interface UseSlugFieldOptions {
  title: string;
  initialSlug?: string;
  isNew?: boolean;
}

/** Auto-generate slug from title on create until the user edits slug manually. */
export function useSlugField({ title, initialSlug = "", isNew = false }: UseSlugFieldOptions) {
  const [manualSlug, setManualSlug] = useState<string | null>(null);

  const autoSlug = slugifyFromTitle(title);
  const slug = manualSlug ?? (isNew ? autoSlug : initialSlug);

  const setSlug = useCallback((value: string) => {
    setManualSlug(value);
  }, []);

  return { slug, setSlug, slugManual: manualSlug !== null };
}

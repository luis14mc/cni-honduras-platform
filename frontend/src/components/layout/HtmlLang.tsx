"use client";

import { useEffect } from "react";
import type { Locale } from "@/src/i18n/config";

export function HtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale === "en" ? "en" : "es";
  }, [locale]);
  return null;
}

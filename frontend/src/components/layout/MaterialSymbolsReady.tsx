"use client";

import { useEffect } from "react";

export function MaterialSymbolsReady() {
  useEffect(() => {
    document.fonts.load('24px "Material Symbols Outlined"').then((fonts) => {
      if (fonts.length) document.documentElement.classList.add("material-symbols-ready");
    }).catch(() => {});
  }, []);
  return null;
}

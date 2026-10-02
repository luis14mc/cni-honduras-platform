"use client";

import { useCallback, useEffect, useState } from "react";

type Props = {
  src: string;
  alt: string;
  openLabel: string;
  closeLabel: string;
};

export function PortfolioImageLightbox({ src, alt, openLabel, closeLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const close = useCallback(() => {
    setOpen(false);
    setZoom(1);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-md bg-[#252A58] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#0E7A7C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F7BF06]"
      >
        {openLabel}
      </button>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#000a1e]/90 p-4"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 rounded-full bg-white px-4 py-2 font-headline text-[11px] font-bold uppercase tracking-[0.14em] text-cni-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F7BF06]"
          >
            {closeLabel}
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onClick={(event) => {
              event.stopPropagation();
              setZoom((value) => (value >= 2.5 ? 1 : Number((value + 0.5).toFixed(1))));
            }}
            className="max-h-[88vh] max-w-[92vw] cursor-zoom-in rounded-lg object-contain shadow-2xl"
            style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
          />
        </div>
      ) : null}
    </>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { resolveMediaFileUrl, type MediaUrlSource } from "@/src/lib/mediaUrl";

type Props = {
  source: string | MediaUrlSource | null | undefined;
  alt?: string;
  className?: string;
  /** Fill parent (requires positioned parent). */
  fill?: boolean;
  width?: number;
  height?: number;
};

/**
 * CMS media preview: uses resolveMediaFileUrl and never shows a broken native icon.
 */
export function CmsMediaImage({
  source,
  alt = "",
  className = "object-cover",
  fill = true,
  width,
  height,
}: Props) {
  const [broken, setBroken] = useState(false);
  const url = resolveMediaFileUrl(source);

  if (!url || broken) {
    return (
      <div
        className="flex h-full w-full items-center justify-center bg-[#334E88]/10 px-1 text-center text-[10px] font-medium leading-tight text-[#334E88]/70"
        role="img"
        aria-label="Archivo no disponible"
      >
        Archivo no disponible
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={url}
        alt={alt}
        fill
        className={className}
        unoptimized
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      width={width ?? 80}
      height={height ?? 80}
      className={className}
      unoptimized
      onError={() => setBroken(true)}
    />
  );
}

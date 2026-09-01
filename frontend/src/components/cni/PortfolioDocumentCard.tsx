import Image from "next/image";
import { Download, FileText } from "lucide-react";
import type { CmsDocument } from "@/src/types/cms";

export function portfolioCoverUrl(document: CmsDocument): string | null {
  return document.cover_image?.file_url || document.cover_image?.file || null;
}

export function PortfolioDocumentCard({
  document,
  label,
  downloadLabel,
}: {
  document: CmsDocument;
  label: string;
  downloadLabel: string;
}) {
  const coverUrl = portfolioCoverUrl(document);

  return (
    <article className="flex min-h-40 overflow-hidden rounded-lg border border-cni-primary/10 bg-[#f8f9ff]">
      <div className="relative flex w-28 shrink-0 items-center justify-center overflow-hidden bg-cni-primary/8 sm:w-32">
        {coverUrl ? (
          <Image src={coverUrl} alt="" fill sizes="128px" className="object-cover" />
        ) : (
          <FileText className="h-10 w-10 text-cni-primary/35" aria-hidden />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <p className="font-headline text-xs font-bold uppercase tracking-[0.12em] text-[#168654]">{label}</p>
        <h3 className="mt-2 font-headline text-base font-bold leading-snug text-cni-primary">{document.title}</h3>
        {document.has_resource && document.file_url ? (
          <a
            href={document.file_url}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 self-start font-headline text-[11px] font-bold uppercase tracking-[0.14em] text-cni-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#32B372]"
          >
            <Download className="h-4 w-4" aria-hidden />
            {downloadLabel}
          </a>
        ) : null}
      </div>
    </article>
  );
}

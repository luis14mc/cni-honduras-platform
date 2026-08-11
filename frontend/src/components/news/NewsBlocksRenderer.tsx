"use client";

import Image from "next/image";
import type { NewsBlock } from "@/src/lib/newsBlocks";
import { sanitizeNewsHtml } from "@/src/lib/sanitizeNewsHtml";
import { resolveMediaFileUrl } from "@/src/lib/mediaUrl";

type Props = {
  blocks: NewsBlock[];
  /** Optional map media_id → absolute URL for image blocks */
  mediaUrls?: Record<number, string>;
};

export function NewsBlocksRenderer({ blocks, mediaUrls = {} }: Props) {
  if (!blocks.length) return null;

  return (
    <div className="space-y-6 font-body text-base leading-relaxed text-[#252A58]/90">
      {blocks.map((block) => {
        switch (block.type) {
          case "paragraph": {
            const safe = sanitizeNewsHtml(block.html || "");
            if (!safe.trim()) return null;
            return (
              <div
                key={block.id}
                className="prose prose-neutral max-w-none [&_a]:text-[#35A963]"
                dangerouslySetInnerHTML={{ __html: safe }}
              />
            );
          }
          case "heading": {
            const Tag = block.level === 3 ? "h3" : "h2";
            if (!block.text.trim()) return null;
            return (
              <Tag
                key={block.id}
                className={
                  block.level === 3
                    ? "font-headline text-xl font-bold text-[#252A58]"
                    : "font-headline text-2xl font-bold text-[#252A58]"
                }
              >
                {block.text}
              </Tag>
            );
          }
          case "image": {
            const src =
              (block.media_id && mediaUrls[block.media_id]) ||
              resolveMediaFileUrl(block.preview_url) ||
              null;
            if (!src) return null;
            return (
              <figure key={block.id} className="space-y-2">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100">
                  <Image
                    src={src}
                    alt={block.alt || ""}
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, 720px"
                    unoptimized
                  />
                </div>
                {block.caption ? (
                  <figcaption className="text-center text-sm text-slate-500">{block.caption}</figcaption>
                ) : null}
              </figure>
            );
          }
          case "list": {
            const items = block.items.filter((item) => item.trim());
            if (!items.length) return null;
            const ListTag = block.style === "ordered" ? "ol" : "ul";
            return (
              <ListTag
                key={block.id}
                className={
                  block.style === "ordered"
                    ? "list-decimal space-y-1 pl-6"
                    : "list-disc space-y-1 pl-6"
                }
              >
                {items.map((item, idx) => (
                  <li key={`${block.id}-${idx}`}>{item}</li>
                ))}
              </ListTag>
            );
          }
          case "quote":
            if (!block.text.trim()) return null;
            return (
              <blockquote
                key={block.id}
                className="border-l-4 border-[#35A963] bg-white/60 px-5 py-4 italic text-[#252A58]"
              >
                <p>{block.text}</p>
                {block.attribution ? (
                  <footer className="mt-2 text-sm not-italic text-slate-500">— {block.attribution}</footer>
                ) : null}
              </blockquote>
            );
          case "divider":
            return <hr key={block.id} className="border-slate-200" />;
          case "button":
            if (!block.label.trim() || !block.url.trim()) return null;
            return (
              <p key={block.id}>
                <a
                  href={block.url}
                  target={block.open_in_new_tab ? "_blank" : undefined}
                  rel={block.open_in_new_tab ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center rounded-full bg-[#35A963] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2d9154]"
                >
                  {block.label}
                </a>
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

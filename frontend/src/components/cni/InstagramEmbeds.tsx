"use client";

import Script from "next/script";
import { useEffect } from "react";
import { ArrowUpRight } from "lucide-react";

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

export type InstagramEmbedPost = {
  href: string;
  officialLabel: string;
  title: string;
};

type Props = {
  posts: InstagramEmbedPost[];
  moreHref: string;
  moreLabel: string;
};

function processInstagramEmbeds() {
  window.instgrm?.Embeds.process();
}

export function InstagramEmbeds({ posts, moreHref, moreLabel }: Props) {
  useEffect(() => {
    processInstagramEmbeds();
  }, [posts]);

  return (
    <>
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
        onLoad={processInstagramEmbeds}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.href}
            className="overflow-hidden rounded-[1.25rem] border border-cni-primary/10 bg-white p-3.5 shadow-sm md:rounded-[1.35rem] md:p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-3 px-1 pt-1">
              <div>
                <p className="font-headline text-[11px] font-extrabold uppercase tracking-wide text-cni-primary">
                  {post.officialLabel}
                </p>
                <p className="mt-1 text-sm font-medium text-cni-primary/65">{post.title}</p>
              </div>
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] font-headline text-[11px] font-extrabold text-white"
                aria-hidden
              >
                IG
              </div>
            </div>

            <div className="al-instagram-embed-wrap overflow-hidden rounded-[1.125rem] bg-[#f8fafc]">
              <blockquote
                className="instagram-media"
                data-instgrm-permalink={post.href}
                data-instgrm-version="14"
                style={{
                  background: "#FFF",
                  border: 0,
                  borderRadius: "18px",
                  boxShadow: "none",
                  margin: 0,
                  maxWidth: "100%",
                  minWidth: "100%",
                  padding: 0,
                  width: "100%",
                }}
              />
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 text-center md:mt-11">
        <a
          href={moreHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 rounded-[0.875rem] bg-cni-primary px-6 py-3.5 font-headline text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#35A8E0]"
        >
          {moreLabel}
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </>
  );
}

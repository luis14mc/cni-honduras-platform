/** Parse public YouTube URLs into a privacy-enhanced embed src. */

const ID = /^[a-zA-Z0-9_-]{11}$/;

export function getYoutubeVideoId(input: string | null | undefined): string | null {
  if (!input) return null;
  const value = input.trim();
  if (!value) return null;
  if (ID.test(value)) return value;

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
      return ID.test(id) ? id : null;
    }
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const fromQuery = url.searchParams.get("v");
      if (fromQuery && ID.test(fromQuery)) return fromQuery;
      const parts = url.pathname.split("/").filter(Boolean);
      const embedIndex = parts.findIndex((part) => part === "embed" || part === "shorts");
      const fromPath = embedIndex >= 0 ? parts[embedIndex + 1] : "";
      return fromPath && ID.test(fromPath) ? fromPath : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function getYoutubeEmbedUrl(input: string | null | undefined): string | null {
  const id = getYoutubeVideoId(input);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

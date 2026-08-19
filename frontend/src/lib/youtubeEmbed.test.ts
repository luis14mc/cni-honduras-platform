import { describe, expect, it } from "vitest";
import { getYoutubeEmbedUrl, getYoutubeVideoId } from "@/src/lib/youtubeEmbed";

describe("getYoutubeVideoId", () => {
  it("parses youtu.be short links", () => {
    expect(getYoutubeVideoId("https://youtu.be/gzplb3I4X98")).toBe("gzplb3I4X98");
  });

  it("parses watch and embed URLs", () => {
    expect(getYoutubeVideoId("https://www.youtube.com/watch?v=gzplb3I4X98")).toBe("gzplb3I4X98");
    expect(getYoutubeVideoId("https://www.youtube.com/embed/gzplb3I4X98")).toBe("gzplb3I4X98");
  });

  it("returns null for empty or invalid input", () => {
    expect(getYoutubeVideoId(null)).toBeNull();
    expect(getYoutubeVideoId("")).toBeNull();
    expect(getYoutubeVideoId("https://example.com/video")).toBeNull();
  });
});

describe("getYoutubeEmbedUrl", () => {
  it("returns a nocookie embed URL", () => {
    expect(getYoutubeEmbedUrl("https://youtu.be/gzplb3I4X98")).toBe(
      "https://www.youtube-nocookie.com/embed/gzplb3I4X98",
    );
  });
});

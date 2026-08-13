import { describe, expect, it } from "vitest";
import {
  CmsApiError,
  MEDIA_STORAGE_ERROR_CODE,
  MEDIA_STORAGE_ERROR_MESSAGE,
} from "@/src/lib/cms/errors";
import { mediaUploadErrorMessage } from "@/src/lib/cms/editorial/media";

describe("mediaUploadErrorMessage", () => {
  it("maps media_storage_error to a useful CMS message", () => {
    const err = new CmsApiError("raw", 503, {}, MEDIA_STORAGE_ERROR_CODE);
    expect(mediaUploadErrorMessage(err)).toBe(MEDIA_STORAGE_ERROR_MESSAGE);
    expect(mediaUploadErrorMessage(err)).not.toMatch(/Failed response/i);
  });

  it("maps 503 without code the same way", () => {
    const err = new CmsApiError("servicio", 503);
    expect(mediaUploadErrorMessage(err)).toBe(MEDIA_STORAGE_ERROR_MESSAGE);
  });

  it("keeps other CmsApiError messages", () => {
    const err = new CmsApiError("Extensión no permitida", 400);
    expect(mediaUploadErrorMessage(err)).toBe("Extensión no permitida");
  });
});

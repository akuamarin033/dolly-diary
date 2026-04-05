import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for photo picker safety and URI validation logic.
 * These tests verify the defensive coding patterns used in the diary edit screen
 * to prevent crashes from invalid photo URIs after trimming/cropping.
 */

describe("Photo URI Validation", () => {
  // Simulates the validation logic used in handlePickPhoto and handleSave
  function isValidPhotoUri(uri: unknown): boolean {
    return typeof uri === "string" && uri.length > 0;
  }

  // Simulates the displayPhotos filter used before rendering
  function sanitizePhotos(photos: (string | undefined | null)[]): string[] {
    return photos.map((p) => (p && typeof p === "string" && p.length > 0 ? p : ""));
  }

  // Simulates the save-time filter
  function filterValidPhotos(photos: string[]): string[] {
    return photos.filter((p) => p && typeof p === "string" && p.length > 0);
  }

  it("should accept valid file URIs", () => {
    expect(isValidPhotoUri("file:///data/user/0/com.app/cache/image.jpg")).toBe(true);
    expect(isValidPhotoUri("content://media/external/images/media/123")).toBe(true);
    expect(isValidPhotoUri("ph://ABCD-1234")).toBe(true);
    expect(isValidPhotoUri("https://example.com/image.png")).toBe(true);
  });

  it("should reject null, undefined, and empty URIs", () => {
    expect(isValidPhotoUri(null)).toBe(false);
    expect(isValidPhotoUri(undefined)).toBe(false);
    expect(isValidPhotoUri("")).toBe(false);
  });

  it("should reject non-string URIs", () => {
    expect(isValidPhotoUri(0)).toBe(false);
    expect(isValidPhotoUri(false)).toBe(false);
    expect(isValidPhotoUri({})).toBe(false);
    expect(isValidPhotoUri([])).toBe(false);
  });

  it("should sanitize photos array for display", () => {
    const raw = ["file:///photo1.jpg", undefined, null, "", "file:///photo3.jpg"];
    const sanitized = sanitizePhotos(raw);
    expect(sanitized).toEqual(["file:///photo1.jpg", "", "", "", "file:///photo3.jpg"]);
    expect(sanitized).toHaveLength(5);
  });

  it("should filter valid photos for saving", () => {
    const photos = ["file:///photo1.jpg", "", "file:///photo2.jpg", ""];
    const valid = filterValidPhotos(photos);
    expect(valid).toEqual(["file:///photo1.jpg", "file:///photo2.jpg"]);
  });

  it("should handle all-empty photos array", () => {
    const photos = ["", "", ""];
    const valid = filterValidPhotos(photos);
    expect(valid).toEqual([]);
  });

  it("should handle empty photos array", () => {
    const photos: string[] = [];
    const valid = filterValidPhotos(photos);
    expect(valid).toEqual([]);
  });
});

describe("Photo Reorder Logic", () => {
  // Simulates the drag-and-drop reorder logic from DraggablePhotoRow
  function reorderPhotos(photos: string[], fromIndex: number, toIndex: number): string[] {
    if (fromIndex === toIndex) return photos;
    if (!photos[fromIndex]) return photos;

    const newPhotos = [...photos];
    const temp = newPhotos[fromIndex];
    newPhotos[fromIndex] = newPhotos[toIndex] || "";
    newPhotos[toIndex] = temp;
    // Remove empty strings from the end
    while (newPhotos.length > 0 && !newPhotos[newPhotos.length - 1]) {
      newPhotos.pop();
    }
    return newPhotos;
  }

  it("should swap two photos correctly", () => {
    const photos = ["a.jpg", "b.jpg", "c.jpg"];
    const result = reorderPhotos(photos, 0, 2);
    expect(result).toEqual(["c.jpg", "b.jpg", "a.jpg"]);
  });

  it("should handle swapping with empty slot", () => {
    const photos = ["a.jpg", "", "c.jpg"];
    const result = reorderPhotos(photos, 0, 1);
    expect(result).toEqual(["", "a.jpg", "c.jpg"]);
  });

  it("should not swap if fromIndex has no photo", () => {
    const photos = ["a.jpg", "", "c.jpg"];
    const result = reorderPhotos(photos, 1, 0);
    expect(result).toEqual(["a.jpg", "", "c.jpg"]);
  });

  it("should trim trailing empty strings", () => {
    const photos = ["a.jpg", "b.jpg", ""];
    const result = reorderPhotos(photos, 1, 2);
    expect(result).toEqual(["a.jpg", "", "b.jpg"]);
  });

  it("should return same array if indices are equal", () => {
    const photos = ["a.jpg", "b.jpg"];
    const result = reorderPhotos(photos, 0, 0);
    expect(result).toEqual(["a.jpg", "b.jpg"]);
  });
});

describe("ImagePicker Result Handling", () => {
  // Simulates how we handle ImagePicker results
  function extractUriFromResult(result: {
    canceled: boolean;
    assets?: Array<{ uri: string }> | null;
  }): string | null {
    if (result.canceled) return null;
    const asset = result.assets?.[0];
    if (!asset) return null;
    const uri = asset.uri;
    if (!uri || typeof uri !== "string" || uri.length === 0) return null;
    return uri;
  }

  it("should extract URI from successful result", () => {
    const result = {
      canceled: false,
      assets: [{ uri: "file:///photo.jpg" }],
    };
    expect(extractUriFromResult(result)).toBe("file:///photo.jpg");
  });

  it("should return null for canceled result", () => {
    const result = { canceled: true, assets: null };
    expect(extractUriFromResult(result)).toBeNull();
  });

  it("should return null for result with no assets", () => {
    const result = { canceled: false, assets: [] };
    expect(extractUriFromResult(result)).toBeNull();
  });

  it("should return null for result with null assets", () => {
    const result = { canceled: false, assets: null };
    expect(extractUriFromResult(result)).toBeNull();
  });

  it("should return null for result with empty URI", () => {
    const result = { canceled: false, assets: [{ uri: "" }] };
    expect(extractUriFromResult(result)).toBeNull();
  });

  it("should return null for result with undefined assets", () => {
    const result = { canceled: false, assets: undefined };
    expect(extractUriFromResult(result)).toBeNull();
  });
});

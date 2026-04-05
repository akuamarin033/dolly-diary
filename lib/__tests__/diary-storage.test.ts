import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock AsyncStorage
const mockStorage: Record<string, string> = {};
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn((key: string) => Promise.resolve(mockStorage[key] ?? null)),
    setItem: vi.fn((key: string, value: string) => {
      mockStorage[key] = value;
      return Promise.resolve();
    }),
    removeItem: vi.fn((key: string) => {
      delete mockStorage[key];
      return Promise.resolve();
    }),
  },
}));

import {
  formatDate,
  parseDate,
  getEntriesForMonth,
  MOOD_CAT_IDS,
  MOOD_LABELS,
  type DiaryEntry,
  type Mood,
  type PlacedDeco,
  type CalendarDeco,
} from "../diary-storage";

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
});

describe("formatDate", () => {
  it("formats a date correctly", () => {
    const d = new Date(2026, 3, 3); // April 3, 2026
    expect(formatDate(d)).toBe("2026-04-03");
  });

  it("pads single digit months and days", () => {
    const d = new Date(2026, 0, 5); // Jan 5
    expect(formatDate(d)).toBe("2026-01-05");
  });
});

describe("parseDate", () => {
  it("parses a date string correctly", () => {
    const d = parseDate("2026-04-03");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(3); // 0-indexed
    expect(d.getDate()).toBe(3);
  });
});

describe("getEntriesForMonth", () => {
  it("returns dates for the correct month", () => {
    const entries: DiaryEntry[] = [
      {
        id: "1",
        date: "2026-04-01",
        title: "Test",
        content: "Content",
        mood: "happy" as Mood,
        photos: [],
        decoStickers: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        date: "2026-04-15",
        title: "Test 2",
        content: "Content 2",
        mood: "sad" as Mood,
        photos: [],
        decoStickers: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "3",
        date: "2026-05-01",
        title: "Test 3",
        content: "Content 3",
        mood: "happy" as Mood,
        photos: [],
        decoStickers: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const result = getEntriesForMonth(entries, 2026, 3); // April (0-indexed)
    expect(result.size).toBe(2);
    expect(result.has("2026-04-01")).toBe(true);
    expect(result.has("2026-04-15")).toBe(true);
    expect(result.has("2026-05-01")).toBe(false);
  });

  it("returns empty set for month with no entries", () => {
    const entries: DiaryEntry[] = [];
    const result = getEntriesForMonth(entries, 2026, 3);
    expect(result.size).toBe(0);
  });
});

describe("MOOD constants", () => {
  it("has all moods defined", () => {
    const moods: Mood[] = ["happy", "sad", "angry", "worried", "depressed", "neutral", "excited"];
    for (const m of moods) {
      expect(MOOD_CAT_IDS[m]).toBeDefined();
      expect(MOOD_LABELS[m]).toBeDefined();
    }
  });
});

describe("Type definitions", () => {
  it("PlacedDeco has correct shape", () => {
    const deco: PlacedDeco = {
      id: "test",
      emoji: "🌸",
      x: 50,
      y: 50,
      scale: 1.0,
    };
    expect(deco.id).toBe("test");
    expect(deco.scale).toBe(1.0);
  });

  it("CalendarDeco has correct shape", () => {
    const deco: CalendarDeco = {
      id: "cal-test",
      emoji: "⭐",
      x: 30,
      y: 40,
      scale: 1.5,
      rotation: 0,
    };
    expect(deco.emoji).toBe("⭐");
    expect(deco.rotation).toBe(0);
  });
});

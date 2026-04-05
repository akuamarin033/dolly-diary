import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock AsyncStorage
const store: Record<string, string> = {};

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (key: string) => store[key] ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn(async (key: string) => {
      delete store[key];
    }),
    getAllKeys: vi.fn(async () => Object.keys(store)),
  },
}));

import {
  getCalendarDecos,
  saveCalendarDecos,
  migrateGlobalDecosToMonth,
  type CalendarDeco,
} from "../lib/diary-storage";

function makeDeco(id: string, overrides?: Partial<CalendarDeco>): CalendarDeco {
  return {
    id,
    emoji: "",
    x: 50,
    y: 50,
    scale: 1.0,
    rotation: 0,
    ...overrides,
  };
}

describe("Monthly Deco Storage", () => {
  beforeEach(() => {
    // Clear store
    for (const key of Object.keys(store)) {
      delete store[key];
    }
  });

  it("should save and load decos for a specific month", async () => {
    const decos = [makeDeco("d1"), makeDeco("d2")];
    await saveCalendarDecos(decos, 2026, 3); // April (0-indexed)

    const loaded = await getCalendarDecos(2026, 3);
    expect(loaded).toHaveLength(2);
    expect(loaded[0].id).toBe("d1");
    expect(loaded[1].id).toBe("d2");
  });

  it("should isolate decos between different months", async () => {
    const aprilDecos = [makeDeco("april1")];
    const mayDecos = [makeDeco("may1"), makeDeco("may2"), makeDeco("may3")];

    await saveCalendarDecos(aprilDecos, 2026, 3); // April
    await saveCalendarDecos(mayDecos, 2026, 4); // May

    const loadedApril = await getCalendarDecos(2026, 3);
    const loadedMay = await getCalendarDecos(2026, 4);

    expect(loadedApril).toHaveLength(1);
    expect(loadedApril[0].id).toBe("april1");
    expect(loadedMay).toHaveLength(3);
    expect(loadedMay[0].id).toBe("may1");
  });

  it("should isolate decos between different years", async () => {
    const decos2026 = [makeDeco("y2026")];
    const decos2027 = [makeDeco("y2027")];

    await saveCalendarDecos(decos2026, 2026, 0); // Jan 2026
    await saveCalendarDecos(decos2027, 2027, 0); // Jan 2027

    const loaded2026 = await getCalendarDecos(2026, 0);
    const loaded2027 = await getCalendarDecos(2027, 0);

    expect(loaded2026).toHaveLength(1);
    expect(loaded2026[0].id).toBe("y2026");
    expect(loaded2027).toHaveLength(1);
    expect(loaded2027[0].id).toBe("y2027");
  });

  it("should return empty array for a month with no decos", async () => {
    const loaded = await getCalendarDecos(2026, 5);
    expect(loaded).toEqual([]);
  });

  it("should use correct storage key format (YYYY_MM)", async () => {
    await saveCalendarDecos([makeDeco("test")], 2026, 0); // January = month 0
    // Key should be dollys_calendar_deco_2026_01
    expect(store["dollys_calendar_deco_2026_01"]).toBeDefined();
    const parsed = JSON.parse(store["dollys_calendar_deco_2026_01"]);
    expect(parsed[0].id).toBe("test");
  });

  it("should use correct key for December (month 11)", async () => {
    await saveCalendarDecos([makeDeco("dec")], 2026, 11);
    expect(store["dollys_calendar_deco_2026_12"]).toBeDefined();
  });

  describe("Migration from global to monthly", () => {
    it("should migrate global decos to the specified month", async () => {
      // Set up legacy global decos
      const globalDecos = [makeDeco("global1"), makeDeco("global2")];
      store["dollys_calendar_deco"] = JSON.stringify(globalDecos);

      const result = await migrateGlobalDecosToMonth(2026, 3); // April

      // Should return the migrated decos
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("global1");

      // Global key should be removed
      expect(store["dollys_calendar_deco"]).toBeUndefined();

      // Month-specific key should have the decos
      const monthDecos = await getCalendarDecos(2026, 3);
      expect(monthDecos).toHaveLength(2);
    });

    it("should not overwrite existing month decos during migration", async () => {
      // Set up legacy global decos
      store["dollys_calendar_deco"] = JSON.stringify([makeDeco("global1")]);
      // Set up existing month decos
      store["dollys_calendar_deco_2026_04"] = JSON.stringify([makeDeco("existing1"), makeDeco("existing2")]);

      const result = await migrateGlobalDecosToMonth(2026, 3); // April (month index 3 = 04)

      // Should return existing month decos, not overwrite
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("existing1");

      // Global key should still be removed
      expect(store["dollys_calendar_deco"]).toBeUndefined();
    });

    it("should return empty array if no global decos exist", async () => {
      const result = await migrateGlobalDecosToMonth(2026, 3);
      expect(result).toEqual([]);
    });

    it("should handle empty global decos array", async () => {
      store["dollys_calendar_deco"] = JSON.stringify([]);
      const result = await migrateGlobalDecosToMonth(2026, 3);
      expect(result).toEqual([]);
    });
  });

  describe("Legacy fallback", () => {
    it("should fall back to global key when no year/month provided", async () => {
      store["dollys_calendar_deco"] = JSON.stringify([makeDeco("legacy1")]);

      const loaded = await getCalendarDecos();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe("legacy1");
    });

    it("should save to global key when no year/month provided", async () => {
      await saveCalendarDecos([makeDeco("legacy_save")]);
      expect(store["dollys_calendar_deco"]).toBeDefined();
      const parsed = JSON.parse(store["dollys_calendar_deco"]);
      expect(parsed[0].id).toBe("legacy_save");
    });
  });

  describe("Deco properties preserved", () => {
    it("should preserve all deco properties through save/load cycle", async () => {
      const deco: CalendarDeco = {
        id: "full_deco",
        emoji: "",
        catStickerId: "cat25",
        x: 35.5,
        y: 72.3,
        scale: 1.3,
        rotation: 90,
      };

      await saveCalendarDecos([deco], 2026, 3);
      const loaded = await getCalendarDecos(2026, 3);

      expect(loaded[0]).toEqual(deco);
    });

    it("should preserve cat2StickerId", async () => {
      const deco: CalendarDeco = {
        id: "cat2_deco",
        emoji: "",
        cat2StickerId: "cat2_15",
        x: 50,
        y: 50,
        scale: 1.0,
        rotation: 45,
      };

      await saveCalendarDecos([deco], 2026, 3);
      const loaded = await getCalendarDecos(2026, 3);

      expect(loaded[0].cat2StickerId).toBe("cat2_15");
    });

    it("should preserve itemStickerId", async () => {
      const deco: CalendarDeco = {
        id: "item_deco",
        emoji: "",
        itemStickerId: "item_star",
        x: 20,
        y: 80,
        scale: 0.8,
        rotation: 180,
      };

      await saveCalendarDecos([deco], 2026, 3);
      const loaded = await getCalendarDecos(2026, 3);

      expect(loaded[0].itemStickerId).toBe("item_star");
    });
  });
});

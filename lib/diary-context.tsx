import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  type DiaryEntry,
  type Mood,
  type PlacedDeco,
  type CalendarDeco,
  type StreakData,
  getAllEntries,
  saveEntry,
  updateEntry,
  deleteEntry,
  searchEntries,
  getCalendarDecos,
  saveCalendarDecos,
  updateStreak,
  getStreak,
} from "./diary-storage";

interface DiaryContextType {
  entries: DiaryEntry[];
  loading: boolean;
  refresh: () => Promise<void>;
  addEntry: (entry: {
    date: string;
    title: string;
    content: string;
    mood: Mood;
    photos?: string[];
    decoStickers?: PlacedDeco[];
  }) => Promise<DiaryEntry>;
  editEntry: (id: string, updates: Partial<Omit<DiaryEntry, "id" | "createdAt">>) => Promise<DiaryEntry | null>;
  removeEntry: (id: string) => Promise<boolean>;
  search: (query: string) => Promise<DiaryEntry[]>;
  getEntryForDate: (date: string) => DiaryEntry | undefined;
  // Calendar decos
  calendarDecos: CalendarDeco[];
  setCalendarDecos: (decos: CalendarDeco[]) => Promise<void>;
  // Streak
  streak: StreakData;
}

const DiaryContext = createContext<DiaryContextType | null>(null);

export function DiaryProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarDecos, setCalendarDecosState] = useState<CalendarDeco[]>([]);
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, lastEntryDate: "", longestStreak: 0 });

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [data, decos, streakData] = await Promise.all([
        getAllEntries(),
        getCalendarDecos(),
        getStreak(),
      ]);
      setEntries(data.sort((a, b) => b.date.localeCompare(a.date)));
      setCalendarDecosState(decos);
      setStreak(streakData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addEntry = useCallback(
    async (entry: {
      date: string;
      title: string;
      content: string;
      mood: Mood;
      photos?: string[];
      decoStickers?: PlacedDeco[];
    }) => {
      const saved = await saveEntry({
        ...entry,
        photos: entry.photos ?? [],
        decoStickers: entry.decoStickers ?? [],
      });
      const streakData = await updateStreak();
      setStreak(streakData);
      await refresh();
      return saved;
    },
    [refresh]
  );

  const editEntry = useCallback(
    async (id: string, updates: Partial<Omit<DiaryEntry, "id" | "createdAt">>) => {
      const updated = await updateEntry(id, updates);
      await refresh();
      return updated;
    },
    [refresh]
  );

  const removeEntry = useCallback(
    async (id: string) => {
      const result = await deleteEntry(id);
      const streakData = await updateStreak();
      setStreak(streakData);
      await refresh();
      return result;
    },
    [refresh]
  );

  const search = useCallback(async (query: string) => {
    return searchEntries(query);
  }, []);

  const getEntryForDate = useCallback(
    (date: string) => {
      return entries.find((e) => e.date === date);
    },
    [entries]
  );

  const setCalendarDecosHandler = useCallback(async (decos: CalendarDeco[]) => {
    await saveCalendarDecos(decos);
    setCalendarDecosState(decos);
  }, []);

  return (
    <DiaryContext.Provider
      value={{
        entries,
        loading,
        refresh,
        addEntry,
        editEntry,
        removeEntry,
        search,
        getEntryForDate,
        calendarDecos,
        setCalendarDecos: setCalendarDecosHandler,
        streak,
      }}
    >
      {children}
    </DiaryContext.Provider>
  );
}

export function useDiary() {
  const ctx = useContext(DiaryContext);
  if (!ctx) throw new Error("useDiary must be used within DiaryProvider");
  return ctx;
}

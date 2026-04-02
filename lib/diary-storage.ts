import AsyncStorage from "@react-native-async-storage/async-storage";

// === Mood Types ===
export type Mood = "happy" | "sad" | "angry" | "sleepy" | "love" | "neutral" | "excited";

export const MOOD_EMOJI: Record<Mood, string> = {
  happy: "😊",
  sad: "😢",
  angry: "😡",
  sleepy: "😴",
  love: "🥰",
  neutral: "😐",
  excited: "🤩",
};

export const MOOD_LABELS: Record<Mood, string> = {
  happy: "嬉しい",
  sad: "悲しい",
  angry: "怒り",
  sleepy: "眠い",
  love: "幸せ",
  neutral: "普通",
  excited: "ワクワク",
};

// === Deco Sticker Types ===
export interface PlacedDeco {
  id: string;
  emoji: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number; // 0.5 - 2.0
}

// === Diary Entry ===
export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string;
  mood: Mood;
  photos: string[]; // URIs, max 3
  decoStickers: PlacedDeco[]; // max 10
  createdAt: string;
  updatedAt: string;
}

// === Calendar Deco (on calendar screen) ===
export interface CalendarDeco {
  id: string;
  emoji: string;
  catStickerId?: string; // cat01-cat32 if using cat sticker image
  x: number;
  y: number;
  scale: number;
}

// === Storage Keys ===
const STORAGE_KEY = "dollys_diary_entries";
const CALENDAR_DECO_KEY = "dollys_calendar_deco";
const STREAK_KEY = "dollys_streak";
const PASSCODE_KEY = "dollys_passcode";
const SETTINGS_KEY = "dollys_settings";

// === Diary CRUD ===
export async function getAllEntries(): Promise<DiaryEntry[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as DiaryEntry[];
  } catch {
    return [];
  }
}

export async function getEntryByDate(date: string): Promise<DiaryEntry | null> {
  const entries = await getAllEntries();
  return entries.find((e) => e.date === date) ?? null;
}

export async function getEntryById(id: string): Promise<DiaryEntry | null> {
  const entries = await getAllEntries();
  return entries.find((e) => e.id === id) ?? null;
}

export async function saveEntry(
  entry: Omit<DiaryEntry, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<DiaryEntry> {
  const entries = await getAllEntries();
  const existing = entries.find((e) => e.date === entry.date);

  if (existing) {
    const updated: DiaryEntry = {
      ...existing,
      ...entry,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    const newEntries = entries.map((e) => (e.id === existing.id ? updated : e));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    return updated;
  }

  const newEntry: DiaryEntry = {
    ...entry,
    id: entry.id ?? `diary_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    photos: entry.photos ?? [],
    decoStickers: entry.decoStickers ?? [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  entries.push(newEntry);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  return newEntry;
}

export async function updateEntry(
  id: string,
  updates: Partial<Omit<DiaryEntry, "id" | "createdAt">>
): Promise<DiaryEntry | null> {
  const entries = await getAllEntries();
  const index = entries.findIndex((e) => e.id === id);
  if (index === -1) return null;

  const updated: DiaryEntry = {
    ...entries[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  entries[index] = updated;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  return updated;
}

export async function deleteEntry(id: string): Promise<boolean> {
  const entries = await getAllEntries();
  const filtered = entries.filter((e) => e.id !== id);
  if (filtered.length === entries.length) return false;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export async function searchEntries(query: string): Promise<DiaryEntry[]> {
  const entries = await getAllEntries();
  const lower = query.toLowerCase();
  return entries.filter(
    (e) =>
      e.title.toLowerCase().includes(lower) ||
      e.content.toLowerCase().includes(lower)
  );
}

export function getEntriesForMonth(
  entries: DiaryEntry[],
  year: number,
  month: number
): Set<string> {
  const dates = new Set<string>();
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  for (const entry of entries) {
    if (entry.date.startsWith(prefix)) {
      dates.add(entry.date);
    }
  }
  return dates;
}

// === Calendar Deco ===
export async function getCalendarDecos(): Promise<CalendarDeco[]> {
  try {
    const data = await AsyncStorage.getItem(CALENDAR_DECO_KEY);
    if (!data) return [];
    return JSON.parse(data) as CalendarDeco[];
  } catch {
    return [];
  }
}

export async function saveCalendarDecos(decos: CalendarDeco[]): Promise<void> {
  await AsyncStorage.setItem(CALENDAR_DECO_KEY, JSON.stringify(decos));
}

// === Streak ===
export interface StreakData {
  currentStreak: number;
  lastEntryDate: string;
  longestStreak: number;
}

export async function getStreak(): Promise<StreakData> {
  try {
    const data = await AsyncStorage.getItem(STREAK_KEY);
    if (!data) return { currentStreak: 0, lastEntryDate: "", longestStreak: 0 };
    return JSON.parse(data) as StreakData;
  } catch {
    return { currentStreak: 0, lastEntryDate: "", longestStreak: 0 };
  }
}

export async function updateStreak(): Promise<StreakData> {
  const entries = await getAllEntries();
  if (entries.length === 0) {
    const data: StreakData = { currentStreak: 0, lastEntryDate: "", longestStreak: 0 };
    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(data));
    return data;
  }

  const sortedDates = [...new Set(entries.map((e) => e.date))].sort().reverse();
  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 86400000));

  let streak = 0;
  if (sortedDates[0] === today || sortedDates[0] === yesterday) {
    let checkDate = sortedDates[0] === today ? today : yesterday;
    for (const d of sortedDates) {
      if (d === checkDate) {
        streak++;
        const prev = new Date(checkDate);
        prev.setDate(prev.getDate() - 1);
        checkDate = formatDate(prev);
      } else if (d < checkDate) {
        break;
      }
    }
  }

  const prev = await getStreak();
  const data: StreakData = {
    currentStreak: streak,
    lastEntryDate: sortedDates[0],
    longestStreak: Math.max(prev.longestStreak, streak),
  };
  await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(data));
  return data;
}

// === Passcode ===
export async function getPasscode(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PASSCODE_KEY);
  } catch {
    return null;
  }
}

export async function setPasscode(code: string | null): Promise<void> {
  if (code === null) {
    await AsyncStorage.removeItem(PASSCODE_KEY);
  } else {
    await AsyncStorage.setItem(PASSCODE_KEY, code);
  }
}

// === Settings ===
export interface AppSettings {
  darkMode: boolean;
  notificationsEnabled: boolean;
}

export async function getSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!data) return { darkMode: false, notificationsEnabled: false };
    return JSON.parse(data) as AppSettings;
  } catch {
    return { darkMode: false, notificationsEnabled: false };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// === Backup / Export ===
export async function exportAllData(): Promise<string> {
  const entries = await getAllEntries();
  const calendarDecos = await getCalendarDecos();
  const streak = await getStreak();
  const settings = await getSettings();
  return JSON.stringify({ entries, calendarDecos, streak, settings }, null, 2);
}

export async function importAllData(jsonStr: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonStr);
    if (data.entries) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data.entries));
    if (data.calendarDecos) await AsyncStorage.setItem(CALENDAR_DECO_KEY, JSON.stringify(data.calendarDecos));
    if (data.streak) await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(data.streak));
    if (data.settings) await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
    return true;
  } catch {
    return false;
  }
}

// === Utility ===
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

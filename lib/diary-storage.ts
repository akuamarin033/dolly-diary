import AsyncStorage from "@react-native-async-storage/async-storage";

// === Mood Types (Cat face stickers) ===
export type Mood = "happy" | "laugh" | "excited" | "worried" | "depressed" | "cry" | "angry" | "surprised" | "neutral" | "sad" | "love" | "rage" | "calm" | "tired" | "annoyed" | "tantrum";

export const MOOD_LABELS: Record<Mood, string> = {
  happy: "嬉しい",
  laugh: "笑い",
  excited: "ウキウキ",
  worried: "不安",
  depressed: "落ち込み",
  cry: "泣き",
  angry: "怒り",
  surprised: "驚き",
  neutral: "普通",
  sad: "悲しい",
  love: "ラブ",
  rage: "激怒",
  calm: "穏やか",
  tired: "疲れ",
  annoyed: "困惑",
  tantrum: "大激怒",
};

// Cat mood sticker IDs map to cat sticker images (cat01-cat10)
export const MOOD_CAT_IDS: Record<Mood, string> = {
  happy: "cat01",
  laugh: "cat02",
  excited: "cat03",
  worried: "cat04",
  depressed: "cat05",
  cry: "cat06",
  angry: "cat07",
  surprised: "cat08",
  neutral: "cat09",
  sad: "cat10",
  love: "cat11",
  rage: "cat20",
  calm: "cat21",
  tired: "cat22",
  annoyed: "cat23",
  tantrum: "cat24",
};

// === Weather Types (Cat weather stickers) ===
export type Weather = "sunny" | "cloudy" | "rainy" | "thunder" | "windy" | "snowy" | "rainbow" | "night";

export const WEATHER_LABELS: Record<Weather, string> = {
  sunny: "晴れ",
  cloudy: "曇り",
  rainy: "雨",
  thunder: "雷",
  windy: "風",
  snowy: "雪",
  rainbow: "虹",
  night: "夜",
};

// Cat weather sticker IDs map to cat sticker images
export const WEATHER_CAT_IDS: Record<Weather, string> = {
  sunny: "cat12",
  cloudy: "cat13",
  rainy: "cat14",
  thunder: "cat15",
  snowy: "cat16",
  windy: "cat17",
  rainbow: "cat18",
  night: "cat19",
};

// === Deco Sticker Types ===
export interface PlacedDeco {
  id: string;
  emoji: string;
  catStickerId?: string;
  itemStickerId?: string;
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
  weather?: Weather;
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
  cat2StickerId?: string; // cat2_01-cat2_44 if using cat2 sticker image
  itemStickerId?: string; // item sticker image id
  x: number;
  y: number;
  scale: number;
  rotation: number; // degrees 0-360
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

// === Calendar Deco (per-month storage) ===
function getMonthDecoKey(year: number, month: number): string {
  return `${CALENDAR_DECO_KEY}_${year}_${String(month + 1).padStart(2, "0")}`;
}

export async function getCalendarDecos(year?: number, month?: number): Promise<CalendarDeco[]> {
  try {
    // If year/month provided, get month-specific decos
    if (year !== undefined && month !== undefined) {
      const key = getMonthDecoKey(year, month);
      const data = await AsyncStorage.getItem(key);
      if (!data) return [];
      return JSON.parse(data) as CalendarDeco[];
    }
    // Fallback: legacy global key (for migration)
    const data = await AsyncStorage.getItem(CALENDAR_DECO_KEY);
    if (!data) return [];
    return JSON.parse(data) as CalendarDeco[];
  } catch {
    return [];
  }
}

export async function saveCalendarDecos(decos: CalendarDeco[], year?: number, month?: number): Promise<void> {
  if (year !== undefined && month !== undefined) {
    const key = getMonthDecoKey(year, month);
    await AsyncStorage.setItem(key, JSON.stringify(decos));
  } else {
    await AsyncStorage.setItem(CALENDAR_DECO_KEY, JSON.stringify(decos));
  }
}

// Migrate legacy global decos to the current month (one-time)
export async function migrateGlobalDecosToMonth(year: number, month: number): Promise<CalendarDeco[]> {
  try {
    const globalData = await AsyncStorage.getItem(CALENDAR_DECO_KEY);
    if (!globalData) return [];
    const globalDecos = JSON.parse(globalData) as CalendarDeco[];
    if (globalDecos.length === 0) return [];
    // Save to current month
    const key = getMonthDecoKey(year, month);
    const existingData = await AsyncStorage.getItem(key);
    if (!existingData) {
      // Only migrate if no month-specific data exists yet
      await AsyncStorage.setItem(key, JSON.stringify(globalDecos));
    }
    // Remove global key to prevent re-migration
    await AsyncStorage.removeItem(CALENDAR_DECO_KEY);
    return existingData ? (JSON.parse(existingData) as CalendarDeco[]) : globalDecos;
  } catch {
    return [];
  }
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
  language: "ja" | "en";
}

export async function getSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!data) return { darkMode: false, notificationsEnabled: false, language: "ja" };
    return JSON.parse(data) as AppSettings;
  } catch {
    return { darkMode: false, notificationsEnabled: false, language: "ja" };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// === Backup / Export ===
export async function exportAllData(): Promise<string> {
  const entries = await getAllEntries();
  // Export all month-specific decos
  const allKeys = await AsyncStorage.getAllKeys();
  const decoKeys = allKeys.filter((k) => k.startsWith(CALENDAR_DECO_KEY + "_"));
  const monthDecos: Record<string, CalendarDeco[]> = {};
  for (const key of decoKeys) {
    const data = await AsyncStorage.getItem(key);
    if (data) monthDecos[key] = JSON.parse(data) as CalendarDeco[];
  }
  // Also export legacy global if it exists
  const globalDecos = await AsyncStorage.getItem(CALENDAR_DECO_KEY);
  const streak = await getStreak();
  const settings = await getSettings();
  return JSON.stringify({
    entries,
    calendarDecos: globalDecos ? JSON.parse(globalDecos) : [],
    monthCalendarDecos: monthDecos,
    streak,
    settings,
  }, null, 2);
}

export async function importAllData(jsonStr: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonStr);
    if (data.entries) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data.entries));
    // Import legacy global decos
    if (data.calendarDecos && !data.monthCalendarDecos) {
      await AsyncStorage.setItem(CALENDAR_DECO_KEY, JSON.stringify(data.calendarDecos));
    }
    // Import month-specific decos
    if (data.monthCalendarDecos) {
      for (const [key, decos] of Object.entries(data.monthCalendarDecos)) {
        await AsyncStorage.setItem(key, JSON.stringify(decos));
      }
    }
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

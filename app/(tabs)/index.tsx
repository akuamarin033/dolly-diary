import { useCallback, useMemo, useState } from "react";
import { Text, View, ScrollView, Pressable, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { Calendar } from "@/components/calendar";
import { useDiary } from "@/lib/diary-context";
import { useColors } from "@/hooks/use-colors";
import { getEntriesForMonth, MOOD_EMOJI, type CalendarDeco } from "@/lib/diary-storage";

const SCALE_STEPS = [0.6, 0.8, 1.0, 1.3, 1.6, 2.0];

export default function CalendarScreen() {
  const colors = useColors();
  const router = useRouter();
  const { entries, getEntryForDate, calendarDecos, setCalendarDecos, streak } = useDiary();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const entryDates = useMemo(() => getEntriesForMonth(entries, year, month), [entries, year, month]);

  const selectedEntry = useMemo(() => {
    if (!selectedDate) return null;
    return getEntryForDate(selectedDate) ?? null;
  }, [selectedDate, getEntryForDate]);

  const handlePrevMonth = useCallback(() => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
    setSelectedDate(null);
  }, [month]);

  const handleNextMonth = useCallback(() => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
    setSelectedDate(null);
  }, [month]);

  const handleSelectDate = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleOpenDiary = useCallback(() => {
    if (!selectedDate) return;
    if (selectedEntry) {
      router.push(`/diary/${selectedDate}` as any);
    } else {
      router.push(`/diary/edit?date=${selectedDate}` as any);
    }
  }, [selectedDate, selectedEntry, router]);

  // Toggle deco scale on tap
  const handleDecoTap = useCallback(
    (decoId: string) => {
      const updated = calendarDecos.map((d) => {
        if (d.id !== decoId) return d;
        const currentIdx = SCALE_STEPS.findIndex((s) => Math.abs(s - d.scale) < 0.05);
        const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % SCALE_STEPS.length : 0;
        return { ...d, scale: SCALE_STEPS[nextIdx] };
      });
      setCalendarDecos(updated);
    },
    [calendarDecos, setCalendarDecos]
  );

  // Remove a deco
  const handleDecoRemove = useCallback(
    (decoId: string) => {
      const updated = calendarDecos.filter((d) => d.id !== decoId);
      setCalendarDecos(updated);
    },
    [calendarDecos, setCalendarDecos]
  );

  return (
    <ScreenContainer className="px-4 pt-2">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header with streak */}
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>カレンダー</Text>
          {streak.currentStreak > 0 && (
            <View style={[styles.streakBadge, { backgroundColor: colors.warning + "22" }]}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={[styles.streakText, { color: colors.warning }]}>
                {streak.currentStreak}日連続
              </Text>
            </View>
          )}
        </View>

        {/* Calendar with deco overlay */}
        <View style={styles.calendarWrapper}>
          <Calendar
            year={year}
            month={month}
            selectedDate={selectedDate}
            entryDates={entryDates}
            onSelectDate={handleSelectDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />

          {/* Deco stickers overlay */}
          {calendarDecos.map((deco) => (
            <Pressable
              key={deco.id}
              onPress={() => handleDecoTap(deco.id)}
              onLongPress={() => handleDecoRemove(deco.id)}
              style={[
                styles.decoSticker,
                {
                  left: `${deco.x}%` as any,
                  top: `${deco.y}%` as any,
                  transform: [{ scale: deco.scale }],
                },
              ]}
            >
              <Text style={styles.decoEmoji}>{deco.emoji}</Text>
            </Pressable>
          ))}
        </View>

        {/* Motivation card */}
        {streak.currentStreak > 0 && (
          <View style={[styles.motivCard, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
            <Text style={[styles.motivText, { color: colors.primary }]}>
              {streak.currentStreak >= 7
                ? "素晴らしい！1週間以上続いています！ 🌟"
                : streak.currentStreak >= 3
                  ? "いい調子！続けていきましょう！ ✨"
                  : "今日も日記を書きましょう！ 📝"}
            </Text>
          </View>
        )}

        {/* Selected date info */}
        {selectedDate && (
          <View
            style={[
              styles.selectedCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {selectedEntry ? (
              <View>
                <View style={styles.entryHeader}>
                  <Text style={{ fontSize: 28 }}>{MOOD_EMOJI[selectedEntry.mood]}</Text>
                  <View style={styles.entryInfo}>
                    <Text style={[styles.entryTitle, { color: colors.foreground }]}>
                      {selectedEntry.title}
                    </Text>
                    <Text style={[styles.entryDate, { color: colors.muted }]}>{selectedDate}</Text>
                  </View>
                </View>
                <Text style={[styles.entryPreview, { color: colors.muted }]} numberOfLines={2}>
                  {selectedEntry.content}
                </Text>
                <View style={styles.buttonRow}>
                  <Text style={[styles.linkText, { color: colors.primary }]} onPress={handleOpenDiary}>
                    詳細を見る →
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.muted }]}>
                  この日の日記はまだありません
                </Text>
                <Text style={[styles.linkText, { color: colors.primary }]} onPress={handleOpenDiary}>
                  日記を書く ✏️
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  streakEmoji: {
    fontSize: 16,
  },
  streakText: {
    fontSize: 13,
    fontWeight: "700",
  },
  calendarWrapper: {
    position: "relative",
  },
  decoSticker: {
    position: "absolute",
    zIndex: 10,
  },
  decoEmoji: {
    fontSize: 28,
  },
  motivCard: {
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  motivText: {
    fontSize: 14,
    fontWeight: "600",
  },
  selectedCard: {
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  entryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  entryInfo: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  entryDate: {
    fontSize: 13,
    marginTop: 2,
  },
  entryPreview: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  buttonRow: {
    marginTop: 12,
    alignItems: "flex-end",
  },
  linkText: {
    fontSize: 15,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 14,
  },
});

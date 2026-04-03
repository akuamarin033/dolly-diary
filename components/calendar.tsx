import React, { useMemo } from "react";
import { Text, View, Pressable, StyleSheet } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { formatDate } from "@/lib/diary-storage";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

// Month-specific background colors (soft pastel tones)
const MONTH_COLORS: Record<number, { bg: string; headerBg: string }> = {
  0: { bg: "#F0F4FF", headerBg: "#D6E4FF" },  // January - 冬の青
  1: { bg: "#FFF0F5", headerBg: "#FFD6E7" },  // February - バレンタインピンク
  2: { bg: "#F0FFF0", headerBg: "#D4F5D4" },  // March - 春の緑
  3: { bg: "#FFF8F0", headerBg: "#FFE8CC" },  // April - 桜オレンジ
  4: { bg: "#F0FFF8", headerBg: "#C8F7E1" },  // May - 新緑
  5: { bg: "#F0F0FF", headerBg: "#D4D4FF" },  // June - 梅雨の紫
  6: { bg: "#FFFFF0", headerBg: "#FFF5CC" },  // July - 夏の黄色
  7: { bg: "#FFF5F0", headerBg: "#FFD9CC" },  // August - 夏のオレンジ
  8: { bg: "#FFF8F5", headerBg: "#FFE6D9" },  // September - 秋のベージュ
  9: { bg: "#FFF5F0", headerBg: "#FFDACC" },  // October - 紅葉
  10: { bg: "#F8F0FF", headerBg: "#E8D4FF" }, // November - 秋の紫
  11: { bg: "#F0F8FF", headerBg: "#CCE8FF" }, // December - 冬の水色
};

interface CalendarProps {
  year: number;
  month: number; // 0-indexed
  selectedDate: string | null;
  entryDates: Set<string>;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function Calendar({
  year,
  month,
  selectedDate,
  entryDates,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: CalendarProps) {
  const colors = useColors();
  const today = formatDate(new Date());
  const monthColor = MONTH_COLORS[month] ?? MONTH_COLORS[0];

  const monthLabel = `${year}年${month + 1}月`;

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    // Fill remaining cells
    while (days.length % 7 !== 0) {
      days.push(null);
    }
    return days;
  }, [year, month]);

  const weeks = useMemo(() => {
    const result: (number | null)[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  return (
    <View style={[styles.container, { backgroundColor: monthColor.bg, borderColor: colors.border }]}>
      {/* Month navigation header */}
      <View style={[styles.header, { backgroundColor: monthColor.headerBg }]}>
        <Pressable
          onPress={onPrevMonth}
          style={({ pressed }) => [
            styles.navButton,
            { backgroundColor: "rgba(255,255,255,0.6)" },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={[styles.navButtonText, { color: colors.foreground }]}>◀</Text>
        </Pressable>
        <Text style={[styles.monthLabel, { color: colors.foreground }]}>{monthLabel}</Text>
        <Pressable
          onPress={onNextMonth}
          style={({ pressed }) => [
            styles.navButton,
            { backgroundColor: "rgba(255,255,255,0.6)" },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={[styles.navButtonText, { color: colors.foreground }]}>▶</Text>
        </Pressable>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day, i) => (
          <View key={day} style={styles.weekdayCell}>
            <Text
              style={[
                styles.weekdayText,
                {
                  color: i === 0 ? colors.error : i === 6 ? colors.primary : colors.muted,
                },
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((day, di) => {
            if (day === null) {
              return <View key={`empty-${di}`} style={styles.dayCell} />;
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;
            const hasEntry = entryDates.has(dateStr);

            return (
              <Pressable
                key={dateStr}
                onPress={() => onSelectDate(dateStr)}
                style={({ pressed }) => [
                  styles.dayCell,
                  styles.dayCellBorder,
                  isSelected && { backgroundColor: colors.primary, borderRadius: 8, borderColor: colors.primary },
                  isToday && !isSelected && {
                    backgroundColor: `${colors.primary}22`,
                    borderRadius: 8,
                    borderColor: colors.primary,
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    {
                      color:
                        isSelected
                          ? "#FFFFFF"
                          : di === 0
                            ? colors.error
                            : di === 6
                              ? colors.primary
                              : colors.foreground,
                    },
                    isToday && !isSelected && { fontWeight: "700" },
                  ]}
                >
                  {day}
                </Text>
                {hasEntry && (
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: isSelected ? "#FFFFFF" : colors.primary,
                      },
                    ]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonText: {
    fontSize: 14,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: "700",
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: "600",
  },
  weekRow: {
    flexDirection: "row",
  },
  dayCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    minHeight: 38,
    margin: 1,
  },
  dayCellBorder: {
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.08)",
    borderRadius: 6,
  },
  dayText: {
    fontSize: 15,
    fontWeight: "500",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },
});

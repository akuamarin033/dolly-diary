import React, { useMemo } from "react";
import { Text, View, Pressable, StyleSheet, Image, type ImageSourcePropType } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { formatDate } from "@/lib/diary-storage";
import { useI18n } from "@/lib/i18n";

const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];
const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Month-specific background colors (soft pastel tones)
export const MONTH_COLORS: Record<number, { bg: string; headerBg: string }> = {
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

// Month background images (0-indexed: 0=January, 11=December)
const MONTH_BG_IMAGES: Record<number, ImageSourcePropType> = {
  0: require("@/assets/images/calendar-bg/month-01.png"),
  1: require("@/assets/images/calendar-bg/month-02.png"),
  2: require("@/assets/images/calendar-bg/month-03.png"),
  3: require("@/assets/images/calendar-bg/month-04.png"),
  4: require("@/assets/images/calendar-bg/month-05.png"),
  5: require("@/assets/images/calendar-bg/month-06.png"),
  6: require("@/assets/images/calendar-bg/month-07.png"),
  7: require("@/assets/images/calendar-bg/month-08.png"),
  8: require("@/assets/images/calendar-bg/month-09.png"),
  9: require("@/assets/images/calendar-bg/month-10.png"),
  10: require("@/assets/images/calendar-bg/month-11.png"),
  11: require("@/assets/images/calendar-bg/month-12.png"),
};

interface CalendarProps {
  year: number;
  month: number; // 0-indexed
  selectedDate: string | null;
  entryDates: Set<string>;
  onSelectDate: (date: string) => void;
}

export function Calendar({
  year,
  month,
  selectedDate,
  entryDates,
  onSelectDate,
}: CalendarProps) {
  const colors = useColors();
  const { language } = useI18n();
  const today = formatDate(new Date());
  const monthColor = MONTH_COLORS[month] ?? MONTH_COLORS[0];
  const bgImage = MONTH_BG_IMAGES[month];

  const WEEKDAYS = language === "en" ? WEEKDAYS_EN : WEEKDAYS_JA;

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
    // Fill remaining cells to complete weeks
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
      {/* Month background image - centered, semi-transparent */}
      {bgImage && (
        <View style={styles.bgImageContainer} pointerEvents="none">
          <Image
            source={bgImage}
            style={styles.bgImage}
            resizeMode="contain"
          />
        </View>
      )}

      {/* Weekday headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day, i) => (
          <View key={day} style={styles.weekdayCell}>
            <Text
              style={[
                styles.weekdayText,
                {
                  color: i === 0 ? "#D32F2F" : i === 6 ? "#1976D2" : "#5D4037",
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
              return <View key={`empty-${di}`} style={[styles.dayCell, styles.dayCellBorder]} />;
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
                  isToday && !isSelected && {
                    backgroundColor: `${colors.primary}18`,
                  },
                  isSelected && { backgroundColor: `${colors.primary}30` },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    {
                      color:
                        di === 0
                          ? "#D32F2F"
                          : di === 6
                            ? "#1976D2"
                            : "#2C1810",
                    },
                    isToday && { fontWeight: "800" },
                  ]}
                >
                  {day}
                </Text>
                {hasEntry && (
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: colors.primary,
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
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    flex: 1,
    position: "relative",
  },
  bgImageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 0,
    opacity: 0.25,
  },
  bgImage: {
    width: "65%",
    height: "65%",
  },
  weekdayRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 4,
    zIndex: 1,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
  },
  weekdayText: {
    fontSize: 14,
    fontWeight: "700",
  },
  weekRow: {
    flexDirection: "row",
    flex: 1,
    zIndex: 1,
  },
  dayCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 4,
    paddingBottom: 2,
  },
  dayCellBorder: {
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.06)",
  },
  dayText: {
    fontSize: 16,
    fontWeight: "500",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },
});

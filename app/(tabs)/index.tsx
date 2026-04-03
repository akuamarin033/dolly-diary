import { useCallback, useMemo, useRef, useState } from "react";
import {
  Text,
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
  Image,
  LayoutChangeEvent,
} from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { Calendar } from "@/components/calendar";
import { DraggableDeco } from "@/components/draggable-deco";
import { useDiary } from "@/lib/diary-context";
import { useColors } from "@/hooks/use-colors";
import { getEntriesForMonth, MOOD_EMOJI, type CalendarDeco } from "@/lib/diary-storage";
import { CAT_STICKERS } from "@/lib/cat-stickers";

const SCALE_STEPS = [0.6, 0.8, 1.0, 1.3, 1.6, 2.0];

const QUICK_EMOJIS = [
  "🌸", "⭐", "❤️", "🎀", "✨", "🌈", "🍰", "🐱",
  "🌙", "🔥", "💖", "🦋", "🎵", "📝", "☀️", "🍓",
  "💫", "🎨", "🧁", "🌺", "😊", "🥰", "🤩", "😎",
];

type DecoTab = "icon" | "cat";

export default function CalendarScreen() {
  const colors = useColors();
  const router = useRouter();
  const { entries, getEntryForDate, calendarDecos, setCalendarDecos, streak } = useDiary();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDecoModal, setShowDecoModal] = useState(false);
  const [decoTab, setDecoTab] = useState<DecoTab>("icon");
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const scrollRef = useRef<ScrollView>(null);

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

  // Drag end - update position
  const handleDecoDragEnd = useCallback(
    (decoId: string, newX: number, newY: number) => {
      const updated = calendarDecos.map((d) => {
        if (d.id !== decoId) return d;
        return { ...d, x: newX, y: newY };
      });
      setCalendarDecos(updated);
    },
    [calendarDecos, setCalendarDecos]
  );

  // Add emoji deco
  const handleAddEmojiDeco = useCallback(
    (emoji: string) => {
      if (calendarDecos.length >= 20) return;
      const newDeco: CalendarDeco = {
        id: `deco_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        emoji,
        x: 10 + Math.random() * 70,
        y: 10 + Math.random() * 70,
        scale: 1.0,
      };
      setCalendarDecos([...calendarDecos, newDeco]);
      setShowDecoModal(false);
    },
    [calendarDecos, setCalendarDecos]
  );

  // Add cat deco
  const handleAddCatDeco = useCallback(
    (catId: string) => {
      if (calendarDecos.length >= 20) return;
      const newDeco: CalendarDeco = {
        id: `deco_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        emoji: "",
        catStickerId: catId,
        x: 10 + Math.random() * 70,
        y: 10 + Math.random() * 70,
        scale: 1.0,
      };
      setCalendarDecos([...calendarDecos, newDeco]);
      setShowDecoModal(false);
    },
    [calendarDecos, setCalendarDecos]
  );

  const handleCalendarLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerSize({ width, height });
  }, []);

  return (
    <ScreenContainer className="px-4 pt-2">
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        scrollEnabled={true}
      >
        {/* Header with streak */}
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>カレンダー</Text>
          <View style={styles.headerRight}>
            {streak.currentStreak > 0 && (
              <View style={[styles.streakBadge, { backgroundColor: colors.warning + "22" }]}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={[styles.streakText, { color: colors.warning }]}>
                  {streak.currentStreak}日連続
                </Text>
              </View>
            )}
            {/* Deco add button */}
            <Pressable
              onPress={() => setShowDecoModal(true)}
              style={({ pressed }) => [
                styles.addDecoBtn,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.addDecoBtnText}>+ デコ</Text>
            </Pressable>
          </View>
        </View>

        {/* Calendar with deco overlay */}
        <View style={styles.calendarWrapper} onLayout={handleCalendarLayout}>
          <Calendar
            year={year}
            month={month}
            selectedDate={selectedDate}
            entryDates={entryDates}
            onSelectDate={handleSelectDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />

          {/* Draggable deco stickers overlay */}
          {containerSize.width > 0 &&
            calendarDecos.map((deco) => (
              <DraggableDeco
                key={deco.id}
                deco={deco}
                containerWidth={containerSize.width}
                containerHeight={containerSize.height}
                onTap={handleDecoTap}
                onLongPress={handleDecoRemove}
                onDragEnd={handleDecoDragEnd}
              />
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

      {/* Deco add modal */}
      <Modal
        visible={showDecoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDecoModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDecoModal(false)}>
          <Pressable
            style={[styles.modalContent, { backgroundColor: colors.background }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHandle}>
              <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
            </View>

            <Text style={[styles.modalTitle, { color: colors.foreground }]}>デコを追加</Text>
            <Text style={[styles.modalSubtitle, { color: colors.muted }]}>
              {calendarDecos.length}/20 配置中
            </Text>

            {/* Tab switch: アイコン / ネコ */}
            <View style={styles.decoTabRow}>
              <Pressable
                onPress={() => setDecoTab("icon")}
                style={({ pressed }) => [
                  styles.decoTabBtn,
                  {
                    backgroundColor: decoTab === "icon" ? colors.primary : colors.surface,
                    borderColor: decoTab === "icon" ? colors.primary : colors.border,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={[styles.decoTabText, { color: decoTab === "icon" ? "#FFFFFF" : colors.foreground }]}>
                  🎨 アイコン
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setDecoTab("cat")}
                style={({ pressed }) => [
                  styles.decoTabBtn,
                  {
                    backgroundColor: decoTab === "cat" ? colors.primary : colors.surface,
                    borderColor: decoTab === "cat" ? colors.primary : colors.border,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={[styles.decoTabText, { color: decoTab === "cat" ? "#FFFFFF" : colors.foreground }]}>
                  🐱 ネコ
                </Text>
              </Pressable>
            </View>

            {decoTab === "icon" ? (
              <View style={styles.modalGrid}>
                {QUICK_EMOJIS.map((emoji, i) => (
                  <Pressable
                    key={i}
                    onPress={() => handleAddEmojiDeco(emoji)}
                    style={({ pressed }) => [
                      styles.modalCell,
                      { backgroundColor: pressed ? colors.border : colors.surface },
                    ]}
                  >
                    <Text style={styles.modalEmoji}>{emoji}</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <ScrollView style={styles.catScrollArea} showsVerticalScrollIndicator={false}>
                <View style={styles.modalCatGrid}>
                  {CAT_STICKERS.map((cat) => (
                    <Pressable
                      key={cat.id}
                      onPress={() => handleAddCatDeco(cat.id)}
                      style={({ pressed }) => [
                        styles.modalCatCell,
                        { backgroundColor: pressed ? colors.border : colors.surface },
                      ]}
                    >
                      <Image source={cat.source} style={styles.modalCatImage} resizeMode="contain" />
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  addDecoBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  addDecoBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  calendarWrapper: {
    position: "relative",
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: 40,
    maxHeight: "70%",
  },
  modalHandle: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
  },
  decoTabRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  decoTabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
  },
  decoTabText: {
    fontSize: 14,
    fontWeight: "700",
  },
  modalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  modalCell: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalEmoji: {
    fontSize: 28,
  },
  catScrollArea: {
    maxHeight: 300,
  },
  modalCatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    paddingBottom: 16,
  },
  modalCatCell: {
    width: 68,
    height: 68,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCatImage: {
    width: 52,
    height: 52,
  },
});

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
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { Calendar } from "@/components/calendar";
import { DraggableDeco } from "@/components/draggable-deco";
import { useDiary } from "@/lib/diary-context";
import { useColors } from "@/hooks/use-colors";
import { getEntriesForMonth, type CalendarDeco } from "@/lib/diary-storage";
import { CAT_STICKERS } from "@/lib/cat-stickers";

import { ITEM_STICKERS } from "@/lib/item-stickers";
import { BannerAd } from "@/components/banner-ad";
import { useI18n } from "@/lib/i18n";

const SCALE_STEPS = [0.6, 0.8, 1.0, 1.3, 1.6];

type DecoTab = "item" | "cat";

export default function CalendarScreen() {
  const colors = useColors();
  const router = useRouter();
  const { entries, getEntryForDate, calendarDecos, setCalendarDecos, streak } = useDiary();
  const { t } = useI18n();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDecoModal, setShowDecoModal] = useState(false);
  const [decoTab, setDecoTab] = useState<DecoTab>("item");
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const entryDates = useMemo(() => getEntriesForMonth(entries, year, month), [entries, year, month]);

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
    const entry = getEntryForDate(date);
    if (entry) {
      router.push(`/diary/${date}` as any);
    } else {
      router.push(`/diary/edit?date=${date}` as any);
    }
  }, [getEntryForDate, router]);

  // Use ref to always have latest calendarDecos for handlers called from DraggableDeco
  const calendarDecosRef = useRef(calendarDecos);
  calendarDecosRef.current = calendarDecos;

  // Toggle deco scale on tap (5 steps)
  const handleDecoTap = useCallback(
    (decoId: string) => {
      const current = calendarDecosRef.current;
      const updated = current.map((d) => {
        if (d.id !== decoId) return d;
        const currentIdx = SCALE_STEPS.findIndex((s) => Math.abs(s - d.scale) < 0.05);
        const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % SCALE_STEPS.length : 0;
        return { ...d, scale: SCALE_STEPS[nextIdx] };
      });
      setCalendarDecos(updated);
    },
    [setCalendarDecos]
  );

  const handleDecoRemove = useCallback(
    (decoId: string) => {
      Alert.alert(
        t("common.confirm"),
        t("calendar.deleteDeco"),
        [
          { text: t("calendar.cancel"), style: "cancel" },
          {
            text: t("calendar.delete"),
            style: "destructive",
            onPress: () => {
              const current = calendarDecosRef.current;
              const updated = current.filter((d) => d.id !== decoId);
              setCalendarDecos(updated);
            },
          },
        ]
      );
    },
    [setCalendarDecos]
  );

  const handleDecoDoubleTap = useCallback(
    (decoId: string) => {
      const current = calendarDecosRef.current;
      const updated = current.map((d) => {
        if (d.id !== decoId) return d;
        return { ...d, rotation: ((d.rotation ?? 0) + 45) % 360 };
      });
      setCalendarDecos(updated);
    },
    [setCalendarDecos]
  );

  const handleDecoDragEnd = useCallback(
    (decoId: string, newX: number, newY: number) => {
      const current = calendarDecosRef.current;
      const updated = current.map((d) => {
        if (d.id !== decoId) return d;
        return { ...d, x: newX, y: newY };
      });
      setCalendarDecos(updated);
    },
    [setCalendarDecos]
  );

  const handleAddItemDeco = useCallback(
    (itemId: string) => {
      const current = calendarDecosRef.current;
      if (current.length >= 20) return;
      const newDeco: CalendarDeco = {
        id: `deco_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        emoji: "",
        itemStickerId: itemId,
        x: 10 + Math.random() * 70,
        y: 10 + Math.random() * 70,
        scale: 1.0,
        rotation: 0,
      };
      setCalendarDecos([...current, newDeco]);
      setShowDecoModal(false);
    },
    [setCalendarDecos]
  );

  const handleAddCatDeco = useCallback(
    (catId: string) => {
      const current = calendarDecosRef.current;
      if (current.length >= 20) return;
      const newDeco: CalendarDeco = {
        id: `deco_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        emoji: "",
        catStickerId: catId,
        x: 10 + Math.random() * 70,
        y: 10 + Math.random() * 70,
        scale: 1.0,
        rotation: 0,
      };
      setCalendarDecos([...current, newDeco]);
      setShowDecoModal(false);
    },
    [setCalendarDecos]
  );

  const handleCalendarLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerSize({ width, height });
  }, []);

  return (
    <ScreenContainer className="px-4 pt-2">
        {/* Header with streak */}
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>{t("calendar.title")}</Text>
          <View style={styles.headerRight}>
            {streak.currentStreak > 0 && (
              <View style={[styles.streakBadge, { backgroundColor: colors.warning + "22" }]}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={[styles.streakText, { color: colors.warning }]}>
                  {streak.currentStreak}{t("calendar.streakDays")}
                </Text>
              </View>
            )}
            <Pressable
              onPress={() => setShowDecoModal(true)}
              style={({ pressed }) => [
                styles.addDecoBtn,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.addDecoBtnText}>{t("calendar.addDeco")}</Text>
            </Pressable>
          </View>
        </View>

        {/* Banner ad */}
        <BannerAd />

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

          {containerSize.width > 0 &&
            calendarDecos.map((deco) => (
              <DraggableDeco
                key={deco.id}
                deco={deco}
                containerWidth={containerSize.width}
                containerHeight={containerSize.height}
                onTap={handleDecoTap}
                onDoubleTap={handleDecoDoubleTap}
                onLongPress={handleDecoRemove}
                onDragEnd={handleDecoDragEnd}
              />
            ))}
        </View>



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

            <Text style={[styles.modalTitle, { color: colors.foreground }]}>{t("calendar.selectDeco")}</Text>
            <Text style={[styles.modalSubtitle, { color: colors.muted }]}>
              {calendarDecos.length}/20 {t("calendar.placed")}
            </Text>

            <View style={styles.decoTabRow}>
              <Pressable
                onPress={() => setDecoTab("item")}
                style={({ pressed }) => [
                  styles.decoTabBtn,
                  {
                    backgroundColor: decoTab === "item" ? colors.primary : colors.surface,
                    borderColor: decoTab === "item" ? colors.primary : colors.border,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={[styles.decoTabText, { color: decoTab === "item" ? "#FFFFFF" : colors.foreground }]}>
                  {t("calendar.itemStickers")}
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
                  {t("calendar.catStickers")}
                </Text>
              </Pressable>
            </View>

            {decoTab === "item" ? (
              <ScrollView style={styles.catScrollArea} showsVerticalScrollIndicator={false}>
                <View style={styles.modalCatGrid}>
                  {ITEM_STICKERS.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => handleAddItemDeco(item.id)}
                      style={({ pressed }) => [
                        styles.modalCatCell,
                        { backgroundColor: pressed ? colors.border : colors.surface },
                      ]}
                    >
                      <Image source={item.source} style={styles.modalCatImage} resizeMode="contain" />
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
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
    flex: 1,
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
  chevron: {
    fontSize: 24,
    fontWeight: "300",
  },
  emptyState: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
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

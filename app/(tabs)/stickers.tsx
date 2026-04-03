import { useCallback, useState } from "react";
import { Text, View, FlatList, Pressable, StyleSheet, Alert, Image, ScrollView } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useDiary } from "@/lib/diary-context";
import { useColors } from "@/hooks/use-colors";
import { type CalendarDeco } from "@/lib/diary-storage";
import { CAT_STICKERS } from "@/lib/cat-stickers";
import { ITEM_STICKERS } from "@/lib/item-stickers";

type MainTab = "item" | "cat";

export default function StickersScreen() {
  const colors = useColors();
  const { calendarDecos, setCalendarDecos } = useDiary();
  const [mainTab, setMainTab] = useState<MainTab>("item");

  const handleAddItemSticker = useCallback(
    (itemId: string) => {
      if (calendarDecos.length >= 20) {
        Alert.alert("上限に達しました", "デコステッカーは最大20個まで配置できます。\n不要なステッカーを長押しで削除してください。");
        return;
      }
      const newDeco: CalendarDeco = {
        id: `deco_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        emoji: "",
        itemStickerId: itemId,
        x: 10 + Math.random() * 70,
        y: 10 + Math.random() * 70,
        scale: 1.0,
        rotation: 0,
      };
      setCalendarDecos([...calendarDecos, newDeco]);
    },
    [calendarDecos, setCalendarDecos]
  );

  const handleAddCatSticker = useCallback(
    (catId: string) => {
      if (calendarDecos.length >= 20) {
        Alert.alert("上限に達しました", "デコステッカーは最大20個まで配置できます。\n不要なステッカーを長押しで削除してください。");
        return;
      }
      const newDeco: CalendarDeco = {
        id: `deco_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        emoji: "",
        catStickerId: catId,
        x: 10 + Math.random() * 70,
        y: 10 + Math.random() * 70,
        scale: 1.0,
        rotation: 0,
      };
      setCalendarDecos([...calendarDecos, newDeco]);
    },
    [calendarDecos, setCalendarDecos]
  );


  return (
    <ScreenContainer className="px-4 pt-2">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>ステッカー</Text>
          <Text style={[styles.countBadge, { color: colors.muted }]}>
            {calendarDecos.length}/20
          </Text>
        </View>

        <Text style={[styles.subtitle, { color: colors.muted }]}>
          ステッカーを選んでカレンダーに配置しよう！{"\n"}
          カレンダー上のステッカーをタップで5段階の拡大縮小、ダブルタップで回転、長押しで削除できます。
        </Text>

        {/* Main tabs: アイテム / ネコ */}
        <View style={styles.mainTabRow}>
          <Pressable
            onPress={() => setMainTab("item")}
            style={({ pressed }) => [
              styles.mainTab,
              {
                backgroundColor: mainTab === "item" ? colors.primary : colors.surface,
                borderColor: mainTab === "item" ? colors.primary : colors.border,
              },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={[styles.mainTabText, { color: mainTab === "item" ? "#FFFFFF" : colors.foreground }]}>
              🎨 アイテム
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMainTab("cat")}
            style={({ pressed }) => [
              styles.mainTab,
              {
                backgroundColor: mainTab === "cat" ? colors.primary : colors.surface,
                borderColor: mainTab === "cat" ? colors.primary : colors.border,
              },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={[styles.mainTabText, { color: mainTab === "cat" ? "#FFFFFF" : colors.foreground }]}>
              🐱 ネコ
            </Text>
          </Pressable>
        </View>

        {mainTab === "item" ? (
          <View style={[styles.stickerGrid, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {ITEM_STICKERS.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => handleAddItemSticker(item.id)}
                style={({ pressed }) => [
                  styles.stickerCell,
                  { backgroundColor: pressed ? colors.border : "transparent" },
                ]}
              >
                <Image source={item.source} style={styles.stickerImage} resizeMode="contain" />
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={[styles.stickerGrid, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {CAT_STICKERS.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => handleAddCatSticker(cat.id)}
                style={({ pressed }) => [
                  styles.stickerCell,
                  { backgroundColor: pressed ? colors.border : "transparent" },
                ]}
              >
                <Image source={cat.source} style={styles.stickerImage} resizeMode="contain" />
              </Pressable>
            ))}
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
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
  },
  countBadge: {
    fontSize: 14,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  mainTabRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  mainTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
  },
  mainTabText: {
    fontSize: 15,
    fontWeight: "700",
  },
  stickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    marginBottom: 12,
  },
  stickerCell: {
    width: "25%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    padding: 4,
  },
  stickerImage: {
    width: 56,
    height: 56,
  },

});

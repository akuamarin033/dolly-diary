import { useCallback, useState } from "react";
import { Text, View, FlatList, Pressable, StyleSheet, Alert, Image } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useDiary } from "@/lib/diary-context";
import { useColors } from "@/hooks/use-colors";
import { type CalendarDeco } from "@/lib/diary-storage";
import { CAT_STICKERS } from "@/lib/cat-stickers";

const STICKER_CATEGORIES = [
  {
    name: "表情",
    emojis: ["😊", "😢", "😡", "😴", "🥰", "😐", "🤩", "😎", "🥺", "😇", "🤗", "😋"],
  },
  {
    name: "動物",
    emojis: ["🐱", "🐶", "🐰", "🐻", "🦊", "🐼", "🐨", "🦁", "🐯", "🐸", "🐧", "🦋"],
  },
  {
    name: "自然",
    emojis: ["🌸", "🌺", "🌻", "🌹", "🍀", "🌈", "⭐", "🌙", "☀️", "❄️", "🌊", "🔥"],
  },
  {
    name: "食べ物",
    emojis: ["🍰", "🍩", "🍪", "🧁", "🍫", "🍓", "🍑", "🍒", "☕", "🧋", "🍵", "🎂"],
  },
  {
    name: "ハート",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💖", "💝", "💕", "💗"],
  },
  {
    name: "その他",
    emojis: ["🎀", "🎵", "🎨", "📝", "✨", "🌟", "💫", "🎁", "🏠", "📷", "🎈", "🪄"],
  },
];

type MainTab = "icon" | "cat";

export default function StickersScreen() {
  const colors = useColors();
  const { calendarDecos, setCalendarDecos } = useDiary();
  const [mainTab, setMainTab] = useState<MainTab>("icon");
  const [selectedCategory, setSelectedCategory] = useState(0);

  const handleAddEmojiSticker = useCallback(
    (emoji: string) => {
      if (calendarDecos.length >= 20) {
        Alert.alert("上限に達しました", "デコステッカーは最大20個まで配置できます。\n不要なステッカーを長押しで削除してください。");
        return;
      }
      const newDeco: CalendarDeco = {
        id: `deco_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        emoji,
        x: 10 + Math.random() * 70,
        y: 10 + Math.random() * 70,
        scale: 1.0,
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
      };
      setCalendarDecos([...calendarDecos, newDeco]);
    },
    [calendarDecos, setCalendarDecos]
  );

  const handleRemoveAll = useCallback(() => {
    if (calendarDecos.length === 0) return;
    Alert.alert(
      "デコステッカーを削除",
      "カレンダー上のすべてのデコステッカーを削除しますか？",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: () => setCalendarDecos([]),
        },
      ]
    );
  }, [calendarDecos, setCalendarDecos]);

  const category = STICKER_CATEGORIES[selectedCategory];

  return (
    <ScreenContainer className="px-4 pt-2">
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.foreground }]}>ステッカー</Text>
        <Text style={[styles.countBadge, { color: colors.muted }]}>
          {calendarDecos.length}/20
        </Text>
      </View>

      <Text style={[styles.subtitle, { color: colors.muted }]}>
        ステッカーを選んでカレンダーに配置しよう！{"\n"}
        カレンダー上のステッカーをタップで拡大縮小、長押しで削除できます。
      </Text>

      {/* Main tabs: アイコン / ネコ */}
      <View style={styles.mainTabRow}>
        <Pressable
          onPress={() => setMainTab("icon")}
          style={({ pressed }) => [
            styles.mainTab,
            {
              backgroundColor: mainTab === "icon" ? colors.primary : colors.surface,
              borderColor: mainTab === "icon" ? colors.primary : colors.border,
            },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={[styles.mainTabText, { color: mainTab === "icon" ? "#FFFFFF" : colors.foreground }]}>
            🎨 アイコン
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

      {mainTab === "icon" ? (
        <>
          {/* Category tabs */}
          <FlatList
            horizontal
            data={STICKER_CATEGORIES}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => setSelectedCategory(index)}
                style={({ pressed }) => [
                  styles.categoryTab,
                  {
                    backgroundColor: index === selectedCategory ? colors.primary + "20" : colors.surface,
                    borderColor: index === selectedCategory ? colors.primary : colors.border,
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: index === selectedCategory ? colors.primary : colors.foreground },
                  ]}
                >
                  {item.name}
                </Text>
              </Pressable>
            )}
            keyExtractor={(_, i) => String(i)}
          />

          {/* Emoji sticker grid */}
          <View style={[styles.stickerGrid, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {category.emojis.map((emoji, i) => (
              <Pressable
                key={`${selectedCategory}-${i}`}
                onPress={() => handleAddEmojiSticker(emoji)}
                style={({ pressed }) => [
                  styles.stickerCell,
                  { backgroundColor: pressed ? colors.border : "transparent" },
                ]}
              >
                <Text style={styles.stickerEmoji}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : (
        <>
          {/* Cat sticker grid */}
          <View style={[styles.catGrid, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {CAT_STICKERS.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => handleAddCatSticker(cat.id)}
                style={({ pressed }) => [
                  styles.catCell,
                  { backgroundColor: pressed ? colors.border : "transparent" },
                ]}
              >
                <Image source={cat.source} style={styles.catImage} resizeMode="contain" />
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* Current decos preview */}
      {calendarDecos.length > 0 && (
        <View style={[styles.previewSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.previewHeader}>
            <Text style={[styles.previewTitle, { color: colors.foreground }]}>配置中のステッカー</Text>
            <Pressable
              onPress={handleRemoveAll}
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}
            >
              <Text style={[styles.removeAllText, { color: colors.error }]}>すべて削除</Text>
            </Pressable>
          </View>
          <View style={styles.previewRow}>
            {calendarDecos.map((d) =>
              d.catStickerId ? (
                <Image
                  key={d.id}
                  source={CAT_STICKERS.find((c) => c.id === d.catStickerId)?.source}
                  style={styles.previewCatImage}
                  resizeMode="contain"
                />
              ) : (
                <Text key={d.id} style={{ fontSize: 24 }}>{d.emoji}</Text>
              )
            )}
          </View>
        </View>
      )}
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
  categoryList: {
    gap: 8,
    marginBottom: 12,
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
  },
  stickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  stickerCell: {
    width: "25%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  stickerEmoji: {
    fontSize: 32,
  },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    marginBottom: 12,
  },
  catCell: {
    width: "25%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    padding: 4,
  },
  catImage: {
    width: 56,
    height: 56,
  },
  previewSection: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  removeAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  previewRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  previewCatImage: {
    width: 32,
    height: 32,
  },
});

import { useCallback, useState } from "react";
import { Text, View, FlatList, Pressable, StyleSheet, Alert } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useDiary } from "@/lib/diary-context";
import { useColors } from "@/hooks/use-colors";
import { type CalendarDeco } from "@/lib/diary-storage";

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

export default function StickersScreen() {
  const colors = useColors();
  const { calendarDecos, setCalendarDecos } = useDiary();
  const [selectedCategory, setSelectedCategory] = useState(0);

  const handleAddSticker = useCallback(
    (emoji: string) => {
      if (calendarDecos.length >= 10) {
        Alert.alert("上限に達しました", "デコステッカーは最大10個まで配置できます。\n不要なステッカーを長押しで削除してください。");
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
          {calendarDecos.length}/10
        </Text>
      </View>

      <Text style={[styles.subtitle, { color: colors.muted }]}>
        ステッカーを選んでカレンダーに配置しよう！{"\n"}
        カレンダー上のステッカーをタップで拡大縮小、長押しで削除できます。
      </Text>

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
                backgroundColor: index === selectedCategory ? colors.primary : colors.surface,
                borderColor: index === selectedCategory ? colors.primary : colors.border,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                { color: index === selectedCategory ? "#FFFFFF" : colors.foreground },
              ]}
            >
              {item.name}
            </Text>
          </Pressable>
        )}
        keyExtractor={(_, i) => String(i)}
      />

      {/* Sticker grid */}
      <View style={[styles.stickerGrid, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {category.emojis.map((emoji, i) => (
          <Pressable
            key={`${selectedCategory}-${i}`}
            onPress={() => handleAddSticker(emoji)}
            style={({ pressed }) => [
              styles.stickerCell,
              { backgroundColor: pressed ? colors.border : "transparent" },
            ]}
          >
            <Text style={styles.stickerEmoji}>{emoji}</Text>
          </Pressable>
        ))}
      </View>

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
            {calendarDecos.map((d) => (
              <Text key={d.id} style={{ fontSize: 24 }}>{d.emoji}</Text>
            ))}
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
    marginBottom: 16,
  },
  categoryList: {
    gap: 8,
    marginBottom: 16,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  stickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    marginBottom: 16,
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
  },
});

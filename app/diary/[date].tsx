import { useCallback, useMemo } from "react";
import { Text, View, ScrollView, Pressable, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useDiary } from "@/lib/diary-context";
import { useColors } from "@/hooks/use-colors";
import { MOOD_EMOJI, MOOD_LABELS } from "@/lib/diary-storage";

export default function DiaryDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { getEntryForDate, removeEntry } = useDiary();

  const entry = useMemo(() => {
    if (!date) return null;
    return getEntryForDate(date) ?? null;
  }, [date, getEntryForDate]);

  const handleEdit = useCallback(() => {
    if (!date) return;
    router.push(`/diary/edit?date=${date}` as any);
  }, [date, router]);

  const handleDelete = useCallback(() => {
    if (!entry) return;
    Alert.alert("日記を削除", "この日記を削除しますか？この操作は取り消せません。", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          await removeEntry(entry.id);
          router.back();
        },
      },
    ]);
  }, [entry, removeEntry, router]);

  if (!entry) {
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-4 pt-2">
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
            <Text style={[styles.backText, { color: colors.primary }]}>← 戻る</Text>
          </Pressable>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 48 }}>📝</Text>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>日記が見つかりません</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-4 pt-2">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
            <Text style={[styles.backText, { color: colors.primary }]}>← 戻る</Text>
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable onPress={handleEdit} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
              <Text style={[styles.actionText, { color: colors.primary }]}>編集</Text>
            </Pressable>
            <Pressable onPress={handleDelete} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
              <Text style={[styles.actionText, { color: colors.error }]}>削除</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.dateRow}>
          <Text style={{ fontSize: 40 }}>{MOOD_EMOJI[entry.mood]}</Text>
          <View>
            <Text style={[styles.dateText, { color: colors.foreground }]}>{entry.date}</Text>
            <Text style={[styles.moodText, { color: colors.muted }]}>{MOOD_LABELS[entry.mood]}</Text>
          </View>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>{entry.title}</Text>

        <View style={[styles.contentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.content, { color: colors.foreground }]}>{entry.content}</Text>
        </View>

        {entry.photos && entry.photos.length > 0 && (
          <View style={styles.photosSection}>
            <Text style={[styles.sectionLabel, { color: colors.muted }]}>写真 ({entry.photos.length})</Text>
            <View style={styles.photoRow}>
              {entry.photos.map((uri, i) => (
                <View
                  key={i}
                  style={[styles.photoPlaceholder, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Text style={{ fontSize: 24 }}>📷</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {entry.decoStickers && entry.decoStickers.length > 0 && (
          <View style={styles.decoSection}>
            <Text style={[styles.sectionLabel, { color: colors.muted }]}>デコステッカー ({entry.decoStickers.length})</Text>
            <View style={styles.decoRow}>
              {entry.decoStickers.map((d) => (
                <Text key={d.id} style={{ fontSize: 28 }}>{d.emoji}</Text>
              ))}
            </View>
          </View>
        )}

        <View style={styles.timestamps}>
          <Text style={[styles.timestampText, { color: colors.muted }]}>
            作成: {new Date(entry.createdAt).toLocaleString("ja-JP")}
          </Text>
          <Text style={[styles.timestampText, { color: colors.muted }]}>
            更新: {new Date(entry.updatedAt).toLocaleString("ja-JP")}
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "700",
  },
  moodText: {
    fontSize: 14,
    marginTop: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 16,
  },
  contentCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    lineHeight: 26,
  },
  photosSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  photoRow: {
    flexDirection: "row",
    gap: 8,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  decoSection: {
    marginBottom: 16,
  },
  decoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timestamps: {
    marginTop: 16,
    gap: 4,
  },
  timestampText: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
});

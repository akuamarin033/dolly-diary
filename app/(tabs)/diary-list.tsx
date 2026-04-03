import { useCallback, useState, useMemo } from "react";
import { Text, View, FlatList, Pressable, TextInput, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useDiary } from "@/lib/diary-context";
import { useColors } from "@/hooks/use-colors";
import { type DiaryEntry } from "@/lib/diary-storage";
import { getMoodStamp } from "@/lib/mood-stamps";
import { CAT_STICKERS } from "@/lib/cat-stickers";
import { ITEM_STICKERS } from "@/lib/item-stickers";

export default function DiaryListScreen() {
  const colors = useColors();
  const router = useRouter();
  const { entries, loading, search } = useDiary();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DiaryEntry[] | null>(null);

  const displayEntries = searchResults ?? entries;

  const handleSearch = useCallback(
    async (text: string) => {
      setQuery(text);
      if (text.trim().length === 0) {
        setSearchResults(null);
        return;
      }
      const results = await search(text.trim());
      setSearchResults(results.sort((a, b) => b.date.localeCompare(a.date)));
    },
    [search]
  );

  const handleOpenEntry = useCallback(
    (entry: DiaryEntry) => {
      router.push(`/diary/${entry.date}` as any);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: DiaryEntry }) => {
      const moodStamp = getMoodStamp(item.mood);

      return (
        <Pressable
          onPress={() => handleOpenEntry(item)}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
        >
          <View style={styles.cardHeader}>
            {moodStamp ? (
              <Image source={moodStamp.source} style={styles.moodImage} resizeMode="contain" />
            ) : (
              <Text style={styles.moodEmoji}>😊</Text>
            )}
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.cardDate, { color: colors.muted }]}>{item.date}</Text>
            </View>
            {item.photos && item.photos.length > 0 && (
              <Text style={{ fontSize: 16 }}>📷 {item.photos.length}</Text>
            )}
          </View>
          <Text style={[styles.cardContent, { color: colors.muted }]} numberOfLines={2}>
            {item.content}
          </Text>
          {item.decoStickers && item.decoStickers.length > 0 && (
            <View style={styles.decoRow}>
              {item.decoStickers.slice(0, 5).map((d) => {
                const catSrc = d.catStickerId
                  ? CAT_STICKERS.find((c) => c.id === d.catStickerId)?.source
                  : undefined;
                const itemSrc = d.itemStickerId
                  ? ITEM_STICKERS.find((s) => s.id === d.itemStickerId)?.source
                  : undefined;
                const imgSrc = catSrc ?? itemSrc;
                return imgSrc ? (
                  <Image key={d.id} source={imgSrc} style={styles.decoImg} resizeMode="contain" />
                ) : d.emoji ? (
                  <Text key={d.id} style={{ fontSize: 16 }}>{d.emoji}</Text>
                ) : null;
              })}
              {item.decoStickers.length > 5 && (
                <Text style={[styles.decoMore, { color: colors.muted }]}>+{item.decoStickers.length - 5}</Text>
              )}
            </View>
          )}
        </Pressable>
      );
    },
    [colors, handleOpenEntry]
  );

  const keyExtractor = useCallback((item: DiaryEntry) => item.id, []);

  const emptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={{ fontSize: 48 }}>📔</Text>
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
          {query ? "検索結果がありません" : "日記がまだありません"}
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
          {query ? "別のキーワードで検索してみてください" : "カレンダーから日付を選んで日記を書きましょう"}
        </Text>
      </View>
    ),
    [colors, query]
  );

  return (
    <ScreenContainer className="px-4 pt-2">
      <Text style={[styles.title, { color: colors.foreground }]}>日記一覧</Text>

      <View
        style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <Text style={{ fontSize: 16, color: colors.muted }}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="日記を検索..."
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={displayEntries}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={loading ? null : emptyComponent}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", marginBottom: 16 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  listContent: { paddingBottom: 100, gap: 12 },
  card: { borderRadius: 16, padding: 16, borderWidth: 1 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  moodEmoji: { fontSize: 32 },
  moodImage: { width: 40, height: 40 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: "700" },
  cardDate: { fontSize: 13, marginTop: 2 },
  cardContent: { fontSize: 14, marginTop: 8, lineHeight: 20 },
  decoRow: { flexDirection: "row", gap: 4, marginTop: 8, alignItems: "center" },
  decoImg: { width: 24, height: 24 },
  decoMore: { fontSize: 12, marginLeft: 4 },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginTop: 8 },
  emptySubtitle: { fontSize: 14, textAlign: "center" },
});

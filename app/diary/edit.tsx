import { useCallback, useState, useMemo } from "react";
import {
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useDiary } from "@/lib/diary-context";
import { useColors } from "@/hooks/use-colors";
import { MOOD_EMOJI, MOOD_LABELS, type Mood, type PlacedDeco } from "@/lib/diary-storage";

const ALL_MOODS: Mood[] = ["happy", "sad", "angry", "sleepy", "love", "neutral", "excited"];

const DECO_EMOJIS = [
  "🌸", "⭐", "❤️", "🎀", "✨", "🌈", "🍰", "🐱", "🌙", "🔥",
  "💖", "🦋", "🎵", "📝", "☀️", "🍓", "💫", "🎨", "🧁", "🌺",
];

export default function DiaryEditScreen() {
  const colors = useColors();
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { getEntryForDate, addEntry, editEntry } = useDiary();

  const existingEntry = useMemo(() => {
    if (!date) return null;
    return getEntryForDate(date) ?? null;
  }, [date, getEntryForDate]);

  const [title, setTitle] = useState(existingEntry?.title ?? "");
  const [content, setContent] = useState(existingEntry?.content ?? "");
  const [mood, setMood] = useState<Mood>(existingEntry?.mood ?? "happy");
  const [decoStickers, setDecoStickers] = useState<PlacedDeco[]>(existingEntry?.decoStickers ?? []);
  const [saving, setSaving] = useState(false);

  const handleAddDeco = useCallback(
    (emoji: string) => {
      if (decoStickers.length >= 10) {
        Alert.alert("上限", "デコステッカーは最大10個までです。");
        return;
      }
      const newDeco: PlacedDeco = {
        id: `deco_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        emoji,
        x: 10 + Math.random() * 70,
        y: 10 + Math.random() * 70,
        scale: 1.0,
      };
      setDecoStickers((prev) => [...prev, newDeco]);
    },
    [decoStickers.length]
  );

  const handleRemoveDeco = useCallback((id: string) => {
    setDecoStickers((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const handleSave = useCallback(async () => {
    if (!date) return;
    if (!title.trim()) {
      Alert.alert("エラー", "タイトルを入力してください。");
      return;
    }
    if (!content.trim()) {
      Alert.alert("エラー", "内容を入力してください。");
      return;
    }

    setSaving(true);
    try {
      if (existingEntry) {
        await editEntry(existingEntry.id, {
          title: title.trim(),
          content: content.trim(),
          mood,
          decoStickers,
        });
      } else {
        await addEntry({
          date,
          title: title.trim(),
          content: content.trim(),
          mood,
          photos: [],
          decoStickers,
        });
      }
      router.back();
    } catch {
      Alert.alert("エラー", "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  }, [date, title, content, mood, decoStickers, existingEntry, addEntry, editEntry, router]);

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-4 pt-2">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
              <Text style={[styles.backText, { color: colors.primary }]}>← キャンセル</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={({ pressed }) => [
                styles.saveButton,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.8 },
                saving && { opacity: 0.5 },
              ]}
            >
              <Text style={styles.saveButtonText}>{saving ? "保存中..." : "保存"}</Text>
            </Pressable>
          </View>

          {/* Date */}
          <Text style={[styles.dateLabel, { color: colors.muted }]}>{date}</Text>

          {/* Mood selector */}
          <Text style={[styles.label, { color: colors.foreground }]}>今日の気分</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll}>
            <View style={styles.moodRow}>
              {ALL_MOODS.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setMood(m)}
                  style={({ pressed }) => [
                    styles.moodItem,
                    {
                      backgroundColor: mood === m ? colors.primary + "20" : colors.surface,
                      borderColor: mood === m ? colors.primary : colors.border,
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={{ fontSize: 28 }}>{MOOD_EMOJI[m]}</Text>
                  <Text
                    style={[
                      styles.moodItemLabel,
                      { color: mood === m ? colors.primary : colors.muted },
                    ]}
                  >
                    {MOOD_LABELS[m]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Title */}
          <Text style={[styles.label, { color: colors.foreground }]}>タイトル</Text>
          <TextInput
            style={[styles.titleInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]}
            placeholder="今日のタイトル..."
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
          />

          {/* Content */}
          <Text style={[styles.label, { color: colors.foreground }]}>内容</Text>
          <TextInput
            style={[styles.contentInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]}
            placeholder="今日あったことを書きましょう..."
            placeholderTextColor={colors.muted}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

          {/* Deco stickers */}
          <Text style={[styles.label, { color: colors.foreground }]}>デコステッカー ({decoStickers.length}/10)</Text>

          {/* Current decos */}
          {decoStickers.length > 0 && (
            <View style={styles.currentDecos}>
              {decoStickers.map((d) => (
                <Pressable
                  key={d.id}
                  onPress={() => handleRemoveDeco(d.id)}
                  style={({ pressed }) => [
                    styles.currentDecoItem,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={{ fontSize: 22 }}>{d.emoji}</Text>
                  <Text style={[styles.removeX, { color: colors.error }]}>×</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Deco picker */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.decoPickerRow}>
              {DECO_EMOJIS.map((emoji, i) => (
                <Pressable
                  key={i}
                  onPress={() => handleAddDeco(emoji)}
                  style={({ pressed }) => [
                    styles.decoPickerItem,
                    { backgroundColor: pressed ? colors.border : colors.surface },
                  ]}
                >
                  <Text style={{ fontSize: 24 }}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  dateLabel: {
    fontSize: 14,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 16,
  },
  moodScroll: {
    marginBottom: 8,
  },
  moodRow: {
    flexDirection: "row",
    gap: 10,
  },
  moodItem: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 4,
  },
  moodItemLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  contentInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 160,
    lineHeight: 24,
  },
  currentDecos: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  currentDecoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  removeX: {
    fontSize: 14,
    fontWeight: "700",
  },
  decoPickerRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  decoPickerItem: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

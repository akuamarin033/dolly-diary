import { useCallback, useState, useMemo, useEffect } from "react";
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
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { ScreenContainer } from "@/components/screen-container";
import { useDiary } from "@/lib/diary-context";
import { useColors } from "@/hooks/use-colors";
import {
  type Mood,
  type Weather,
} from "@/lib/diary-storage";
import { MOOD_STAMPS, WEATHER_STAMPS, getMoodStamp, getWeatherStamp } from "@/lib/mood-stamps";
import { PolaroidPhoto } from "@/components/polaroid-photo";
import { InterstitialAd } from "@/components/interstitial-ad";
import { useAds } from "@/lib/ad-context";

export default function DiaryEditScreen() {
  const colors = useColors();
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { getEntryForDate, addEntry, editEntry } = useDiary();
  const { shouldShowInterstitial } = useAds();
  const [showAd, setShowAd] = useState(false);

  // Show interstitial ad sometimes when opening diary
  useEffect(() => {
    if (shouldShowInterstitial()) {
      setShowAd(true);
    }
  }, []);

  const existingEntry = useMemo(() => {
    if (!date) return null;
    return getEntryForDate(date) ?? null;
  }, [date, getEntryForDate]);

  const [title, setTitle] = useState(existingEntry?.title ?? "");
  const [content, setContent] = useState(existingEntry?.content ?? "");
  const [mood, setMood] = useState<Mood>(existingEntry?.mood ?? "happy");
  const [weather, setWeather] = useState<Weather | undefined>(existingEntry?.weather ?? undefined);
  const [photos, setPhotos] = useState<string[]>(existingEntry?.photos ?? []);
  const [saving, setSaving] = useState(false);

  const handlePickPhoto = useCallback(async (index: number) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });
      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setPhotos((prev) => {
          const updated = [...prev];
          updated[index] = uri;
          return updated;
        });
      }
    } catch {
      Alert.alert("エラー", "写真の選択に失敗しました。");
    }
  }, []);

  const handleRemovePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(async () => {
    if (!date) return;
    if (!content.trim()) {
      Alert.alert("エラー", "内容を入力してください。");
      return;
    }

    setSaving(true);
    try {
      if (existingEntry) {
        await editEntry(existingEntry.id, {
          title: title.trim() || date,
          content: content.trim(),
          mood,
          weather,
          photos: photos.filter(Boolean),
        });
      } else {
        await addEntry({
          date,
          title: title.trim() || date,
          content: content.trim(),
          mood,
          photos: photos.filter(Boolean),
        });
      }
      router.back();
    } catch {
      Alert.alert("エラー", "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  }, [date, title, content, mood, weather, photos, existingEntry, addEntry, editEntry, router]);

  const selectedMoodStamp = getMoodStamp(mood);
  const selectedWeatherStamp = weather ? getWeatherStamp(weather) : undefined;

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
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

          {/* Leather frame diary */}
          <View style={styles.leatherFrame}>
            {/* Stitching effect border */}
            <View style={styles.stitchBorder} />

            {/* Corner decorations */}
            <Text style={[styles.cornerDecor, styles.topLeft]}>⭐</Text>
            <Text style={[styles.cornerDecor, styles.topRight]}>✨</Text>
            <Text style={[styles.cornerDecor, styles.bottomLeft]}>🌸</Text>
            <Text style={[styles.cornerDecor, styles.bottomRight]}>⭐</Text>

            {/* Mood cat stamps section - wrapping grid */}
            <View style={styles.moodSection}>
              <View style={styles.stampGrid}>
                {MOOD_STAMPS.map((stamp) => (
                  <Pressable
                    key={stamp.id}
                    onPress={() => setMood(stamp.id)}
                    style={({ pressed }) => [
                      styles.stampItem,
                      mood === stamp.id && styles.stampItemSelected,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Image source={stamp.source} style={styles.stampImage} resizeMode="contain" />
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Weather cat stamps section - 4 columns x 2 rows */}
            <View style={styles.weatherSection}>
              <View style={styles.weatherGrid}>
                {WEATHER_STAMPS.map((stamp) => (
                  <Pressable
                    key={stamp.id}
                    onPress={() => setWeather(weather === stamp.id ? undefined : stamp.id)}
                    style={({ pressed }) => [
                      styles.weatherStampItem,
                      weather === stamp.id && styles.weatherStampItemSelected,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Image source={stamp.source} style={styles.weatherStampImage} resizeMode="contain" />
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Title input */}
            <View style={styles.titleRow}>
              <View style={styles.titleLabelBox}>
                <Text style={styles.titleLabelTop}>Today&apos;s</Text>
                <Text style={styles.titleLabelBottom}>Title</Text>
              </View>
              <TextInput
                style={styles.titleInput}
                placeholder="今日のタイトル 例:猫カフェ!"
                placeholderTextColor="#C4A882"
                value={title}
                onChangeText={setTitle}
                returnKeyType="next"
              />
            </View>

            {/* Photo slots - Polaroid style */}
            <View style={styles.photoRow}>
              {[0, 1, 2].map((i) => (
                <PolaroidPhoto
                  key={i}
                  index={i}
                  photoUri={photos[i]}
                  onPress={() => photos[i] ? handleRemovePhoto(i) : handlePickPhoto(i)}
                  size={100}
                />
              ))}
            </View>

            {/* Decorative hearts */}
            <View style={styles.heartsRow}>
              <Text style={styles.heartEmoji}>💛</Text>
              <Text style={styles.heartEmoji}>💙</Text>
              <Text style={styles.heartEmoji}>💚</Text>
            </View>

            {/* Notebook-style content area */}
            <View style={styles.notebookArea}>
              <Text style={styles.notebookTitle}>
                {date ? `${date} の日記` : "今日の日記スペース"}
              </Text>
              <Text style={styles.notebookSubtitle}>（日記の入力スペース）</Text>
              <TextInput
                style={styles.contentInput}
                placeholder="今日あったことを書こう..."
                placeholderTextColor="#C4A882"
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
              />
              {/* Selected stamps display in corner */}
              <View style={styles.selectedStampsCorner}>
                {selectedMoodStamp && (
                  <Image source={selectedMoodStamp.source} style={styles.cornerStampImg} resizeMode="contain" />
                )}
                {selectedWeatherStamp && (
                  <Image source={selectedWeatherStamp.source} style={styles.cornerWeatherImg} resizeMode="contain" />
                )}
              </View>
            </View>

            {/* Bottom heart decorations */}
            <View style={styles.bottomDecoRow}>
              <Text style={styles.decoEmoji}>💛</Text>
              <Text style={styles.decoEmoji}>💙</Text>
              <Text style={styles.decoEmoji}>💚</Text>
            </View>
          </View>

          {/* Bottom decorations outside frame */}
          <View style={styles.outerDecoRow}>
            <Text style={styles.outerDeco}>⭐</Text>
            <Text style={styles.outerDeco}>💖</Text>
            <Text style={styles.outerDeco}>✨</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <InterstitialAd visible={showAd} onClose={() => setShowAd(false)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 16,
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
  leatherFrame: {
    marginHorizontal: 12,
    borderWidth: 5,
    borderColor: "#A0764A",
    borderRadius: 18,
    backgroundColor: "#FFF5EB",
    padding: 16,
    position: "relative",
    shadowColor: "#8B6914",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  stitchBorder: {
    position: "absolute",
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderWidth: 1.5,
    borderColor: "#C4A06A",
    borderRadius: 14,
    borderStyle: "dashed",
  },
  cornerDecor: {
    position: "absolute",
    fontSize: 18,
    zIndex: 2,
  },
  topLeft: { top: 8, left: 10 },
  topRight: { top: 8, right: 10 },
  bottomLeft: { bottom: 8, left: 10 },
  bottomRight: { bottom: 8, right: 10 },
  moodSection: {
    marginTop: 12,
    marginBottom: 4,
  },
  stampGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 2,
    justifyContent: "center",
  },
  stampItem: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E8D5C0",
    backgroundColor: "#FFF8F0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  stampItemSelected: {
    borderColor: "#A0764A",
    backgroundColor: "#F5E6D3",
    borderWidth: 3,
  },
  stampImage: {
    width: 40,
    height: 40,
  },
  weatherSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  weatherGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 2,
  },
  weatherStampItem: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#E8D5C0",
    backgroundColor: "#FFF8F0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  weatherStampItemSelected: {
    borderColor: "#5DADE2",
    backgroundColor: "#D6EAF8",
    borderWidth: 3,
  },
  weatherStampImage: {
    width: "75%",
    height: "75%",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
    marginBottom: 14,
  },
  titleLabelBox: {
    alignItems: "center",
  },
  titleLabelTop: {
    fontSize: 13,
    fontWeight: "700",
    color: "#A0764A",
    lineHeight: 16,
  },
  titleLabelBottom: {
    fontSize: 15,
    fontWeight: "800",
    color: "#A0764A",
    lineHeight: 18,
  },
  titleInput: {
    flex: 1,
    borderBottomWidth: 1.5,
    borderBottomColor: "#D4B896",
    paddingVertical: 8,
    fontSize: 16,
    color: "#6B4226",
  },
  photoRow: {
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  heartsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
  },
  heartEmoji: {
    fontSize: 18,
  },
  notebookArea: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8D5C0",
    backgroundColor: "#FFF8F0",
    padding: 16,
    minHeight: 200,
    position: "relative",
  },
  notebookTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6B4226",
    marginBottom: 2,
  },
  notebookSubtitle: {
    fontSize: 12,
    color: "#C4A882",
    marginBottom: 12,
  },
  contentInput: {
    fontSize: 15,
    lineHeight: 28,
    minHeight: 140,
    color: "#6B4226",
  },
  selectedStampsCorner: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    gap: 4,
    alignItems: "flex-end",
  },
  cornerStampImg: {
    width: 40,
    height: 40,
    opacity: 0.5,
  },
  cornerWeatherImg: {
    width: 36,
    height: 36,
    opacity: 0.5,
  },
  bottomDecoRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 12,
  },
  decoEmoji: {
    fontSize: 20,
  },
  outerDecoRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  outerDeco: {
    fontSize: 18,
  },
});

import { useCallback, useMemo, useState } from "react";
import { Text, View, ScrollView, Pressable, StyleSheet, Alert, Image, Modal, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useDiary } from "@/lib/diary-context";
import { useColors } from "@/hooks/use-colors";
import { MOOD_LABELS, WEATHER_LABELS } from "@/lib/diary-storage";
import { getMoodStamp, getWeatherStamp } from "@/lib/mood-stamps";
import { PolaroidPhoto } from "@/components/polaroid-photo";
import { useI18n } from "@/lib/i18n";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function DiaryDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t, language } = useI18n();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { getEntryForDate, removeEntry } = useDiary();
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

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
    Alert.alert(t("diary.deleteTitle"), t("diary.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
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
            <Text style={[styles.backText, { color: colors.primary }]}>← {t("diary.back")}</Text>
          </Pressable>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 48 }}>📝</Text>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{t("diary.noEntry")}</Text>
        </View>
      </ScreenContainer>
    );
  }

  const moodStamp = getMoodStamp(entry.mood);
  const weatherStamp = entry.weather ? getWeatherStamp(entry.weather) : undefined;

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
            <Text style={[styles.backText, { color: colors.primary }]}>← {t("diary.back")}</Text>
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable onPress={handleEdit} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
              <Text style={[styles.actionText, { color: colors.primary }]}>{t("diary.edit")}</Text>
            </Pressable>
            <Pressable onPress={handleDelete} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
              <Text style={[styles.actionText, { color: colors.error }]}>{t("common.delete")}</Text>
            </Pressable>
          </View>
        </View>

        {/* Leather frame */}
        <View style={styles.leatherFrame}>
          {/* Stitching effect */}
          <View style={styles.stitchBorder} />

          {/* Corner decorations */}
          <Text style={[styles.cornerDecor, styles.topLeft]}>⭐</Text>
          <Text style={[styles.cornerDecor, styles.topRight]}>✨</Text>
          <Text style={[styles.cornerDecor, styles.bottomLeft]}>🌸</Text>
          <Text style={[styles.cornerDecor, styles.bottomRight]}>⭐</Text>

          {/* Mood & Weather stamps display */}
          <View style={styles.stampDisplayRow}>
            {moodStamp && (
              <View style={styles.stampDisplay}>
                <Image source={moodStamp.source} style={styles.stampImg} resizeMode="contain" />
                <Text style={styles.stampLabel}>{MOOD_LABELS[entry.mood]}</Text>
              </View>
            )}
            {weatherStamp && entry.weather && (
              <View style={styles.stampDisplay}>
                <Image source={weatherStamp.source} style={styles.weatherStampImg} resizeMode="contain" />
                <Text style={styles.stampLabel}>{WEATHER_LABELS[entry.weather]}</Text>
              </View>
            )}
          </View>

          {/* Date & Title */}
          <Text style={styles.dateText}>{entry.date}</Text>
          <Text style={styles.titleText}>{entry.title}</Text>

          {/* Photos polaroid-style - tappable for full-screen preview */}
          {entry.photos && entry.photos.length > 0 && (
            <View style={styles.photoRow}>
              {entry.photos.map((uri, i) => (
                <PolaroidPhoto
                  key={i}
                  index={i}
                  photoUri={uri}
                  size={100}
                  onPress={() => setPreviewPhoto(uri)}
                />
              ))}
            </View>
          )}

          {/* Decorative hearts */}
          <View style={styles.heartsRow}>
            <Text style={styles.heartEmoji}>💛</Text>
            <Text style={styles.heartEmoji}>💙</Text>
            <Text style={styles.heartEmoji}>💚</Text>
          </View>

          {/* Content notebook area */}
          <View style={styles.notebookArea}>
            <Text style={styles.content}>{entry.content}</Text>
            {/* Stamps in corner */}
            <View style={styles.selectedStampsCorner}>
              {moodStamp && (
                <Image source={moodStamp.source} style={styles.cornerStampImg} resizeMode="contain" />
              )}
              {weatherStamp && (
                <Image source={weatherStamp.source} style={styles.cornerWeatherImg} resizeMode="contain" />
              )}
            </View>
          </View>

          {/* Bottom hearts */}
          <View style={styles.bottomDecoRow}>
            <Text style={styles.decoEmoji}>💛</Text>
            <Text style={styles.decoEmoji}>💙</Text>
            <Text style={styles.decoEmoji}>💚</Text>
          </View>
        </View>

        {/* Outer decorations */}
        <View style={styles.outerDecoRow}>
          <Text style={styles.outerDeco}>⭐</Text>
          <Text style={styles.outerDeco}>💖</Text>
          <Text style={styles.outerDeco}>✨</Text>
        </View>

        {/* Timestamps */}
        <View style={styles.timestamps}>
          <Text style={[styles.timestampText, { color: colors.muted }]}>
            {t("diary.created")}: {new Date(entry.createdAt).toLocaleString(language === "en" ? "en-US" : "ja-JP")}
          </Text>
          <Text style={[styles.timestampText, { color: colors.muted }]}>
            {t("diary.updated")}: {new Date(entry.updatedAt).toLocaleString(language === "en" ? "en-US" : "ja-JP")}
          </Text>
        </View>
      </ScrollView>

      {/* Full-screen photo preview modal */}
      <Modal
        visible={previewPhoto !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewPhoto(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setPreviewPhoto(null)}
        >
          <View style={styles.modalContent}>
            {previewPhoto && (
              <Image
                source={{ uri: previewPhoto }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
          </View>
          <Pressable
            onPress={() => setPreviewPhoto(null)}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </Pressable>
      </Modal>
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
  backText: { fontSize: 16, fontWeight: "600" },
  headerActions: { flexDirection: "row", gap: 16 },
  actionText: { fontSize: 16, fontWeight: "600" },
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
  cornerDecor: { position: "absolute", fontSize: 18, zIndex: 2 },
  topLeft: { top: 8, left: 10 },
  topRight: { top: 8, right: 10 },
  bottomLeft: { bottom: 8, left: 10 },
  bottomRight: { bottom: 8, right: 10 },
  stampDisplayRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginVertical: 14,
  },
  stampDisplay: { alignItems: "center", gap: 4 },
  stampImg: { width: 56, height: 56 },
  weatherStampImg: { width: 56, height: 56 },
  stampLabel: { fontSize: 12, color: "#A0764A", fontWeight: "600" },
  dateText: { fontSize: 16, fontWeight: "700", textAlign: "center", marginBottom: 4, color: "#6B4226" },
  titleText: { fontSize: 22, fontWeight: "800", textAlign: "center", marginBottom: 16, color: "#6B4226" },
  photoRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 12,
  },
  photoSlot: {
    width: 100,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8D5C0",
    backgroundColor: "#FFF5EB",
    overflow: "hidden",
    position: "relative",
  },
  tape: {
    position: "absolute",
    top: -2,
    left: "20%",
    width: "60%",
    height: 14,
    backgroundColor: "rgba(245, 230, 211, 0.85)",
    borderRadius: 2,
    zIndex: 1,
  },
  photoImage: { width: "100%", height: "100%" },
  heartsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
  },
  heartEmoji: { fontSize: 18 },
  notebookArea: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8D5C0",
    backgroundColor: "#FFF8F0",
    padding: 16,
    minHeight: 150,
    position: "relative",
  },
  content: { fontSize: 16, lineHeight: 28, color: "#6B4226" },
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
  decoEmoji: { fontSize: 20 },
  outerDecoRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  outerDeco: { fontSize: 18 },
  timestamps: { marginTop: 8, paddingHorizontal: 16, gap: 4 },
  timestampText: { fontSize: 12 },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_HEIGHT * 0.7,
  },
  closeButton: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
});

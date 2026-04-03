import { useCallback, useState } from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { formatDate } from "@/lib/diary-storage";
import { useDiary } from "@/lib/diary-context";
import { useI18n } from "@/lib/i18n";

export default function WriteDiaryScreen() {
  const colors = useColors();
  const router = useRouter();
  const { getEntryForDate } = useDiary();
  const { t } = useI18n();
  const [navigating, setNavigating] = useState(false);

  const today = formatDate(new Date());

  useFocusEffect(
    useCallback(() => {
      // Small delay to ensure tab is fully mounted before navigating
      if (navigating) return;
      const timer = setTimeout(() => {
        setNavigating(true);
        router.push(`/diary/edit?date=${today}` as any);
        // Reset after navigation so it works when coming back
        setTimeout(() => setNavigating(false), 500);
      }, 100);
      return () => clearTimeout(timer);
    }, [today, navigating])
  );

  return (
    <ScreenContainer className="p-4">
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.foreground }]}>{t("diary.todayDiary")}</Text>
        <Text style={[styles.dateText, { color: colors.muted }]}>{today}</Text>
        <Pressable
          onPress={() => router.push(`/diary/edit?date=${today}` as any)}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={styles.buttonText}>{t("diary.startWriting")}</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
  },
  dateText: {
    fontSize: 15,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

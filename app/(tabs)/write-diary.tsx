import { useCallback, useRef } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { formatDate } from "@/lib/diary-storage";
import { useI18n } from "@/lib/i18n";

export default function WriteDiaryScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useI18n();

  const today = formatDate(new Date());
  // Track whether we already auto-navigated so we don't loop
  const hasAutoNavigated = useRef(false);

  useFocusEffect(
    useCallback(() => {
      // Only auto-navigate once per mount. When user comes back from
      // edit screen via cancel/save, we stay on this screen.
      if (hasAutoNavigated.current) return;
      hasAutoNavigated.current = true;
      const timer = setTimeout(() => {
        router.push(`/diary/edit?date=${today}` as any);
      }, 100);
      return () => clearTimeout(timer);
    }, [today])
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

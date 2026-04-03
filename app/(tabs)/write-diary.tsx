import { useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { formatDate } from "@/lib/diary-storage";
import { useDiary } from "@/lib/diary-context";

export default function WriteDiaryScreen() {
  const colors = useColors();
  const router = useRouter();
  const { getEntryForDate } = useDiary();

  const today = formatDate(new Date());
  const existingEntry = getEntryForDate(today);

  useEffect(() => {
    // Auto-navigate to edit screen for today
    if (existingEntry) {
      router.replace(`/diary/edit?date=${today}` as any);
    } else {
      router.replace(`/diary/edit?date=${today}` as any);
    }
  }, []);

  return (
    <ScreenContainer className="p-4">
      <View style={styles.container}>
        <Text style={[styles.loadingText, { color: colors.muted }]}>日記画面を開いています...</Text>
        <Pressable
          onPress={() => router.push(`/diary/edit?date=${today}` as any)}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={styles.buttonText}>日記を書く</Text>
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
  loadingText: {
    fontSize: 16,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

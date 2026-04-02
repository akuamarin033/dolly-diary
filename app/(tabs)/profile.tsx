import { useCallback, useState, useMemo } from "react";
import { Text, View, Pressable, StyleSheet, TextInput, Alert, ScrollView, Share } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useDiary } from "@/lib/diary-context";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import {
  MOOD_EMOJI,
  MOOD_LABELS,
  type Mood,
  exportAllData,
  getPasscode,
  setPasscode,
} from "@/lib/diary-storage";

export default function ProfileScreen() {
  const colors = useColors();
  const { entries, streak } = useDiary();
  const { colorScheme, setColorScheme } = useThemeContext();
  const [passcodeEnabled, setPasscodeEnabled] = useState(false);
  const [showPasscodeSetup, setShowPasscodeSetup] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");

  // Stats
  const totalEntries = entries.length;
  const moodStats = useMemo(() => {
    const stats: Partial<Record<Mood, number>> = {};
    for (const e of entries) {
      stats[e.mood] = (stats[e.mood] ?? 0) + 1;
    }
    return Object.entries(stats)
      .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
      .slice(0, 5) as [Mood, number][];
  }, [entries]);

  // Check passcode on mount
  useState(() => {
    getPasscode().then((code) => setPasscodeEnabled(!!code));
  });

  const handleToggleDarkMode = useCallback(() => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  }, [colorScheme, setColorScheme]);

  const handleTogglePasscode = useCallback(async () => {
    if (passcodeEnabled) {
      Alert.alert("パスコードを削除", "パスコードロックを解除しますか？", [
        { text: "キャンセル", style: "cancel" },
        {
          text: "解除",
          style: "destructive",
          onPress: async () => {
            await setPasscode(null);
            setPasscodeEnabled(false);
          },
        },
      ]);
    } else {
      setShowPasscodeSetup(true);
      setPasscodeInput("");
    }
  }, [passcodeEnabled]);

  const handleSetPasscode = useCallback(async () => {
    if (passcodeInput.length < 4) {
      Alert.alert("エラー", "パスコードは4桁以上で設定してください。");
      return;
    }
    await setPasscode(passcodeInput);
    setPasscodeEnabled(true);
    setShowPasscodeSetup(false);
    setPasscodeInput("");
    Alert.alert("完了", "パスコードが設定されました。");
  }, [passcodeInput]);

  const handleExport = useCallback(async () => {
    try {
      const data = await exportAllData();
      await Share.share({
        message: data,
        title: "Dolly's Diary バックアップ",
      });
    } catch {
      Alert.alert("エラー", "エクスポートに失敗しました。");
    }
  }, []);

  return (
    <ScreenContainer className="px-4 pt-2">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={[styles.title, { color: colors.foreground }]}>プロフィール</Text>

        {/* Stats card */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{totalEntries}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>日記数</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.warning }]}>{streak.currentStreak}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>連続日数</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.success }]}>{streak.longestStreak}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>最長記録</Text>
            </View>
          </View>
        </View>

        {/* Mood distribution */}
        {moodStats.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>気分の傾向</Text>
            {moodStats.map(([mood, count]) => (
              <View key={mood} style={styles.moodRow}>
                <Text style={{ fontSize: 22 }}>{MOOD_EMOJI[mood]}</Text>
                <Text style={[styles.moodLabel, { color: colors.foreground }]}>{MOOD_LABELS[mood]}</Text>
                <View style={[styles.moodBar, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.moodBarFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${Math.min(100, (count / totalEntries) * 100)}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.moodCount, { color: colors.muted }]}>{count}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Settings section */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>設定</Text>

          {/* Dark mode */}
          <Pressable
            onPress={handleToggleDarkMode}
            style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.7 }]}
          >
            <Text style={{ fontSize: 22 }}>🌙</Text>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.foreground }]}>ダークモード</Text>
              <Text style={[styles.settingSubtitle, { color: colors.muted }]}>
                {colorScheme === "dark" ? "オン" : "オフ"}
              </Text>
            </View>
            <View style={[styles.toggle, { backgroundColor: colorScheme === "dark" ? colors.primary : colors.border }]}>
              <View style={[styles.toggleKnob, { left: colorScheme === "dark" ? 20 : 2 }]} />
            </View>
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Passcode */}
          <Pressable
            onPress={handleTogglePasscode}
            style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.7 }]}
          >
            <Text style={{ fontSize: 22 }}>🔒</Text>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.foreground }]}>パスコードロック</Text>
              <Text style={[styles.settingSubtitle, { color: colors.muted }]}>
                {passcodeEnabled ? "設定済み" : "未設定"}
              </Text>
            </View>
            <View style={[styles.toggle, { backgroundColor: passcodeEnabled ? colors.primary : colors.border }]}>
              <View style={[styles.toggleKnob, { left: passcodeEnabled ? 20 : 2 }]} />
            </View>
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Export */}
          <Pressable
            onPress={handleExport}
            style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.7 }]}
          >
            <Text style={{ fontSize: 22 }}>📤</Text>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.foreground }]}>データエクスポート</Text>
              <Text style={[styles.settingSubtitle, { color: colors.muted }]}>
                日記データをバックアップ
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Passcode setup modal inline */}
        {showPasscodeSetup && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>パスコード設定</Text>
            <TextInput
              style={[styles.passcodeInput, { color: colors.foreground, borderColor: colors.border }]}
              placeholder="4桁以上のパスコード"
              placeholderTextColor={colors.muted}
              value={passcodeInput}
              onChangeText={setPasscodeInput}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              returnKeyType="done"
              onSubmitEditing={handleSetPasscode}
            />
            <View style={styles.passcodeButtons}>
              <Pressable
                onPress={() => setShowPasscodeSetup(false)}
                style={({ pressed }) => [
                  styles.passcodeBtn,
                  { backgroundColor: colors.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.passcodeBtnText, { color: colors.foreground }]}>キャンセル</Text>
              </Pressable>
              <Pressable
                onPress={handleSetPasscode}
                style={({ pressed }) => [
                  styles.passcodeBtn,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.passcodeBtnText, { color: "#FFFFFF" }]}>設定</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* App info */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <Text style={{ fontSize: 22 }}>📱</Text>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.foreground }]}>Dolly's Diary</Text>
              <Text style={[styles.settingSubtitle, { color: colors.muted }]}>v1.0.0 - カレンダー＆日記アプリ</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 16,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },
  moodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  moodLabel: {
    width: 50,
    fontSize: 13,
    fontWeight: "600",
  },
  moodBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  moodBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  moodCount: {
    width: 24,
    textAlign: "right",
    fontSize: 13,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    position: "relative",
  },
  toggleKnob: {
    position: "absolute",
    top: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  passcodeInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 8,
    marginBottom: 12,
  },
  passcodeButtons: {
    flexDirection: "row",
    gap: 12,
  },
  passcodeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  passcodeBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
});

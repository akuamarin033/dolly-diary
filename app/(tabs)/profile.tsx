import { useCallback, useState } from "react";
import { Text, View, Pressable, StyleSheet, TextInput, Alert, ScrollView, Share } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useDiary } from "@/lib/diary-context";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import {
  exportAllData,
  getPasscode,
  setPasscode,
} from "@/lib/diary-storage";
import { useAds } from "@/lib/ad-context";

export default function ProfileScreen() {
  const colors = useColors();
  const { entries, streak } = useDiary();
  const { isAdFree, purchaseAdFree, restoreAdFree } = useAds();
  const { colorScheme, setColorScheme } = useThemeContext();
  const [passcodeEnabled, setPasscodeEnabled] = useState(false);
  const [showPasscodeSetup, setShowPasscodeSetup] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");

  // Stats
  const totalEntries = entries.length;

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
        title: "Calendar&Diary バックアップ",
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

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Ad removal */}
          <Pressable
            onPress={() => {
              if (isAdFree) {
                Alert.alert("広告非表示", "すでに広告非表示が有効です。");
              } else {
                Alert.alert(
                  "広告を非表示にする",
                  "¥480で広告を完全に非表示にします。",
                  [
                    { text: "キャンセル", style: "cancel" },
                    {
                      text: "購入する",
                      onPress: async () => {
                        await purchaseAdFree();
                        Alert.alert("完了", "広告が非表示になりました。");
                      },
                    },
                  ]
                );
              }
            }}
            style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.7 }]}
          >
            <Text style={{ fontSize: 22 }}>✨</Text>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.foreground }]}>広告を非表示</Text>
              <Text style={[styles.settingSubtitle, { color: colors.muted }]}>
                {isAdFree ? "有効中" : "¥480で広告を削除"}
              </Text>
            </View>
            {isAdFree ? (
              <View style={[styles.premiumBadge, { backgroundColor: colors.success + "22" }]}>
                <Text style={[styles.premiumBadgeText, { color: colors.success }]}>有効</Text>
              </View>
            ) : (
              <View style={[styles.premiumBadge, { backgroundColor: colors.primary + "22" }]}>
                <Text style={[styles.premiumBadgeText, { color: colors.primary }]}>¥480</Text>
              </View>
            )}
          </Pressable>

          {!isAdFree && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Pressable
                onPress={async () => {
                  await restoreAdFree();
                  Alert.alert("復元", isAdFree ? "購入済みの広告非表示を復元しました。" : "購入履歴が見つかりませんでした。");
                }}
                style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.7 }]}
              >
                <Text style={{ fontSize: 22 }}>🔄</Text>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.foreground }]}>購入を復元</Text>
                  <Text style={[styles.settingSubtitle, { color: colors.muted }]}>
                    以前の購入を復元する
                  </Text>
                </View>
              </Pressable>
            </>
          )}
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
              <Text style={[styles.settingTitle, { color: colors.foreground }]}>Calendar&Diary</Text>
              <Text style={[styles.settingSubtitle, { color: colors.muted }]}>v1.0.27 - カレンダー＆日記アプリ</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", marginBottom: 16 },
  statsCard: { borderRadius: 16, padding: 20, borderWidth: 1, marginBottom: 16 },
  statsRow: { flexDirection: "row", alignItems: "center" },
  statItem: { flex: 1, alignItems: "center" },
  statNumber: { fontSize: 28, fontWeight: "800" },
  statLabel: { fontSize: 12, marginTop: 4 },
  statDivider: { width: 1, height: 40 },
  section: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 16, padding: 16 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },

  settingRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 4 },
  settingInfo: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: "600" },
  settingSubtitle: { fontSize: 13, marginTop: 2 },
  toggle: { width: 44, height: 24, borderRadius: 12, position: "relative" },
  toggleKnob: { position: "absolute", top: 2, width: 20, height: 20, borderRadius: 10, backgroundColor: "#FFFFFF" },
  divider: { height: 1, marginVertical: 12 },
  passcodeInput: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 18, textAlign: "center", letterSpacing: 8, marginBottom: 12 },
  passcodeButtons: { flexDirection: "row", gap: 12 },
  passcodeBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  passcodeBtnText: { fontSize: 15, fontWeight: "600" },
  premiumBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  premiumBadgeText: { fontSize: 13, fontWeight: "700" },
});

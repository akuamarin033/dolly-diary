import { useCallback, useState, useEffect } from "react";
import { Text, View, Pressable, StyleSheet, TextInput, Alert, ScrollView, Share, Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as DocumentPicker from "expo-document-picker";

import { ScreenContainer } from "@/components/screen-container";
import { useDiary } from "@/lib/diary-context";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import {
  exportAllData,
  importAllData,
  getPasscode,
  setPasscode,
} from "@/lib/diary-storage";
import { useAds } from "@/lib/ad-context";
import { useConsent } from "@/lib/consent-context";
import { useI18n } from "@/lib/i18n";

export default function ProfileScreen() {
  const colors = useColors();
  const { entries, streak, reload } = useDiary();
  const { isAdFree, purchaseAdFree, restoreAdFree, isPurchasing } = useAds();
  const { gdprApplies, showPrivacyOptions } = useConsent();
  const { colorScheme, setColorScheme } = useThemeContext();
  const { language, setLanguage, t } = useI18n();
  const [passcodeEnabled, setPasscodeEnabled] = useState(false);
  const [showPasscodeSetup, setShowPasscodeSetup] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");

  // Stats
  const totalEntries = entries.length;

  // Check passcode on mount
  useEffect(() => {
    let mounted = true;
    getPasscode().then((code) => {
      if (mounted) setPasscodeEnabled(!!code);
    });
    return () => { mounted = false; };
  }, []);

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

  // === Backup (Export) ===
  const handleBackup = useCallback(async () => {
    try {
      const data = await exportAllData();
      if (Platform.OS === "web") {
        // Web: download as file
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `dollys-diary-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        Alert.alert("完了", "バックアップファイルをダウンロードしました。");
      } else {
        // Native: save to file and share
        const fileName = `dollys-diary-backup-${new Date().toISOString().slice(0, 10)}.json`;
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, data, { encoding: FileSystem.EncodingType.UTF8 });
        await Share.share({
          url: fileUri,
          title: "Dolly's Diary バックアップ",
          message: Platform.OS === "android" ? data : undefined,
        });
      }
    } catch (e) {
      Alert.alert("エラー", "バックアップに失敗しました。");
    }
  }, []);

  // === Restore (Import) ===
  const handleRestore = useCallback(async () => {
    Alert.alert(
      "データを復元",
      "バックアップファイルからデータを復元します。\n現在のデータは上書きされます。\n続行しますか？",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "復元する",
          style: "destructive",
          onPress: async () => {
            try {
              // Use */* to allow Google Drive files to be selectable
              // Google Drive may not recognize application/json for .json files
              const result = await DocumentPicker.getDocumentAsync({
                type: "*/*",
                copyToCacheDirectory: true,
              });

              if (result.canceled || !result.assets || result.assets.length === 0) {
                return;
              }

              const asset = result.assets[0];
              
              // Verify it's a JSON file by name
              if (!asset.name?.toLowerCase().endsWith(".json")) {
                Alert.alert("エラー", "JSONファイルを選択してください。");
                return;
              }

              let jsonStr: string;

              if (Platform.OS === "web") {
                // Web: read via fetch
                const response = await fetch(asset.uri);
                jsonStr = await response.text();
              } else {
                // Native: copy to local cache first, then read
                // This ensures Google Drive / cloud files are fully downloaded
                const localPath = FileSystem.cacheDirectory + `restore-${Date.now()}.json`;
                try {
                  await FileSystem.copyAsync({
                    from: asset.uri,
                    to: localPath,
                  });
                  jsonStr = await FileSystem.readAsStringAsync(localPath, {
                    encoding: FileSystem.EncodingType.UTF8,
                  });
                  // Clean up temp file
                  await FileSystem.deleteAsync(localPath, { idempotent: true });
                } catch (copyErr) {
                  // Fallback: try reading directly
                  jsonStr = await FileSystem.readAsStringAsync(asset.uri, {
                    encoding: FileSystem.EncodingType.UTF8,
                  });
                }
              }

              const success = await importAllData(jsonStr);
              if (success) {
                // Reload diary context
                if (reload) await reload();
                Alert.alert("完了", "データを復元しました。アプリを再起動すると完全に反映されます。");
              } else {
                Alert.alert("エラー", "バックアップファイルの形式が正しくありません。");
              }
            } catch (e: any) {
              console.log("Restore error:", e?.message || e);
              Alert.alert("エラー", "データの復元に失敗しました。\n" + (e?.message || ""));
            }
          },
        },
      ]
    );
  }, [reload]);

  return (
    <ScreenContainer className="px-4 pt-2">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={[styles.title, { color: colors.foreground }]}>{t("profile.title")}</Text>

        {/* Stats card */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{totalEntries}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>{t("profile.diaryCount")}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.warning }]}>{streak.currentStreak}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>{t("profile.streak")}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.success }]}>{streak.longestStreak}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>{t("profile.longestStreak")}</Text>
            </View>
          </View>
        </View>

        {/* Settings section */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("profile.settings")}</Text>

          {/* Dark mode */}
          <Pressable
            onPress={handleToggleDarkMode}
            style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.7 }]}
          >
            <Text style={{ fontSize: 22 }}>🌙</Text>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.foreground }]}>{t("profile.darkMode")}</Text>
              <Text style={[styles.settingSubtitle, { color: colors.muted }]}>
                {colorScheme === "dark" ? t("profile.darkModeOn") : t("profile.darkModeOff")}
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
              <Text style={[styles.settingTitle, { color: colors.foreground }]}>{t("profile.passcode")}</Text>
              <Text style={[styles.settingSubtitle, { color: colors.muted }]}>
                {passcodeEnabled ? t("profile.passcodeSet") : t("profile.passcodeUnset")}
              </Text>
            </View>
            <View style={[styles.toggle, { backgroundColor: passcodeEnabled ? colors.primary : colors.border }]}>
              <View style={[styles.toggleKnob, { left: passcodeEnabled ? 20 : 2 }]} />
            </View>
          </Pressable>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Language */}
          <Pressable
            onPress={() => setLanguage(language === "ja" ? "en" : "ja")}
            style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.7 }]}
          >
            <Text style={{ fontSize: 22 }}>🌐</Text>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.foreground }]}>{t("profile.language")}</Text>
              <Text style={[styles.settingSubtitle, { color: colors.muted }]}>
                {language === "ja" ? t("profile.languageJa") : t("profile.languageEn")}
              </Text>
            </View>
            <View style={[styles.langBadge, { backgroundColor: colors.primary + "22" }]}>
              <Text style={[styles.langBadgeText, { color: colors.primary }]}>{language === "ja" ? "日本語" : "EN"}</Text>
            </View>
          </Pressable>
        </View>

        {/* Backup & Restore section */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("profile.backup")}</Text>

          {/* Backup */}
          <Pressable
            onPress={handleBackup}
            style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.7 }]}
          >
            <Text style={{ fontSize: 22 }}>📤</Text>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.foreground }]}>{t("profile.backupBtn")}</Text>
              <Text style={[styles.settingSubtitle, { color: colors.muted }]}>
                {t("profile.backupDesc")}
              </Text>
            </View>
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Restore */}
          <Pressable
            onPress={handleRestore}
            style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.7 }]}
          >
            <Text style={{ fontSize: 22 }}>📥</Text>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.foreground }]}>{t("profile.restoreBtn")}</Text>
              <Text style={[styles.settingSubtitle, { color: colors.muted }]}>
                {t("profile.restoreDesc")}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Ad removal section */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("profile.premium")}</Text>

          <Pressable
            onPress={async () => {
              if (isAdFree) {
                Alert.alert("広告非表示", "すでに広告非表示が有効です。");
              } else {
                try {
                  await purchaseAdFree();
                } catch (err: any) {
                  const msg = err?.message || String(err);
                  if (!msg.includes("userCancelled") && !msg.includes("E_USER_CANCELLED")) {
                    Alert.alert("エラー", "購入に失敗しました。しばらくしてからもう一度お試しください。");
                  }
                }
              }
            }}
            disabled={isPurchasing}
            style={({ pressed }) => [styles.settingRow, (pressed || isPurchasing) && { opacity: 0.7 }]}
          >
            <Text style={{ fontSize: 22 }}>✨</Text>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.foreground }]}>{t("profile.removeAds")}</Text>
              <Text style={[styles.settingSubtitle, { color: colors.muted }]}>
                {isAdFree ? t("profile.removeAdsActive") : t("profile.removeAdsPrice")}
              </Text>
            </View>
            {isAdFree ? (
              <View style={[styles.premiumBadge, { backgroundColor: colors.success + "22" }]}>
                <Text style={[styles.premiumBadgeText, { color: colors.success }]}>有効</Text>
              </View>
            ) : (
              <View style={[styles.premiumBadge, { backgroundColor: colors.primary + "22" }]}>
                <Text style={[styles.premiumBadgeText, { color: colors.primary }]}>¥300</Text>
              </View>
            )}
          </Pressable>

          {!isAdFree && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Pressable
                onPress={async () => {
                  try {
                    await restoreAdFree();
                    // restoreAdFree updates isAdFree state internally
                    // Show a generic message since state update is async
                    Alert.alert("復元", "購入履歴を確認しました。");
                  } catch {
                    Alert.alert("エラー", "復元に失敗しました。");
                  }
                }}
                style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.7 }]}
              >
                <Text style={{ fontSize: 22 }}>🔄</Text>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.foreground }]}>{t("profile.restorePurchase")}</Text>
                  <Text style={[styles.settingSubtitle, { color: colors.muted }]}>
                    {t("profile.restorePurchaseDesc")}
                  </Text>
                </View>
              </Pressable>
            </>
          )}

          {/* Privacy / Consent Options (GDPR) */}
          {(gdprApplies || Platform.OS !== "web") && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Pressable
                onPress={async () => {
                  await showPrivacyOptions();
                }}
                style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.7 }]}
              >
                <Text style={{ fontSize: 22 }}>🔒</Text>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.foreground }]}>{t("profile.privacySettings")}</Text>
                  <Text style={[styles.settingSubtitle, { color: colors.muted }]}>
                    {t("profile.privacySettingsDesc")}
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
              <Text style={[styles.settingSubtitle, { color: colors.muted }]}>{t("profile.appVersion")}</Text>
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
  langBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  langBadgeText: { fontSize: 13, fontWeight: "700" },
});

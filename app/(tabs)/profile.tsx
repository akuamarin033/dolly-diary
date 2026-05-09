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
  exportFullBackup,
  importAllData,
  getPasscode,
  setPasscode,
} from "@/lib/diary-storage";
import { useAds } from "@/lib/ad-context";
import { useConsent } from "@/lib/consent-context";
import { useI18n } from "@/lib/i18n";

interface BackupFileInfo {
  name: string;
  uri: string;
  size: number;
  modifiedTime: number;
}

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
  const [backupFiles, setBackupFiles] = useState<BackupFileInfo[]>([]);
  const [showBackupList, setShowBackupList] = useState(false);

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

  // Helper: read a file as Base64
  const readFileAsBase64 = useCallback(async (uri: string): Promise<string | null> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (e) {
      console.log("readFileAsBase64 failed:", uri, e);
      return null;
    }
  }, []);

  // Helper: write Base64 data to a local file
  const writeFileFromBase64 = useCallback(async (fileName: string, base64: string): Promise<string | null> => {
    try {
      const dir = FileSystem.documentDirectory + "photos/";
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }
      const localUri = dir + fileName;
      await FileSystem.writeAsStringAsync(localUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return localUri;
    } catch (e) {
      console.log("writeFileFromBase64 failed:", fileName, e);
      return null;
    }
  }, []);

  // === Backup (Export) - Local storage only ===
  const handleBackup = useCallback(async () => {
    if (Platform.OS === "web") {
      try {
        const data = await exportAllData();
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `dollys-diary-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        Alert.alert("完了", "バックアップファイルをダウンロードしました。");
      } catch (e) {
        Alert.alert("エラー", "バックアップに失敗しました。");
      }
      return;
    }

    // Native: show backup type options (full or text-only)
    Alert.alert(
      "バックアップの種類を選択",
      "写真を含めると容量が大きくなります",
      [
        {
          text: "完全バックアップ（写真含む）",
          onPress: () => backupToLocalStorage(true),
        },
        {
          text: "テキストのみ（軽量）",
          onPress: () => backupToLocalStorage(false),
        },
        { text: "キャンセル", style: "cancel" },
      ]
    );
  }, []);

  // Backup to local storage using SAF (Android) or Share (iOS)
  const backupToLocalStorage = useCallback(async (includePhotos: boolean) => {
    try {
      const data = includePhotos
        ? await exportFullBackup(readFileAsBase64)
        : await exportAllData();
      const suffix = includePhotos ? "-full" : "";
      const fileName = `dollys-diary-backup${suffix}-${new Date().toISOString().slice(0, 10)}.json`;

      if (Platform.OS === "android") {
        // Android: Use StorageAccessFramework to let user pick a folder
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) {
          return;
        }
        const dirUri = permissions.directoryUri;
        const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          dirUri,
          fileName,
          "application/json"
        );
        await FileSystem.writeAsStringAsync(fileUri, data, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        Alert.alert(
          "完了",
          includePhotos
            ? `写真を含む完全バックアップを保存しました。\n\nファイル名: ${fileName}\n保存先: 選択したフォルダ`
            : `バックアップを保存しました。\n\nファイル名: ${fileName}\n保存先: 選択したフォルダ`
        );
      } else {
        // iOS: Save to document directory and share
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, data, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        await Share.share({
          url: fileUri,
          title: "Dolly's Diary バックアップ",
        });
      }
      // Refresh backup file list
      await loadBackupFiles();
    } catch (e: any) {
      console.log("Backup to local error:", e?.message || e);
      Alert.alert("エラー", "バックアップに失敗しました。");
    }
  }, [readFileAsBase64]);

  // Load backup files from app document directory
  const loadBackupFiles = useCallback(async () => {
    if (Platform.OS === "web") return;
    try {
      const dir = FileSystem.documentDirectory || "";
      const files = await FileSystem.readDirectoryAsync(dir);
      const backups: BackupFileInfo[] = [];
      for (const file of files) {
        if (file.startsWith("dollys-diary-backup") && file.endsWith(".json")) {
          const uri = dir + file;
          const info = await FileSystem.getInfoAsync(uri);
          if (info.exists && !info.isDirectory) {
            backups.push({
              name: file,
              uri,
              size: info.size || 0,
              modifiedTime: info.modificationTime || 0,
            });
          }
        }
      }
      // Sort by modified time descending (newest first)
      backups.sort((a, b) => b.modifiedTime - a.modifiedTime);
      setBackupFiles(backups);
    } catch (e) {
      console.log("loadBackupFiles error:", e);
    }
  }, []);

  // Delete a backup file
  const handleDeleteBackup = useCallback(async (file: BackupFileInfo) => {
    Alert.alert(
      "バックアップを削除",
      `「${file.name}」を削除しますか？\nこの操作は取り消せません。`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: async () => {
            try {
              await FileSystem.deleteAsync(file.uri, { idempotent: true });
              await loadBackupFiles();
              Alert.alert("完了", "バックアップファイルを削除しました。");
            } catch (e) {
              Alert.alert("エラー", "削除に失敗しました。");
            }
          },
        },
      ]
    );
  }, [loadBackupFiles]);

  // Restore from a specific backup file in app directory
  const handleRestoreFromFile = useCallback(async (file: BackupFileInfo) => {
    Alert.alert(
      "データを復元",
      `「${file.name}」から復元します。\n現在のデータは上書きされます。`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "復元する",
          style: "destructive",
          onPress: async () => {
            try {
              const jsonStr = await FileSystem.readAsStringAsync(file.uri, {
                encoding: FileSystem.EncodingType.UTF8,
              });
              const success = await importAllData(jsonStr, writeFileFromBase64);
              if (success) {
                if (reload) await reload();
                Alert.alert("完了", "データを復元しました。アプリを再起動すると完全に反映されます。");
              } else {
                Alert.alert("エラー", "バックアップファイルの形式が正しくありません。");
              }
            } catch (e: any) {
              Alert.alert("エラー", "復元に失敗しました。\n" + (e?.message || ""));
            }
          },
        },
      ]
    );
  }, [reload, writeFileFromBase64]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date from timestamp
  const formatDate = (timestamp: number): string => {
    if (!timestamp) return "";
    const d = new Date(timestamp * 1000);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

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
              const result = await DocumentPicker.getDocumentAsync({
                type: "application/json",
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
                // Native: read from local cache
                jsonStr = await FileSystem.readAsStringAsync(asset.uri, {
                  encoding: FileSystem.EncodingType.UTF8,
                });
              }

              const success = await importAllData(jsonStr, writeFileFromBase64);
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

          {Platform.OS !== "web" && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* Backup file list toggle */}
              <Pressable
                onPress={() => {
                  if (!showBackupList) loadBackupFiles();
                  setShowBackupList(!showBackupList);
                }}
                style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.7 }]}
              >
                <Text style={{ fontSize: 22 }}>🗂️</Text>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.foreground }]}>バックアップ一覧</Text>
                  <Text style={[styles.settingSubtitle, { color: colors.muted }]}>
                    保存済みファイルの管理・復元・削除
                  </Text>
                </View>
                <Text style={{ fontSize: 16, color: colors.muted }}>{showBackupList ? "▲" : "▼"}</Text>
              </Pressable>

              {showBackupList && (
                <View style={{ marginTop: 12 }}>
                  {backupFiles.length === 0 ? (
                    <Text style={[styles.settingSubtitle, { color: colors.muted, textAlign: "center", paddingVertical: 12 }]}>
                      バックアップファイルがありません
                    </Text>
                  ) : (
                    backupFiles.map((file, idx) => (
                      <View
                        key={file.uri}
                        style={[
                          styles.backupFileRow,
                          { borderColor: colors.border },
                          idx > 0 && { marginTop: 8 },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.backupFileName, { color: colors.foreground }]} numberOfLines={1}>
                            {file.name}
                          </Text>
                          <Text style={[styles.backupFileMeta, { color: colors.muted }]}>
                            {formatFileSize(file.size)} ・ {formatDate(file.modifiedTime)}
                          </Text>
                        </View>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                          <Pressable
                            onPress={() => handleRestoreFromFile(file)}
                            style={({ pressed }) => [
                              styles.backupFileBtn,
                              { backgroundColor: colors.primary + "22" },
                              pressed && { opacity: 0.7 },
                            ]}
                          >
                            <Text style={{ fontSize: 12, color: colors.primary, fontWeight: "600" }}>復元</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => handleDeleteBackup(file)}
                            style={({ pressed }) => [
                              styles.backupFileBtn,
                              { backgroundColor: colors.error + "22" },
                              pressed && { opacity: 0.7 },
                            ]}
                          >
                            <Text style={{ fontSize: 12, color: colors.error, fontWeight: "600" }}>削除</Text>
                          </Pressable>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              )}
            </>
          )}
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
  backupFileRow: { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 10, borderWidth: 1 },
  backupFileName: { fontSize: 13, fontWeight: "600" },
  backupFileMeta: { fontSize: 11, marginTop: 2 },
  backupFileBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
});

import { View, Text, StyleSheet, Pressable, Linking } from "react-native";
import { useAds } from "@/lib/ad-context";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/i18n";

export function BannerAd() {
  const { isAdFree } = useAds();
  const colors = useColors();
  const { t } = useI18n();

  if (isAdFree) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.adLabel}>
        <Text style={[styles.adLabelText, { color: colors.muted }]}>AD</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.adTitle, { color: colors.foreground }]}>Dolly's Diary Premium</Text>
        <Text style={[styles.adSubtitle, { color: colors.muted }]}>{t("ad.premiumDesc")}</Text>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.adButton,
          { backgroundColor: colors.primary },
          pressed && { opacity: 0.8 },
        ]}
      >
        <Text style={styles.adButtonText}>{t("ad.details")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 8,
  },
  adLabel: {
    backgroundColor: "#FFA50033",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adLabelText: {
    fontSize: 10,
    fontWeight: "800",
  },
  content: {
    flex: 1,
  },
  adTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  adSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  adButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  adButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});

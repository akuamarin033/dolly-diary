import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { useAds } from "@/lib/ad-context";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";

// Native AdMob banner component wrapper
function NativeAdMobBanner() {
  const [AdComponents, setAdComponents] = useState<{ BannerAd: any; BannerAdSize: any } | null>(null);
  const [adUnitId, setAdUnitId] = useState<string>("");

  useEffect(() => {
    if (Platform.OS === "web") return;
    try {
      const admob = require("react-native-google-mobile-ads");
      const config = require("@/lib/admob-config");
      setAdComponents({ BannerAd: admob.BannerAd, BannerAdSize: admob.BannerAdSize });
      setAdUnitId(config.ADMOB_BANNER_ID);
    } catch (e) {
      console.log("AdMob not available:", e);
    }
  }, []);

  if (!AdComponents || !adUnitId) return null;

  const { BannerAd: AdMobBanner, BannerAdSize } = AdComponents;
  return (
    <AdMobBanner
      unitId={adUnitId}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      requestOptions={{
        requestNonPersonalizedAdsOnly: true,
      }}
      onAdFailedToLoad={(error: any) => {
        console.log("Banner ad failed to load:", error);
      }}
    />
  );
}

export function BannerAd() {
  const { isAdFree } = useAds();
  const colors = useColors();
  const { t } = useI18n();

  if (isAdFree) return null;

  // On native platforms, use real AdMob banner
  if (Platform.OS !== "web") {
    return (
      <View style={[styles.nativeAdContainer, { borderColor: colors.border }]}>
        <NativeAdMobBanner />
      </View>
    );
  }

  // Web fallback - placeholder ad
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
  nativeAdContainer: {
    marginBottom: 8,
    alignItems: "center",
    overflow: "hidden",
    borderRadius: 8,
  },
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

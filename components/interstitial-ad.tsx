import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useConsent } from "@/lib/consent-context";
import { useI18n } from "@/lib/i18n";

interface InterstitialAdProps {
  visible: boolean;
  onClose: () => void;
}

export function InterstitialAd({ visible, onClose }: InterstitialAdProps) {
  const colors = useColors();
  const { t } = useI18n();
  const { canRequestAds, isConsentReady } = useConsent();
  const [countdown, setCountdown] = useState(3);
  const [canClose, setCanClose] = useState(false);

  // Native AdMob interstitial
  useEffect(() => {
    if (!visible || Platform.OS === "web") return;
    if (!isConsentReady || !canRequestAds) {
      // If consent not ready or ads not allowed, skip ad
      onClose();
      return;
    }

    let unsubLoaded: (() => void) | null = null;
    let unsubClosed: (() => void) | null = null;
    let unsubError: (() => void) | null = null;

    try {
      const admob = require("react-native-google-mobile-ads");
      const config = require("@/lib/admob-config");
      const InterstitialAdClass = admob.InterstitialAd;
      const AdEventTypeEnum = admob.AdEventType;

      const interstitial = InterstitialAdClass.createForAdRequest(config.ADMOB_INTERSTITIAL_ID, {
        requestNonPersonalizedAdsOnly: !canRequestAds,
      });

      unsubLoaded = interstitial.addAdEventListener(AdEventTypeEnum.LOADED, () => {
        interstitial.show();
      });

      unsubClosed = interstitial.addAdEventListener(AdEventTypeEnum.CLOSED, () => {
        onClose();
      });

      unsubError = interstitial.addAdEventListener(AdEventTypeEnum.ERROR, (error: any) => {
        console.log("Interstitial ad error:", error);
        onClose();
      });

      interstitial.load();
    } catch (e) {
      console.log("AdMob interstitial not available:", e);
      onClose();
    }

    return () => {
      unsubLoaded?.();
      unsubClosed?.();
      unsubError?.();
    };
  }, [visible, isConsentReady, canRequestAds]);

  // Web fallback countdown
  useEffect(() => {
    if (!visible) {
      setCountdown(3);
      setCanClose(false);
      return;
    }

    // On native, don't show web fallback
    if (Platform.OS !== "web") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible]);

  if (!visible) return null;

  // On native, the AdMob SDK handles the full-screen ad display
  if (Platform.OS !== "web") {
    return null;
  }

  // Web fallback - placeholder interstitial
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={canClose ? onClose : undefined}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Close button */}
          <View style={styles.topBar}>
            <View style={styles.adBadge}>
              <Text style={styles.adBadgeText}>AD</Text>
            </View>
            {canClose ? (
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeBtn,
                  { backgroundColor: colors.foreground + "33" },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.closeBtnText, { color: colors.foreground }]}>✕</Text>
              </Pressable>
            ) : (
              <View style={[styles.countdownBadge, { backgroundColor: colors.foreground + "22" }]}>
                <Text style={[styles.countdownText, { color: colors.muted }]}>{countdown}s</Text>
              </View>
            )}
          </View>

          {/* Ad content */}
          <View style={styles.adContent}>
            <View style={[styles.adImagePlaceholder, { backgroundColor: colors.primary + "15" }]}>
              <Text style={{ fontSize: 64 }}>🐱</Text>
              <Text style={[styles.adMainTitle, { color: colors.primary }]}>Dolly's Diary</Text>
              <Text style={[styles.adMainSubtitle, { color: colors.primary }]}>Premium</Text>
            </View>

            <View style={styles.featureList}>
              <View style={styles.featureRow}>
                <Text style={styles.featureIcon}>✨</Text>
                <Text style={[styles.featureText, { color: colors.foreground }]}>{t("ad.feature1")}</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.featureIcon}>🎨</Text>
                <Text style={[styles.featureText, { color: colors.foreground }]}>{t("ad.feature2")}</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.featureIcon}>☁️</Text>
                <Text style={[styles.featureText, { color: colors.foreground }]}>{t("ad.feature3")}</Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.ctaButton,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.ctaText}>{t("ad.upgrade")}</Text>
            </Pressable>

            <Text style={[styles.priceText, { color: colors.muted }]}>{t("ad.price")}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    overflow: "hidden",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  adBadge: {
    backgroundColor: "#FFA50044",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  adBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#CC8800",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: "700",
  },
  countdownBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countdownText: {
    fontSize: 13,
    fontWeight: "600",
  },
  adContent: {
    padding: 24,
    alignItems: "center",
  },
  adImagePlaceholder: {
    width: "100%",
    paddingVertical: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  adMainTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 8,
  },
  adMainSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    opacity: 0.7,
  },
  featureList: {
    width: "100%",
    gap: 12,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureText: {
    fontSize: 15,
    fontWeight: "500",
  },
  ctaButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  priceText: {
    fontSize: 13,
    marginTop: 4,
  },
});

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { Platform } from "react-native";

interface ConsentContextType {
  /** Whether ads can be requested (consent obtained or not required) */
  canRequestAds: boolean;
  /** Whether the consent flow has completed (regardless of result) */
  isConsentReady: boolean;
  /** Whether GDPR applies to this user */
  gdprApplies: boolean;
  /** Show the privacy options form (for settings screen) */
  showPrivacyOptions: () => Promise<void>;
  /** Reset consent state (for testing) */
  resetConsent: () => void;
}

const ConsentContext = createContext<ConsentContextType>({
  canRequestAds: true,
  isConsentReady: false,
  gdprApplies: false,
  showPrivacyOptions: async () => {},
  resetConsent: () => {},
});

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [canRequestAds, setCanRequestAds] = useState(false);
  const [isConsentReady, setIsConsentReady] = useState(false);
  const [gdprApplies, setGdprApplies] = useState(false);
  const isMobileAdsStartCalled = useRef(false);

  useEffect(() => {
    // On web, consent is not needed - just allow ads
    if (Platform.OS === "web") {
      setCanRequestAds(true);
      setIsConsentReady(true);
      return;
    }

    initializeConsent();
  }, []);

  const initializeConsent = useCallback(async () => {
    try {
      const { AdsConsent } = require("react-native-google-mobile-ads");

      // Request consent information and show form if required
      await AdsConsent.gatherConsent()
        .then(() => startGoogleMobileAdsSDK())
        .catch((error: any) => {
          console.log("Consent gathering failed:", error);
        });

      // Also try to start SDK with previous session consent
      await startGoogleMobileAdsSDK();
    } catch (e) {
      console.log("Consent initialization error:", e);
      // If consent module not available, allow ads anyway
      setCanRequestAds(true);
      setIsConsentReady(true);
    }
  }, []);

  const startGoogleMobileAdsSDK = useCallback(async () => {
    try {
      const { AdsConsent } = require("react-native-google-mobile-ads");
      const mobileAds = require("react-native-google-mobile-ads").default;

      const { canRequestAds: canRequest } = await AdsConsent.getConsentInfo();

      if (!canRequest || isMobileAdsStartCalled.current) {
        setCanRequestAds(canRequest);
        setIsConsentReady(true);
        return;
      }

      isMobileAdsStartCalled.current = true;

      // Check if GDPR applies
      const gdpr = await AdsConsent.getGdprApplies();
      setGdprApplies(gdpr);

      // Initialize the Google Mobile Ads SDK
      await mobileAds().initialize();

      setCanRequestAds(true);
      setIsConsentReady(true);
    } catch (e) {
      console.log("Mobile Ads SDK init error:", e);
      setCanRequestAds(true);
      setIsConsentReady(true);
    }
  }, []);

  const showPrivacyOptions = useCallback(async () => {
    if (Platform.OS === "web") return;

    try {
      const { AdsConsent } = require("react-native-google-mobile-ads");
      await AdsConsent.showPrivacyOptionsForm();

      // Re-check consent status after form
      const { canRequestAds: canRequest } = await AdsConsent.getConsentInfo();
      setCanRequestAds(canRequest);
    } catch (e) {
      console.log("Privacy options form error:", e);
    }
  }, []);

  const resetConsent = useCallback(() => {
    if (Platform.OS === "web") return;

    try {
      const { AdsConsent } = require("react-native-google-mobile-ads");
      AdsConsent.reset();
      isMobileAdsStartCalled.current = false;
      setCanRequestAds(false);
      setIsConsentReady(false);
      setGdprApplies(false);

      // Re-initialize after reset
      initializeConsent();
    } catch (e) {
      console.log("Consent reset error:", e);
    }
  }, [initializeConsent]);

  return (
    <ConsentContext.Provider
      value={{
        canRequestAds,
        isConsentReady,
        gdprApplies,
        showPrivacyOptions,
        resetConsent,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  return useContext(ConsentContext);
}

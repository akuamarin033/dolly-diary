import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AD_FREE_KEY = "@dollys_diary_ad_free";

interface AdContextType {
  isAdFree: boolean;
  purchaseAdFree: () => Promise<void>;
  restoreAdFree: () => Promise<void>;
  shouldShowInterstitial: () => boolean;
}

const AdContext = createContext<AdContextType | null>(null);

export function AdProvider({ children }: { children: React.ReactNode }) {
  const [isAdFree, setIsAdFree] = useState(false);
  const [interstitialCount, setInterstitialCount] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(AD_FREE_KEY).then((val) => {
      if (val === "true") setIsAdFree(true);
    });
  }, []);

  const purchaseAdFree = useCallback(async () => {
    await AsyncStorage.setItem(AD_FREE_KEY, "true");
    setIsAdFree(true);
  }, []);

  const restoreAdFree = useCallback(async () => {
    const val = await AsyncStorage.getItem(AD_FREE_KEY);
    if (val === "true") {
      setIsAdFree(true);
    }
  }, []);

  // Show interstitial every 3rd diary open
  const shouldShowInterstitial = useCallback(() => {
    if (isAdFree) return false;
    const next = interstitialCount + 1;
    setInterstitialCount(next);
    return next % 3 === 0;
  }, [isAdFree, interstitialCount]);

  return (
    <AdContext.Provider value={{ isAdFree, purchaseAdFree, restoreAdFree, shouldShowInterstitial }}>
      {children}
    </AdContext.Provider>
  );
}

export function useAds() {
  const ctx = useContext(AdContext);
  if (!ctx) throw new Error("useAds must be used within AdProvider");
  return ctx;
}

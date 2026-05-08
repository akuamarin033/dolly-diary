import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const AD_FREE_KEY = "@dollys_diary_ad_free";
const PRODUCT_ID = "remove_ads";

interface AdContextType {
  isAdFree: boolean;
  purchaseAdFree: () => Promise<void>;
  restoreAdFree: () => Promise<void>;
  shouldShowInterstitial: () => boolean;
  isPurchasing: boolean;
}

const AdContext = createContext<AdContextType | null>(null);

export function AdProvider({ children }: { children: React.ReactNode }) {
  const [isAdFree, setIsAdFree] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const interstitialCountRef = useRef(0);
  const iapModuleRef = useRef<any>(null);

  // Initialize IAP and check purchase status on mount
  useEffect(() => {
    let purchaseListener: any = null;

    const init = async () => {
      // First check local cache
      const cached = await AsyncStorage.getItem(AD_FREE_KEY);
      if (cached === "true") {
        setIsAdFree(true);
      }

      // On native, initialize IAP and verify purchase state
      if (Platform.OS === "web") return;

      try {
        const RNIap = require("react-native-iap");
        iapModuleRef.current = RNIap;

        await RNIap.initConnection();

        // Check existing purchases (restore on startup)
        try {
          const purchases = await RNIap.getAvailablePurchases();
          const hasRemoveAds = purchases.some(
            (p: any) => p.productId === PRODUCT_ID
          );
          if (hasRemoveAds) {
            await AsyncStorage.setItem(AD_FREE_KEY, "true");
            setIsAdFree(true);
          }
        } catch {
          // If getAvailablePurchases fails, rely on local cache
        }

        // Listen for new purchases
        purchaseListener = RNIap.purchaseUpdatedListener(
          async (purchase: any) => {
            if (purchase.productId === PRODUCT_ID) {
              try {
                // Acknowledge the purchase (required for Android)
                if (Platform.OS === "android" && !purchase.isAcknowledgedAndroid) {
                  await RNIap.acknowledgePurchaseAndroid({
                    token: purchase.purchaseToken,
                  });
                }
                // Finish the transaction
                await RNIap.finishTransaction({ purchase, isConsumable: false });
                await AsyncStorage.setItem(AD_FREE_KEY, "true");
                setIsAdFree(true);
              } catch (err) {
                console.warn("Failed to finish purchase:", err);
              }
            }
            setIsPurchasing(false);
          }
        );
      } catch (err) {
        console.warn("IAP init error:", err);
      }
    };

    init();

    return () => {
      if (purchaseListener) {
        purchaseListener.remove();
      }
      if (iapModuleRef.current && Platform.OS !== "web") {
        try {
          iapModuleRef.current.endConnection();
        } catch {}
      }
    };
  }, []);

  const purchaseAdFree = useCallback(async () => {
    if (Platform.OS === "web") return;

    const RNIap = iapModuleRef.current;
    if (!RNIap) {
      console.warn("IAP not initialized");
      return;
    }

    setIsPurchasing(true);
    try {
      // Get product info first
      const products = await RNIap.getProducts({ skus: [PRODUCT_ID] });
      if (!products || products.length === 0) {
        throw new Error("Product not found");
      }

      // Request purchase
      await RNIap.requestPurchase({ sku: PRODUCT_ID });
      // Purchase completion is handled by purchaseUpdatedListener
    } catch (err: any) {
      setIsPurchasing(false);
      // Re-throw so caller can show error to user
      throw err;
    }
  }, []);

  const restoreAdFree = useCallback(async () => {
    if (Platform.OS === "web") {
      // On web, just check local storage
      const val = await AsyncStorage.getItem(AD_FREE_KEY);
      if (val === "true") setIsAdFree(true);
      return;
    }

    const RNIap = iapModuleRef.current;
    if (!RNIap) {
      console.warn("IAP not initialized");
      return;
    }

    try {
      const purchases = await RNIap.getAvailablePurchases();
      const hasRemoveAds = purchases.some(
        (p: any) => p.productId === PRODUCT_ID
      );
      if (hasRemoveAds) {
        await AsyncStorage.setItem(AD_FREE_KEY, "true");
        setIsAdFree(true);
      } else {
        // Clear local cache if purchase not found on store
        await AsyncStorage.removeItem(AD_FREE_KEY);
        setIsAdFree(false);
      }
    } catch (err) {
      console.warn("Restore purchases error:", err);
      // Fallback to local cache
      const val = await AsyncStorage.getItem(AD_FREE_KEY);
      if (val === "true") setIsAdFree(true);
    }
  }, []);

  // Show interstitial every 3rd diary open
  const shouldShowInterstitial = useCallback(() => {
    if (isAdFree) return false;
    interstitialCountRef.current += 1;
    return interstitialCountRef.current % 3 === 0;
  }, [isAdFree]);

  return (
    <AdContext.Provider value={{ isAdFree, purchaseAdFree, restoreAdFree, shouldShowInterstitial, isPurchasing }}>
      {children}
    </AdContext.Provider>
  );
}

export function useAds() {
  const ctx = useContext(AdContext);
  if (!ctx) throw new Error("useAds must be used within AdProvider");
  return ctx;
}

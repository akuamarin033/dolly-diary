import { Platform } from "react-native";

/**
 * AdMob configuration for Dolly's Diary App
 * 
 * App ID: ca-app-pub-7262624140219679~2581809809
 * (configured in app.config.ts plugin)
 * 
 * Note: react-native-google-mobile-ads is a native-only module.
 * On web, placeholder ads are shown instead.
 * The actual AdMob ads will only display on native builds (iOS/Android).
 */

// Production ad unit IDs
const PRODUCTION_BANNER_ID = "ca-app-pub-7262624140219679/2579173908";
const PRODUCTION_INTERSTITIAL_ID = "ca-app-pub-7262624140219679/6326847221";

// Test ad unit IDs (Google's official test IDs)
const TEST_BANNER_ID = "ca-app-pub-3940256099942544/9214589741";
const TEST_INTERSTITIAL_ID = "ca-app-pub-3940256099942544/1033173712";

// Use test IDs during development, real IDs in production
export const ADMOB_BANNER_ID = __DEV__ ? TEST_BANNER_ID : PRODUCTION_BANNER_ID;
export const ADMOB_INTERSTITIAL_ID = __DEV__ ? TEST_INTERSTITIAL_ID : PRODUCTION_INTERSTITIAL_ID;

// Check if we're on a native platform (AdMob only works on native)
export const IS_NATIVE = Platform.OS === "ios" || Platform.OS === "android";

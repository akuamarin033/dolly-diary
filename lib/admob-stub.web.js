// Stub module for react-native-google-mobile-ads on web platform
// AdMob is a native-only module and doesn't work on web.
// This stub prevents import errors when bundling for web.

export const BannerAd = () => null;
export const BannerAdSize = {
  BANNER: "BANNER",
  FULL_BANNER: "FULL_BANNER",
  LARGE_BANNER: "LARGE_BANNER",
  LEADERBOARD: "LEADERBOARD",
  MEDIUM_RECTANGLE: "MEDIUM_RECTANGLE",
  ANCHORED_ADAPTIVE_BANNER: "ANCHORED_ADAPTIVE_BANNER",
  INLINE_ADAPTIVE_BANNER: "INLINE_ADAPTIVE_BANNER",
};

export const InterstitialAd = {
  createForAdRequest: () => ({
    addAdEventListener: () => () => {},
    load: () => {},
    show: () => {},
  }),
};

export const RewardedAd = {
  createForAdRequest: () => ({
    addAdEventListener: () => () => {},
    load: () => {},
    show: () => {},
  }),
};

export const AdEventType = {
  LOADED: "loaded",
  ERROR: "error",
  OPENED: "opened",
  CLOSED: "closed",
  CLICKED: "clicked",
};

export const RewardedAdEventType = {
  LOADED: "loaded",
  EARNED_REWARD: "earned_reward",
};

export const TestIds = {
  BANNER: "ca-app-pub-3940256099942544/6300978111",
  INTERSTITIAL: "ca-app-pub-3940256099942544/1033173712",
  REWARDED: "ca-app-pub-3940256099942544/5224354917",
  ADAPTIVE_BANNER: "ca-app-pub-3940256099942544/9214589741",
};

export default {
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
  TestIds,
};

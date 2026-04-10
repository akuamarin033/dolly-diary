const ADMOB_ANDROID_APP_ID =
  'ca-app-pub-7262624140219679~7799984066';

const ADMOB_IOS_APP_ID =
  'ca-app-pub-3940256099942544~1458002511';

const BANNER_ID =
  process.env.EXPO_PUBLIC_AD_BANNER_ID ||
  'ca-app-pub-3940256099942544/6300978111';

const INTERSTITIAL_ID =
  process.env.EXPO_PUBLIC_AD_INTERSTITIAL_ID ||
  'ca-app-pub-3940256099942544/1033173712';

module.exports = ({ config }) => ({
  ...config,
  name: 'Dolly Diary',
  slug: 'dollys-diary-app',
  scheme: 'dollydiary',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',

  android: {
    package: 'com.akuam.dollydiary',
  },

  ios: {
    bundleIdentifier: 'com.akuam.dollydiary',
    supportsTablet: true,
  },

  plugins: [
    'expo-router',
    [
      'expo-image-picker',
      {
        photosPermission:
          '日記に写真を追加するため、写真ライブラリへのアクセスを使用します。',
        microphonePermission: false,
      },
    ],
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: ADMOB_ANDROID_APP_ID,
        iosAppId: ADMOB_IOS_APP_ID,
        delayAppMeasurementInit: true,
      },
    ],
  ],

  extra: {
    ...(config.extra ?? {}),
    ads: {
      appId: ADMOB_ANDROID_APP_ID,
      banner: BANNER_ID,
      interstitial: INTERSTITIAL_ID,
    },
    eas: {
      projectId: 'fa7bf9f2-c76f-44ec-95bb-23da54013146',
    },
  },
});

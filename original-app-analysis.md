# 元アプリ解析結果

## アプリアイコン
- 可愛い白猫が日記帳を持っているイラスト（オレンジ/ゴールド背景）
- APKの `res/5c.webp` と `res/iE.webp` に格納

## ルート構造（タブ）
- `/(tabs)/index.tsx` - カレンダー画面（ホーム）
- `/(tabs)/diary-list.tsx` - 日記一覧
- `/(tabs)/profile.tsx` - プロフィール画面
- `/(tabs)/stickers.tsx` - ステッカー（デコ）画面

## 主要機能（全て維持）
1. カレンダー（月間表示、日記インジケーター）
2. 日記作成・編集・閲覧（diaryInput, diaryLabel, diarySubLabel, diaryDates, diaryDays）
3. デコステッカー機能（最大10個 - "Up to 10 deco stickers"）
   - draggableDeco（ドラッグ可能なデコ）
   - placedDecoEmoji（配置されたデコ絵文字）
   - decoStickers, decoLabel, decoSmallHeart
   - "Remove Deco Stickers" 機能
4. 写真添付（最大3枚 - "Up to 3 photos"）
   - photoRow, photoThumb, photoLimit, photoPlaceholder
5. 気分（mood）カテゴリ（moodCategory, moodSleepy, moodLabel, moodImageUrl）
6. ストリーク（連続記録）機能（"1 day streak!"）
7. パスコードロック機能
   - passcodeDots, passcodeEnable, passcodeErrorText
   - passcodeLabel, passcodeNumEmpty, passcodeNumText, passcodeNumPad
   - passcodeRemoved, passcodeSetSuccess, passcodeTitle, passcodeNew
8. プロフィール画面（profileName, profileTitle）
9. ダークモード対応
10. 生体認証（expo-local-authentication）
11. カレンダー連携（expo-calendar）
12. 音声メモ（expo-audio, RECORD_AUDIO permission）
13. アプリ内課金（expo-iap）
14. Google広告（react-native-google-mobile-ads）
15. データバックアップ/エクスポート（"Save your diary data to a file for device transfer. Includes photos, deco stickers, and settings."）
16. 動機付けカード（motivCard, motivText）

## 削除対象（ウィジェットのみ）
- react-native-android-widget（カレンダーウィジェット）

## カラー（元アプリ）
- #FDF8F3 - 背景（クリーム）
- #3D2C1E, #3D2A3A - テキスト
- #1A222E, #1A2332, #1A2A1E - ダークテーマ
- #C4956A - アクセント

## 使用パッケージ（app.configから）
- expo-router, expo-localization
- react-native-google-mobile-ads（広告）
- expo-iap（アプリ内課金）
- expo-local-authentication（生体認証）
- expo-calendar（カレンダー連携）
- expo-audio（音声メモ）
- expo-video, expo-splash-screen, expo-build-properties

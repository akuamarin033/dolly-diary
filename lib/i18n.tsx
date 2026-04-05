import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LANG_KEY = "dollys_language";

export type Language = "ja" | "en";

// Translation dictionary
const translations = {
  // Tab names
  "tab.calendar": { ja: "カレンダー", en: "Calendar" },
  "tab.diary": { ja: "日記", en: "Diary" },
  "tab.list": { ja: "一覧", en: "List" },
  "tab.stamps": { ja: "スタンプ", en: "Stamps" },
  "tab.settings": { ja: "設定", en: "Settings" },

  // Calendar screen
  "calendar.title": { ja: "カレンダー", en: "Calendar" },
  "calendar.addDeco": { ja: "+ デコ", en: "+ Deco" },
  "calendar.thisMonth": { ja: "今月", en: "Today" },
  "calendar.year": { ja: "年", en: "" },
  "calendar.month": { ja: "月", en: "" },
  "calendar.sun": { ja: "日", en: "Sun" },
  "calendar.mon": { ja: "月", en: "Mon" },
  "calendar.tue": { ja: "火", en: "Tue" },
  "calendar.wed": { ja: "水", en: "Wed" },
  "calendar.thu": { ja: "木", en: "Thu" },
  "calendar.fri": { ja: "金", en: "Fri" },
  "calendar.sat": { ja: "土", en: "Sat" },
  "calendar.deleteDeco": { ja: "このデコを削除しますか？", en: "Delete this deco?" },
  "calendar.delete": { ja: "削除", en: "Delete" },
  "calendar.cancel": { ja: "キャンセル", en: "Cancel" },
  "calendar.decoLimit": { ja: "上限に達しました", en: "Limit reached" },
  "calendar.decoLimitMsg": { ja: "デコステッカーは最大20個まで配置できます。\n不要なステッカーを長押しで削除してください。", en: "You can place up to 20 deco stickers.\nLong press to delete unwanted stickers." },
  "calendar.selectDeco": { ja: "デコを選択", en: "Select Deco" },
  "calendar.itemStickers": { ja: "アイテム", en: "Items" },
  "calendar.catStickers": { ja: "ネコ", en: "Cats" },
  "calendar.cat2Stickers": { ja: "ネコ2", en: "Cats 2" },

  // Diary edit screen
  "diary.todaysTitle": { ja: "Today's\nTitle", en: "Today's\nTitle" },
  "diary.titlePlaceholder": { ja: "今日のタイトル 例:猫カフェ!", en: "Today's title e.g. Cat Cafe!" },
  "diary.contentPlaceholder": { ja: "今日の出来事を書いてみよう...", en: "Write about today..." },
  "diary.save": { ja: "保存する", en: "Save" },
  "diary.saving": { ja: "保存中...", en: "Saving..." },
  "diary.saved": { ja: "保存しました！", en: "Saved!" },
  "diary.mood": { ja: "気分", en: "Mood" },
  "diary.weather": { ja: "天気", en: "Weather" },
  "diary.photos": { ja: "写真", en: "Photos" },
  "diary.addPhoto": { ja: "写真を追加", en: "Add Photo" },
  "diary.deleteEntry": { ja: "この日記を削除しますか？", en: "Delete this diary entry?" },
  "diary.deleteConfirm": { ja: "この操作は取り消せません。", en: "This action cannot be undone." },
  "diary.todayDiary": { ja: "今日の日記", en: "Today's Diary" },
  "diary.writeDiary": { ja: "日記を書く", en: "Write Diary" },

  // Diary list screen
  "list.title": { ja: "日記一覧", en: "Diary List" },
  "list.searchPlaceholder": { ja: "日記を検索...", en: "Search diary..." },
  "list.empty": { ja: "まだ日記がありません", en: "No diary entries yet" },
  "list.emptyHint": { ja: "日記タブから最初の日記を書いてみましょう！", en: "Start writing your first diary from the Diary tab!" },
  "list.noResults": { ja: "検索結果がありません", en: "No results found" },

  // Stickers screen
  "stickers.title": { ja: "デコ", en: "Deco" },
  "stickers.itemTab": { ja: "アイテム", en: "Items" },
  "stickers.catTab": { ja: "ネコ", en: "Cats" },
  "stickers.cat2Tab": { ja: "ネコ2", en: "Cats 2" },
  "stickers.tapToPlace": { ja: "ステッカーを選んでカレンダーに配置しよう！", en: "Pick a sticker to place on the calendar!" },
  "stickers.scaleHint": { ja: "カレンダー上のステッカーをタップで5段階の拡大縮小、ダブルタップで回転、長押しで削除できます。", en: "Tap stickers on calendar to resize (5 levels), double-tap to rotate, long press to delete." },

  // Profile screen
  "profile.title": { ja: "プロフィール", en: "Profile" },
  "profile.diaryCount": { ja: "日記数", en: "Entries" },
  "profile.streak": { ja: "連続日数", en: "Streak" },
  "profile.longestStreak": { ja: "最長記録", en: "Best" },
  "profile.settings": { ja: "設定", en: "Settings" },
  "profile.darkMode": { ja: "ダークモード", en: "Dark Mode" },
  "profile.darkModeOn": { ja: "オン", en: "On" },
  "profile.darkModeOff": { ja: "オフ", en: "Off" },
  "profile.passcode": { ja: "パスコードロック", en: "Passcode Lock" },
  "profile.passcodeSet": { ja: "設定済み", en: "Enabled" },
  "profile.passcodeUnset": { ja: "未設定", en: "Disabled" },
  "profile.language": { ja: "言語", en: "Language" },
  "profile.languageJa": { ja: "日本語", en: "Japanese" },
  "profile.languageEn": { ja: "英語", en: "English" },
  "profile.backup": { ja: "バックアップ & リストア", en: "Backup & Restore" },
  "profile.backupBtn": { ja: "バックアップ", en: "Backup" },
  "profile.backupDesc": { ja: "日記・デコ・設定をファイルに保存", en: "Save diary, deco & settings to file" },
  "profile.restoreBtn": { ja: "リストア", en: "Restore" },
  "profile.restoreDesc": { ja: "バックアップファイルからデータを復元", en: "Restore data from backup file" },
  "profile.premium": { ja: "プレミアム", en: "Premium" },
  "profile.removeAds": { ja: "広告を非表示", en: "Remove Ads" },
  "profile.removeAdsActive": { ja: "有効中", en: "Active" },
  "profile.removeAdsPrice": { ja: "¥480で広告を削除", en: "Remove ads for ¥480" },
  "profile.restorePurchase": { ja: "購入を復元", en: "Restore Purchase" },
  "profile.restorePurchaseDesc": { ja: "以前の購入を復元する", en: "Restore previous purchase" },
  "profile.appVersion": { ja: "v1.0.28 - カレンダー＆日記アプリ", en: "v1.0.28 - Calendar & Diary App" },

  // Diary detail screen
  "diary.back": { ja: "戻る", en: "Back" },
  "diary.edit": { ja: "編集", en: "Edit" },
  "diary.deleteTitle": { ja: "日記を削除", en: "Delete Entry" },
  "diary.noEntry": { ja: "日記が見つかりません", en: "Entry not found" },
  "diary.created": { ja: "作成", en: "Created" },
  "diary.updated": { ja: "更新", en: "Updated" },
  "diary.cancel": { ja: "キャンセル", en: "Cancel" },
  "diary.photoError": { ja: "写真の選択に失敗しました。", en: "Failed to select photo." },
  "diary.contentRequired": { ja: "内容を入力してください。", en: "Please enter some content." },
  "diary.saveFailed": { ja: "保存に失敗しました。", en: "Failed to save." },
  "diary.writeContent": { ja: "今日あったことを書こう...", en: "Write about what happened today..." },

  // Write diary tab
  "diary.todayDate": { ja: "今日の日付", en: "Today's Date" },
  "diary.startWriting": { ja: "日記を書く", en: "Start Writing" },

  // Calendar streak
  "calendar.streakDays": { ja: "日連続", en: " day streak" },
  "calendar.writeDiary": { ja: "の日記を書く", en: "Write diary for " },
  "calendar.placed": { ja: "配置中", en: "placed" },
  "calendar.motiv7": { ja: "素晴らしい！1週間以上続いています！", en: "Amazing! Over a week streak!" },
  "calendar.motiv3": { ja: "いい調子！続けていきましょう！", en: "Great going! Keep it up!" },
  "calendar.motiv1": { ja: "今日も日記を書きましょう！", en: "Let's write today's diary!" },

  // Common
  "common.cancel": { ja: "キャンセル", en: "Cancel" },
  "common.delete": { ja: "削除", en: "Delete" },
  "common.done": { ja: "完了", en: "Done" },
  "common.error": { ja: "エラー", en: "Error" },
  "common.ok": { ja: "OK", en: "OK" },
  "common.confirm": { ja: "確認", en: "Confirm" },
  "common.purchase": { ja: "購入する", en: "Purchase" },

  // Mood labels
  "mood.happy": { ja: "嬉しい", en: "Happy" },
  "mood.laugh": { ja: "笑い", en: "Laugh" },
  "mood.excited": { ja: "ウキウキ", en: "Excited" },
  "mood.worried": { ja: "不安", en: "Worried" },
  "mood.depressed": { ja: "落ち込み", en: "Depressed" },
  "mood.cry": { ja: "泣き", en: "Cry" },
  "mood.angry": { ja: "怒り", en: "Angry" },
  "mood.surprised": { ja: "驚き", en: "Surprised" },
  "mood.neutral": { ja: "普通", en: "Neutral" },
  "mood.sad": { ja: "悲しい", en: "Sad" },
  "mood.love": { ja: "ラブ", en: "Love" },
  "mood.rage": { ja: "激怒", en: "Rage" },
  "mood.calm": { ja: "穏やか", en: "Calm" },
  "mood.tired": { ja: "疲れ", en: "Tired" },
  "mood.annoyed": { ja: "困惑", en: "Annoyed" },
  "mood.tantrum": { ja: "大激怒", en: "Tantrum" },

  // Weather labels
  "weather.sunny": { ja: "晴れ", en: "Sunny" },
  "weather.cloudy": { ja: "曇り", en: "Cloudy" },
  "weather.rainy": { ja: "雨", en: "Rainy" },
  "weather.thunder": { ja: "雷", en: "Thunder" },
  "weather.windy": { ja: "風", en: "Windy" },
  "weather.snowy": { ja: "雪", en: "Snowy" },
  "weather.rainbow": { ja: "虹", en: "Rainbow" },
  "weather.night": { ja: "夜", en: "Night" },

  // Ad banner
  "ad.premium": { ja: "Dolly's Diary Premium", en: "Dolly's Diary Premium" },
  "ad.premiumDesc": { ja: "広告を非表示にして快適に日記を書こう", en: "Remove ads for a better diary experience" },
  "ad.details": { ja: "詳細", en: "Details" },
  "ad.close": { ja: "閉じる", en: "Close" },
  "ad.interstitialTitle": { ja: "広告", en: "Advertisement" },
  "ad.interstitialMsg": { ja: "Dolly's Diary をご利用いただきありがとうございます！\n\nプレミアムプランで広告を非表示にできます。", en: "Thank you for using Dolly's Diary!\n\nUpgrade to Premium to remove ads." },
  "ad.feature1": { ja: "広告なしで快適に日記を書ける", en: "Write diary comfortably without ads" },
  "ad.feature2": { ja: "限定デコステッカーが使える", en: "Access exclusive deco stickers" },
  "ad.feature3": { ja: "クラウドバックアップ対応", en: "Cloud backup support" },
  "ad.upgrade": { ja: "プレミアムにアップグレード", en: "Upgrade to Premium" },
  "ad.price": { ja: "¥480 / 月", en: "$4.99 / month" },

  // Privacy / Consent
  "profile.privacySettings": { ja: "プライバシー設定", en: "Privacy Settings" },
  "profile.privacySettingsDesc": { ja: "広告のパーソナライズ設定を管理", en: "Manage ad personalization preferences" },
} as const;

export type TranslationKey = keyof typeof translations;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ja");

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((lang) => {
      if (lang === "en" || lang === "ja") {
        setLanguageState(lang);
      }
    });
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(LANG_KEY, lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const entry = translations[key];
      if (!entry) return key;
      return entry[language] || entry.ja;
    },
    [language]
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

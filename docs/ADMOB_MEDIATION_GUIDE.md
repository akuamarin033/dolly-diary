# AdMob メディエーション設定ガイド

AdMob メディエーションを使用すると、AdMob ネットワークに加えてサードパーティの広告ネットワークからも広告を配信できます。これにより、広告の充填率（フィルレート）が向上し、収益を最大化できます。

## 前提条件

本アプリには以下のAdMob設定が完了しています。

| 項目 | 値 |
|------|-----|
| AdMobアプリID | `ca-app-pub-7262624140219679~2581809809` |
| バナー広告ユニットID | `ca-app-pub-7262624140219679/2579173908` |
| インタースティシャル広告ユニットID | `ca-app-pub-7262624140219679/6326847221` |

## Step 1: AdMobコンソールでメディエーショングループを作成

1. [AdMobコンソール](https://apps.admob.com/) にログインします。
2. 左メニューから **メディエーション** を選択します。
3. **メディエーショングループを作成** をクリックします。
4. 広告フォーマットを選択します（バナーまたはインタースティシャル）。
5. プラットフォーム（Android / iOS）を選択します。
6. メディエーショングループに名前を付けます（例: 「Calendar&Diary バナー メディエーション」）。

## Step 2: 広告ソースを追加

メディエーショングループに広告ネットワークを追加します。以下は推奨される広告ネットワークです。

| 広告ネットワーク | 特徴 | 推奨度 |
|----------------|------|--------|
| **Meta Audience Network** | 高いeCPM、大規模なリーチ | 高 |
| **AppLovin** | 高いフィルレート | 高 |
| **Unity Ads** | ゲーム系に強い | 中 |
| **ironSource** | メディエーション機能が充実 | 中 |
| **InMobi** | アジア圏に強い | 中 |
| **Pangle (TikTok)** | 動画広告に強い | 中 |

各ネットワークの追加手順は以下の通りです。

1. メディエーショングループの **広告ソースを追加** をクリックします。
2. 追加したいネットワークを選択します。
3. 各ネットワークのアカウント情報（アプリID、プレースメントIDなど）を入力します。
4. eCPMの値を設定します（ウォーターフォール方式の場合）。

## Step 3: アプリにメディエーションアダプターを追加

各広告ネットワークのメディエーションアダプターをアプリに追加する必要があります。Expoプロジェクトでは `app.config.ts` の `expo-build-properties` プラグインを使用してネイティブ依存関係を追加します。

### Android アダプターの追加例

`app.config.ts` の `expo-build-properties` に以下のように追加します。

```typescript
[
  "expo-build-properties",
  {
    android: {
      buildArchs: ["armeabi-v7a", "arm64-v8a"],
      minSdkVersion: 24,
      // メディエーションアダプターの依存関係を追加
      extraMavenRepos: [
        "https://artifact.bytedance.com/repository/pangle",
      ],
    },
  },
],
```

各ネットワークのアダプター依存関係は、Google公式ドキュメントを参照してください。

- [Android アダプター一覧](https://developers.google.com/admob/android/mediation#supported_ad_networks)
- [iOS アダプター一覧](https://developers.google.com/admob/ios/mediation#supported_ad_networks)

## Step 4: ウォーターフォール vs 入札（Bidding）

AdMobメディエーションには2つの方式があります。

### ウォーターフォール方式

広告ネットワークに優先順位を付けて、上から順に広告リクエストを送信します。eCPMの高いネットワークを上位に配置することで収益を最大化できます。

### 入札（Bidding）方式

複数の広告ネットワークが同時に入札し、最も高い入札額の広告が表示されます。リアルタイムで最適な広告が選択されるため、手動でのeCPM調整が不要です。

**推奨**: 対応しているネットワークでは入札方式を使用し、対応していないネットワークにはウォーターフォール方式を併用する **ハイブリッド方式** が最も効果的です。

## Step 5: テストと最適化

1. **Ad Inspector** を使用して、メディエーション設定が正しく動作しているか確認します。
2. AdMobコンソールの **メディエーションレポート** で各ネットワークのパフォーマンスを確認します。
3. eCPMフロア（最低入札額）を調整して収益を最適化します。
4. A/Bテストを実施して、最適なメディエーション構成を見つけます。

## GDPR対応

本アプリにはGoogle UMP SDK（User Messaging Platform）が統合されています。EU圏のユーザーに対して自動的に同意ダイアログが表示されます。

メディエーションネットワークのGDPR対応については、各ネットワークのドキュメントを参照してください。多くのネットワークはAdMobのUMP SDKと連携して同意状態を自動的に伝達します。

### AdMobコンソールでのGDPR設定

1. [AdMobコンソール](https://apps.admob.com/) にログインします。
2. **プライバシーとメッセージ** セクションに移動します。
3. **GDPR** メッセージを作成・設定します。
4. **IDFA** メッセージも設定します（iOS向け）。
5. メッセージを公開します。

## 参考リンク

- [AdMob メディエーション概要（Google公式）](https://developers.google.com/admob/android/mediate)
- [react-native-google-mobile-ads メディエーション](https://docs.page/invertase/react-native-google-mobile-ads/mediation)
- [AdMob UMP SDK（GDPR同意管理）](https://developers.google.com/admob/android/privacy)
- [AdMob ヘルプセンター](https://support.google.com/admob/)

import React, { useEffect } from 'react';
import { Alert, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { AdEventType, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';
import { useDiaryDraft } from '../../src/store/useDiaryDraft';

const PHOTO_FRAMES = [
  require('../../assets/diary/photo-frames/photo_slot_01.png'),
  require('../../assets/diary/photo-frames/photo_slot_02.png'),
  require('../../assets/diary/photo-frames/photo_slot_03.png'),
] as const;

const WEATHER_LABELS: Record<string, string> = {
  weather_sunny: '☀️ 晴れ',
  weather_cloudy: '☁️ くもり',
  weather_rainy: '🌧️ 雨',
  weather_snow: '❄️ 雪',
  weather_windy: '🍃 風',
  weather_night: '🌙 夜',
  weather_rainbow: '🌈 虹',
  weather_storm: '⛈️ 雷',
};

const MOOD_LABELS: Record<string, string> = {
  mood_happy: '😊 うれしい',
  mood_love: '🥰 だいすき',
  mood_calm: '😌 おだやか',
  mood_excited: '🤩 わくわく',
  mood_sleepy: '😴 ねむい',
  mood_sad: '😢 かなしい',
  mood_angry: '😠 いらいら',
  mood_shy: '🥺 しゅん',
};

let diaryOpenCount = 0;

function pickParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value ?? '';
}

export default function DiaryEditScreen() {
  const params = useLocalSearchParams<{ date?: string | string[] }>();
  const dateParam = pickParam(params.date) || new Date().toISOString().slice(0, 10);
  const { date, title, body, weatherId, moodId, photos, stampCount, setDate, setTitle, setBody, setPhoto, clearPhoto } = useDiaryDraft();

  useEffect(() => {
    setDate(dateParam);
  }, [dateParam, setDate]);

  useEffect(() => {
    diaryOpenCount += 1;
    if (diaryOpenCount % 3 !== 0) return;

    const unitId = __DEV__
      ? TestIds.INTERSTITIAL
      : ((Constants.expoConfig?.extra as any)?.ads?.interstitial || TestIds.INTERSTITIAL);
    const ad = InterstitialAd.createForAdRequest(unitId);
    const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => ad.show());
    const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, () => {});
    ad.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeError();
    };
  }, []);

  const onPickImage = async (index: number) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('権限が必要です', '写真を追加するには写真ライブラリへのアクセスを許可してください。');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhoto(index, result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()}><Text style={styles.nav}>← 戻る</Text></Pressable>
          <Pressable onPress={() => router.push({ pathname: '/diary/view', params: { date: date || dateParam } })}><Text style={styles.nav}>表示確認</Text></Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.date}>{date || dateParam}</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="タイトル" style={styles.titleInput} placeholderTextColor="#b4a6b4" />
          <TextInput value={body} onChangeText={setBody} placeholder="きょうのことを書いてね" multiline style={styles.bodyInput} placeholderTextColor="#b4a6b4" />

          <View style={styles.row}>
            <Pressable style={styles.chip} onPress={() => router.push('/modals/weather-picker')}>
              <Text style={styles.chipText}>{WEATHER_LABELS[weatherId] || '天気を選ぶ'}</Text>
            </Pressable>
            <Pressable style={styles.chip} onPress={() => router.push('/modals/mood-picker')}>
              <Text style={styles.chipText}>{MOOD_LABELS[moodId] || '気分を選ぶ'}</Text>
            </Pressable>
          </View>

          <View style={styles.photoRow}>
            {PHOTO_FRAMES.map((frame, index) => (
              <View key={index} style={styles.photoWrap}>
                <Pressable onPress={() => onPickImage(index)}>
                  <Image source={photos[index] ? { uri: photos[index] } : frame} style={styles.photo} />
                </Pressable>
                {photos[index] ? (
                  <Pressable style={styles.deleteButton} onPress={() => clearPhoto(index)}>
                    <Text style={styles.deleteText}>×</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>

          <Pressable style={styles.stampButton} onPress={() => router.push('/modals/stamp-picker')}>
            <Text style={styles.stampText}>スタンプを追加（{stampCount}）</Text>
          </Pressable>

          <Pressable style={styles.saveButton} onPress={() => Alert.alert('試作APK', '保存機能は次段階で追加します。')}>
            <Text style={styles.saveText}>保存（仮）</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff7fb' },
  content: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  nav: { color: '#7d6f7f', fontWeight: '700', fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 26, padding: 18, gap: 14 },
  date: { color: '#8b7a8c', fontSize: 14, fontWeight: '700' },
  titleInput: { fontSize: 22, fontWeight: '800', color: '#402432', borderBottomWidth: 1, borderBottomColor: '#f0d7e5', paddingBottom: 8 },
  bodyInput: { minHeight: 180, textAlignVertical: 'top', color: '#4b4250', fontSize: 16, lineHeight: 24, backgroundColor: '#fff8fc', borderRadius: 18, padding: 14 },
  row: { flexDirection: 'row', gap: 10 },
  chip: { flex: 1, backgroundColor: '#fff3f8', borderRadius: 18, padding: 14, alignItems: 'center' },
  chipText: { color: '#5a4e5e', fontWeight: '700' },
  photoRow: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  photoWrap: { width: '31%', alignItems: 'center' },
  photo: { width: 96, height: 132, borderRadius: 14, resizeMode: 'cover' },
  deleteButton: { marginTop: 6, backgroundColor: '#402432', width: 24, height: 24, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  deleteText: { color: '#fff', fontWeight: '800' },
  stampButton: { backgroundColor: '#fff3f8', borderRadius: 18, padding: 16, alignItems: 'center' },
  stampText: { color: '#5a4e5e', fontWeight: '700' },
  saveButton: { backgroundColor: '#ff9fc2', borderRadius: 18, padding: 16, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

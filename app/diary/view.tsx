import React from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useDiaryDraft } from '../../src/store/useDiaryDraft';

const PHOTO_FRAMES = [
  require('../../assets/diary/photo-frames/photo_slot_01.png'),
  require('../../assets/diary/photo-frames/photo_slot_02.png'),
  require('../../assets/diary/photo-frames/photo_slot_03.png'),
] as const;

function pickParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value ?? '';
}

export default function DiaryViewScreen() {
  const params = useLocalSearchParams<{ date?: string | string[] }>();
  const { date, title, body, weatherId, moodId, photos, stampCount } = useDiaryDraft();
  const displayDate = pickParam(params.date) || date || new Date().toISOString().slice(0, 10);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()}><Text style={styles.nav}>← 戻る</Text></Pressable>
          <Pressable onPress={() => router.replace({ pathname: '/diary/edit', params: { date: displayDate } })}><Text style={styles.nav}>編集</Text></Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.date}>{displayDate}</Text>
          <Text style={styles.title}>{title || 'タイトル未設定'}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{weatherId || '天気未設定'}</Text>
            <Text style={styles.meta}>{moodId || '気分未設定'}</Text>
            <Text style={styles.meta}>スタンプ {stampCount}</Text>
          </View>
          <View style={styles.photoRow}>
            {PHOTO_FRAMES.map((frame, index) => (
              <Image key={index} source={photos[index] ? { uri: photos[index] } : frame} style={styles.photo} />
            ))}
          </View>
          <Text style={styles.body}>{body || 'まだ本文は入力されていません。'}</Text>
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
  title: { color: '#402432', fontSize: 24, fontWeight: '800' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  meta: { backgroundColor: '#fff3f8', color: '#5a4e5e', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, overflow: 'hidden' },
  photoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  photo: { width: 96, height: 132, borderRadius: 14, resizeMode: 'cover' },
  body: { color: '#4b4250', fontSize: 16, lineHeight: 24 },
});

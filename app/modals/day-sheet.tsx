import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useDiaryDraft } from '../../src/store/useDiaryDraft';

function pickParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value ?? '';
}

export default function DaySheet() {
  const params = useLocalSearchParams<{ date?: string | string[] }>();
  const date = pickParam(params.date) || new Date().toISOString().slice(0, 10);
  const setDate = useDiaryDraft((state) => state.setDate);

  return (
    <SafeAreaView style={styles.safe}>
      <Pressable style={styles.backdrop} onPress={() => router.back()}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>この日のメニュー</Text>
          <Text style={styles.date}>{date}</Text>
          <Pressable style={styles.primary} onPress={() => { setDate(date); router.replace({ pathname: '/diary/edit', params: { date } }); }}>
            <Text style={styles.primaryText}>この日の日記を書く</Text>
          </Pressable>
          <Pressable style={styles.secondary} onPress={() => { setDate(date); router.replace({ pathname: '/diary/view', params: { date } }); }}>
            <Text style={styles.secondaryText}>表示確認を開く</Text>
          </Pressable>
          <Pressable style={styles.link} onPress={() => router.back()}>
            <Text style={styles.linkText}>閉じる</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#00000044' },
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff7fb', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#402432' },
  date: { fontSize: 16, color: '#7d6f7f' },
  primary: { backgroundColor: '#ff9fc2', borderRadius: 18, paddingVertical: 16, alignItems: 'center' },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  secondary: { backgroundColor: '#fff', borderRadius: 18, paddingVertical: 16, alignItems: 'center' },
  secondaryText: { color: '#6f6170', fontSize: 16, fontWeight: '700' },
  link: { paddingVertical: 12, alignItems: 'center' },
  linkText: { color: '#8b7a8c', fontWeight: '700' },
});

import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useDiaryDraft } from '../../src/store/useDiaryDraft';

const OPTIONS = [
  ['mood_happy', '😊', 'うれしい'],
  ['mood_love', '🥰', 'だいすき'],
  ['mood_calm', '😌', 'おだやか'],
  ['mood_excited', '🤩', 'わくわく'],
  ['mood_sleepy', '😴', 'ねむい'],
  ['mood_sad', '😢', 'かなしい'],
  ['mood_angry', '😠', 'いらいら'],
  ['mood_shy', '🥺', 'しゅん'],
] as const;

export default function MoodPicker() {
  const moodId = useDiaryDraft((state) => state.moodId);
  const setMoodId = useDiaryDraft((state) => state.setMoodId);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>きぶんをえらぶ</Text>
        <View style={styles.grid}>
          {OPTIONS.map(([id, emoji, label]) => {
            const selected = moodId === id;
            return (
              <Pressable
                key={id}
                style={[styles.item, selected && styles.itemSelected]}
                onPress={() => {
                  setMoodId(id);
                  router.back();
                }}>
                <Text style={styles.emoji}>{emoji}</Text>
                <Text style={styles.label}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable style={styles.secondary} onPress={() => { setMoodId(''); router.back(); }}>
          <Text style={styles.secondaryText}>未設定にする</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff7fb' },
  content: { padding: 20, gap: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#402432' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  item: { width: '47%', backgroundColor: '#fff', borderRadius: 20, padding: 16, alignItems: 'center', gap: 8 },
  itemSelected: { borderWidth: 2, borderColor: '#ff9fc2' },
  emoji: { fontSize: 34 },
  label: { fontSize: 16, color: '#4b4250', fontWeight: '600' },
  secondary: { backgroundColor: '#fff', borderRadius: 18, padding: 16, alignItems: 'center' },
  secondaryText: { color: '#7d6f7f', fontWeight: '700' },
});

import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useDiaryDraft } from '../../src/store/useDiaryDraft';

const GROUPS = {
  cat1: ['🐱', '😺', '😸', '😻'],
  cat2: ['🐈', '🫶', '🎀', '🧶'],
  item: ['🌸', '⭐', '🍓', '☕'],
} as const;

type Tab = keyof typeof GROUPS;

export default function StampPicker() {
  const addStamp = useDiaryDraft((state) => state.addStamp);
  const [tab, setTab] = React.useState<Tab>('cat1');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>スタンプをえらぶ</Text>
        <View style={styles.tabs}>
          {(['cat1', 'cat2', 'item'] as Tab[]).map((key) => (
            <Pressable key={key} style={[styles.tab, tab === key && styles.tabActive]} onPress={() => setTab(key)}>
              <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{key === 'cat1' ? 'ネコ1' : key === 'cat2' ? 'ネコ2' : 'アイテム'}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.grid}>
          {GROUPS[tab].map((emoji, index) => (
            <Pressable key={`${tab}-${index}`} style={styles.item} onPress={() => { addStamp(); router.back(); }}>
              <Text style={styles.emoji}>{emoji}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff7fb' },
  content: { padding: 20, gap: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#402432' },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: { flex: 1, backgroundColor: '#fff', borderRadius: 999, paddingVertical: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#ff9fc2' },
  tabText: { color: '#7d6f7f', fontWeight: '700' },
  tabTextActive: { color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  item: { width: '22%', aspectRatio: 1, backgroundColor: '#fff', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 34 },
});

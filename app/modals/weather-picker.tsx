import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useDiaryDraft } from '../../src/store/useDiaryDraft';

const OPTIONS = [
  ['weather_sunny', '☀️', '晴れ'],
  ['weather_cloudy', '☁️', 'くもり'],
  ['weather_rainy', '🌧️', '雨'],
  ['weather_snow', '❄️', '雪'],
  ['weather_windy', '🍃', '風'],
  ['weather_night', '🌙', '夜'],
  ['weather_rainbow', '🌈', '虹'],
  ['weather_storm', '⛈️', '雷'],
] as const;

export default function WeatherPicker() {
  const weatherId = useDiaryDraft((state) => state.weatherId);
  const setWeatherId = useDiaryDraft((state) => state.setWeatherId);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>天気をえらぶ</Text>
        <View style={styles.grid}>
          {OPTIONS.map(([id, emoji, label]) => {
            const selected = weatherId === id;
            return (
              <Pressable
                key={id}
                style={[styles.item, selected && styles.itemSelected]}
                onPress={() => {
                  setWeatherId(id);
                  router.back();
                }}>
                <Text style={styles.emoji}>{emoji}</Text>
                <Text style={styles.label}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable style={styles.secondary} onPress={() => { setWeatherId(''); router.back(); }}>
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

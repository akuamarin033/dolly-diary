import React, { useMemo, useState } from 'react';
import { ImageBackground, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { getMonthTheme } from '../../src/theme/monthThemes';
import { useDiaryDraft } from '../../src/store/useDiaryDraft';

const LIGHT_BACKGROUNDS = [
  require('../../assets/calendar/light/month_01.png'),
  require('../../assets/calendar/light/month_02.png'),
  require('../../assets/calendar/light/month_03.png'),
  require('../../assets/calendar/light/month_04.png'),
  require('../../assets/calendar/light/month_05.png'),
  require('../../assets/calendar/light/month_06.png'),
  require('../../assets/calendar/light/month_07.png'),
  require('../../assets/calendar/light/month_08.png'),
  require('../../assets/calendar/light/month_09.png'),
  require('../../assets/calendar/light/month_10.png'),
  require('../../assets/calendar/light/month_11.png'),
  require('../../assets/calendar/light/month_12.png'),
] as const;

const DARK_BACKGROUNDS = [
  require('../../assets/calendar/dark/month_01.png'),
  require('../../assets/calendar/dark/month_02.png'),
  require('../../assets/calendar/dark/month_03.png'),
  require('../../assets/calendar/dark/month_04.png'),
  require('../../assets/calendar/dark/month_05.png'),
  require('../../assets/calendar/dark/month_06.png'),
  require('../../assets/calendar/dark/month_07.png'),
  require('../../assets/calendar/dark/month_08.png'),
  require('../../assets/calendar/dark/month_09.png'),
  require('../../assets/calendar/dark/month_10.png'),
  require('../../assets/calendar/dark/month_11.png'),
  require('../../assets/calendar/dark/month_12.png'),
] as const;

const WEEK_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

function formatDate(date: Date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
}

function buildCalendar(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1);
  const start = first.getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ key: string; day?: number }> = [];

  for (let i = 0; i < start; i += 1) cells.push({ key: `empty-${i}` });
  for (let day = 1; day <= days; day += 1) cells.push({ key: `day-${day}`, day });
  while (cells.length % 7 !== 0) cells.push({ key: `tail-${cells.length}` });
  return cells;
}

export default function CalendarScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const resetDraft = useDiaryDraft((state) => state.reset);
  const month = currentMonth.getMonth() + 1;
  const theme = getMonthTheme(month);
  const bgSource = (isDark ? DARK_BACKGROUNDS : LIGHT_BACKGROUNDS)[month - 1];
  const calendarCells = useMemo(() => buildCalendar(currentMonth), [currentMonth]);
  const bannerId = (Constants.expoConfig?.extra as any)?.ads?.banner || TestIds.BANNER;

  return (
    <ImageBackground source={bgSource} resizeMode="cover" style={{ flex: 1 }}>
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? `${theme.dark}CC` : `${theme.light}EE` }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.bannerWrap}>
            <BannerAd unitId={bannerId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
          </View>

          <View style={[styles.headerCard, { backgroundColor: isDark ? '#1f2630ee' : '#fffffff0' }]}>
            <View>
              <Text style={[styles.monthLabel, { color: isDark ? '#fff' : theme.textDark }]}>{currentMonth.getFullYear()}年 {month}月</Text>
              <Text style={[styles.sub, { color: isDark ? '#d5dbe4' : '#7b6e7e' }]}>月ごとに背景が変わる かわいい日記カレンダー</Text>
            </View>
            <View style={styles.headerButtons}>
              <Pressable style={[styles.smallButton, { backgroundColor: theme.accent }]} onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
                <Text style={styles.smallButtonText}>←</Text>
              </Pressable>
              <Pressable style={[styles.smallButton, { backgroundColor: theme.accent }]} onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
                <Text style={styles.smallButtonText}>→</Text>
              </Pressable>
            </View>
          </View>

          <View style={[styles.calendarCard, { backgroundColor: isDark ? '#202833ee' : '#fffffff0' }]}>
            <View style={styles.weekRow}>
              {WEEK_LABELS.map((label) => (
                <Text key={label} style={[styles.weekLabel, { color: isDark ? '#dbe2ea' : '#6f6170' }]}>{label}</Text>
              ))}
            </View>
            <View style={styles.grid}>
              {calendarCells.map((cell) => (
                <Pressable
                  key={cell.key}
                  disabled={!cell.day}
                  style={[styles.dayCell, cell.day ? { backgroundColor: isDark ? '#2b3643' : '#fff7fb' } : styles.dayEmpty]}
                  onPress={() => {
                    if (!cell.day) return;
                    const selectedDate = formatDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), cell.day));
                    resetDraft(selectedDate);
                    router.push({ pathname: '/modals/day-sheet', params: { date: selectedDate } });
                  }}>
                  <Text style={[styles.dayText, { color: isDark ? '#fff' : theme.textDark }]}>{cell.day ?? ''}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.bottomRow}>
            <Pressable style={[styles.actionButton, { backgroundColor: theme.accent }]} onPress={() => {
              const today = formatDate(new Date());
              resetDraft(today);
              router.push({ pathname: '/diary/edit', params: { date: today } });
            }}>
              <Text style={styles.actionText}>今日の日記を書く</Text>
            </Pressable>
            <Pressable style={styles.ghostButton} onPress={() => router.push('/list')}>
              <Text style={styles.ghostText}>一覧</Text>
            </Pressable>
            <Pressable style={styles.ghostButton} onPress={() => router.push('/settings')}>
              <Text style={styles.ghostText}>設定</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 16 },
  bannerWrap: { overflow: 'hidden', borderRadius: 16, alignItems: 'center', backgroundColor: '#ffffffdd', paddingVertical: 8 },
  headerCard: { borderRadius: 24, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  monthLabel: { fontSize: 28, fontWeight: '800' },
  sub: { marginTop: 6, fontSize: 14 },
  headerButtons: { flexDirection: 'row', gap: 8 },
  smallButton: { width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  smallButtonText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  calendarCard: { borderRadius: 28, padding: 16, gap: 12 },
  weekRow: { flexDirection: 'row' },
  weekLabel: { flex: 1, textAlign: 'center', fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayCell: { width: '13.4%', aspectRatio: 0.9, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dayEmpty: { backgroundColor: 'transparent' },
  dayText: { fontSize: 16, fontWeight: '700' },
  bottomRow: { gap: 10, marginBottom: 24 },
  actionButton: { borderRadius: 18, paddingVertical: 16, alignItems: 'center' },
  actionText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  ghostButton: { borderRadius: 18, paddingVertical: 14, alignItems: 'center', backgroundColor: '#ffffffdd' },
  ghostText: { color: '#6f6170', fontWeight: '700' },
});

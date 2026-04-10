import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import mobileAds from 'react-native-google-mobile-ads';

export default function RootLayout() {
  useEffect(() => {
    mobileAds()
      .initialize()
      .catch(() => {
        console.warn('AdMob initialization skipped.');
      });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="calendar/index" />
        <Stack.Screen name="diary/edit" />
        <Stack.Screen name="diary/view" />
        <Stack.Screen name="list/index" />
        <Stack.Screen name="settings/index" />
        <Stack.Screen name="modals/day-sheet" options={{ presentation: 'transparentModal', animation: 'fade' }} />
        <Stack.Screen name="modals/weather-picker" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modals/mood-picker" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modals/stamp-picker" options={{ presentation: 'modal' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

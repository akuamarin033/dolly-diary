import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.title}>設定</Text>
        <Text style={styles.body}>試作APKでは、テーマと広告位置の確認を優先しています。</Text>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>戻る</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff7fb', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, gap: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#402432' },
  body: { fontSize: 16, color: '#6f6170' },
  button: { marginTop: 8, backgroundColor: '#ff9fc2', padding: 14, borderRadius: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
});

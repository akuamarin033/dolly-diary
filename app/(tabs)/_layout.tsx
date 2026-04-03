import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "カレンダー",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="write-diary"
        options={{
          title: "日記",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="book.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="diary-list"
        options={{
          title: "一覧",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stickers"
        options={{
          title: "スタンプ",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="face.smiling" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "プロフィール",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

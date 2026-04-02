// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "calendar": "calendar-today",
  "book.fill": "menu-book",
  "face.smiling": "emoji-emotions",
  "person.fill": "person",
  "gearshape.fill": "settings",
  "star.fill": "star",
  "trash.fill": "delete",
  "pencil": "edit",
  "plus": "add",
  "xmark": "close",
  "photo": "photo",
  "camera.fill": "camera-alt",
  "lock.fill": "lock",
  "arrow.down.doc.fill": "file-download",
  "arrow.up.doc.fill": "file-upload",
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}

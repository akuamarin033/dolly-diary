import { useRef } from "react";
import { Image, Text, StyleSheet, PanResponder, Animated } from "react-native";
import { type CalendarDeco } from "@/lib/diary-storage";
import { CAT_STICKERS } from "@/lib/cat-stickers";

interface DraggableDecoProps {
  deco: CalendarDeco;
  containerWidth: number;
  containerHeight: number;
  onTap: (id: string) => void;
  onDoubleTap: (id: string) => void;
  onLongPress: (id: string) => void;
  onDragEnd: (id: string, newX: number, newY: number) => void;
}

export function DraggableDeco({
  deco,
  containerWidth,
  containerHeight,
  onTap,
  onDoubleTap,
  onLongPress,
  onDragEnd,
}: DraggableDecoProps) {
  const startX = (deco.x / 100) * containerWidth;
  const startY = (deco.y / 100) * containerHeight;

  const pan = useRef(new Animated.ValueXY({ x: startX, y: startY })).current;
  const isDragging = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapTime = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
      },
      onPanResponderGrant: () => {
        isDragging.current = false;
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });

        longPressTimer.current = setTimeout(() => {
          if (!isDragging.current) {
            onLongPress(deco.id);
          }
        }, 600);
      },
      onPanResponderMove: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3) {
          isDragging.current = true;
          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
          }
        }
        Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        })(_, gestureState);
      },
      onPanResponderRelease: () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }

        pan.flattenOffset();

        if (!isDragging.current) {
          const now = Date.now();
          const DOUBLE_TAP_DELAY = 300;
          if (now - lastTapTime.current < DOUBLE_TAP_DELAY) {
            // Double tap -> rotate
            onDoubleTap(deco.id);
            lastTapTime.current = 0;
          } else {
            // Single tap -> scale
            lastTapTime.current = now;
            setTimeout(() => {
              if (lastTapTime.current !== 0 && Date.now() - lastTapTime.current >= DOUBLE_TAP_DELAY) {
                onTap(deco.id);
                lastTapTime.current = 0;
              }
            }, DOUBLE_TAP_DELAY + 10);
          }
          return;
        }

        const newPxX = (pan.x as any)._value;
        const newPxY = (pan.y as any)._value;

        const newPercentX = containerWidth > 0
          ? Math.max(0, Math.min(95, (newPxX / containerWidth) * 100))
          : deco.x;
        const newPercentY = containerHeight > 0
          ? Math.max(0, Math.min(95, (newPxY / containerHeight) * 100))
          : deco.y;

        onDragEnd(deco.id, newPercentX, newPercentY);
      },
    })
  ).current;

  const catSource = deco.catStickerId
    ? CAT_STICKERS.find((c) => c.id === deco.catStickerId)?.source
    : undefined;

  const rotation = deco.rotation ?? 0;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.decoSticker,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: deco.scale },
            { rotate: `${rotation}deg` },
          ],
        },
      ]}
    >
      {catSource ? (
        <Image source={catSource} style={styles.decoCatImage} resizeMode="contain" />
      ) : (
        <Text style={styles.decoEmoji}>{deco.emoji}</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  decoSticker: {
    position: "absolute",
    zIndex: 10,
    left: 0,
    top: 0,
  },
  decoEmoji: {
    fontSize: 28,
  },
  decoCatImage: {
    width: 40,
    height: 40,
  },
});

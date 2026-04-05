import { useRef, useEffect } from "react";
import { Image, Text, StyleSheet, PanResponder, Animated } from "react-native";
import { type CalendarDeco } from "@/lib/diary-storage";
import { ALL_CAT_STICKERS } from "@/lib/cat-stickers";
import { CAT2_STICKERS } from "@/lib/cat2-stickers";
import { ITEM_STICKERS } from "@/lib/item-stickers";

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

  // Keep latest callback refs to avoid stale closures in PanResponder
  const onTapRef = useRef(onTap);
  const onDoubleTapRef = useRef(onDoubleTap);
  const onLongPressRef = useRef(onLongPress);
  const onDragEndRef = useRef(onDragEnd);
  const decoIdRef = useRef(deco.id);
  const containerWidthRef = useRef(containerWidth);
  const containerHeightRef = useRef(containerHeight);
  const decoXRef = useRef(deco.x);
  const decoYRef = useRef(deco.y);

  useEffect(() => {
    onTapRef.current = onTap;
    onDoubleTapRef.current = onDoubleTap;
    onLongPressRef.current = onLongPress;
    onDragEndRef.current = onDragEnd;
    decoIdRef.current = deco.id;
    containerWidthRef.current = containerWidth;
    containerHeightRef.current = containerHeight;
    decoXRef.current = deco.x;
    decoYRef.current = deco.y;
  });

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
            onLongPressRef.current(decoIdRef.current);
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
            onDoubleTapRef.current(decoIdRef.current);
            lastTapTime.current = 0;
          } else {
            lastTapTime.current = now;
            setTimeout(() => {
              if (lastTapTime.current !== 0 && Date.now() - lastTapTime.current >= DOUBLE_TAP_DELAY) {
                onTapRef.current(decoIdRef.current);
                lastTapTime.current = 0;
              }
            }, DOUBLE_TAP_DELAY + 10);
          }
          return;
        }

        const newPxX = (pan.x as any)._value;
        const newPxY = (pan.y as any)._value;
        const cw = containerWidthRef.current;
        const ch = containerHeightRef.current;

        const newPercentX = cw > 0
          ? Math.max(0, Math.min(95, (newPxX / cw) * 100))
          : decoXRef.current;
        const newPercentY = ch > 0
          ? Math.max(0, Math.min(95, (newPxY / ch) * 100))
          : decoYRef.current;

        onDragEndRef.current(decoIdRef.current, newPercentX, newPercentY);
      },
    })
  ).current;

  // Determine image source
  const catSource = deco.catStickerId
    ? ALL_CAT_STICKERS.find((c) => c.id === deco.catStickerId)?.source
    : undefined;

  const cat2Source = deco.cat2StickerId
    ? CAT2_STICKERS.find((c) => c.id === deco.cat2StickerId)?.source
    : undefined;

  const itemSource = deco.itemStickerId
    ? ITEM_STICKERS.find((s) => s.id === deco.itemStickerId)?.source
    : undefined;

  const imageSource = catSource ?? cat2Source ?? itemSource;
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
      {imageSource ? (
        <Image source={imageSource} style={styles.decoImage} resizeMode="contain" />
      ) : deco.emoji ? (
        <Text style={styles.decoEmoji}>{deco.emoji}</Text>
      ) : null}
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
  decoImage: {
    width: 40,
    height: 40,
  },
});

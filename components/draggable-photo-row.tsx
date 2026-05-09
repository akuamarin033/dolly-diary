import React, { useCallback, useState } from "react";
import { View, Image, Pressable, StyleSheet, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

const POLAROID_FRAMES = [
  require("@/assets/images/polaroid/polaroid1.png"),
  require("@/assets/images/polaroid/polaroid2.png"),
  require("@/assets/images/polaroid/polaroid3.png"),
];

interface DraggablePhotoRowProps {
  photos: string[];
  onReorder: (photos: string[]) => void;
  onPickPhoto: (index: number) => void;
  onRemovePhoto: (index: number) => void;
  size?: number;
}

interface DraggablePhotoItemProps {
  index: number;
  photoUri?: string;
  size: number;
  onPickPhoto: (index: number) => void;
  onRemovePhoto: (index: number) => void;
  onDragStart: (index: number) => void;
  onDragEnd: (fromIndex: number, toIndex: number) => void;
  itemWidth: number;
  isDragging: boolean;
}

function DraggablePhotoItem({
  index,
  photoUri,
  size,
  onPickPhoto,
  onRemovePhoto,
  onDragStart,
  onDragEnd,
  itemWidth,
  isDragging,
}: DraggablePhotoItemProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(0);
  const frameIdx = index % 3;
  const frameSource = POLAROID_FRAMES[frameIdx];
  // Frame-specific photo area percentages based on pixel analysis
  const FRAME_CONFIGS = [
    { aspectRatio: 311/271, topPct: 0.075, leftPct: 0.075, widthPct: 0.85, heightPct: 0.73 },
    { aspectRatio: 324/270, topPct: 0.13, leftPct: 0.075, widthPct: 0.85, heightPct: 0.68 },
    { aspectRatio: 311/271, topPct: 0.075, leftPct: 0.075, widthPct: 0.85, heightPct: 0.73 },
  ];
  const config = FRAME_CONFIGS[frameIdx];
  const frameHeight = size * config.aspectRatio;
  const photoWidth = size * config.widthPct;
  const photoHeight = frameHeight * config.heightPct;
  const photoLeft = size * config.leftPct;
  const photoTop = frameHeight * config.topPct;

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(300)
    .onStart(() => {
      scale.value = withTiming(1.1, { duration: 150 });
      zIndex.value = 100;
      runOnJS(onDragStart)(index);
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      // Calculate which slot the photo was dropped on
      const displacement = e.translationX;
      let targetIndex = index;
      if (displacement > itemWidth * 0.4) {
        targetIndex = Math.min(index + 1, 2);
      } else if (displacement < -itemWidth * 0.4) {
        targetIndex = Math.max(index - 1, 0);
      }

      translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      scale.value = withTiming(1, { duration: 150 });
      zIndex.value = 0;
      runOnJS(onDragEnd)(index, targetIndex);
    })
    .onFinalize(() => {
      translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      scale.value = withTiming(1, { duration: 150 });
      zIndex.value = 0;
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    if (photoUri) {
      runOnJS(onRemovePhoto)(index);
    } else {
      runOnJS(onPickPhoto)(index);
    }
  });

  const composedGesture = photoUri
    ? Gesture.Race(panGesture, tapGesture)
    : tapGesture;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: zIndex.value,
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        style={[
          { width: size, height: frameHeight },
          animatedStyle,
        ]}
      >
        {/* Frame image as background */}
        <Image
          source={frameSource}
          style={[styles.frameImage, { width: size, height: frameHeight }]}
          resizeMode="contain"
        />
        {/* Photo overlay inside the frame */}
        {photoUri && (
          <Image
            source={{ uri: photoUri }}
            style={[
              styles.photoOverlay,
              {
                width: photoWidth,
                height: photoHeight,
                left: photoLeft,
                top: photoTop,
                borderRadius: 2,
              },
            ]}
            resizeMode="cover"
          />
        )}
        {/* Drag hint indicator for photos */}
        {photoUri && (
          <View style={styles.dragHint}>
            <Text style={styles.dragHintText}>⋮⋮</Text>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

export function DraggablePhotoRow({
  photos,
  onReorder,
  onPickPhoto,
  onRemovePhoto,
  size = 100,
}: DraggablePhotoRowProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const itemWidth = size + 4; // size + gap

  const handleDragStart = useCallback((index: number) => {
    setDraggingIndex(index);
  }, []);

  const handleDragEnd = useCallback(
    (fromIndex: number, toIndex: number) => {
      setDraggingIndex(null);
      if (fromIndex === toIndex) return;
      if (!photos[fromIndex]) return;

      const newPhotos = [...photos];
      // Swap the two photos
      const temp = newPhotos[fromIndex];
      newPhotos[fromIndex] = newPhotos[toIndex] || "";
      newPhotos[toIndex] = temp;
      // Remove empty strings from the end
      while (newPhotos.length > 0 && !newPhotos[newPhotos.length - 1]) {
        newPhotos.pop();
      }
      onReorder(newPhotos);
    },
    [photos, onReorder]
  );

  return (
    <View style={styles.photoRow}>
      {[0, 1, 2].map((i) => (
        <DraggablePhotoItem
          key={i}
          index={i}
          photoUri={photos[i]}
          size={size}
          onPickPhoto={onPickPhoto}
          onRemovePhoto={onRemovePhoto}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          itemWidth={itemWidth}
          isDragging={draggingIndex === i}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  photoRow: {
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  frameImage: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  photoOverlay: {
    position: "absolute",
  },
  dragHint: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(160, 118, 74, 0.6)",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  dragHintText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "700",
    lineHeight: 12,
  },
});

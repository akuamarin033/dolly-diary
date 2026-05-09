import React from "react";
import { View, Image, Pressable, StyleSheet } from "react-native";

const POLAROID_FRAMES = [
  require("@/assets/images/polaroid/polaroid1.png"),
  require("@/assets/images/polaroid/polaroid2.png"),
  require("@/assets/images/polaroid/polaroid3.png"),
];

interface PolaroidPhotoProps {
  index: number; // 0, 1, or 2 - determines which frame to use
  photoUri?: string;
  onPress?: () => void;
  size?: number; // overall size of the polaroid frame
}

// Frame-specific photo area percentages based on pixel analysis
// polaroid1 (271x311): border at top=20, bottom=250, left=17, right=249
// polaroid2 (270x324): border at top=38, bottom=263, left=18, right=249
// polaroid3 same as polaroid1
const FRAME_CONFIGS = [
  { aspectRatio: 311/271, topPct: 0.075, leftPct: 0.075, widthPct: 0.85, heightPct: 0.73 },  // polaroid1
  { aspectRatio: 324/270, topPct: 0.13, leftPct: 0.075, widthPct: 0.85, heightPct: 0.68 },   // polaroid2
  { aspectRatio: 311/271, topPct: 0.075, leftPct: 0.075, widthPct: 0.85, heightPct: 0.73 },  // polaroid3
];

export function PolaroidPhoto({ index, photoUri, onPress, size = 105 }: PolaroidPhotoProps) {
  const frameIdx = index % 3;
  const frameSource = POLAROID_FRAMES[frameIdx];
  const config = FRAME_CONFIGS[frameIdx];
  const frameHeight = size * config.aspectRatio;
  const photoWidth = size * config.widthPct;
  const photoHeight = frameHeight * config.heightPct;
  const photoLeft = size * config.leftPct;
  const photoTop = frameHeight * config.topPct;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        { width: size, height: frameHeight },
        pressed && { opacity: 0.7 },
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  frameImage: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  photoOverlay: {
    position: "absolute",
  },
});

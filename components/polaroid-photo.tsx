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

export function PolaroidPhoto({ index, photoUri, onPress, size = 105 }: PolaroidPhotoProps) {
  const frameSource = POLAROID_FRAMES[index % 3];
  // Photo area within polaroid frame (256x300 frame)
  // Photo area: left=8%, top=10%, width=84%, height=72% of frame height
  const frameHeight = size * 1.15;
  const photoWidth = size * 0.84;
  const photoHeight = frameHeight * 0.72;
  const photoLeft = size * 0.08;
  const photoTop = frameHeight * 0.10;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        { width: size, height: size * 1.15 },
        pressed && { opacity: 0.7 },
      ]}
    >
      {/* Frame image as background */}
      <Image
        source={frameSource}
        style={[styles.frameImage, { width: size, height: size * 1.15 }]}
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

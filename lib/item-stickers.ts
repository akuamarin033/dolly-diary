import { ImageSourcePropType } from "react-native";

export interface ItemSticker {
  id: string;
  source: ImageSourcePropType;
}

export const ITEM_STICKERS: ItemSticker[] = [
  { id: "cupcake", source: require("@/assets/images/stickers/sticker-cupcake.png") },
  { id: "bunny", source: require("@/assets/images/stickers/sticker-bunny.png") },
  { id: "wallet", source: require("@/assets/images/stickers/sticker-wallet.png") },
  { id: "camera", source: require("@/assets/images/stickers/sticker-camera.png") },
  { id: "smartphone", source: require("@/assets/images/stickers/sticker-smartphone.png") },
  { id: "calendar", source: require("@/assets/images/stickers/sticker-calendar.png") },
  { id: "washer", source: require("@/assets/images/stickers/sticker-washer.png") },
  { id: "umbrella", source: require("@/assets/images/stickers/sticker-umbrella.png") },
  { id: "cart", source: require("@/assets/images/stickers/sticker-cart.png") },
  { id: "tapioca", source: require("@/assets/images/stickers/sticker-tapioca.png") },
  { id: "beer", source: require("@/assets/images/stickers/sticker-beer.png") },
  { id: "car", source: require("@/assets/images/stickers/sticker-car.png") },
  { id: "checklist", source: require("@/assets/images/stickers/sticker-checklist.png") },
  { id: "heartkey", source: require("@/assets/images/stickers/sticker-heartkey.png") },
  { id: "cooking", source: require("@/assets/images/stickers/sticker-cooking.png") },
  { id: "laundry", source: require("@/assets/images/stickers/sticker-laundry.png") },
  { id: "coffee", source: require("@/assets/images/stickers/sticker-coffee.png") },
  { id: "meal", source: require("@/assets/images/stickers/sticker-meal.png") },
  { id: "notebook", source: require("@/assets/images/stickers/sticker-notebook.png") },
  { id: "clock", source: require("@/assets/images/stickers/sticker-clock.png") },
  { id: "shopping", source: require("@/assets/images/stickers/sticker-shopping.png") },
  { id: "nail", source: require("@/assets/images/stickers/sticker-nail.png") },
  { id: "music", source: require("@/assets/images/stickers/sticker-music.png") },
  { id: "cosmetics", source: require("@/assets/images/stickers/sticker-cosmetics.png") },
  { id: "moon", source: require("@/assets/images/stickers/sticker-moon.png") },
  { id: "heart", source: require("@/assets/images/stickers/sticker-heart.png") },
  { id: "cake", source: require("@/assets/images/stickers/sticker-cake.png") },
  { id: "present", source: require("@/assets/images/stickers/sticker-present.png") },
  { id: "sleepy", source: require("@/assets/images/stickers/sticker-sleepy.png") },
  { id: "bath", source: require("@/assets/images/stickers/sticker-bath.png") },
  { id: "bouquet", source: require("@/assets/images/stickers/sticker-bouquet.png") },
  { id: "rainbow", source: require("@/assets/images/stickers/sticker-rainbow.png") },
];

export function getItemStickerById(id: string): ItemSticker | undefined {
  return ITEM_STICKERS.find((s) => s.id === id);
}

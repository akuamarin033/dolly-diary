import { ImageSourcePropType } from "react-native";

export interface ItemSticker {
  id: string;
  source: ImageSourcePropType;
}

export const ITEM_STICKERS: ItemSticker[] = [
  { id: "checklist", source: require("@/assets/images/stickers/sticker-checklist.png") },
  { id: "heartkey", source: require("@/assets/images/stickers/sticker-heartkey.png") },
  { id: "cooking", source: require("@/assets/images/stickers/sticker-cooking.png") },
  { id: "washer", source: require("@/assets/images/stickers/sticker-washer.png") },
  { id: "coffee", source: require("@/assets/images/stickers/sticker-coffee.png") },
  { id: "meal", source: require("@/assets/images/stickers/sticker-meal.png") },
  { id: "notebook", source: require("@/assets/images/stickers/sticker-notebook.png") },
  { id: "clock", source: require("@/assets/images/stickers/sticker-clock.png") },
  { id: "cart", source: require("@/assets/images/stickers/sticker-cart.png") },
  { id: "nailpolish", source: require("@/assets/images/stickers/sticker-nailpolish.png") },
  { id: "music", source: require("@/assets/images/stickers/sticker-music.png") },
  { id: "lipstick", source: require("@/assets/images/stickers/sticker-lipstick.png") },
  { id: "moon", source: require("@/assets/images/stickers/sticker-moon.png") },
  { id: "heart", source: require("@/assets/images/stickers/sticker-heart.png") },
  { id: "cake", source: require("@/assets/images/stickers/sticker-cake.png") },
  { id: "gift", source: require("@/assets/images/stickers/sticker-gift.png") },
  { id: "sleep", source: require("@/assets/images/stickers/sticker-sleep.png") },
  { id: "bath", source: require("@/assets/images/stickers/sticker-bath.png") },
  { id: "bouquet", source: require("@/assets/images/stickers/sticker-bouquet.png") },
  { id: "rainbow", source: require("@/assets/images/stickers/sticker-rainbow.png") },
  { id: "cupcake", source: require("@/assets/images/stickers/sticker-cupcake.png") },
  { id: "bunny", source: require("@/assets/images/stickers/sticker-bunny.png") },
  { id: "wallet", source: require("@/assets/images/stickers/sticker-wallet.png") },
  { id: "camera", source: require("@/assets/images/stickers/sticker-camera.png") },
  { id: "smartphone", source: require("@/assets/images/stickers/sticker-smartphone.png") },
  { id: "calendar", source: require("@/assets/images/stickers/sticker-calendar.png") },
  { id: "umbrella", source: require("@/assets/images/stickers/sticker-umbrella.png") },
  { id: "tapioca", source: require("@/assets/images/stickers/sticker-tapioca.png") },
  { id: "beer", source: require("@/assets/images/stickers/sticker-beer.png") },
  { id: "car", source: require("@/assets/images/stickers/sticker-car.png") },
  { id: "dumbbell", source: require("@/assets/images/stickers/sticker-dumbbell.png") },
  { id: "game", source: require("@/assets/images/stickers/sticker-game.png") },
  { id: "guitar", source: require("@/assets/images/stickers/sticker-guitar.png") },
  { id: "headphones", source: require("@/assets/images/stickers/sticker-headphones.png") },
  { id: "icecream", source: require("@/assets/images/stickers/sticker-icecream.png") },
  { id: "medicine", source: require("@/assets/images/stickers/sticker-medicine.png") },
  { id: "movie", source: require("@/assets/images/stickers/sticker-movie.png") },
];

export function getItemStickerById(id: string): ItemSticker | undefined {
  return ITEM_STICKERS.find((s) => s.id === id);
}

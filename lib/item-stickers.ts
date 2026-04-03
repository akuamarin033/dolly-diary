import { ImageSourcePropType } from "react-native";

export interface ItemSticker {
  id: string;
  source: ImageSourcePropType;
}

export const ITEM_STICKERS: ItemSticker[] = [
  // A series - decorative items
  { id: "nailpolish", source: require("@/assets/images/stickers/sticker-nailpolish.png") },
  { id: "music", source: require("@/assets/images/stickers/sticker-music.png") },
  { id: "cosmetics", source: require("@/assets/images/stickers/sticker-cosmetics.png") },
  { id: "lipstick", source: require("@/assets/images/stickers/sticker-lipstick.png") },
  { id: "heart", source: require("@/assets/images/stickers/sticker-heart.png") },
  { id: "cake", source: require("@/assets/images/stickers/sticker-cake.png") },
  { id: "gift", source: require("@/assets/images/stickers/sticker-gift.png") },
  { id: "goodnight", source: require("@/assets/images/stickers/sticker-goodnight.png") },
  { id: "bath", source: require("@/assets/images/stickers/sticker-bath.png") },
  { id: "bouquet", source: require("@/assets/images/stickers/sticker-bouquet.png") },
  { id: "rainbow", source: require("@/assets/images/stickers/sticker-rainbow.png") },
  { id: "sleepcloud", source: require("@/assets/images/stickers/sticker-sleepcloud.png") },
  // BB series - cute items
  { id: "bathduck", source: require("@/assets/images/stickers/sticker-bathduck.png") },
  { id: "flowers", source: require("@/assets/images/stickers/sticker-flowers.png") },
  { id: "giftbox", source: require("@/assets/images/stickers/sticker-giftbox.png") },
  // M series - daily life items
  { id: "sleepycloud", source: require("@/assets/images/stickers/sticker-sleepycloud.png") },
  { id: "bathtub", source: require("@/assets/images/stickers/sticker-bathtub.png") },
  { id: "car", source: require("@/assets/images/stickers/sticker-car.png") },
  { id: "rainbow2", source: require("@/assets/images/stickers/sticker-rainbow2.png") },
  { id: "heartkey", source: require("@/assets/images/stickers/sticker-heartkey.png") },
  { id: "beer", source: require("@/assets/images/stickers/sticker-beer.png") },
  { id: "clock", source: require("@/assets/images/stickers/sticker-clock.png") },
  { id: "coffee", source: require("@/assets/images/stickers/sticker-coffee.png") },
  { id: "cutlery", source: require("@/assets/images/stickers/sticker-cutlery.png") },
  { id: "notebook", source: require("@/assets/images/stickers/sticker-notebook.png") },
  { id: "cooking", source: require("@/assets/images/stickers/sticker-cooking.png") },
  { id: "shopping", source: require("@/assets/images/stickers/sticker-shopping.png") },
  // X series - more items
  { id: "cupcake", source: require("@/assets/images/stickers/sticker-cupcake.png") },
  { id: "bunny", source: require("@/assets/images/stickers/sticker-bunny.png") },
  { id: "wallet", source: require("@/assets/images/stickers/sticker-wallet.png") },
  { id: "camera", source: require("@/assets/images/stickers/sticker-camera.png") },
  { id: "phone", source: require("@/assets/images/stickers/sticker-phone.png") },
  { id: "calendar", source: require("@/assets/images/stickers/sticker-calendar.png") },
  { id: "washer", source: require("@/assets/images/stickers/sticker-washer.png") },
  { id: "umbrella", source: require("@/assets/images/stickers/sticker-umbrella.png") },
  { id: "cart", source: require("@/assets/images/stickers/sticker-cart.png") },
];

export function getItemStickerById(id: string): ItemSticker | undefined {
  return ITEM_STICKERS.find((s) => s.id === id);
}

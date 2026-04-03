import { ImageSourcePropType } from "react-native";

export interface CatSticker {
  id: string;
  source: ImageSourcePropType;
}

export const CAT_STICKERS: CatSticker[] = [
  { id: "cat01", source: require("@/assets/images/cat-stickers/cat01.png") },
  { id: "cat02", source: require("@/assets/images/cat-stickers/cat02.png") },
  { id: "cat03", source: require("@/assets/images/cat-stickers/cat03.png") },
  { id: "cat04", source: require("@/assets/images/cat-stickers/cat04.png") },
  { id: "cat05", source: require("@/assets/images/cat-stickers/cat05.png") },
  { id: "cat06", source: require("@/assets/images/cat-stickers/cat06.png") },
  { id: "cat07", source: require("@/assets/images/cat-stickers/cat07.png") },
  { id: "cat08", source: require("@/assets/images/cat-stickers/cat08.png") },
  { id: "cat09", source: require("@/assets/images/cat-stickers/cat09.png") },
  { id: "cat10", source: require("@/assets/images/cat-stickers/cat10.png") },
  { id: "cat11", source: require("@/assets/images/cat-stickers/cat11.png") },
  { id: "cat12", source: require("@/assets/images/cat-stickers/cat12.png") },
  { id: "cat13", source: require("@/assets/images/cat-stickers/cat13.png") },
  { id: "cat14", source: require("@/assets/images/cat-stickers/cat14.png") },
  { id: "cat15", source: require("@/assets/images/cat-stickers/cat15.png") },
  { id: "cat16", source: require("@/assets/images/cat-stickers/cat16.png") },
  { id: "cat17", source: require("@/assets/images/cat-stickers/cat17.png") },
  { id: "cat18", source: require("@/assets/images/cat-stickers/cat18.png") },
  { id: "cat19", source: require("@/assets/images/cat-stickers/cat19.png") },
  { id: "cat20", source: require("@/assets/images/cat-stickers/cat20.png") },
  { id: "cat21", source: require("@/assets/images/cat-stickers/cat21.png") },
  { id: "cat22", source: require("@/assets/images/cat-stickers/cat22.png") },
  { id: "cat23", source: require("@/assets/images/cat-stickers/cat23.png") },
  { id: "cat24", source: require("@/assets/images/cat-stickers/cat24.png") },
  { id: "cat25", source: require("@/assets/images/cat-stickers/cat25.png") },
  { id: "cat26", source: require("@/assets/images/cat-stickers/cat26.png") },
  { id: "cat27", source: require("@/assets/images/cat-stickers/cat27.png") },
  { id: "cat28", source: require("@/assets/images/cat-stickers/cat28.png") },
  { id: "cat29", source: require("@/assets/images/cat-stickers/cat29.png") },
  { id: "cat30", source: require("@/assets/images/cat-stickers/cat30.png") },
  { id: "cat31", source: require("@/assets/images/cat-stickers/cat31.png") },
  { id: "cat32", source: require("@/assets/images/cat-stickers/cat32.png") },
];

export function getCatStickerById(id: string): CatSticker | undefined {
  return CAT_STICKERS.find((s) => s.id === id);
}

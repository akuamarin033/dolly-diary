import { ImageSourcePropType } from "react-native";

export interface Cat2Sticker {
  id: string;
  source: ImageSourcePropType;
}

// Cat2 sticker images for the "ネコ2" deco tab
export const CAT2_STICKERS: Cat2Sticker[] = [
  { id: "cat2_01", source: require("@/assets/images/cat2-stickers/cat2_01.png") },
  { id: "cat2_02", source: require("@/assets/images/cat2-stickers/cat2_02.png") },
  { id: "cat2_03", source: require("@/assets/images/cat2-stickers/cat2_03.png") },
  { id: "cat2_04", source: require("@/assets/images/cat2-stickers/cat2_04.png") },
  { id: "cat2_05", source: require("@/assets/images/cat2-stickers/cat2_05.png") },
  { id: "cat2_06", source: require("@/assets/images/cat2-stickers/cat2_06.png") },
  { id: "cat2_07", source: require("@/assets/images/cat2-stickers/cat2_07.png") },
  { id: "cat2_08", source: require("@/assets/images/cat2-stickers/cat2_08.png") },
  { id: "cat2_09", source: require("@/assets/images/cat2-stickers/cat2_09.png") },
  { id: "cat2_10", source: require("@/assets/images/cat2-stickers/cat2_10.png") },
  { id: "cat2_11", source: require("@/assets/images/cat2-stickers/cat2_11.png") },
  { id: "cat2_12", source: require("@/assets/images/cat2-stickers/cat2_12.png") },
  { id: "cat2_13", source: require("@/assets/images/cat2-stickers/cat2_13.png") },
  { id: "cat2_14", source: require("@/assets/images/cat2-stickers/cat2_14.png") },
  { id: "cat2_15", source: require("@/assets/images/cat2-stickers/cat2_15.png") },
  { id: "cat2_16", source: require("@/assets/images/cat2-stickers/cat2_16.png") },
  { id: "cat2_17", source: require("@/assets/images/cat2-stickers/cat2_17.png") },
  { id: "cat2_18", source: require("@/assets/images/cat2-stickers/cat2_18.png") },
  { id: "cat2_19", source: require("@/assets/images/cat2-stickers/cat2_19.png") },
  { id: "cat2_20", source: require("@/assets/images/cat2-stickers/cat2_20.png") },
  { id: "cat2_21", source: require("@/assets/images/cat2-stickers/cat2_21.png") },
  { id: "cat2_22", source: require("@/assets/images/cat2-stickers/cat2_22.png") },
  { id: "cat2_23", source: require("@/assets/images/cat2-stickers/cat2_23.png") },
  { id: "cat2_24", source: require("@/assets/images/cat2-stickers/cat2_24.png") },
  { id: "cat2_25", source: require("@/assets/images/cat2-stickers/cat2_25.png") },
  { id: "cat2_26", source: require("@/assets/images/cat2-stickers/cat2_26.png") },
  { id: "cat2_27", source: require("@/assets/images/cat2-stickers/cat2_27.png") },
  { id: "cat2_28", source: require("@/assets/images/cat2-stickers/cat2_28.png") },
  { id: "cat2_29", source: require("@/assets/images/cat2-stickers/cat2_29.png") },
  { id: "cat2_30", source: require("@/assets/images/cat2-stickers/cat2_30.png") },
  { id: "cat2_31", source: require("@/assets/images/cat2-stickers/cat2_31.png") },
  { id: "cat2_32", source: require("@/assets/images/cat2-stickers/cat2_32.png") },
  { id: "cat2_33", source: require("@/assets/images/cat2-stickers/cat2_33.png") },
  { id: "cat2_34", source: require("@/assets/images/cat2-stickers/cat2_34.png") },
  { id: "cat2_35", source: require("@/assets/images/cat2-stickers/cat2_35.png") },
  { id: "cat2_36", source: require("@/assets/images/cat2-stickers/cat2_36.png") },
  { id: "cat2_37", source: require("@/assets/images/cat2-stickers/cat2_37.png") },
  { id: "cat2_38", source: require("@/assets/images/cat2-stickers/cat2_38.png") },
  { id: "cat2_39", source: require("@/assets/images/cat2-stickers/cat2_39.png") },
  { id: "cat2_40", source: require("@/assets/images/cat2-stickers/cat2_40.png") },
  { id: "cat2_41", source: require("@/assets/images/cat2-stickers/cat2_41.png") },
  { id: "cat2_42", source: require("@/assets/images/cat2-stickers/cat2_42.png") },
  { id: "cat2_43", source: require("@/assets/images/cat2-stickers/cat2_43.png") },
  { id: "cat2_44", source: require("@/assets/images/cat2-stickers/cat2_44.png") },
];

export function getCat2StickerById(id: string): Cat2Sticker | undefined {
  return CAT2_STICKERS.find((s) => s.id === id);
}

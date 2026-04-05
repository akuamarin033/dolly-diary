import { ImageSourcePropType } from "react-native";

export interface CatSticker {
  id: string;
  source: ImageSourcePropType;
}

// All cat sticker images (used for lookup by ID from diary entries and calendar decos)
export const ALL_CAT_STICKERS: CatSticker[] = [
  // Mood stickers (cat01-cat11, cat20-cat24)
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
  // Weather stickers (cat12-cat19)
  { id: "cat12", source: require("@/assets/images/cat-stickers/cat12.png") },
  { id: "cat13", source: require("@/assets/images/cat-stickers/cat13.png") },
  { id: "cat14", source: require("@/assets/images/cat-stickers/cat14.png") },
  { id: "cat15", source: require("@/assets/images/cat-stickers/cat15.png") },
  { id: "cat16", source: require("@/assets/images/cat-stickers/cat16.png") },
  { id: "cat17", source: require("@/assets/images/cat-stickers/cat17.png") },
  { id: "cat18", source: require("@/assets/images/cat-stickers/cat18.png") },
  { id: "cat19", source: require("@/assets/images/cat-stickers/cat19.png") },
  // Additional mood stickers (cat20-cat24)
  { id: "cat20", source: require("@/assets/images/cat-stickers/cat20.png") },
  { id: "cat21", source: require("@/assets/images/cat-stickers/cat21.png") },
  { id: "cat22", source: require("@/assets/images/cat-stickers/cat22.png") },
  { id: "cat23", source: require("@/assets/images/cat-stickers/cat23.png") },
  { id: "cat24", source: require("@/assets/images/cat-stickers/cat24.png") },
  // Deco-only stickers (cat25-cat58)
  { id: "cat25", source: require("@/assets/images/cat-stickers/cat25.png") },
  { id: "cat26", source: require("@/assets/images/cat-stickers/cat26.png") },
  { id: "cat27", source: require("@/assets/images/cat-stickers/cat27.png") },
  { id: "cat28", source: require("@/assets/images/cat-stickers/cat28.png") },
  { id: "cat29", source: require("@/assets/images/cat-stickers/cat29.png") },
  { id: "cat30", source: require("@/assets/images/cat-stickers/cat30.png") },
  { id: "cat31", source: require("@/assets/images/cat-stickers/cat31.png") },
  { id: "cat32", source: require("@/assets/images/cat-stickers/cat32.png") },
  { id: "cat33", source: require("@/assets/images/cat-stickers/cat33.png") },
  { id: "cat34", source: require("@/assets/images/cat-stickers/cat34.png") },
  { id: "cat35", source: require("@/assets/images/cat-stickers/cat35.png") },
  { id: "cat36", source: require("@/assets/images/cat-stickers/cat36.png") },
  { id: "cat37", source: require("@/assets/images/cat-stickers/cat37.png") },
  { id: "cat38", source: require("@/assets/images/cat-stickers/cat38.png") },
  { id: "cat39", source: require("@/assets/images/cat-stickers/cat39.png") },
  { id: "cat40", source: require("@/assets/images/cat-stickers/cat40.png") },
  { id: "cat41", source: require("@/assets/images/cat-stickers/cat41.png") },
  { id: "cat42", source: require("@/assets/images/cat-stickers/cat42.png") },
  { id: "cat43", source: require("@/assets/images/cat-stickers/cat43.png") },
  { id: "cat44", source: require("@/assets/images/cat-stickers/cat44.png") },
  { id: "cat45", source: require("@/assets/images/cat-stickers/cat45.png") },
  { id: "cat46", source: require("@/assets/images/cat-stickers/cat46.png") },
  { id: "cat47", source: require("@/assets/images/cat-stickers/cat47.png") },
  { id: "cat48", source: require("@/assets/images/cat-stickers/cat48.png") },
  { id: "cat49", source: require("@/assets/images/cat-stickers/cat49.png") },
  { id: "cat50", source: require("@/assets/images/cat-stickers/cat50.png") },
  { id: "cat51", source: require("@/assets/images/cat-stickers/cat51.png") },
  { id: "cat52", source: require("@/assets/images/cat-stickers/cat52.png") },
  { id: "cat53", source: require("@/assets/images/cat-stickers/cat53.png") },
  { id: "cat54", source: require("@/assets/images/cat-stickers/cat54.png") },
  { id: "cat55", source: require("@/assets/images/cat-stickers/cat55.png") },
  { id: "cat56", source: require("@/assets/images/cat-stickers/cat56.png") },
  { id: "cat57", source: require("@/assets/images/cat-stickers/cat57.png") },
  { id: "cat58", source: require("@/assets/images/cat-stickers/cat58.png") },
];

// Deco-only cat stickers (shown in the sticker picker screen, excludes mood/weather cats)
export const CAT_STICKERS: CatSticker[] = ALL_CAT_STICKERS.filter(
  (s) => {
    const num = parseInt(s.id.replace("cat", ""), 10);
    // cat01-cat24 are mood/weather stickers, cat25+ are deco-only
    return num >= 25;
  }
);

export function getCatStickerById(id: string): CatSticker | undefined {
  return ALL_CAT_STICKERS.find((s) => s.id === id);
}

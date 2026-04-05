import { ImageSourcePropType } from "react-native";
import { type Mood, type Weather } from "./diary-storage";

export interface MoodStamp {
  id: Mood;
  label: string;
  source: ImageSourcePropType;
}

export interface WeatherStamp {
  id: Weather;
  label: string;
  source: ImageSourcePropType;
}

export const MOOD_STAMPS: MoodStamp[] = [
  { id: "happy", label: "嬉しい", source: require("@/assets/images/mood-stamps/mood-happy.png") },
  { id: "laugh", label: "笑い", source: require("@/assets/images/mood-stamps/mood-laugh.png") },
  { id: "excited", label: "ウキウキ", source: require("@/assets/images/mood-stamps/mood-excited.png") },
  { id: "worried", label: "不安", source: require("@/assets/images/mood-stamps/mood-worried.png") },
  { id: "depressed", label: "落ち込み", source: require("@/assets/images/mood-stamps/mood-depressed.png") },
  { id: "cry", label: "泣き", source: require("@/assets/images/mood-stamps/mood-cry.png") },
  { id: "angry", label: "怒り", source: require("@/assets/images/mood-stamps/mood-angry.png") },
  { id: "surprised", label: "驚き", source: require("@/assets/images/mood-stamps/mood-surprised.png") },
  { id: "neutral", label: "普通", source: require("@/assets/images/mood-stamps/mood-neutral.png") },
  { id: "sad", label: "悲しい", source: require("@/assets/images/mood-stamps/mood-sad.png") },
];

export const WEATHER_STAMPS: WeatherStamp[] = [
  { id: "sunny", label: "晴れ", source: require("@/assets/images/weather-stamps/weather-sunny.png") },
  { id: "cloudy", label: "曇り", source: require("@/assets/images/weather-stamps/weather-cloudy.png") },
  { id: "rainy", label: "雨", source: require("@/assets/images/weather-stamps/weather-rainy.png") },
  { id: "thunder", label: "雷", source: require("@/assets/images/weather-stamps/weather-thunder.png") },
  { id: "windy", label: "風", source: require("@/assets/images/weather-stamps/weather-windy.png") },
  { id: "snowy", label: "雪", source: require("@/assets/images/weather-stamps/weather-snowy.png") },
  { id: "rainbow", label: "虹", source: require("@/assets/images/weather-stamps/weather-rainbow.png") },
  { id: "night", label: "夜", source: require("@/assets/images/weather-stamps/weather-night.png") },
];

export function getMoodStamp(mood: Mood): MoodStamp | undefined {
  return MOOD_STAMPS.find((s) => s.id === mood);
}

export function getWeatherStamp(weather: Weather): WeatherStamp | undefined {
  return WEATHER_STAMPS.find((s) => s.id === weather);
}

/**
 * 動的フォント読み込みユーティリティ
 * 必要なフォントのみを読み込むことで初期ロード時間を短縮
 */

import { useFonts } from "expo-font";
import {
  AntDesign,
  MaterialIcons,
  Ionicons,
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

/**
 * 基本的なフォント（よく使われるもの）を読み込む
 */
export const useBasicFonts = () => {
  return useFonts({
    ...AntDesign.font,
    ...MaterialIcons.font,
    ...Ionicons.font,
  });
};

/**
 * 拡張フォント（必要に応じて読み込む）を読み込む
 */
export const useExtendedFonts = () => {
  return useFonts({
    ...FontAwesome.font,
    ...FontAwesome5.font,
    ...MaterialCommunityIcons.font,
  });
};

/**
 * すべてのフォントを読み込む（後方互換性のため）
 */
export const useAllFonts = () => {
  return useFonts({
    ...AntDesign.font,
    ...MaterialIcons.font,
    ...Ionicons.font,
    ...FontAwesome.font,
    ...FontAwesome5.font,
    ...MaterialCommunityIcons.font,
  });
};

/**
 * 特定のフォントのみを読み込む
 */
export const useCustomFonts = (fontNames: Array<"antdesign" | "material" | "ionicons" | "fontawesome" | "fontawesome5" | "materialcommunity">) => {
  const fonts: Record<string, any> = {};
  
  if (fontNames.includes("antdesign")) {
    Object.assign(fonts, AntDesign.font);
  }
  if (fontNames.includes("material")) {
    Object.assign(fonts, MaterialIcons.font);
  }
  if (fontNames.includes("ionicons")) {
    Object.assign(fonts, Ionicons.font);
  }
  if (fontNames.includes("fontawesome")) {
    Object.assign(fonts, FontAwesome.font);
  }
  if (fontNames.includes("fontawesome5")) {
    Object.assign(fonts, FontAwesome5.font);
  }
  if (fontNames.includes("materialcommunity")) {
    Object.assign(fonts, MaterialCommunityIcons.font);
  }
  
  return useFonts(fonts);
};


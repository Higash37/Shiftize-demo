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


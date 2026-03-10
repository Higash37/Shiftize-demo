/**
 * @file ShadowConstants.ts
 * @description シャドウスタイルの定義（現在は全体的に無効化済み）
 */
import { ViewStyle, Platform } from "react-native";

/** シャドウスタイルの型。用途別にViewStyleを持つ */
export type ShadowsType = {
  none: ViewStyle;
  small: ViewStyle;
  medium: ViewStyle;
  large: ViewStyle;
  xlarge: ViewStyle;
  // 特定用途のシャドウ
  card: ViewStyle;
  header: ViewStyle;
  footer: ViewStyle;
  button: ViewStyle;
  modal: ViewStyle;
  // 追加のコンポーネント専用シャドウ
  listItem: ViewStyle;
  chip: ViewStyle;
  notification: ViewStyle;
  floatingButton: ViewStyle;
  // インタラクション用シャドウ
  pressed: ViewStyle;
  elevated: ViewStyle;
};

/** Web用のboxShadow生成（現在は無効化のため常に"none"を返す） */
const createWebShadow = (
  _color: string,
  _x: number,
  _y: number,
  _blur: number,
  _opacity: number
) => {
  return "none";
};

/** 既存のshadowプロパティをWeb警告回避形式に変換する（現在は無効化済み） */
export const convertShadowForWeb = (_shadowStyle: {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}): ViewStyle => {
  if (Platform.OS === "web") {
    return { boxShadow: "none" } as ViewStyle;
  }
  return {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  };
};

/** プラットフォーム共通のシャドウスタイル生成（現在は無効化済み） */
const createShadow = (
  _color: string,
  _x: number,
  _y: number,
  _blur: number,
  _opacity: number,
  _elevation: number
): ViewStyle => {
  if (Platform.OS === "web") {
    return { boxShadow: "none" } as ViewStyle;
  }
  return {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  };
};

export const shadows: ShadowsType = {
  none:
    Platform.OS === "web"
      ? ({ boxShadow: "none" } as ViewStyle)
      : {
          shadowColor: "transparent",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
        },
  small: createShadow("#000", 0, 1, 1, 0.18, 1),
  medium: createShadow("#000", 0, 2, 3.84, 0.25, 3),
  large: createShadow("#000", 0, 4, 4.65, 0.3, 6),
  xlarge: createShadow("#000", 0, 8, 8, 0.35, 10),
  // 特定用途のシャドウ
  card: createShadow("#000", 0, 2, 8, 0.1, 4),
  header: createShadow("#000", 0, 2, 6, 0.15, 4),
  footer: createShadow("#000", 0, -2, 6, 0.15, 4),
  button: createShadow("#000", 0, 2, 4, 0.12, 2),
  modal: createShadow("#000", 0, 10, 20, 0.25, 15),
  // 追加のコンポーネント専用シャドウ
  listItem: createShadow("#000", 0, 1, 3, 0.08, 2),
  chip: createShadow("#000", 0, 1, 2, 0.1, 1),
  notification: createShadow("#000", 0, 4, 8, 0.2, 6),
  floatingButton: createShadow("#000", 0, 4, 12, 0.3, 8),
  // インタラクション用シャドウ
  pressed: createShadow("#000", 0, 1, 2, 0.05, 1),
  elevated: createShadow("#000", 0, 6, 12, 0.25, 8),
};

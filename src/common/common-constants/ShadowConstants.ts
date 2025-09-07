import { ViewStyle } from "react-native";
import { Platform } from "react-native";

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

// Web用のboxShadowを生成するヘルパー関数
const createWebShadow = (
  color: string,
  x: number,
  y: number,
  blur: number,
  opacity: number
) => {
  const rgba = `rgba(0, 0, 0, ${opacity})`;
  return `${x}px ${y}px ${blur}px ${rgba}`;
};

// 既存のshadowプロパティをWebの警告を回避する形式に変換するヘルパー関数
export const convertShadowForWeb = (shadowStyle: {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}): ViewStyle => {
  if (Platform.OS === "web") {
    const color = shadowStyle.shadowColor || "#000";
    const x = shadowStyle.shadowOffset?.width || 0;
    const y = shadowStyle.shadowOffset?.height || 0;
    const blur = shadowStyle.shadowRadius || 0;
    const opacity = shadowStyle.shadowOpacity || 0;
    
    return {
      boxShadow: createWebShadow(color, x, y, blur, opacity),
    } as ViewStyle;
  }
  
  return shadowStyle as ViewStyle;
};

// プラットフォーム共通のシャドウスタイルを生成するヘルパー関数
const createShadow = (
  color: string,
  x: number,
  y: number,
  blur: number,
  opacity: number,
  elevation: number
): ViewStyle => {
  if (Platform.OS === "web") {
    return {
      boxShadow: createWebShadow(color, x, y, blur, opacity),
    } as ViewStyle;
  }
  return {
    shadowColor: color,
    shadowOffset: { width: x, height: y },
    shadowOpacity: opacity,
    shadowRadius: blur,
    elevation: elevation,
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
  small: createShadow("#000", 0, 1, 1.0, 0.18, 1),
  medium: createShadow("#000", 0, 2, 3.84, 0.25, 3),
  large: createShadow("#000", 0, 4, 4.65, 0.3, 6),
  xlarge: createShadow("#000", 0, 8, 8.0, 0.35, 10),
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

import { ViewStyle, Platform } from "react-native";

/**
 * Material Design 3 エレベーションシステム
 *
 * MD3では6段階のエレベーション (Level 0-5) を定義:
 * - Level 0: フラット (影なし)
 * - Level 1: カード、スイッチ (1dp shadow)
 * - Level 2: ボタン、メニュー (3dp shadow)
 * - Level 3: ナビゲーションバー、FAB (6dp shadow)
 * - Level 4: アプリバー (8dp shadow)
 * - Level 5: モーダル、ダイアログ (12dp shadow)
 *
 * Web環境では boxShadow、ネイティブでは shadow* + elevation を使用
 */

export interface MD3ElevationLevel {
  shadow: ViewStyle;
  /** MD3ではサーフェスティント(primary色の半透明オーバーレイ)でエレベーションを表現 */
  surfaceTintOpacity: number;
}

export interface MD3ElevationScale {
  level0: MD3ElevationLevel;
  level1: MD3ElevationLevel;
  level2: MD3ElevationLevel;
  level3: MD3ElevationLevel;
  level4: MD3ElevationLevel;
  level5: MD3ElevationLevel;
}

/** プラットフォーム対応のシャドウ生成 */
const createShadow = (
  y: number,
  blur: number,
  opacity: number,
  elevation: number,
): ViewStyle => {
  if (Platform.OS === "web") {
    return {
      boxShadow: `0px ${y}px ${blur}px rgba(0, 0, 0, ${opacity})`,
    } as ViewStyle;
  }
  return {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: y },
    shadowOpacity: opacity,
    shadowRadius: blur,
    elevation,
  };
};

export const md3Elevation: MD3ElevationScale = {
  level0: {
    shadow: Platform.OS === "web"
      ? ({ boxShadow: "none" } as ViewStyle)
      : {
          shadowColor: "transparent",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
        },
    surfaceTintOpacity: 0,
  },
  level1: {
    shadow: createShadow(1, 2, 0.15, 1),
    surfaceTintOpacity: 0.05,
  },
  level2: {
    shadow: createShadow(2, 6, 0.15, 3),
    surfaceTintOpacity: 0.08,
  },
  level3: {
    shadow: createShadow(4, 8, 0.18, 6),
    surfaceTintOpacity: 0.11,
  },
  level4: {
    shadow: createShadow(6, 10, 0.2, 8),
    surfaceTintOpacity: 0.12,
  },
  level5: {
    shadow: createShadow(8, 16, 0.22, 12),
    surfaceTintOpacity: 0.14,
  },
};

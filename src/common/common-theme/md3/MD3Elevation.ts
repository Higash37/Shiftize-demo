/**
 * @file MD3Elevation.ts
 * @description Material Design 3 のエレベーション（影・高さ）システムを定義するファイル。
 *   UI要素の「浮き上がり具合」を影で表現する仕組み。
 *   ※ 現在このアプリでは影を全体的に無効化しており、全レベルで影が出ない設定になっている。
 *
 * 【このファイルの位置づけ】
 *   ■ 上位ファイル（このファイルをimportしている）:
 *     - MD3ThemeContext.tsx … lightTheme.elevation に使用
 *     - md3/index.ts       … 再エクスポート
 *   ■ 下位ファイル（このファイルがimportしている）:
 *     - react-native の ViewStyle と Platform
 *   ■ テーマシステム全体での役割:
 *     MD3Elevation ─→ MD3ThemeContext ─→ useMD3Theme() ─→ 各コンポーネント
 *     （影の定義）     （テーマ統合）     （フックで取得） （画面で使用）
 *
 *   使用例:
 *     const { elevation } = useMD3Theme();
 *     <View style={elevation.level2.shadow}>  // Level 2 の影を適用
 *
 * 【MD3 エレベーションの概念】
 *   MD3 では UI要素に「高さ」の概念があり、高いほど重要・前面にある。
 *   高さは 6段階（Level 0〜5）で表現する:
 *
 *   | Level | dp  | 用途                           |
 *   |-------|-----|-------------------------------|
 *   | 0     | 0   | フラット（影なし）               |
 *   | 1     | 1   | カード、スイッチ                 |
 *   | 2     | 3   | ボタン、メニュー                 |
 *   | 3     | 6   | ナビゲーションバー、FAB           |
 *   | 4     | 8   | アプリバー                      |
 *   | 5     | 12  | モーダル、ダイアログ              |
 *
 *   MD3 ではさらに「サーフェスティント」という概念がある。
 *   これは影の代わりに、primary色の半透明オーバーレイで高さを表現する手法。
 *   surfaceTintOpacity が大きいほど「高い」ことを示す。
 */

// ViewStyle: React Native のビュー（View）に適用できるスタイルの型定義。
//   shadowColor, shadowOffset, elevation 等の影関連プロパティを含む。
// Platform: 実行環境（"web", "ios", "android"）を判定するためのモジュール。
//   Platform.OS === "web" で Web 環境かどうかを判定できる。
import { ViewStyle, Platform } from "react-native";

/**
 * MD3ElevationLevel インターフェース - エレベーションの1段階分の定義
 */
export interface MD3ElevationLevel {
  /** 影のスタイル。ViewStyle 型なので、そのまま style プロパティに渡せる */
  shadow: ViewStyle;
  /**
   * サーフェスティントの不透明度（0〜1）。
   * MD3 では primary 色をこの不透明度で要素に重ねることで、
   * 影を使わずに「高さ」を表現できる。値が大きいほど高い要素。
   */
  surfaceTintOpacity: number;
}

/**
 * MD3ElevationScale インターフェース - 全6段階のエレベーション
 */
export interface MD3ElevationScale {
  level0: MD3ElevationLevel;  // 0dp - フラット
  level1: MD3ElevationLevel;  // 1dp - カード等
  level2: MD3ElevationLevel;  // 3dp - ボタン等
  level3: MD3ElevationLevel;  // 6dp - ナビゲーションバー等
  level4: MD3ElevationLevel;  // 8dp - アプリバー等
  level5: MD3ElevationLevel;  // 12dp - モーダル等
}

/**
 * プラットフォーム対応のシャドウ生成関数（現在は影を全体的に無効化済み）
 *
 * 本来は引数に応じた影を生成するが、デザイン方針で影を無効化しているため、
 * 全ての引数を無視して「影なし」のスタイルを返す。
 *
 * 引数名の先頭に _ がついているのは「未使用パラメータ」であることを明示するための
 * TypeScript の慣習。ESLint の未使用変数警告を回避する効果もある。
 *
 * @param _y       - 影のY方向オフセット（dp）。大きいほど下に影が伸びる
 * @param _blur    - 影のぼかし半径（dp）。大きいほどぼんやりした影
 * @param _opacity - 影の不透明度（0〜1）。大きいほど濃い影
 * @param _elevation - Android用のelevation値（dp）。Android固有の影システム
 * @returns 影なしの ViewStyle
 */
const createShadow = (
  _y: number,
  _blur: number,
  _opacity: number,
  _elevation: number,
): ViewStyle => {
  // Platform.OS で実行環境を判定し、プラットフォームごとに適切なスタイルを返す。
  // Web → CSS の boxShadow プロパティを使用
  // ネイティブ(iOS/Android) → React Native の shadow* プロパティと elevation を使用
  if (Platform.OS === "web") {
    // Web 環境: boxShadow: "none" で影を消す
    // `as ViewStyle` は型アサーション。boxShadow は React Native の型定義に
    // 含まれていないが、Web 実行時には使えるので、型チェックを通すために使う。
    return { boxShadow: "none" } as ViewStyle;
  }
  // ネイティブ環境: 全ての影パラメータを0にして影を消す
  return {
    shadowColor: "transparent",                 // 影の色を透明に
    shadowOffset: { width: 0, height: 0 },      // 影のオフセットを0に
    shadowOpacity: 0,                           // 影の不透明度を0に
    shadowRadius: 0,                            // 影のぼかし半径を0に
    elevation: 0,                               // Android用の影を0に
  };
};

/**
 * MD3 エレベーションスケールの実際の値
 *
 * 現在は影が無効化されているが、surfaceTintOpacity の値は活きている。
 * コンポーネント側で surfaceTintOpacity を使ってティント（色の重ね合わせ）で
 * 高さを表現することは可能。
 */
export const md3Elevation: MD3ElevationScale = {
  // Level 0: フラット - 影なし、ティントなし
  level0: {
    // level0 は createShadow 関数を使わず直接記述している（より明示的にするため）
    shadow: Platform.OS === "web"
      ? ({ boxShadow: "none" } as ViewStyle)
      : {
          shadowColor: "transparent",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
        },
    surfaceTintOpacity: 0,    // ティントなし
  },
  // Level 1: カード、スイッチ - 最も控えめな影
  level1: {
    shadow: createShadow(1, 2, 0.15, 1),
    surfaceTintOpacity: 0.05, // ごくわずかなティント
  },
  // Level 2: ボタン、メニュー
  level2: {
    shadow: createShadow(2, 6, 0.15, 3),
    surfaceTintOpacity: 0.08,
  },
  // Level 3: ナビゲーションバー、FAB
  level3: {
    shadow: createShadow(4, 8, 0.18, 6),
    surfaceTintOpacity: 0.11,
  },
  // Level 4: アプリバー
  level4: {
    shadow: createShadow(6, 10, 0.2, 8),
    surfaceTintOpacity: 0.12,
  },
  // Level 5: モーダル、ダイアログ - 最も強い影
  level5: {
    shadow: createShadow(8, 16, 0.22, 12),
    surfaceTintOpacity: 0.14, // 最もはっきりしたティント
  },
};

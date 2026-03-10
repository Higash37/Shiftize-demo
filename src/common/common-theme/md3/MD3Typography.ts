/**
 * @file MD3Typography.ts
 * @description Material Design 3 のタイポグラフィ（文字スタイル）スケールを定義するファイル。
 *   フォントサイズ、行間、字間、太さなど、テキスト表示に関する全ての設定を管理する。
 *
 * 【このファイルの位置づけ】
 *   ■ 上位ファイル（このファイルをimportしている）:
 *     - MD3ThemeContext.tsx … lightTheme.typography に使用
 *     - md3/index.ts       … 再エクスポート
 *   ■ 下位ファイル（このファイルがimportしている）:
 *     - FontConstants.ts   … アプリ共通のフォントファミリー定数
 *   ■ テーマシステム全体での役割:
 *     MD3Typography ─→ MD3ThemeContext ─→ useMD3Theme() ─→ 各コンポーネント
 *     （文字スタイル）  （テーマ統合）     （フックで取得） （画面で使用）
 *
 *   使用例:
 *     const { typography } = useMD3Theme();
 *     <Text style={typography.bodyLarge}>本文テキスト</Text>
 */

// TextStyle は React Native の型で、テキストに適用できるスタイルプロパティの集合。
// fontSize, fontWeight, lineHeight, letterSpacing などを含む。
import { TextStyle } from "react-native";
// アプリ全体で使うフォントファミリー（Inter, SF Pro, Roboto 等のフォールバック付き）
import { APP_FONT_FAMILY } from "@/common/common-constants/FontConstants";

/**
 * MD3TypeScale インターフェース
 *
 * MD3 は 5カテゴリ x 3サイズ = 15段階のタイプスケールを定義する:
 *
 * | カテゴリ    | 用途                              | Large | Medium | Small |
 * |------------|-----------------------------------|-------|--------|-------|
 * | Display    | 画面タイトル、大きな数値表示          | 57px  | 45px   | 36px  |
 * | Headline   | セクションヘッダー                   | 32px  | 28px   | 24px  |
 * | Title      | カードタイトル、ダイアログタイトル      | 22px  | 16px   | 14px  |
 * | Body       | 本文テキスト                        | 16px  | 14px   | 12px  |
 * | Label      | ボタン、ナビゲーション、バッジ         | 14px  | 12px   | 11px  |
 *
 * 各プロパティの値は TextStyle 型。TextStyle には以下のようなプロパティがある:
 *   - fontSize: 文字の大きさ（ピクセル）
 *   - fontWeight: 文字の太さ（"400"=通常, "500"=中太, "700"=太字）
 *   - lineHeight: 行の高さ（ピクセル）。行間のスペースに影響する
 *   - letterSpacing: 文字間の間隔（ピクセル）。マイナスだと詰まる
 *   - fontFamily: 使用するフォント名
 */
export interface MD3TypeScale {
  // --- Display: 最も大きい。画面のメインタイトルや数字表示に使う ---
  displayLarge: TextStyle;    // 57px - 大画面のヒーローテキスト
  displayMedium: TextStyle;   // 45px
  displaySmall: TextStyle;    // 36px

  // --- Headline: セクションの見出しに使う ---
  headlineLarge: TextStyle;   // 32px - 大きなセクション見出し
  headlineMedium: TextStyle;  // 28px
  headlineSmall: TextStyle;   // 24px

  // --- Title: カードやダイアログの小さな見出しに使う ---
  titleLarge: TextStyle;      // 22px - カードのタイトル
  titleMedium: TextStyle;     // 16px - リストアイテムのタイトル
  titleSmall: TextStyle;      // 14px - サブタイトル

  // --- Body: 本文のテキストに使う ---
  bodyLarge: TextStyle;       // 16px - メインの本文
  bodyMedium: TextStyle;      // 14px - 標準の本文
  bodySmall: TextStyle;       // 12px - 補足テキスト

  // --- Label: ボタン、チップ、ナビゲーションなど小さなUIに使う ---
  labelLarge: TextStyle;      // 14px - ボタンのテキスト
  labelMedium: TextStyle;     // 12px - ナビゲーションラベル
  labelSmall: TextStyle;      // 11px - バッジ、キャプション
}

// fontFamily を変数にまとめておくことで、全スタイルで同じフォントを使い回す。
// もしフォントを変えたくなったら FontConstants.ts の1箇所だけ変更すればOK。
const fontFamily = APP_FONT_FAMILY;

/**
 * MD3 タイポグラフィの実際の値
 *
 * fontWeight の値について:
 *   "400" = Regular（通常の太さ）
 *   "500" = Medium（やや太い。タイトルやラベルに使用）
 *   "700" = Bold（太字）
 *   ※ React Native では fontWeight は文字列で指定する
 *
 * letterSpacing の値について:
 *   マイナス値（例: -0.25）→ 文字が少し詰まる。大きな文字では読みやすくなる
 *   0 → 標準
 *   プラス値（例: 0.5）→ 文字が広がる。小さな文字の可読性が上がる
 *
 * lineHeight の考え方:
 *   一般的に fontSize の 1.2〜1.5 倍。
 *   例: fontSize: 16, lineHeight: 24 → 行間は 24-16=8px
 */
export const md3Typography: MD3TypeScale = {
  // ===== Display - 画面タイトル、大きな数値表示 =====
  displayLarge: {
    fontFamily,
    fontSize: 57,           // 最大の文字サイズ
    fontWeight: "400",      // Regular
    lineHeight: 64,         // 57 * 1.12 ≒ 64
    letterSpacing: -0.25,   // 大きな文字なので少し詰める
  },
  displayMedium: {
    fontFamily,
    fontSize: 45,
    fontWeight: "400",
    lineHeight: 52,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily,
    fontSize: 36,
    fontWeight: "400",
    lineHeight: 44,
    letterSpacing: 0,
  },

  // ===== Headline - セクションヘッダー =====
  headlineLarge: {
    fontFamily,
    fontSize: 32,
    fontWeight: "400",
    lineHeight: 40,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily,
    fontSize: 28,
    fontWeight: "400",
    lineHeight: 36,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily,
    fontSize: 24,
    fontWeight: "400",
    lineHeight: 32,
    letterSpacing: 0,
  },

  // ===== Title - カードタイトル、ダイアログタイトル =====
  titleLarge: {
    fontFamily,
    fontSize: 22,
    fontWeight: "400",
    lineHeight: 28,
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily,
    fontSize: 16,
    fontWeight: "500",      // Medium - タイトルはやや太くして目立たせる
    lineHeight: 24,
    letterSpacing: 0.15,    // わずかに広げて可読性UP
  },
  titleSmall: {
    fontFamily,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  // ===== Body - 本文テキスト =====
  bodyLarge: {
    fontFamily,
    fontSize: 16,
    fontWeight: "400",       // Regular - 本文は通常の太さ
    lineHeight: 24,
    letterSpacing: 0.5,      // 本文は少し広げて読みやすく
  },
  bodyMedium: {
    fontFamily,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily,
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
    letterSpacing: 0.4,      // 小さい文字ほど letterSpacing を広げる
  },

  // ===== Label - ボタン、ナビゲーション、バッジ =====
  labelLarge: {
    fontFamily,
    fontSize: 14,
    fontWeight: "500",       // Medium - ボタン等は少し太く
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily,
    fontSize: 11,            // 最小の文字サイズ
    fontWeight: "500",
    lineHeight: 16,
    letterSpacing: 0.5,
  },
};

import { TextStyle } from "react-native";

/**
 * Material Design 3 タイポグラフィスケール
 *
 * MD3は5カテゴリ × 3サイズ = 15段階のタイプスケールを定義:
 * Display, Headline, Title, Body, Label × Large/Medium/Small
 *
 * フォントファミリー: システムフォント (Inter, SF Pro, Roboto等)
 * 全てのfontSizeは16px以上またはラベル/キャプション用途のみ16px未満
 */

export interface MD3TypeScale {
  displayLarge: TextStyle;
  displayMedium: TextStyle;
  displaySmall: TextStyle;
  headlineLarge: TextStyle;
  headlineMedium: TextStyle;
  headlineSmall: TextStyle;
  titleLarge: TextStyle;
  titleMedium: TextStyle;
  titleSmall: TextStyle;
  bodyLarge: TextStyle;
  bodyMedium: TextStyle;
  bodySmall: TextStyle;
  labelLarge: TextStyle;
  labelMedium: TextStyle;
  labelSmall: TextStyle;
}

const fontFamily =
  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const md3Typography: MD3TypeScale = {
  // Display - 画面タイトル、大きな数値表示
  displayLarge: {
    fontFamily,
    fontSize: 57,
    fontWeight: "400",
    lineHeight: 64,
    letterSpacing: -0.25,
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

  // Headline - セクションヘッダー
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

  // Title - カードタイトル、ダイアログタイトル
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
    fontWeight: "500",
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontFamily,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  // Body - 本文テキスト
  bodyLarge: {
    fontFamily,
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    letterSpacing: 0.5,
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
    letterSpacing: 0.4,
  },

  // Label - ボタン、ナビゲーション、バッジ
  labelLarge: {
    fontFamily,
    fontSize: 14,
    fontWeight: "500",
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
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 16,
    letterSpacing: 0.5,
  },
};

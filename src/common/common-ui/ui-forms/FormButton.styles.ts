/** @file FormButton.styles.ts @description Buttonコンポーネントのテーマ連動スタイル定義 */
// ============================================================================
// 【なぜスタイルを別ファイルに分けるのか — CSS-in-JS の歴史】
// ============================================================================
// このファイルは FormButton.tsx のスタイル定義だけを担当している。
// なぜコンポーネントと同じファイルに書かず、わざわざ分けるのか？
//
// ■ Web のスタイリングの歴史:
//   1. HTML に直接書く時代（1990年代）: <font color="red">
//   2. CSS の登場（1996年〜）: 見た目を別ファイルに分離する思想
//   3. CSS Modules（2015年〜）: CSS のクラス名の衝突を防ぐ仕組み
//   4. CSS-in-JS（2015年〜）: JavaScript の中でスタイルを書く（styled-components等）
//   5. StyleSheet.create（React Native）: CSS ファイルが使えない環境向けの解法
//
// ■ React Native でスタイルを JS で書く理由:
//   React Native はブラウザではなくネイティブ（iOS/Android）で動作するため、
//   通常の CSS ファイルは使えない。代わりに StyleSheet.create() で
//   JavaScript オブジェクトとしてスタイルを定義する。
//   StyleSheet.create() は単なるオブジェクトではなく、React Native が
//   内部的にスタイルを最適化（ID化してブリッジ転送を高速化）するためのAPI。
//
// ■ なぜ別ファイルにするのか（関心の分離）:
//   コンポーネントファイル（.tsx）には「何を表示するか」のロジックを、
//   スタイルファイル（.styles.ts）には「どう見せるか」の定義を分離する。
//   これにより:
//   - コンポーネントの見通しが良くなる（ロジックに集中できる）
//   - スタイルだけを変更したいとき、影響範囲が明確
//   - デザイナーとの協業がしやすい
//
// ■ ケースバイケース:
//   - 複雑なスタイル（10行以上）→ 別ファイル（.styles.ts）に分離（このファイルのように）
//   - 簡単なスタイル（3行以下）→ コンポーネント内にインラインで書いてOK
//   - 1つのスタイルだけ → style={{ marginTop: 8 }} のように直接指定でも十分
// ============================================================================
import { StyleSheet } from "react-native";
import { MD3Theme } from "../../common-theme/md3/MD3Theme.types";
import { ButtonStyleName } from "./FormButton.types";

export const createButtonStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    base: {
      borderRadius: theme.shape.full,
      alignItems: "center",
      justifyContent: "center",
    },
    primary: {
      backgroundColor: theme.colorScheme.primary,
      ...theme.elevation.level1.shadow,
    },
    secondary: {
      backgroundColor: theme.colorScheme.secondaryContainer,
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.colorScheme.outline,
    },
    text: {
      backgroundColor: "transparent",
    },
    size_small: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      minHeight: 32,
    },
    size_medium: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xxl,
      minHeight: 40,
    },
    size_large: {
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xxxl,
      minHeight: 48,
    },
    size_compact: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      minHeight: 36,
    },
    fullWidth: {
      width: "100%",
    },
    disabled: {
      opacity: 0.38,
    },
    text_base: {
      ...theme.typography.labelLarge,
    },
    text_primary: {
      color: theme.colorScheme.onPrimary,
    },
    text_secondary: {
      color: theme.colorScheme.onSecondaryContainer,
    },
    text_outline: {
      color: theme.colorScheme.primary,
    },
    text_text: {
      color: theme.colorScheme.primary,
    },
    text_small: {
      fontSize: theme.typography.labelMedium.fontSize,
    },
    text_medium: {
      fontSize: theme.typography.labelLarge.fontSize,
    },
    text_large: {
      fontSize: theme.typography.titleMedium.fontSize,
    },
    text_compact: {
      fontSize: theme.typography.labelLarge.fontSize,
    },
  }) as Record<ButtonStyleName, any>;

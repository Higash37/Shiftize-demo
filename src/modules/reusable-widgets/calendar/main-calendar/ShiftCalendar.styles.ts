/**
 * @file ShiftCalendar.styles.ts
 * @description メインのシフトカレンダーコンポーネントのスタイル定義ファイル。
 *              カレンダー全体のコンテナ、影、レスポンシブ幅などを定義する。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: react-native（StyleSheet）, MD3Theme（テーマ型）, ShiftCalendar.types（スタイル型）
// インポート先: ShiftCalendar.tsx

import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";
import { ShiftCalendarStyles } from "./ShiftCalendar.types";

/**
 * createShiftCalendarStyles
 *
 * テーマを受け取り、ShiftCalendar 用のスタイルを生成するファクトリ関数。
 *
 * @param theme - MD3テーマオブジェクト
 * @returns ShiftCalendarStyles 型のスタイルオブジェクト
 */
export const createShiftCalendarStyles = (theme: MD3Theme) =>
  StyleSheet.create<ShiftCalendarStyles>({
    // --- カレンダー全体のコンテナ ---
    container: {
      alignItems: "center",            // 子要素を水平方向中央揃え
      paddingVertical: 0,
      borderRadius: theme.shape.large,  // テーマの大きい角丸
      borderWidth: 0,                   // 枠線なし
      elevation: 0,                     // Android の影の深さ（0=影なし）
      ...theme.elevation.level0.shadow, // 影なし（level0）
      margin: 0,
      paddingHorizontal: 0,
      width: "96%",                     // 親の96%幅
      alignSelf: "center",             // 自身を中央揃え
    },
    // --- スマホ向けフル幅コンテナ（isSmallScreen 時に追加適用） ---
    containerFullWidth: {
      paddingHorizontal: theme.spacing.lg, // 小さい画面では左右にパディングを追加
    },
    // --- カレンダー本体 ---
    calendar: {
      borderRadius: theme.shape.large,
      marginHorizontal: "auto",         // 水平方向中央寄せ（Web向け）
      borderWidth: 0,
      ...theme.elevation.level0.shadow,
    },
    // --- カレンダーの影（追加で適用するスタイル） ---
    calendarShadow: {
      ...theme.elevation.level0.shadow, // 現在は影なし（フラットデザイン）
      marginBottom: 0,
    },
  });

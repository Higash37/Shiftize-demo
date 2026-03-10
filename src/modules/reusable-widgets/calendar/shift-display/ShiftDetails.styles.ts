/**
 * @file ShiftDetails.styles.ts
 * @description シフト詳細表示コンポーネントのスタイル定義ファイル。
 *              スタッフ時間と授業時間を視覚的に区別するスタイルを提供する。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: react-native（StyleSheet）, MD3Theme（テーマ型）, ShiftDetails.types（スタイル型）
// インポート先: ShiftDetails.tsx

import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";
import { ShiftDetailsStyles } from "./ShiftDetails.types";

/**
 * createShiftDetailsStyles
 *
 * テーマを受け取り、ShiftDetails 用のスタイルを生成するファクトリ関数。
 *
 * @param theme - MD3テーマオブジェクト
 * @returns ShiftDetailsStyles 型のスタイルオブジェクト
 */
export const createShiftDetailsStyles = (theme: MD3Theme) =>
  StyleSheet.create<ShiftDetailsStyles>({
    // --- 全体コンテナ ---
    container: {
      overflow: "hidden",                           // はみ出す部分を非表示（アニメーション時に重要）
      backgroundColor: theme.colorScheme.surface,    // テーマの表面色
      borderBottomWidth: 1,                          // 下線で区切り
      borderBottomColor: theme.colorScheme.outlineVariant,
    },
    // --- ヘッダー ---
    header: {
      marginBottom: theme.spacing.sm,               // 下にスペース
    },
    // --- ニックネームテキスト ---
    nickname: {
      ...theme.typography.bodyLarge,                 // テーマのタイポグラフィを適用
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
    },
    // --- 日付テキスト ---
    date: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,     // やや薄いテキスト色
      marginTop: 2,
    },
    // --- 時間スロット一覧のコンテナ ---
    timeSlots: {
      gap: theme.spacing.sm,                         // 各スロット間の間隔
    },
    // --- 通常の時間スロット（スタッフ時間） ---
    timeSlot: {
      flexDirection: "row",            // ラベルと時間を横並びに
      justifyContent: "space-between", // ラベル=左、時間=右に配置
      alignItems: "center",
      paddingVertical: theme.spacing.xs,
    },
    // --- 授業時間スロット（背景色付き） ---
    classTimeSlot: {
      // "primary色" + "10" で非常に薄いプライマリ色の背景
      backgroundColor: theme.colorScheme.primary + "10",
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.shape.extraSmall,          // 小さい角丸
    },
    // --- スロットラベル ---
    timeSlotLabel: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      width: 60,                                     // 固定幅で揃える
    },
    // --- 授業ラベル（プライマリ色に変更） ---
    classLabel: {
      color: theme.colorScheme.primary,
    },
    // --- 時間テキスト ---
    timeText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurface,
    },
    // --- 授業時間テキスト（太字・プライマリ色） ---
    classTime: {
      color: theme.colorScheme.primary,
      fontWeight: "bold",
    },
  });

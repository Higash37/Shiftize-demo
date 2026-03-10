/**
 * @file ShiftList.styles.ts
 * @description シフト一覧（ShiftListView）のスタイル定義ファイル。
 *              テーマに応じたシフトカードのレイアウト・色分けスタイルを提供する。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: react-native（StyleSheet）, MD3Theme（テーマ型）,
//              ShiftList.types（スタイル型）, ModelIndex（ShiftStatus型）
// インポート先: ShiftListView.tsx

import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";
import { ShiftListStyles } from "./ShiftList.types";
import { ShiftStatus } from "@/common/common-models/ModelIndex";

/**
 * getStatusColor
 *
 * テーマのシフトステータス色マップからステータスに応じた色を取得する関数。
 *
 * `theme.colorScheme.shift[status]` でステータスに対応する色を取得。
 * `??` (Nullish合体演算子): 左が null/undefined のときだけ右の値を返す。
 * || と違い、0 や 空文字 は falsy だが null/undefined ではないので左が返る。
 *
 * @param theme  - MD3テーマオブジェクト
 * @param status - シフトステータス
 * @returns カラーコード文字列
 */
export const getStatusColor = (theme: MD3Theme, status: ShiftStatus) => {
  return theme.colorScheme.shift[status] ?? theme.colorScheme.onSurface;
};

/**
 * createShiftListStyles
 *
 * テーマを受け取り、シフト一覧のスタイルを生成するファクトリ関数。
 *
 * @param theme - MD3テーマオブジェクト
 * @returns ShiftListStyles 型のスタイルオブジェクト
 */
export const createShiftListStyles = (theme: MD3Theme) =>
  StyleSheet.create<ShiftListStyles>({
    // --- リスト全体のコンテナ ---
    container: {
      padding: theme.spacing.lg,
    },
    // --- シフト1件のカード ---
    shiftItem: {
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.small,
      padding: 6,
      marginBottom: theme.spacing.sm,
      borderWidth: 2,                         // ステータスに応じた色の枠線
    },
    // --- シフト情報（左側） ---
    shiftInfo: {
      flex: 1,                                // 親の空きスペースをすべて使う
    },
    // --- 日時テキスト ---
    dateTime: {
      ...theme.typography.bodyLarge,
      fontWeight: "bold",
      marginBottom: theme.spacing.xs,
    },
    // --- シフトタイプテキスト ---
    shiftType: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
    },
    // --- 右側コンテナ（ステータス・詳細ボタン） ---
    rightContainer: {
      alignItems: "flex-end",                 // 右揃え
    },
    // --- ステータステキスト ---
    statusText: {
      ...theme.typography.bodyMedium,
      marginBottom: theme.spacing.xs,
    },
    // --- 詳細ボタン ---
    detailsButton: {
      flexDirection: "row",                   // アイコンとテキストを横並び
      alignItems: "center",
    },
    // --- 詳細ボタンテキスト ---
    detailsButtonText: {
      ...theme.typography.bodyMedium,
      marginRight: theme.spacing.xs,
      color: theme.colorScheme.primary,
    },
    // --- 詳細展開部分のコンテナ ---
    detailsContainer: {
      marginTop: theme.spacing.sm,
      padding: theme.spacing.xs,
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
      borderRadius: theme.shape.extraSmall,
    },
    // --- 詳細内のセクション ---
    detailSection: {
      marginBottom: theme.spacing.lg,
    },
    // --- 詳細セクションのタイトル ---
    detailTitle: {
      ...theme.typography.bodyLarge,
      fontWeight: "bold",
      marginBottom: theme.spacing.sm,
    },
    // --- 詳細テキスト ---
    detailsText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
    },
    // --- タイムラインコンテナ ---
    timelineContainer: {
      marginBottom: theme.spacing.lg,
    },
    // --- 時間スロット ---
    timeSlot: {
      paddingVertical: 2,
      paddingHorizontal: theme.spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: theme.colorScheme.outlineVariant,
    },
    // --- 授業時間スロット ---
    classTimeSlot: {
      backgroundColor: theme.colorScheme.primary,
    },
    // --- スロットタイトル ---
    timeSlotTitle: {
      ...theme.typography.bodyMedium,
      fontWeight: "bold",
    },
    // --- 変更申請内容のコンテナ ---
    changesContainer: {
      marginTop: theme.spacing.lg,
      padding: theme.spacing.sm,
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
      borderRadius: theme.shape.extraSmall,
    },
    // --- 変更申請タイトル ---
    changesTitle: {
      ...theme.typography.bodyLarge,
      fontWeight: "bold",
      marginBottom: theme.spacing.sm,
    },
    // --- 変更申請テキスト ---
    changesText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
    },
  });

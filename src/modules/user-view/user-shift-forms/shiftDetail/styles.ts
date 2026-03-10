/** @file styles.ts (shiftDetail)
 *  @description シフト詳細表示・タイムスロット表示のスタイル定義。
 *    詳細コンテナとタイムスロット（種別ラベル＋時間）のレイアウトを管理する。
 *
 *  【このファイルの位置づけ】
 *  - 依存: react-native の StyleSheet / MD3Theme
 *  - 利用先: ShiftDetailsView / ShiftTimeSlot コンポーネント
 *  - 2つのファクトリ関数（createShiftDetailsViewStyles / createShiftTimeSlotStyles）
 *    をエクスポートする
 */
import { StyleSheet } from "react-native";
import type { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

export const createShiftDetailsViewStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    detailsContainer: {
      width: "100%",
      maxWidth: 600,
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
      borderRadius: theme.shape.small,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      alignSelf: "center",
      borderWidth: 1,
      borderTopWidth: 0,
      borderColor: theme.colorScheme.outlineVariant,
      ...theme.elevation.level1.shadow,
    },
  });

export const createShiftTimeSlotStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    timeSlot: {
      marginBottom: theme.spacing.sm,
      flexDirection: "row",
      alignItems: "center",
    },
    timeSlotText: {
      ...theme.typography.bodyMedium,
      fontSize: 14,
      fontWeight: "500",
    },
    timeSlotType: {
      width: 60,
      ...theme.typography.bodyMedium,
      fontSize: 14,
      fontWeight: "500",
    },
    timeSlotTime: {
      ...theme.typography.bodyMedium,
      fontSize: 14,
      fontWeight: "500",
      color: theme.colorScheme.onSurface,
    },
  });

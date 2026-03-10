/** @file PrintButton.styles.ts
 *  @description 印刷ボタン用のスタイル定義。MD3テーマを受け取って動的にスタイルを生成する。
 */

// 【このファイルの位置づけ】
// - importされる先: （現在は UnifiedButtonStyles に移行したため直接使用箇所は少ない）
// - 役割: テーマ対応の印刷ボタンスタイルを生成するファクトリ関数。

import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

// createPrintButtonStyles: テーマ（MD3Theme）を引数に取り、StyleSheet を返す関数。
// theme.colorScheme.primary などテーマの色をスタイルに反映する。
export const createPrintButtonStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    printButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colorScheme.primary,
      padding: 10,
      borderRadius: 6,
      marginTop: 10,
    },
    printButtonText: {
      color: theme.colorScheme.onPrimary,
      marginLeft: 8,
      fontWeight: "bold",
    },
  });

/** @file GanttChartMonthView.styles.ts
 *  @description ガントチャート月間ビューのスタイル定義。
 *    MD3（Material Design 3）テーマを受け取り、テーマカラーに応じたスタイルを動的に生成する。
 */

// 【このファイルの位置づけ】
// - import元: MD3Theme.types（テーマの型定義）, DateNavigator（サブヘッダー高さ定数）
// - importされる先: GanttChartMonthView, GanttHeader, MonthSelectorBar など
// - 役割: StyleSheet.create() でスタイルオブジェクトを生成する「ファクトリ関数」。
//   テーマが変わると色が変わるように、theme引数を受け取って動的にスタイルを返す。

// 【CSS/スタイルの基礎知識】
// - position: "absolute" → 親要素の中で自由な位置に配置（left/top で指定）
// - position: "relative" → 通常の位置を基準にして、子のabsoluteの基準点になる
// - flex: 1 → 利用可能な空間をすべて占める
// - flexDirection: "row" → 子要素を横並びにする（デフォルトは "column" = 縦並び）
// - elevation → Android用の影の深さ（0=影なし）
// - borderRadius → 角丸の半径

import { StyleSheet } from "react-native";
import type { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";
import { SUB_HEADER_HEIGHT } from "@/common/common-ui/ui-navigation/DateNavigator";

// createGanttChartMonthViewStyles はテーマオブジェクトを受け取り、
// StyleSheet（スタイル定義の辞書）を返す関数。
// 使う側: const styles = useThemedStyles(createGanttChartMonthViewStyles);
export const createGanttChartMonthViewStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colorScheme.surface,
      ...theme.elevation.level1.shadow,
    },
    addShiftButtonRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      flexShrink: 0,
    },
    addShiftButton: {
      display: "none",
      backgroundColor: theme.colorScheme.primary + "E6",
      borderRadius: 13,
      padding: 5,
      width: 26,
      height: 29,
      justifyContent: "center",
      alignItems: "center",
      elevation: 0,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: theme.colorScheme.surface,
      width: "30%",
      maxHeight: "100%",
      borderRadius: 10,
      padding: 5,
      ...theme.elevation.level5.shadow,
      borderWidth: 0,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 4,
      textAlign: "center",
    },
    modalSubtitle: {
      fontSize: 9,
      color: theme.colorScheme.onSurfaceVariant,
      marginBottom: 3,
      textAlign: "center",
    },
    timeInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 3,
    },
    timeInputGroup: {
      flex: 1,
    },
    timeInputLabel: {
      fontSize: 9,
      color: theme.colorScheme.onSurfaceVariant,
      marginBottom: 3,
    },
    timeInput: {
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
      borderRadius: 3,
      padding: 4,
      fontSize: 10,
    },
    timeInputSeparator: {
      marginHorizontal: 5,
      fontSize: 11,
      color: theme.colorScheme.onSurfaceVariant,
    },
    formGroup: {
      marginBottom: 4,
    },
    formLabel: {
      fontSize: 9,
      color: theme.colorScheme.onSurfaceVariant,
      marginBottom: 3,
    },
    pickerContainer: {
      marginBottom: 5,
      backgroundColor: "transparent",
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    modalButton: {
      flex: 1,
      paddingVertical: 5,
      borderRadius: 3,
      alignItems: "center",
    },
    cancelButton: {
      marginRight: 5,
      backgroundColor: theme.colorScheme.surfaceContainerHigh,
    },
    cancelButtonText: {
      color: theme.colorScheme.onSurfaceVariant,
      fontWeight: "bold",
    },
    saveButtonText: {
      color: theme.colorScheme.onPrimary,
      fontWeight: "bold",
    },
    headerRow: {
      flexDirection: "row",
      backgroundColor: theme.colorScheme.surfaceContainerHigh,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colorScheme.outlineVariant,
      elevation: 0,
      height: 29,
      alignItems: "center",
    },
    headerRightButtons: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 8,
      gap: 5,
    },
    headerButton: {
      backgroundColor: theme.colorScheme.primary,
      borderRadius: 6,
      paddingHorizontal: 13,
      paddingVertical: 6,
      marginLeft: 5,
      height: 28,
      minWidth: 52,
      justifyContent: "center",
      alignItems: "center",
      elevation: 0,
    },
    headerButtonText: {
      color: theme.colorScheme.onPrimary,
      fontWeight: "bold",
      fontSize: 13,
      letterSpacing: 0.3,
    },
    headerDateCell: {
      padding: 5,
      justifyContent: "center",
      alignItems: "center",
      borderRightWidth: 1,
      borderRightColor: theme.colorScheme.outlineVariant,
    },
    headerGanttCell: {
      flexDirection: "row",
      position: "relative",
      borderRightWidth: 1,
      borderRightColor: theme.colorScheme.outlineVariant,
      height: 29,
    },
    headerInfoCell: {
      padding: 5,
      justifyContent: "center",
      alignItems: "center",
    },
    headerText: {
      fontWeight: "bold",
      fontSize: 10,
    },
    timeLabel: {
      fontSize: 12,
      textAlign: "center",
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
      paddingTop: 8,
    },
    monthSelector: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 8,
      height: SUB_HEADER_HEIGHT,
      backgroundColor: theme.colorScheme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colorScheme.outlineVariant,
    },
    monthNavigator: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    monthNavButton: {
      paddingHorizontal: 8,
      paddingVertical: 6,
    },
    monthNavButtonText: {
      fontSize: 18,
      fontWeight: "500",
      color: theme.colorScheme.primary,
    },
    monthButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
    },
    monthText: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
    },
    content: {
      flex: 1,
    },
    shiftRow: {
      flexDirection: "row",
      minHeight: 44,
      height: 48,
    },
    dateCell: {
      padding: 4,
      justifyContent: "center",
      alignItems: "center",
      borderRightWidth: 1,
      borderRightColor: theme.colorScheme.outlineVariant,
      backgroundColor: theme.colorScheme.surface,
    },
    dateDayText: {
      fontSize: 16,
      fontWeight: "bold",
    },
    dateWeekText: {
      fontSize: 11,
      fontWeight: "500",
    },
    ganttCell: {
      position: "relative",
      height: 46,
      borderRightWidth: 1,
      borderRightColor: theme.colorScheme.outlineVariant,
      overflow: "hidden",
    },
    ganttBgRow: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
    },
    ganttBgCell: {
      height: "100%",
      borderRightColor: theme.colorScheme.outlineVariant,
    },
    classTimeCell: {
      backgroundColor: "rgba(180, 180, 180, 0.15)",
    },
    shiftBar: {
      position: "absolute",
      height: 46,
      top: 0,
      borderRadius: 0,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 0,
      paddingVertical: 0,
      elevation: 0,
      borderWidth: 0,
    },
    shiftBarText: {
      color: theme.colorScheme.onSurface,
      fontSize: 11,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 1,
    },
    shiftTimeText: {
      color: theme.colorScheme.onSurface,
      fontSize: 10,
      fontWeight: "500",
      textAlign: "center",
    },
    infoCell: {
      padding: 0,
      justifyContent: "flex-start",
      height: 46,
      overflow: "hidden",
      backgroundColor: theme.colorScheme.surface,
    },
    infoContent: {
      marginBottom: 0,
      padding: 2,
      borderRadius: 6,
      marginHorizontal: 0,
      marginTop: 1,
      borderWidth: 1,
      borderColor: theme.colorScheme.success,
      backgroundColor: theme.colorScheme.primaryContainer,
    },
    infoText: {
      fontSize: 9,
      fontWeight: "bold",
      marginBottom: 1,
    },
    infoTimeText: {
      fontSize: 8,
      color: theme.colorScheme.onSurface,
      marginBottom: 0,
    },
    statusText: {
      fontSize: 7,
      fontWeight: "500",
      color: theme.colorScheme.onSurfaceVariant,
    },
    emptyCell: {
      height: 46,
      borderRightWidth: 1,
      borderRightColor: theme.colorScheme.outlineVariant,
      position: "relative",
    },
    emptyInfoCell: {
      height: 46,
      backgroundColor: theme.colorScheme.surface,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    input: {
      height: 29,
      borderColor: theme.colorScheme.outlineVariant,
      borderWidth: 1,
      borderRadius: 3,
      paddingHorizontal: 6,
      marginBottom: 10,
    },
    picker: {
      height: 32,
      borderColor: theme.colorScheme.outlineVariant,
      borderWidth: 1,
      borderRadius: 3,
      marginBottom: 10,
    },
    saveButton: {
      backgroundColor: theme.colorScheme.success,
      borderRadius: 3,
      paddingVertical: 6,
      alignItems: "center",
    },
    closeButton: {
      marginTop: 6,
      paddingVertical: 6,
    },
    closeButtonText: {
      color: theme.colorScheme.onPrimary,
      fontWeight: "bold",
    },
    classBar: {
      position: "absolute",
      backgroundColor: theme.colorScheme.outline,
      borderRadius: 4,
      opacity: 0.85,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 1,
      zIndex: 3,
    },
    headerCostCellLeft: {
      justifyContent: "flex-start",
      alignItems: "center",
      padding: 6,
      backgroundColor: theme.colorScheme.surface,
      borderRadius: 3,
    },
    costLabel: {
      fontSize: 11,
      fontWeight: "bold",
      color: theme.colorScheme.primary,
    },
    monthCostContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      paddingHorizontal: 6,
      paddingVertical: 3,
    },
    monthCostContainerLeft: {
      position: "absolute",
      left: 0,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 6,
      paddingVertical: 3,
    },
    monthPickerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 6,
      paddingVertical: 3,
    },
    pdfButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colorScheme.primaryContainer,
      padding: 5,
      borderRadius: 5,
      marginRight: 5,
    },
    pdfButtonText: {
      marginLeft: 3,
      color: theme.colorScheme.primary,
      fontWeight: "bold",
    },
  });

export default createGanttChartMonthViewStyles;

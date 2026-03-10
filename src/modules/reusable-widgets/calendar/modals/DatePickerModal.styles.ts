/**
 * @file DatePickerModal.styles.ts
 * @description 日付ピッカーモーダルのスタイル定義ファイル。
 *              年・月・日選択画面で共通して使うレイアウトスタイルを提供する。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: react-native（StyleSheet, ViewStyle, TextStyle）, MD3Theme（テーマ型）
// インポート先: DatePickerModal.tsx

import { StyleSheet, ViewStyle, TextStyle } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

// --- ローカル型定義 ---

/**
 * DatePickerModalStyles のローカル定義
 *
 * ※ DatePickerModal.types.ts にも同じ型があるが、ここではスタイル生成の内部で使用。
 *    本来は types.ts からインポートして統一するのが望ましい設計。
 */
interface DatePickerModalStyles {
  modalOverlay: ViewStyle;
  modalContainer: ViewStyle;
  modalContent: ViewStyle;
  modalTitle: TextStyle;
  pickerContainer: ViewStyle;
  pickerItem: ViewStyle;
  selectedItem: ViewStyle;
  pickerText: TextStyle;
  selectedText: TextStyle;
  monthGrid: ViewStyle;
  monthItem: ViewStyle;
  monthItemText: TextStyle;
  modalButtons: ViewStyle;
  modalButton: ViewStyle;
  modalButtonText: TextStyle;
}

/**
 * createDatePickerModalStyles
 *
 * テーマを受け取り、日付ピッカーモーダルのスタイルを生成するファクトリ関数。
 *
 * @param theme - MD3テーマオブジェクト
 * @returns DatePickerModalStyles 型のスタイルオブジェクト
 */
export const createDatePickerModalStyles = (theme: MD3Theme) =>
  StyleSheet.create<DatePickerModalStyles>({
    // --- 半透明オーバーレイ ---
    // position: "absolute" + top/left/right/bottom: 0 で画面全体を覆う
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)", // 半透明の黒背景
      justifyContent: "center",               // 垂直方向中央
      alignItems: "center",                   // 水平方向中央
      position: "absolute",                   // 絶対位置指定
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,                           // 他の要素より手前に表示
    },
    // --- モーダルのコンテナ（位置決め用） ---
    modalContainer: {
      alignItems: "center",
      justifyContent: "center",
      maxWidth: "100%",
      position: "relative",                   // 子要素のabsolute配置の基準
    },
    // --- モーダルの内容エリア ---
    modalContent: {
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.medium,
      padding: theme.spacing.xxl,             // 大きめの内側余白
      width: "90%",
      maxWidth: 650,                          // 大画面でも大きくなりすぎない
      maxHeight: "100%",
      minWidth: 350,                          // 小さくなりすぎない最小幅
      ...theme.elevation.level5.shadow,       // 影（level5 = やや深い影）
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginHorizontal: "auto",              // 水平方向中央寄せ（Web向け）
    },
    // --- タイトルテキスト ---
    modalTitle: {
      ...theme.typography.titleMedium,
      fontWeight: "bold",
      textAlign: "center",                    // テキスト中央揃え
      marginBottom: theme.spacing.lg,
      color: theme.colorScheme.onSurface,
    },
    // --- 年選択リストのコンテナ ---
    pickerContainer: {
      maxHeight: 400,                         // スクロール可能な最大高さ
      width: "100%",
    },
    // --- 年選択リストの各行 ---
    pickerItem: {
      padding: 15,
      borderBottomWidth: 1,                   // 下線で区切り
      borderBottomColor: theme.colorScheme.outlineVariant,
      width: "100%",
    },
    // --- 選択中の行に適用する追加スタイル ---
    selectedItem: {
      // "#primary色" + "20" で透明度20(16進)のプライマリ色を背景にする
      // 16進の "20" は10進で32、つまり約12.5%の不透明度
      backgroundColor: theme.colorScheme.primary + "20",
    },
    // --- 年の数字テキスト ---
    pickerText: {
      ...theme.typography.bodyLarge,
      textAlign: "center",
      color: theme.colorScheme.onSurface,
    },
    // --- 選択中のテキストスタイル ---
    selectedText: {
      color: theme.colorScheme.primary,       // プライマリ色で目立たせる
      fontWeight: "bold",
    },
    // --- 月選択グリッド ---
    monthGrid: {
      flexDirection: "row",     // 横並び
      flexWrap: "wrap",         // 折り返しを有効にする（1行に収まらない場合は次の行へ）
      justifyContent: "space-around", // 均等に配置
      width: "100%",
      marginBottom: theme.spacing.md,
    },
    // --- 月選択の各アイテム ---
    monthItem: {
      width: "30%",             // 1行に約3つ並ぶ（30% × 3 = 90%）
      padding: 15,
      marginBottom: 10,
      borderRadius: theme.shape.small,
      alignItems: "center",
    },
    // --- 月アイテムのテキスト ---
    monthItemText: {
      ...theme.typography.bodyLarge,
      color: theme.colorScheme.onSurface,
    },
    // --- ボタン行 ---
    modalButtons: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: theme.spacing.lg,
      width: "100%",
    },
    // --- 各ボタン ---
    modalButton: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: 10,
      marginHorizontal: theme.spacing.sm,
      // "#primary色" + "10" で非常に薄いプライマリ色背景
      backgroundColor: theme.colorScheme.primary + "10",
      borderRadius: theme.shape.small,
    },
    // --- ボタンテキスト ---
    modalButtonText: {
      color: theme.colorScheme.primary,
      ...theme.typography.bodyLarge,
      fontWeight: "bold",
      textAlign: "center",
    },
  });

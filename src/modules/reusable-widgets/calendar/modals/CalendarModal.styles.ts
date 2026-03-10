/**
 * @file CalendarModal.styles.ts
 * @description カレンダーモーダルのスタイル定義ファイル。
 *              MD3テーマに応じた動的スタイル生成と、画面幅に基づくレスポンシブ計算を行う。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: react-native（StyleSheet, Platform, Dimensions）,
//              MD3Theme（テーマ型）, CalendarModal.types（スタイル型）
// インポート先: CalendarModal.tsx

import { StyleSheet, Platform, Dimensions } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";
import { CalendarModalStyles } from "./CalendarModal.types";

// --- 画面幅に基づくサイズ計算 ---

// Dimensions.get("window").width で画面の横幅を取得
const SCREEN_WIDTH = Dimensions.get("window").width;

// Math.min() で「画面幅 - 32px」と「400px」の小さい方を選ぶ。
// 小さい画面では画面幅に合わせ、大きい画面では400px以下に収める。
export const CALENDAR_WIDTH = Math.min(SCREEN_WIDTH - 32, 400);

// カレンダー幅を7（曜日数）で割って1日分の幅を計算
export const DAY_WIDTH = Math.floor(CALENDAR_WIDTH / 7);

/**
 * createCalendarModalStyles
 *
 * テーマを引数に受け取り、CalendarModal 用のスタイルを生成するファクトリ関数。
 * テーマの色・間隔・影を使うことで、ライト/ダークモードに対応する。
 *
 * StyleSheet.create<CalendarModalStyles>(...) のジェネリクス <CalendarModalStyles> は、
 * 「生成するスタイルオブジェクトが CalendarModalStyles の形であること」を保証する。
 * 型に定義されたプロパティが足りなかったり余分だったりするとコンパイルエラーになる。
 *
 * @param theme - MD3テーマオブジェクト
 * @returns CalendarModalStyles 型のスタイルオブジェクト
 */
export const createCalendarModalStyles = (theme: MD3Theme) =>
  StyleSheet.create<CalendarModalStyles>({
    // --- オーバーレイ: モーダル背景の半透明レイヤー ---
    overlay: {
      flex: 1,                          // 画面全体を占める（flex: 1 は「親の空きスペースをすべて使う」）
      backgroundColor: "rgba(0, 0, 0, 0.5)", // 黒の50%透明。rgba(赤, 緑, 青, 不透明度)
      justifyContent: "center",         // 子要素を垂直方向中央揃え
      alignItems: "center",             // 子要素を水平方向中央揃え
    },
    // --- コンテンツ: モーダル本体のカード ---
    content: {
      backgroundColor: theme.colorScheme.surface, // テーマの表面色（白系/暗色系）
      borderRadius: theme.shape.medium,            // 角丸サイズ（テーマで統一）
      // Platform.OS === "web": Web版では固定幅、ネイティブでは画面の90%幅
      width: Platform.OS === "web" ? CALENDAR_WIDTH : "90%",
      maxWidth: CALENDAR_WIDTH,                    // 最大幅制限
      padding: theme.spacing.lg,                   // 内側余白（テーマの大きめスペーシング）
      ...theme.elevation.level4.shadow,            // スプレッドで影スタイルを展開（浮き上がって見える効果）
    },
    // --- ヘッダー: タイトル行 ---
    header: {
      flexDirection: "row",             // 子要素を横並び（他: "column"=縦並び, "row-reverse"=逆順横並び）
      justifyContent: "space-between",  // 子要素を両端に配置（他: "center", "flex-start", "space-around"）
      alignItems: "center",            // 垂直方向中央揃え
      marginBottom: theme.spacing.lg,   // 下にスペースを確保
    },
    // --- タイトルテキスト ---
    title: {
      ...theme.typography.titleMedium,  // テーマのタイトル用タイポグラフィをスプレッド展開
      fontWeight: "600",                // やや太字
      color: theme.colorScheme.onSurface, // テーマの「表面の上」のテキスト色
    },
    // --- 閉じるボタン（✕マーク） ---
    closeButton: {
      fontSize: 20,
      color: theme.colorScheme.onSurfaceVariant, // やや薄めのテキスト色
      padding: theme.spacing.xs,                  // タップ領域確保のためのパディング
    },
    // --- カレンダー部分のコンテナ ---
    calendar: {
      borderWidth: 1,                              // 1pxの枠線
      borderColor: theme.colorScheme.outlineVariant, // 薄い枠線色
      borderRadius: theme.shape.small,              // 小さめの角丸
    },
    // --- カレンダーヘッダー（年月表示行） ---
    calendarHeader: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: theme.spacing.sm,
    },
    // --- 月テキスト ---
    monthText: {
      ...theme.typography.bodyLarge,
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
    },
    // --- フッター（ボタン行） ---
    footer: {
      flexDirection: "row",
      justifyContent: "flex-end",  // ボタンを右寄せ
      gap: theme.spacing.sm,      // ボタン間の間隔（gap は Flexbox の隙間設定）
      marginTop: theme.spacing.lg,
    },
    // --- ボタン共通スタイル ---
    button: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.shape.small,
      minWidth: 80,                     // 最小幅を確保してボタンが小さくなりすぎないように
      alignItems: "center",
    },
    // --- キャンセルボタン固有スタイル ---
    cancelButton: {
      backgroundColor: theme.colorScheme.surfaceContainerLowest, // 薄い背景色
    },
    // --- 確定ボタン固有スタイル ---
    confirmButton: {
      backgroundColor: theme.colorScheme.primary, // プライマリ色（青系）
    },
    // --- キャンセルボタンテキスト ---
    cancelButtonText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      fontWeight: "500",
    },
    // --- 確定ボタンテキスト ---
    confirmButtonText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onPrimary, // プライマリ色の上に乗るテキスト色（白系）
      fontWeight: "500",
    },
    // --- サブタイトル（「N日選択中」） ---
    subtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
    },
  });

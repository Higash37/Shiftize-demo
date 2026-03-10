/**
 * @file ui-constants.ts
 * @description シフトUI全体で共有されるスタイル定数と基本スタイルオブジェクト。
 *   画面サイズに応じてスペーシングやフォントサイズを切り替えるレスポンシブ対応を行う。
 */

/*
【このファイルの位置づけ】
  TimeSelect.styles.ts, TimeInputSection.styles.ts 等 → ★このファイル（定数・基本スタイル参照）
    └─ @/common/common-theme/ThemeColors（カラー定義）
    └─ @/common/common-constants/BoundaryConstants（ブレークポイント値）
*/

import { colors } from "@/common/common-theme/ThemeColors";
// StyleSheet: React Nativeでスタイルオブジェクトを最適化して作成するAPI
// Dimensions: デバイスの画面サイズを取得するAPI
import { StyleSheet, Dimensions } from "react-native";
import { BREAKPOINTS } from "@/common/common-constants/BoundaryConstants";

// --- レスポンシブデザイン用の定数 ---

// 分割代入 + リネーム: `Dimensions.get("window")` の返り値から `width` を取り出し、
// 変数名を `SCREEN_WIDTH` に変更している
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// 画面幅がブレークポイント未満なら「小さいデバイス」と判定
const IS_SMALL_DEVICE = SCREEN_WIDTH < BREAKPOINTS.SMALL_DEVICE_MAX_WIDTH_EXCLUSIVE;
// タブレット判定: 最小幅以上 かつ 最大幅未満
const IS_TABLET = SCREEN_WIDTH >= BREAKPOINTS.TABLET_MIN_WIDTH_INCLUSIVE && SCREEN_WIDTH < BREAKPOINTS.TABLET_MAX_WIDTH_EXCLUSIVE;


/**
 * シフトUI用の共通スタイル定数
 *
 * 三項演算子 `IS_SMALL_DEVICE ? 小さい値 : 通常値` で、
 * デバイスサイズに応じた値を切り替えている。
 */
export const shiftUIConstants = {
  // スペーシング（余白）: xs(極小)〜xl(極大)の5段階
  spacing: {
    xs: IS_SMALL_DEVICE ? 2 : 4,
    sm: IS_SMALL_DEVICE ? 6 : 8,
    md: IS_SMALL_DEVICE ? 12 : 16,
    lg: IS_SMALL_DEVICE ? 20 : 24,
    xl: IS_SMALL_DEVICE ? 28 : 32,
  },
  // 角丸の半径
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
  },
  // フォントサイズ
  fontSize: {
    sm: IS_SMALL_DEVICE ? 10 : 12,
    md: IS_SMALL_DEVICE ? 12 : 14,
    lg: IS_SMALL_DEVICE ? 14 : 16,
    xl: IS_SMALL_DEVICE ? 16 : 18,
  },
};

/**
 * 共通のスタイルミキシン（基本スタイル集）
 *
 * StyleSheet.create() で作成するとReact Nativeが内部で最適化する。
 * 他のスタイルファイルでスプレッド演算子 `...shiftUIStyles.container` のように
 * 展開して再利用できる。
 */
export const shiftUIStyles = StyleSheet.create({
  // 各コンポーネントの外枠
  container: {
    backgroundColor: colors.background,
    borderRadius: shiftUIConstants.borderRadius.md,
    padding: shiftUIConstants.spacing.md,
  },
  // セクション間の余白
  section: {
    marginBottom: shiftUIConstants.spacing.lg,
  },
  // セクションタイトル
  title: {
    fontSize: shiftUIConstants.fontSize.lg,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: shiftUIConstants.spacing.sm,
  },
  // フォームラベル
  label: {
    fontSize: shiftUIConstants.fontSize.md,
    color: colors.text.secondary,
    marginBottom: shiftUIConstants.spacing.xs,
  },
  // テキスト入力風のボタン（タップで選択UIを開く）
  input: {
    padding: shiftUIConstants.spacing.md,
    backgroundColor: colors.surface,
    borderRadius: shiftUIConstants.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  // プライマリボタン
  // alignItems: "center" は子要素を水平中央に配置（"flex-start" で左寄せ, "flex-end" で右寄せも可能）
  // justifyContent: "center" は子要素を垂直中央に配置
  button: {
    padding: shiftUIConstants.spacing.md,
    backgroundColor: colors.primary,
    borderRadius: shiftUIConstants.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  // ボタン内テキスト
  buttonText: {
    color: colors.text.white,
    fontSize: shiftUIConstants.fontSize.md,
    fontWeight: "bold",
  },
  // アイコンのデフォルト色
  icon: {
    color: colors.text.primary,
  },
});

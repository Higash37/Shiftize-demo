/**
 * @file ThemeColors.ts
 * @description レガシーテーマ用の色定義の再エクスポートファイル。
 *
 * 【このファイルの位置づけ】
 * - common-constants/ColorConstants.ts で定義された colors を再エクスポートしている
 * - ThemeDefinition.ts から参照される
 * - 古いコードとの互換性維持のために存在する
 * - 関連ファイル: ColorConstants.ts（色の実体定義）, ThemeDefinition.ts（テーマの組み立て）
 *
 * 【なぜ再エクスポートするのか】
 * テーマの色定義と定数の色定義を同じにすることで、
 * `import { colors } from "ThemeColors"` と書ける。
 * テーマ経由のインポートパスを提供するための薄いラッパー。
 *
 * @deprecated 新規コードでは `useMD3Theme().colorScheme` を使用する
 */
export { colors } from "../common-constants/ColorConstants";

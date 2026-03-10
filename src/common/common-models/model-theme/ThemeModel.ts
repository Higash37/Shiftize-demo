/**
 * @file ThemeModel.ts
 * @description レガシーテーマシステムの型定義
 */
import { ColorsType } from "@/common/common-constants/ColorConstants";
import { LayoutType } from "@/common/common-constants/LayoutConstants";
import { ShadowsType } from "@/common/common-constants/ShadowConstants";
import { TypographyType } from "@/common/common-constants/TypographyConstants";

/** テーマオブジェクトの構造 */
export interface Theme {
  /** カラーパレット */
  colors: ColorsType;
  /** フォントサイズ・ウェイト等 */
  typography: TypographyType;
  /** パディング・角丸等 */
  layout: LayoutType;
  /** シャドウスタイル */
  shadows: ShadowsType;
}

/** テーマ拡張用のエイリアス */
export type ExtendedTheme = Theme;

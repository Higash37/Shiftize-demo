/**
 * @file ThemeConstants.ts
 * @description レガシーテーマ定数の集約エクスポート。新規コードではMD3テーマを使用すること
 */
import { colors, ColorsType } from "./ColorConstants";
import { typography, TypographyType } from "./TypographyConstants";
import { layout, LayoutType } from "./LayoutConstants";
import { shadows, ShadowsType } from "./ShadowConstants";

/** テーマオブジェクト全体の型 */
export interface ThemeType {
  colors: ColorsType;
  typography: TypographyType;
  layout: LayoutType;
  shadows: ShadowsType;
}

/** レガシーテーマ定数のまとめオブジェクト */
export const theme: ThemeType = {
  colors,
  typography,
  layout,
  shadows,
};

export { colors } from "./ColorConstants";
export { typography } from "./TypographyConstants";
export { layout } from "./LayoutConstants";
export { shadows } from "./ShadowConstants";

/**
 * テーマ設定をまとめたファイル
 * 各種定数は個別のファイルに定義し、このファイルからエクスポートしています
 */
import { colors, ColorsType } from "./ColorConstants";
import { typography, TypographyType } from "./TypographyConstants";
import { layout, LayoutType } from "./LayoutConstants";
import { shadows, ShadowsType } from "./ShadowConstants";

export interface ThemeType {
  colors: ColorsType;
  typography: TypographyType;
  layout: LayoutType;
  shadows: ShadowsType;
}

export const theme: ThemeType = {
  colors,
  typography,
  layout,
  shadows,
};

// 個別のエクスポート
export { colors, typography, layout, shadows };

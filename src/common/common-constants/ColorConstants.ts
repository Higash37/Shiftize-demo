/**
 * @file ColorConstants.ts
 * @description レガシー互換カラー定義。MD3ライトスキームからの導出ブリッジ
 * @deprecated 新規コードでは useMD3Theme().colorScheme を使用
 */
import { ShiftStatus } from "../common-models/model-shift/shiftTypes";
import { lightColorScheme } from "../common-theme/md3/MD3Colors";

/** レガシーテーマ用のカラー型定義 */
export type ColorsType = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  text: {
    primary: string;
    secondary: string;
    white: string;
    disabled: string;
  };
  border: string;
  overlay: string;
  header: {
    background: string;
    tint: string;
    separator: string;
  };
  footer: {
    background: string;
    tint: string;
    separator: string;
  };
  error: string;
  success: string;
  warning: string;
  selected: string;
  shift: Record<ShiftStatus, string>;
  status: Record<ShiftStatus, string>;
};

const cs = lightColorScheme;

export const colors: ColorsType = {
  primary: cs.primary,
  secondary: cs.secondary,
  background: cs.surface,
  surface: cs.surfaceContainerLowest,
  surfaceElevated: cs.surfaceContainerHigh,
  text: {
    primary: cs.onSurface,
    secondary: cs.onSurfaceVariant,
    white: "#FFFFFF",
    disabled: cs.outlineVariant,
  },
  border: cs.outlineVariant,
  overlay: "rgba(255, 255, 255, 0.6)",
  header: {
    background: cs.surfaceContainer,
    tint: cs.primary,
    separator: cs.outlineVariant,
  },
  footer: {
    background: cs.surfaceContainer,
    tint: cs.primary,
    separator: cs.outlineVariant,
  },
  error: cs.error,
  success: cs.success,
  warning: cs.warning,
  selected: cs.primaryContainer,
  shift: cs.shift,
  status: cs.shift,
};

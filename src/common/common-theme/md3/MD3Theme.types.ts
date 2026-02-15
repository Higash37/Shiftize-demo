import { MD3ColorScheme } from "./MD3Colors";
import { MD3TypeScale } from "./MD3Typography";
import { MD3ShapeScale } from "./MD3Shape";
import { MD3ElevationScale } from "./MD3Elevation";
import { MD3SpacingScale } from "./MD3Spacing";

/**
 * Material Design 3 統合テーマ型
 *
 * アプリ全体で使用するデザイントークンの集合体
 * useMD3Theme() フックから取得可能
 */
export interface MD3Theme {
  /** MD3カラーロール */
  colorScheme: MD3ColorScheme;
  /** MD3タイポグラフィスケール (15段階) */
  typography: MD3TypeScale;
  /** MD3シェイプスケール (角丸) */
  shape: MD3ShapeScale;
  /** MD3エレベーションスケール (Level 0-5) */
  elevation: MD3ElevationScale;
  /** MD3スペーシンググリッド (4dp base) */
  spacing: MD3SpacingScale;
}

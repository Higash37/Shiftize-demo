/**
 * @file MD3Theme.types.ts
 * @description Material Design 3 テーマの統合型定義。
 *
 * 【このファイルの位置づけ】
 * - MD3テーマの全トークン（色、文字、角丸、影、余白）を1つの型にまとめる
 * - useMD3Theme() フックの戻り値の型として使用される
 * - 関連ファイル: MD3Colors.ts, MD3Typography.ts, MD3Shape.ts, MD3Elevation.ts, MD3Spacing.ts
 *
 * 【Material Design 3 (MD3) とは】
 * Googleが策定したデザインシステム。色・文字・形状等のルールを統一し、
 * 一貫性のあるUIを構築するためのガイドライン。
 *
 * 【TypeScript構文の解説】
 * - `interface` → オブジェクトの構造（プロパティ名と型）を定義する
 * - `import type` → 型のみをインポート。ランタイムのJSコードに影響しない
 */

import { MD3ColorScheme } from "./MD3Colors";
import { MD3TypeScale } from "./MD3Typography";
import { MD3ShapeScale } from "./MD3Shape";
import { MD3ElevationScale } from "./MD3Elevation";
import { MD3SpacingScale } from "./MD3Spacing";

/**
 * MD3Theme - Material Design 3 テーマの統合型
 *
 * アプリ全体で使用するデザイントークンの集合体。
 * 各コンポーネントはこの型を通じて一貫したデザインにアクセスする。
 *
 * 【デザイントークンとは】
 * デザインの決定事項（色、フォントサイズ、余白等）を変数として管理する仕組み。
 * ハードコードされた値（例: "#FF0000"）の代わりにトークン（例: colorScheme.error）を
 * 使うことで、テーマ変更時に全体を一括変更できる。
 */
export interface MD3Theme {
  /** MD3カラーロール - primary, secondary, surface等の色定義 */
  colorScheme: MD3ColorScheme;
  /** MD3タイポグラフィスケール - displayLarge～labelSmallの15段階の文字スタイル */
  typography: MD3TypeScale;
  /** MD3シェイプスケール - extraSmall～fullの角丸サイズ定義 */
  shape: MD3ShapeScale;
  /** MD3エレベーションスケール - Level 0～5の影の深さ定義 */
  elevation: MD3ElevationScale;
  /** MD3スペーシンググリッド - 4dpを基本単位とした余白サイズ定義 */
  spacing: MD3SpacingScale;
}

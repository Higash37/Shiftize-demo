/** @file util-settings/index.ts @description 設定関連モジュールのバレルファイル。useAppSettings フックと SettingsContext をまとめて公開する。 */

// useAppSettings フックと各バリデーション関数をエクスポート
export {
  useAppSettings,
  validateShiftRuleSettings,
  validateAppearanceSettings,
  validateHolidaySettings,
} from "./useAppSettings";

// React Context を使った設定プロバイダーとフック
export { SettingsProvider, useSettings } from "./SettingsContext";

// ── `export type` について ──
// `export type` は型情報だけをエクスポートする構文。
// ランタイム（実行時）には存在せず、TypeScript のコンパイル時のみ使われる。
// バンドルサイズに影響しないので、型は `export type` で公開するのがベスト。
export type {
  AppSettings,
  ShiftRuleSettings,
  ShiftAppearanceSettings,
  HolidaySettings,
} from "./useAppSettings";

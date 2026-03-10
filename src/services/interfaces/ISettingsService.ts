/** @file ISettingsService.ts @description アプリ設定の取得・保存・監視を行うサービスのインターフェース */

import type { AppSettings } from "@/common/common-utils/util-settings/useAppSettings";

/** アプリ設定の管理サービス */
export interface ISettingsService {
  /** 現在の設定を取得する */
  getSettings(): Promise<AppSettings | null>;

  /** 設定を部分的に保存する */
  saveSettings(settings: Partial<AppSettings>): Promise<void>;

  /** 設定をデフォルト値にリセットする */
  resetSettings(defaults: AppSettings): Promise<void>;

  /** 設定変更をリアルタイム監視する */
  onSettingsChanged(callback: (settings: AppSettings | null) => void): () => void;

  /** シフトステータス設定の変更をリアルタイム監視する */
  onShiftStatusConfigChanged(callback: (configs: Record<string, any> | null) => void): () => void;
}

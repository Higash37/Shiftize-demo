import type { AppSettings } from "@/common/common-utils/util-settings/useAppSettings";

export interface ISettingsService {
  getSettings(): Promise<AppSettings | null>;

  saveSettings(settings: Partial<AppSettings>): Promise<void>;

  resetSettings(defaults: AppSettings): Promise<void>;

  onSettingsChanged(callback: (settings: AppSettings | null) => void): () => void;

  onShiftStatusConfigChanged(callback: (configs: Record<string, any> | null) => void): () => void;
}

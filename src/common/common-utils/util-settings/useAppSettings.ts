import { useState, useEffect, useCallback } from "react";
import { ServiceProvider } from "@/services/ServiceProvider";

export interface ShiftRuleSettings {
  maxWorkHours: number;
  minBreakMinutes: number;
  maxConsecutiveDays: number;
  weekStartDay: number; // 0: 日曜日, 1: 月曜日
  shiftTimeUnit: number; // 15, 30, 60分単位
  allowOvertime: boolean;
  maxOvertimeHours: number;
  minShiftHours: number;
  maxShiftGap: number; // シフト間の最大間隔（日）
}

export interface ShiftAppearanceSettings {
  primaryColor?: string;
  accentColor?: string;
  fontSize: "small" | "medium" | "large";
  compactMode: boolean;
  showWeekNumbers: boolean;
  calendarView: "month" | "week" | "day";
  language: "ja" | "en";
}

export interface HolidaySettings {
  holidays: Array<{
    id: string;
    date: string;
    name: string;
    type: "national" | "custom";
  }>;
  specialDays: Array<{
    id: string;
    date: string;
    name: string;
    type: "special" | "event";
    workingDay?: boolean;
  }>;
}

export interface AppSettings {
  shiftRule: ShiftRuleSettings;
  appearance: ShiftAppearanceSettings;
  holidays: HolidaySettings;
}

const DEFAULT_SETTINGS: AppSettings = {
  shiftRule: {
    maxWorkHours: 8,
    minBreakMinutes: 60,
    maxConsecutiveDays: 5,
    weekStartDay: 1, // 月曜日開始
    shiftTimeUnit: 30, // 30分単位
    allowOvertime: true,
    maxOvertimeHours: 3,
    minShiftHours: 2,
    maxShiftGap: 7,
  },
  appearance: {
    fontSize: "medium" as const,
    compactMode: false,
    showWeekNumbers: false,
    calendarView: "month" as const,
    language: "ja" as const,
  },
  holidays: {
    holidays: [],
    specialDays: [],
  },
};

// 設定値のバリデーション
export const validateShiftRuleSettings = (
  settings: ShiftRuleSettings
): string[] => {
  const errors: string[] = [];

  if (settings.maxWorkHours < 1 || settings.maxWorkHours > 24) {
    errors.push("最大勤務時間は1時間から24時間の間で設定してください");
  }

  if (settings.minBreakMinutes < 0 || settings.minBreakMinutes > 480) {
    errors.push("最小休憩時間は0分から480分の間で設定してください");
  }

  if (settings.maxConsecutiveDays < 1 || settings.maxConsecutiveDays > 14) {
    errors.push("連勤制限は1日から14日の間で設定してください");
  }

  if (settings.weekStartDay < 0 || settings.weekStartDay > 6) {
    errors.push("週の開始日は0（日曜日）から6（土曜日）の間で設定してください");
  }

  if (![15, 30, 60].includes(settings.shiftTimeUnit)) {
    errors.push("シフト時間単位は15分、30分、60分のいずれかを選択してください");
  }

  if (settings.maxOvertimeHours < 0 || settings.maxOvertimeHours > 12) {
    errors.push("最大残業時間は0時間から12時間の間で設定してください");
  }

  if (
    settings.minShiftHours < 1 ||
    settings.minShiftHours > settings.maxWorkHours
  ) {
    errors.push("最小シフト時間は1時間から最大勤務時間以下で設定してください");
  }

  if (settings.maxShiftGap < 1 || settings.maxShiftGap > 30) {
    errors.push("最大シフト間隔は1日から30日の間で設定してください");
  }

  return errors;
};

export const validateAppearanceSettings = (
  settings: ShiftAppearanceSettings
): string[] => {
  const errors: string[] = [];

  if (!["small", "medium", "large"].includes(settings.fontSize)) {
    errors.push(
      "フォントサイズは small、medium、large のいずれかを選択してください"
    );
  }

  if (!["month", "week", "day"].includes(settings.calendarView)) {
    errors.push(
      "カレンダー表示は month、week、day のいずれかを選択してください"
    );
  }

  if (!["ja", "en"].includes(settings.language)) {
    errors.push("言語は ja または en を選択してください");
  }

  return errors;
};

export const validateHolidaySettings = (
  settings: HolidaySettings
): string[] => {
  const errors: string[] = [];

  // 祝日の重複チェック
  const holidayDates = settings.holidays.map((h) => h.date);
  const duplicateHolidayDates = holidayDates.filter(
    (date, index) => holidayDates.indexOf(date) !== index
  );
  if (duplicateHolidayDates.length > 0) {
    errors.push(`重複する祝日があります: ${duplicateHolidayDates.join(", ")}`);
  }

  // 特別日の重複チェック
  const specialDayDates = settings.specialDays.map((s) => s.date);
  const duplicateSpecialDayDates = specialDayDates.filter(
    (date, index) => specialDayDates.indexOf(date) !== index
  );
  if (duplicateSpecialDayDates.length > 0) {
    errors.push(
      `重複する特別日があります: ${duplicateSpecialDayDates.join(", ")}`
    );
  }

  // 祝日と特別日の重複チェック
  const allDates = [...holidayDates, ...specialDayDates];
  const duplicateAllDates = allDates.filter(
    (date, index) => allDates.indexOf(date) !== index
  );
  if (duplicateAllDates.length > 0) {
    errors.push(
      `祝日と特別日で重複する日付があります: ${duplicateAllDates.join(", ")}`
    );
  }

  return errors;
};

const mergeWithDefaults = (data: any): AppSettings => {
  const shiftRule = data?.shiftRule;
  const appearance = data?.appearance;
  const holidays = data?.holidays;

  return {
    shiftRule: shiftRule
      ? { ...DEFAULT_SETTINGS.shiftRule, ...shiftRule }
      : DEFAULT_SETTINGS.shiftRule,
    appearance: appearance
      ? { ...DEFAULT_SETTINGS.appearance, ...appearance }
      : DEFAULT_SETTINGS.appearance,
    holidays: holidays
      ? {
          ...DEFAULT_SETTINGS.holidays,
          ...holidays,
          holidays: holidays.holidays ?? DEFAULT_SETTINGS.holidays.holidays,
          specialDays:
            holidays.specialDays ?? DEFAULT_SETTINGS.holidays.specialDays,
        }
      : DEFAULT_SETTINGS.holidays,
  };
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 設定の読み込み
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ServiceProvider.settings.getSettings();

      if (data) {
        setSettings(mergeWithDefaults(data));
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
      setError(null);
    } catch {
      setError("設定の読み込みに失敗しました");
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  // 設定の保存
  const saveSettings = useCallback(
    async (newSettings: Partial<AppSettings>) => {
      try {
        await ServiceProvider.settings.saveSettings(newSettings);

        setSettings((prevSettings) => ({
          ...prevSettings,
          ...newSettings,
        }));
        setError(null);
      } catch (err) {
        setError("設定の保存に失敗しました");
        throw err;
      }
    },
    []
  );

  // シフトルール設定の更新
  const updateShiftRuleSettings = useCallback(
    async (shiftRuleSettings: Partial<ShiftRuleSettings>) => {
      const newSettings = {
        shiftRule: {
          ...settings.shiftRule,
          ...shiftRuleSettings,
        },
      };
      await saveSettings(newSettings);
    },
    [settings.shiftRule, saveSettings]
  );

  // 外観設定の更新
  const updateAppearanceSettings = useCallback(
    async (appearanceSettings: Partial<ShiftAppearanceSettings>) => {
      const newSettings = {
        appearance: {
          ...settings.appearance,
          ...appearanceSettings,
        },
      };
      await saveSettings(newSettings);
    },
    [settings.appearance, saveSettings]
  );

  // 祝日設定の更新
  const updateHolidaySettings = useCallback(
    async (holidaySettings: Partial<HolidaySettings>) => {
      const newSettings = {
        holidays: {
          ...settings.holidays,
          ...holidaySettings,
        },
      };
      await saveSettings(newSettings);
    },
    [settings.holidays, saveSettings]
  );

  // 祝日の追加
  const addHoliday = useCallback(
    async (holiday: Omit<HolidaySettings["holidays"][0], "id">) => {
      const newHoliday = {
        ...holiday,
        id: Date.now().toString(),
      };

      const updatedHolidays = [...settings.holidays.holidays, newHoliday];
      await updateHolidaySettings({ holidays: updatedHolidays });
    },
    [settings.holidays.holidays, updateHolidaySettings]
  );

  // 祝日の削除
  const removeHoliday = useCallback(
    async (holidayId: string) => {
      const updatedHolidays = settings.holidays.holidays.filter(
        (h) => h.id !== holidayId
      );
      await updateHolidaySettings({ holidays: updatedHolidays });
    },
    [settings.holidays.holidays, updateHolidaySettings]
  );

  // 特別日の追加
  const addSpecialDay = useCallback(
    async (specialDay: Omit<HolidaySettings["specialDays"][0], "id">) => {
      const newSpecialDay = {
        ...specialDay,
        id: Date.now().toString(),
      };

      const updatedSpecialDays = [
        ...settings.holidays.specialDays,
        newSpecialDay,
      ];
      await updateHolidaySettings({ specialDays: updatedSpecialDays });
    },
    [settings.holidays.specialDays, updateHolidaySettings]
  );

  // 特別日の削除
  const removeSpecialDay = useCallback(
    async (specialDayId: string) => {
      const updatedSpecialDays = settings.holidays.specialDays.filter(
        (s) => s.id !== specialDayId
      );
      await updateHolidaySettings({ specialDays: updatedSpecialDays });
    },
    [settings.holidays.specialDays, updateHolidaySettings]
  );

  // 日付が祝日かどうかをチェック
  const isHoliday = useCallback(
    (date: string): boolean => {
      return settings.holidays.holidays.some(
        (holiday) => holiday.date === date
      );
    },
    [settings.holidays.holidays]
  );

  // 日付が特別日かどうかをチェック
  const isSpecialDay = useCallback(
    (date: string): boolean => {
      return settings.holidays.specialDays.some(
        (specialDay) => specialDay.date === date
      );
    },
    [settings.holidays.specialDays]
  );

  // 日付の祝日情報を取得
  const getHolidayInfo = useCallback(
    (date: string) => {
      const holiday = settings.holidays.holidays.find((h) => h.date === date);
      const specialDay = settings.holidays.specialDays.find(
        (s) => s.date === date
      );

      return {
        isHoliday: !!holiday,
        isSpecialDay: !!specialDay,
        holidayName: holiday?.name,
        specialDayName: specialDay?.name,
        isWorkingDay: specialDay?.workingDay,
      };
    },
    [settings.holidays]
  );

  // 設定のリセット
  const resetSettings = useCallback(async () => {
    try {
      await ServiceProvider.settings.resetSettings(DEFAULT_SETTINGS);
      setSettings(DEFAULT_SETTINGS);
      setError(null);
    } catch (err) {
      setError("設定のリセットに失敗しました");
      throw err;
    }
  }, []);

  // 設定のエクスポート
  const exportSettings = useCallback(() => {
    try {
      const settingsJson = JSON.stringify(settings, null, 2);
      return settingsJson;
    } catch {
      throw new Error("設定のエクスポートに失敗しました");
    }
  }, [settings]);

  // 設定のインポート
  const importSettings = useCallback(async (settingsJson: string) => {
    try {
      const importedSettings = JSON.parse(settingsJson) as AppSettings;

      // バリデーション
      const shiftRuleErrors = validateShiftRuleSettings(
        importedSettings.shiftRule
      );
      const appearanceErrors = validateAppearanceSettings(
        importedSettings.appearance
      );
      const holidayErrors = validateHolidaySettings(importedSettings.holidays);

      const allErrors = [
        ...shiftRuleErrors,
        ...appearanceErrors,
        ...holidayErrors,
      ];
      if (allErrors.length > 0) {
        throw new Error(`設定の検証エラー:\n${allErrors.join("\n")}`);
      }

      // 設定を保存
      await ServiceProvider.settings.saveSettings(importedSettings);
      setSettings(importedSettings);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      } else {
        setError("設定のインポートに失敗しました");
        throw new Error("設定のインポートに失敗しました");
      }
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // リアルタイム更新のリスナー設定
  useEffect(() => {
    const unsubscribe = ServiceProvider.settings.onSettingsChanged((data) => {
      if (data) {
        setSettings(mergeWithDefaults(data));
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    settings,
    loading,
    error,

    // 基本操作
    loadSettings,
    saveSettings,

    // 個別設定更新
    updateShiftRuleSettings,
    updateAppearanceSettings,
    updateHolidaySettings,

    // 祝日・特別日操作
    addHoliday,
    removeHoliday,
    addSpecialDay,
    removeSpecialDay,

    // 日付チェック関数
    isHoliday,
    isSpecialDay,
    getHolidayInfo,

    // 設定管理機能
    resetSettings,
    exportSettings,
    importSettings,
  };
};

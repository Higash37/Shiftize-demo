/** @file useAppSettings.ts @description アプリ設定の読み込み・保存・バリデーションを管理するカスタムフック。シフトルール、外観、祝日の3カテゴリの設定を扱う。 */

// ── React フックのインポート ──
// useState: コンポーネント内で状態（値）を管理する
// useEffect: コンポーネントのマウント時や値の変化時に副作用（API呼び出しなど）を実行する
// useCallback: 関数をメモ化して、不要な再生成を防ぐ（パフォーマンス最適化）
import { useState, useEffect, useCallback } from "react";
import { ServiceProvider } from "@/services/ServiceProvider";

// ══════════════════════════════════════════
// 型定義（interface）
// ══════════════════════════════════════════

/**
 * シフトルール設定の型
 * 勤務時間の上限・休憩時間・連勤制限などのビジネスルールを定義する
 */
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

/**
 * 外観設定の型
 *
 * ── `?`（オプショナルプロパティ）について ──
 * `primaryColor?: string` の `?` は「あってもなくてもいい」という意味。
 * 型としては `string | undefined` と同じ。
 *
 * ── リテラル型のユニオンについて ──
 * `fontSize: "small" | "medium" | "large"` は、この3つの文字列しか代入できない。
 * 普通の string より厳密で、タイポをコンパイル時に検出できる。
 */
export interface ShiftAppearanceSettings {
  primaryColor?: string;
  accentColor?: string;
  fontSize: "small" | "medium" | "large";
  compactMode: boolean;
  showWeekNumbers: boolean;
  calendarView: "month" | "week" | "day";
  language: "ja" | "en";
}

/**
 * 祝日設定の型
 *
 * ── `Array<{ ... }>` について ──
 * オブジェクト型の配列。各要素は id, date, name, type を持つ。
 * `{ id: string; ... }[]` と書いても同じ。
 */
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
    workingDay?: boolean; // true なら特別日でも出勤日扱い
  }>;
}

/**
 * アプリ設定の全体型
 * 上記の3つの設定カテゴリをまとめたもの
 */
export interface AppSettings {
  shiftRule: ShiftRuleSettings;
  appearance: ShiftAppearanceSettings;
  holidays: HolidaySettings;
}

// ══════════════════════════════════════════
// デフォルト値
// ══════════════════════════════════════════

/**
 * 設定のデフォルト値
 * 初回起動時や設定読み込み失敗時に使われる
 *
 * ── `as const` について ──
 * `"medium" as const` は、型を `string` ではなく `"medium"` という
 * リテラル型に固定する。これにより ShiftAppearanceSettings の
 * fontSize: "small" | "medium" | "large" に正しく代入できる。
 */
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

// ══════════════════════════════════════════
// バリデーション関数
// ══════════════════════════════════════════

/**
 * シフトルール設定のバリデーション
 * 各フィールドの値が妥当な範囲にあるかチェックし、エラーメッセージの配列を返す
 *
 * @param settings - チェックするシフトルール設定
 * @returns エラーメッセージの配列（エラーがなければ空配列）
 *
 * 呼び出し元: importSettings(), 設定保存時の事前チェック
 */
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

  // .includes() で配列の中に値が含まれるかチェック
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

/**
 * 外観設定のバリデーション
 *
 * @param settings - チェックする外観設定
 * @returns エラーメッセージの配列
 */
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

/**
 * 祝日設定のバリデーション
 * 祝日・特別日の日付重複をチェックする
 *
 * @param settings - チェックする祝日設定
 * @returns エラーメッセージの配列
 *
 * ── 重複検出のアルゴリズム ──
 * 1. 配列の各要素の date を map で取り出す
 * 2. filter で「初出のインデックス !== 現在のインデックス」の要素だけ残す → 重複
 */
export const validateHolidaySettings = (
  settings: HolidaySettings
): string[] => {
  const errors: string[] = [];

  // 祝日の重複チェック
  const holidayDates = settings.holidays.map((h) => h.date);
  // indexOf は最初に見つかったインデックスを返す。
  // 2回目以降の同じ値は index !== indexOf(date) になるので重複と判定できる
  const duplicateHolidayDates = holidayDates.filter(
    (date, index) => holidayDates.indexOf(date) !== index
  );
  if (duplicateHolidayDates.length > 0) {
    errors.push(`重複する祝日があります: ${duplicateHolidayDates.join(", ")}`);
  }

  // 特別日の重複チェック（同じロジック）
  const specialDayDates = settings.specialDays.map((s) => s.date);
  const duplicateSpecialDayDates = specialDayDates.filter(
    (date, index) => specialDayDates.indexOf(date) !== index
  );
  if (duplicateSpecialDayDates.length > 0) {
    errors.push(
      `重複する特別日があります: ${duplicateSpecialDayDates.join(", ")}`
    );
  }

  // 祝日と特別日の間の重複チェック
  // スプレッド構文 `...` で2つの配列を1つに結合
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

// ══════════════════════════════════════════
// ヘルパー関数
// ══════════════════════════════════════════

/**
 * サーバーから取得したデータにデフォルト値をマージする関数
 *
 * サーバーのデータに欠落しているフィールドがあっても、デフォルト値で補完する。
 * `{ ...DEFAULT, ...serverData }` でスプレッド構文を使い、
 * DEFAULT を先に展開し、serverData で上書きする。
 *
 * @param data - サーバーから取得した設定データ（any 型）
 * @returns デフォルト値で補完された AppSettings
 *
 * ── `any` 型について ──
 * any はどんな型でも代入できる「何でもあり」の型。
 * サーバーから返ってくるデータは型が保証できないため、ここでは any を使っている。
 * 本来は Zod などでバリデーションしてから型をつけるのがベスト。
 *
 * ── `??`（Nullish Coalescing）について ──
 * `holidays.holidays ?? DEFAULT` は「holidays.holidays が null または undefined なら DEFAULT を使う」という意味。
 * `||` と似ているが、`??` は 0 や "" を false 扱いしないのが違い。
 */
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

// ══════════════════════════════════════════
// メインのカスタムフック
// ══════════════════════════════════════════

/**
 * アプリ設定を管理するカスタムフック
 *
 * ── カスタムフックとは ──
 * `use` で始まる関数は React のカスタムフック。
 * useState や useEffect を内部で使い、ロジックを再利用可能にまとめたもの。
 *
 * @returns 設定値と操作関数一式（settings, loadSettings, saveSettings, ...）
 *
 * 呼び出し元: SettingsContext.tsx の SettingsProvider
 */
export const useAppSettings = () => {
  // ── useState の型パラメータ ──
  // useState<AppSettings>(DEFAULT_SETTINGS) は、
  // 「AppSettings 型の状態を DEFAULT_SETTINGS で初期化する」という意味。
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── 設定の読み込み ──
  // useCallback で関数をメモ化。依存配列 [] が空なので、この関数は1回だけ生成される
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
      // finally は成功・失敗に関わらず最後に必ず実行される
      setLoading(false);
    }
  }, []);

  // ── 設定の保存 ──
  const saveSettings = useCallback(
    async (newSettings: Partial<AppSettings>) => {
      try {
        await ServiceProvider.settings.saveSettings(newSettings);

        // prevSettings を使って既存の設定に新しい設定をマージ
        // setState に関数を渡すと、最新の state を引数として受け取れる（安全なパターン）
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

  // ── シフトルール設定の更新 ──
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

  // ── 外観設定の更新 ──
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

  // ── 祝日設定の更新 ──
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

  // ── 祝日の追加 ──
  // Omit<HolidaySettings["holidays"][0], "id"> → 祝日オブジェクトから id を除いた型
  // id は Date.now() で自動生成するので、呼び出し側は渡さない
  const addHoliday = useCallback(
    async (holiday: Omit<HolidaySettings["holidays"][0], "id">) => {
      const newHoliday = {
        ...holiday,
        // Date.now() はミリ秒のタイムスタンプを返す。簡易的なユニークID生成
        id: Date.now().toString(),
      };

      // スプレッド構文で既存の配列に新しい要素を追加した新しい配列を作る
      const updatedHolidays = [...settings.holidays.holidays, newHoliday];
      await updateHolidaySettings({ holidays: updatedHolidays });
    },
    [settings.holidays.holidays, updateHolidaySettings]
  );

  // ── 祝日の削除 ──
  const removeHoliday = useCallback(
    async (holidayId: string) => {
      // filter で指定IDと一致しない要素だけ残す = そのIDの要素を削除
      const updatedHolidays = settings.holidays.holidays.filter(
        (h) => h.id !== holidayId
      );
      await updateHolidaySettings({ holidays: updatedHolidays });
    },
    [settings.holidays.holidays, updateHolidaySettings]
  );

  // ── 特別日の追加（祝日追加と同じパターン） ──
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

  // ── 特別日の削除 ──
  const removeSpecialDay = useCallback(
    async (specialDayId: string) => {
      const updatedSpecialDays = settings.holidays.specialDays.filter(
        (s) => s.id !== specialDayId
      );
      await updateHolidaySettings({ specialDays: updatedSpecialDays });
    },
    [settings.holidays.specialDays, updateHolidaySettings]
  );

  // ── 日付が祝日かどうかをチェック ──
  // .some() は配列の中に条件を満たす要素が1つでもあれば true を返す
  const isHoliday = useCallback(
    (date: string): boolean => {
      return settings.holidays.holidays.some(
        (holiday) => holiday.date === date
      );
    },
    [settings.holidays.holidays]
  );

  // ── 日付が特別日かどうかをチェック ──
  const isSpecialDay = useCallback(
    (date: string): boolean => {
      return settings.holidays.specialDays.some(
        (specialDay) => specialDay.date === date
      );
    },
    [settings.holidays.specialDays]
  );

  // ── 日付の祝日情報を取得 ──
  // .find() は条件を満たす最初の要素を返す（見つからなければ undefined）
  const getHolidayInfo = useCallback(
    (date: string) => {
      const holiday = settings.holidays.holidays.find((h) => h.date === date);
      const specialDay = settings.holidays.specialDays.find(
        (s) => s.date === date
      );

      return {
        // `!!holiday` はオブジェクトを boolean に変換する。
        // holiday が undefined なら false、値があれば true
        isHoliday: !!holiday,
        isSpecialDay: !!specialDay,
        // `?.` はオプショナルチェーン。holiday が undefined なら name にアクセスせず undefined を返す
        holidayName: holiday?.name,
        specialDayName: specialDay?.name,
        isWorkingDay: specialDay?.workingDay,
      };
    },
    [settings.holidays]
  );

  // ── 設定のリセット ──
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

  // ── 設定のエクスポート（JSON文字列化） ──
  const exportSettings = useCallback(() => {
    try {
      // JSON.stringify の第2引数は置換関数（null = 変換なし）、第3引数はインデント数
      const settingsJson = JSON.stringify(settings, null, 2);
      return settingsJson;
    } catch {
      throw new Error("設定のエクスポートに失敗しました");
    }
  }, [settings]);

  // ── 設定のインポート（JSON文字列 → 設定オブジェクト） ──
  const importSettings = useCallback(async (settingsJson: string) => {
    try {
      // `as AppSettings` は型アサーション。JSON.parse の戻り値（any）を
      // AppSettings 型として扱うことを TypeScript に伝える。
      // 実際の型チェックは下のバリデーションで行う。
      const importedSettings = JSON.parse(settingsJson) as AppSettings;

      // 3つのカテゴリすべてをバリデーション
      const shiftRuleErrors = validateShiftRuleSettings(
        importedSettings.shiftRule
      );
      const appearanceErrors = validateAppearanceSettings(
        importedSettings.appearance
      );
      const holidayErrors = validateHolidaySettings(importedSettings.holidays);

      // スプレッド構文で3つのエラー配列を1つに結合
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
      // `instanceof Error` は型ガード。err が Error クラスのインスタンスかチェックする
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      } else {
        setError("設定のインポートに失敗しました");
        throw new Error("設定のインポートに失敗しました");
      }
    }
  }, []);

  // ── コンポーネントマウント時に設定を読み込む ──
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // ── リアルタイム更新のリスナー設定 ──
  // 他のユーザーが設定を変更したときに自動で反映するための購読
  useEffect(() => {
    const unsubscribe = ServiceProvider.settings.onSettingsChanged((data) => {
      if (data) {
        setSettings(mergeWithDefaults(data));
      }
    });

    // クリーンアップ関数: コンポーネントがアンマウントされたとき購読を解除する
    return () => unsubscribe();
  }, []);

  // ── フックの戻り値 ──
  // このオブジェクトが SettingsContext 経由で全コンポーネントに共有される
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

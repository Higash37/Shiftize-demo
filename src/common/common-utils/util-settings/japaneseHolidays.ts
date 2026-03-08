/**
 * 日本の祝日データを外部APIから自動取得 + メモリキャッシュ
 * API: https://holidays-jp.github.io/api/v1/date.json
 */

type HolidayMap = Record<string, string>;

let cachedHolidays: HolidayMap | null = null;
let fetchPromise: Promise<HolidayMap> | null = null;

/**
 * APIから祝日データを取得してキャッシュする
 */
async function fetchHolidaysFromAPI(): Promise<HolidayMap> {
  if (cachedHolidays) return cachedHolidays;

  try {
    const res = await fetch(
      "https://holidays-jp.github.io/api/v1/date.json"
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: HolidayMap = await res.json();
    cachedHolidays = data;
    return data;
  } catch {
    // API失敗時は空を返す（次回再取得を試みる）
    return {};
  }
}

/**
 * 祝日データを取得（重複リクエスト防止付き）
 */
export async function loadJapaneseHolidays(): Promise<HolidayMap> {
  if (cachedHolidays) return cachedHolidays;
  if (!fetchPromise) {
    fetchPromise = fetchHolidaysFromAPI().finally(() => {
      fetchPromise = null;
    });
  }
  return fetchPromise;
}

/**
 * 同期的にキャッシュ済みの祝日データを返す
 * まだ取得されていない場合は空オブジェクトを返し、バックグラウンドで取得開始
 */
export function getHolidaysSync(): HolidayMap {
  if (cachedHolidays) return cachedHolidays;
  // バックグラウンドで取得開始
  loadJapaneseHolidays();
  return {};
}

/**
 * 指定日が祝日かどうかを判定（同期）
 */
export function isHoliday(dateString: string): boolean {
  const holidays = getHolidaysSync();
  return dateString in holidays;
}

/**
 * 指定日の祝日名を返す（祝日でなければ undefined）
 */
export function getHolidayName(dateString: string): string | undefined {
  const holidays = getHolidaysSync();
  return holidays[dateString];
}

/** @file japaneseHolidays.ts @description 日本の祝日データを外部APIから取得してキャッシュするユーティリティ。カレンダー上で祝日を赤色表示するなどの用途で使う。 */

/**
 * ── `type` エイリアスについて ──
 * `type HolidayMap = Record<string, string>` は新しい型に名前をつける構文。
 *
 * ── `Record<K, V>` について ──
 * Record<string, string> は「キーが string、値も string のオブジェクト」の型。
 * 例: { "2025-01-01": "元日", "2025-02-11": "建国記念の日" }
 */
type HolidayMap = Record<string, string>;

// ── モジュールレベルのキャッシュ変数 ──
// ファイルのトップレベルに let で宣言された変数は、このモジュールがインポートされている限りメモリに残る
let cachedHolidays: HolidayMap | null = null;

// ── 重複リクエスト防止用の Promise キャッシュ ──
// 同時に複数箇所から呼ばれても、APIリクエストは1回だけ実行する
let fetchPromise: Promise<HolidayMap> | null = null;

/**
 * APIから祝日データを取得してキャッシュに保存する内部関数
 *
 * @returns 祝日マップ（"YYYY-MM-DD" → "祝日名"）
 */
async function fetchHolidaysFromAPI(): Promise<HolidayMap> {
  // すでにキャッシュがあればAPIを叩かずに返す
  if (cachedHolidays) return cachedHolidays;

  try {
    const res = await fetch(
      "https://holidays-jp.github.io/api/v1/date.json"
    );
    // res.ok は HTTPステータスが 200-299 の場合に true
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: HolidayMap = await res.json();
    cachedHolidays = data;
    return data;
  } catch {
    // API失敗時は空オブジェクトを返す。cachedHolidays は null のままなので次回再取得を試みる
    return {};
  }
}

/**
 * 祝日データを取得する関数（重複リクエスト防止つき）
 *
 * ── 処理の流れ ──
 * 1. キャッシュがあればそれを返す
 * 2. 現在リクエスト中（fetchPromise が存在）ならその Promise を返す
 * 3. どちらでもなければ新しいリクエストを開始し、その Promise を返す
 *
 * 呼び出し元: getHolidaysSync() のバックグラウンド取得、カレンダー初期化時
 */
export async function loadJapaneseHolidays(): Promise<HolidayMap> {
  if (cachedHolidays) return cachedHolidays;
  if (!fetchPromise) {
    fetchPromise = fetchHolidaysFromAPI().finally(() => {
      // .finally() は成功・失敗どちらの場合も実行される。リクエスト完了後に fetchPromise をリセット
      fetchPromise = null;
    });
  }
  return fetchPromise;
}

/**
 * キャッシュ済みの祝日データを同期的に返す関数
 *
 * まだ取得前なら空オブジェクトを返し、バックグラウンドで非同期取得を開始する。
 * 次回呼び出し時にはキャッシュされたデータが返る。
 *
 * 呼び出し元: isHoliday(), getHolidayName()
 */
export function getHolidaysSync(): HolidayMap {
  if (cachedHolidays) return cachedHolidays;
  // バックグラウンドで取得開始（結果を待たない）
  loadJapaneseHolidays();
  return {};
}

/**
 * 指定日が祝日かどうかを判定する関数（同期）
 *
 * @param dateString - "YYYY-MM-DD" 形式の日付文字列
 * @returns 祝日なら true
 */
export function isHoliday(dateString: string): boolean {
  const holidays = getHolidaysSync();
  // `in` 演算子でオブジェクトにそのキーが存在するかチェック
  return dateString in holidays;
}

/**
 * 指定日の祝日名を返す関数（祝日でなければ undefined）
 *
 * @param dateString - "YYYY-MM-DD" 形式の日付文字列
 * @returns 祝日名（例: "元日"）または undefined
 */
export function getHolidayName(dateString: string): string | undefined {
  const holidays = getHolidaysSync();
  return holidays[dateString];
}

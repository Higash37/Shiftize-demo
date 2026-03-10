/** @file DateFormatter.ts @description 日付のフォーマット・変換・計算を行うユーティリティ関数群。カレンダー表示やシフト日付処理で使われる。 */
// ============================================================================
// 【なぜ日付処理に注意が必要なのか — JavaScript の日付問題】
// ============================================================================
// このファイルでは日付処理を自前の関数でラップしている。
// 一見シンプルだが、JavaScript の Date には歴史的な落とし穴が多い。
//
// ■ JavaScript の Date オブジェクトの問題:
//   JavaScript の Date は 1995年に、Java 1.0 の java.util.Date を
//   わずか10日間でコピーして作られた（Brendan Eich が Netscape で急造）。
//   Java 側はすぐに java.util.Calendar → java.time と改善されたが、
//   JavaScript の Date は30年近くそのまま残っている。
//
//   主な問題点:
//   - ミュータブル: date.setDate() は元のオブジェクトを書き換える（バグの温床）
//   - 月が 0 始まり: 1月 = 0, 12月 = 11（混乱しやすい）
//   - タイムゾーン処理が貧弱: UTC とローカル時間の変換が煩雑
//   - フォーマット機能がない: "2025年3月10日" のような表示に変換する標準APIがない
//     （toLocaleDateString は比較的新しいAPIで、このファイルでも活用している）
//
// ■ 代替ライブラリの歴史:
//   - Moment.js（2011年）: 最初の人気ライブラリ。しかし重い（300KB超）＆ミュータブル
//     → 2020年にメンテナンス終了宣言
//   - date-fns（2016年）: 関数型。Tree-shaking で必要な関数だけバンドル可能。軽量
//   - Day.js（2018年）: Moment.js 互換だが軽量（2KB）
//   - Luxon（2017年）: Moment.js チームが作った後継。タイムゾーン処理が強力
//   - Temporal API（策定中）: JavaScript の新しい標準日付API。将来的にライブラリ不要に
//
// ■ このファイルの方針:
//   現在はネイティブの Date + toLocaleDateString で対応している。
//   シンプルなフォーマットと計算のみなので、外部ライブラリなしで十分。
//
// ■ ケースバイケース:
//   - 単純な日付表示・加減算のみ → ネイティブ Date で十分（このファイルのように）
//   - 日付のパース・フォーマットが多い → date-fns が軽量でおすすめ
//   - 複雑なタイムゾーン処理 → Luxon や Day.js + timezone プラグイン
//   - 将来的には → Temporal API が標準化されればライブラリ不要になる見込み
// ============================================================================

/**
 * 日付を日本語の「年月日」形式にフォーマットする関数
 *
 * @param date - フォーマットしたい Date オブジェクト
 * @returns "2025年3月10日" のような日本語形式の文字列
 *
 * 呼び出し元: カレンダーやシフト一覧の日付表示
 */
export const formatDate = (date: Date): string => {
  // toLocaleDateString は、ロケール（言語・地域）に合わせた日付文字列を返す
  // "ja-JP" = 日本語ロケール
  // year: "numeric" → 「2025」のように4桁の年
  // month: "long" → 「3月」のように「○月」形式
  // day: "numeric" → 「10」のように日だけ
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * 日付オブジェクトから時刻部分だけを "HH:mm" 形式で取り出す関数
 *
 * @param date - 時刻を取り出したい Date オブジェクト
 * @returns "09:30" のような24時間制の時刻文字列
 */
export const formatTime = (date: Date): string => {
  // hour: "2-digit" → 「09」のように0埋め2桁
  // minute: "2-digit" → 「05」のように0埋め2桁
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * "YYYY-MM-DD" 形式の文字列を Date オブジェクトに変換する関数
 *
 * @param dateString - "2025-03-10" のような日付文字列
 * @returns 変換された Date オブジェクト。無効な文字列なら null
 *
 * ── 戻り値の型 `Date | null` について ──
 * `|` はユニオン型と呼ばれ、「Date か null のどちらか」という意味。
 * 失敗する可能性がある関数でよく使うパターン。
 */
export const parseDate = (dateString: string): Date | null => {
  const date = new Date(dateString);
  // Number.isNaN() は引数が NaN（Not a Number）かどうかを判定する
  // 無効な日付文字列で new Date() すると getTime() が NaN を返す
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

/**
 * 指定した日数を加算した日付を返す関数
 *
 * @param date - 基準となる日付
 * @param days - 加算する日数（負の数を渡せば過去に遡れる）
 * @returns 計算後の新しい Date オブジェクト（元の date は変更しない）
 *
 * 呼び出し元: getDateRange(), 日付ナビゲーション（前日・翌日ボタン）
 */
export const addDays = (date: Date, days: number): Date => {
  // new Date(date) でコピーを作る。元の date を書き換えないための安全策
  const result = new Date(date);
  // setDate で「日」部分を更新。月をまたいでも自動で繰り上がる
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * 開始日から終了日までの日付配列を生成する関数（両端を含む）
 *
 * @param startDate - 開始日（この日を含む）
 * @param endDate - 終了日（この日を含む）
 * @returns 日付オブジェクトの配列。例: [3/1, 3/2, 3/3, ...]
 *
 * 呼び出し元: ガントチャートの日付列生成
 */
export const getDateRange = (startDate: Date, endDate: Date): Date[] => {
  const dateArray: Date[] = [];
  let currentDate = new Date(startDate);

  // currentDate が endDate を超えるまでループ
  while (currentDate <= endDate) {
    // push するときも new Date() でコピー。同じ参照を入れると全部同じ日付になる
    dateArray.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return dateArray;
};

/**
 * Date オブジェクトを "YYYY-MM-DD" 形式の文字列に変換する関数
 *
 * @param date - 変換したい Date オブジェクト
 * @returns "2025-03-10" のような ISO 日付文字列
 * @throws Error - フォーマットに失敗した場合
 *
 * 呼び出し元: シフトデータの日付をDBに保存するとき
 */
export const toISODateString = (date: Date): string => {
  // toISOString() は "2025-03-10T09:30:00.000Z" のようなフルISO文字列を返す
  // .split("T")[0] で "T" より前の日付部分だけ取り出す
  const isoString = date.toISOString().split("T")[0];
  if (!isoString) {
    throw new Error("Failed to format date to ISO string");
  }
  return isoString;
};

/**
 * 曜日を日本語1文字で取得する関数
 *
 * @param date - 曜日を調べたい Date オブジェクト
 * @returns "日", "月", "火", "水", "木", "金", "土" のいずれか
 * @throws Error - 予期しない曜日の場合（通常は起きない）
 */
export const getJapaneseDayOfWeek = (date: Date): string => {
  // dayNames 配列のインデックスは getDay() の戻り値（0=日, 1=月, ..., 6=土）に対応
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
  const dayName = dayNames[date.getDay()];
  if (!dayName) {
    throw new Error("Invalid day of week");
  }
  return dayName;
};

/**
 * 指定した年月の初日（1日）を取得する関数
 *
 * @param year - 年（例: 2025）
 * @param month - 月（0始まり。0=1月, 11=12月）。JavaScript の Date は月が 0 始まりなので注意
 * @returns その月の1日の Date オブジェクト
 */
export const getFirstDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month, 1);
};

/**
 * 指定した年月の最終日を取得する関数
 *
 * @param year - 年（例: 2025）
 * @param month - 月（0始まり。0=1月, 11=12月）
 * @returns その月の最終日の Date オブジェクト
 *
 * ── 仕組み ──
 * new Date(year, month + 1, 0) で「翌月の0日目」を指定すると、
 * JavaScript は自動的に「今月の最終日」として解釈する。
 * 例: new Date(2025, 2, 0) → 2025年2月28日（2月の最終日）
 */
export const getLastDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month + 1, 0);
};

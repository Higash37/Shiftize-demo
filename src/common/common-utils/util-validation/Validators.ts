/**
 * @file Validators.ts
 * @description バリデーション（入力値検証）用ユーティリティ関数群。
 *              必須チェック、メール形式、パスワード強度、数値範囲、日付、時間、文字列長のバリデーションを提供する。
 *
 * 【このファイルの位置づけ】
 * - TypeChecker.ts の基本型チェック関数をベースにした、ユーザー向けバリデーション
 * - フォーム入力のバリデーションに使用される
 * - 関連ファイル: TypeChecker.ts（型チェック基盤）, inputValidation.ts（セキュリティ寄りのバリデーション）
 *
 * 【バリデーション関数の設計パターン】
 * - 戻り値: `string | undefined`
 *   - undefined → バリデーション成功（エラーなし）
 *   - string → エラーメッセージ（ユーザーに表示する日本語メッセージ）
 * - 空値（null, undefined, 空文字列）は基本的にスキップ（必須チェックは validateRequired で行う）
 */
import { isNumeric, isEmpty, isValidDate } from "../utility-interfaces/TypeChecker";

/**
 * validateRequired - 必須項目のチェック
 *
 * isEmpty() を使って値が「空」かどうかを判定する。
 * 空の場合はエラーメッセージを返す。
 *
 * @param value - チェックする値
 * @returns エラーメッセージ、またはバリデーション成功時 undefined
 */
export const validateRequired = (value: unknown): string | undefined => {
  return isEmpty(value) ? "この項目は必須です" : undefined;
};

/**
 * validateEmail - メールアドレスの形式チェック
 *
 * 【正規表現の解説】
 * `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
 * - `^` → 文字列の先頭
 * - `[^\s@]+` → 空白と@以外の1文字以上（ローカルパート: user.name 等）
 * - `@` → @文字（リテラル）
 * - `[^\s@]+` → 空白と@以外の1文字以上（ドメイン: example 等）
 * - `\.` → ドット（リテラル）
 * - `[^\s@]+` → 空白と@以外の1文字以上（TLD: com, jp 等）
 * - `$` → 文字列の末尾
 *
 * この正規表現は基本的なチェックのみ。RFC 5322 完全準拠ではない。
 *
 * @param value - チェックする値
 * @returns エラーメッセージ、または undefined
 */
export const validateEmail = (value: unknown): string | undefined => {
  if (isEmpty(value)) return undefined; // 空はスキップ（必須チェックは別途行う）
  if (typeof value !== "string")
    return "メールアドレスの形式が正しくありません";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value)
    ? undefined
    : "メールアドレスの形式が正しくありません";
};

/**
 * validatePassword - パスワードの強度チェック
 *
 * 【強度判定の基準】
 * 以下の4種類のうち3種類以上を含むことを推奨:
 * - 大文字 (A-Z)
 * - 小文字 (a-z)
 * - 数字 (0-9)
 * - 記号 (\W = 英数字以外の文字)
 *
 * 【filter(Boolean) の動作】
 * 配列から falsy な値（false, 0, null, undefined等）を除外する。
 * [true, false, true, true].filter(Boolean) → [true, true, true]
 * .length で true の個数（= 満たしている条件の数）を取得。
 *
 * @param value - チェックする値
 * @param minLength - 最小文字数（inclusive。デフォルト: 8）
 * @returns エラーメッセージ、または undefined
 */
export const validatePassword = (
  value: unknown,
  minLength = 8
): string | undefined => {
  if (isEmpty(value)) return undefined;
  if (typeof value !== "string")
    return "パスワードは文字列である必要があります";

  if (value.length < minLength) {
    return `パスワードは${minLength}文字以上である必要があります`;
  }

  // 各種文字の存在チェック
  const hasUpperCase = /[A-Z]/.test(value); // 大文字
  const hasLowerCase = /[a-z]/.test(value); // 小文字
  const hasNumbers = /\d/.test(value);       // 数字（\d = [0-9]）
  const hasNonAlphas = /\W/.test(value);     // 記号（\W = 英数字以外）

  // true の個数をカウント
  const strength = [
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasNonAlphas,
  ].filter(Boolean).length;

  if (strength < 3) {
    return "パスワードは大文字、小文字、数字、記号を含めるとより安全です";
  }

  return undefined;
};

/**
 * validateNumberRange - 数値範囲チェック（両端 inclusive）
 *
 * inclusive とは「境界値を含む」の意味。
 * min=0, max=100 の場合、0と100は有効な値。
 *
 * @param value - チェックする値
 * @param min - 最小値（inclusive。この値以上で有効）
 * @param max - 最大値（inclusive。この値以下で有効）
 * @returns エラーメッセージ、または undefined
 */
export const validateNumberRange = (
  value: unknown,
  min?: number,
  max?: number
): string | undefined => {
  if (isEmpty(value)) return undefined;
  if (!isNumeric(value)) return "数値を入力してください";

  const numValue = Number(value);

  // 最小値チェック
  if (min !== undefined && numValue < min) {
    return `${min}以上の値を入力してください`;
  }

  // 最大値チェック
  if (max !== undefined && numValue > max) {
    return `${max}以下の値を入力してください`;
  }

  return undefined;
};

/**
 * validateDate - 日付の有効性チェック
 *
 * TypeChecker.ts の isValidDate() を使用して日付の有効性を検証する。
 *
 * @param value - チェックする値
 * @returns エラーメッセージ、または undefined
 */
export const validateDate = (value: unknown): string | undefined => {
  if (isEmpty(value)) return undefined;
  if (!isValidDate(value)) return "有効な日付を入力してください";
  return undefined;
};

/**
 * validateTimeFormat - 時間文字列（HH:MM）の形式チェック
 *
 * 【正規表現の解説】
 * `/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/`
 * - `([01]?[0-9]|2[0-3])` → 時間部分
 *   - `[01]?[0-9]` → 0-19（先頭の0または1はオプション。"9" も "09" も有効）
 *   - `|` → または
 *   - `2[0-3]` → 20-23
 * - `:` → コロン（リテラル）
 * - `[0-5][0-9]` → 分部分（00-59）
 *
 * 有効な例: "0:00", "9:30", "13:45", "23:59"
 * 無効な例: "24:00", "12:60", "abc"
 *
 * @param time - チェックする時間文字列
 * @returns 有効な場合 true
 */
export const validateTimeFormat = (time: string): boolean => {
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
};

/**
 * validateLength - 文字列の長さチェック（両端 inclusive）
 *
 * @param value - チェックする値
 * @param min - 最小文字数（inclusive。この文字数以上で有効）
 * @param max - 最大文字数（inclusive。この文字数以下で有効）
 * @returns エラーメッセージ、または undefined
 */
export const validateLength = (
  value: unknown,
  min?: number,
  max?: number
): string | undefined => {
  if (isEmpty(value)) return undefined;
  if (typeof value !== "string") return "文字列を入力してください";

  if (min !== undefined && value.length < min) {
    return `${min}文字以上入力してください`;
  }

  if (max !== undefined && value.length > max) {
    return `${max}文字以下で入力してください`;
  }

  return undefined;
};

/**
 * バリデーション用ユーティリティ関数
 */
import { isNumeric, isEmpty, isValidDate } from "../utility-interfaces/TypeChecker";

/**
 * 必須項目のチェック
 * @param value チェックする値
 * @returns エラーメッセージまたは undefined
 */
export const validateRequired = (value: unknown): string | undefined => {
  return isEmpty(value) ? "この項目は必須です" : undefined;
};

/**
 * メールアドレスの形式チェック
 * @param value チェックする値
 * @returns エラーメッセージまたは undefined
 */
export const validateEmail = (value: unknown): string | undefined => {
  if (isEmpty(value)) return undefined;
  if (typeof value !== "string")
    return "メールアドレスの形式が正しくありません";

  // 基本的なメール形式チェック
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value)
    ? undefined
    : "メールアドレスの形式が正しくありません";
};

/**
 * パスワードの強度チェック
 * @param value チェックする値
 * @param minLength 最小文字数（inclusive: この文字数以上で有効）
 * @returns エラーメッセージまたは undefined
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

  // 強度チェック（任意）
  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumbers = /\d/.test(value);
  const hasNonAlphas = /\W/.test(value);

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
 * 数値範囲チェック（両端 inclusive）
 * @param value チェックする値
 * @param min 最小値（inclusive: この値以上で有効）
 * @param max 最大値（inclusive: この値以下で有効）
 * @returns エラーメッセージまたは undefined
 */
export const validateNumberRange = (
  value: unknown,
  min?: number,
  max?: number
): string | undefined => {
  if (isEmpty(value)) return undefined;
  if (!isNumeric(value)) return "数値を入力してください";

  const numValue = Number(value);

  if (min !== undefined && numValue < min) {
    return `${min}以上の値を入力してください`;
  }

  if (max !== undefined && numValue > max) {
    return `${max}以下の値を入力してください`;
  }

  return undefined;
};

/**
 * 日付の有効性チェック
 * @param value チェックする値
 * @returns エラーメッセージまたは undefined
 */
export const validateDate = (value: unknown): string | undefined => {
  if (isEmpty(value)) return undefined;
  if (!isValidDate(value)) return "有効な日付を入力してください";
  return undefined;
};

/**
 * 時間文字列（HH:MM）の形式チェック
 * @param time チェックする時間文字列
 * @returns 有効な場合 true
 */
export const validateTimeFormat = (time: string): boolean => {
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
};

/**
 * 文字列の長さチェック（両端 inclusive）
 * @param value チェックする値
 * @param min 最小文字数（inclusive: この文字数以上で有効）
 * @param max 最大文字数（inclusive: この文字数以下で有効）
 * @returns エラーメッセージまたは undefined
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

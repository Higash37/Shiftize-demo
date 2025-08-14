/**
 * 型チェックユーティリティ関数
 */

/**
 * 値が null または undefined かどうかをチェック
 * @param value チェックする値
 * @returns 値が null または undefined の場合 true
 */
export const isNullOrUndefined = (
  value: unknown
): value is null | undefined => {
  return value === null || value === undefined;
};

/**
 * 値が空文字列、null または undefined かどうかをチェック
 * @param value チェックする値
 * @returns 値が空文字列、null または undefined の場合 true
 */
export const isEmpty = (value: unknown): boolean => {
  if (isNullOrUndefined(value)) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

/**
 * 値が数値に変換可能かどうかチェック
 * @param value チェックする値
 * @returns 数値に変換可能の場合 true
 */
export const isNumeric = (value: unknown): boolean => {
  if (typeof value === "number") return !isNaN(value);
  if (typeof value !== "string") return false;
  return !isNaN(parseFloat(value)) && isFinite(Number(value));
};

/**
 * 値を安全に数値に変換
 * @param value 変換する値
 * @param defaultValue 変換できない場合のデフォルト値
 * @returns 変換後の数値
 */
export const toNumber = (value: unknown, defaultValue: number = 0): number => {
  if (isNumeric(value)) {
    return Number(value);
  }
  return defaultValue;
};

/**
 * 値が有効な日付かどうかチェック
 * @param value チェックする値
 * @returns 有効な日付の場合 true
 */
export const isValidDate = (value: unknown): boolean => {
  if (value instanceof Date) return !isNaN(value.getTime());
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
  return false;
};

/**
 * オブジェクトが特定のプロパティを持っているかチェック
 * @param obj チェックするオブジェクト
 * @param prop プロパティ名
 * @returns プロパティを持っている場合 true
 */
export const hasProperty = <T extends object, K extends PropertyKey>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> => {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

/**
 * 値が特定の型のオブジェクトかどうかをチェック
 * @param value チェックする値
 * @param requiredProps 必須プロパティの配列
 * @returns 全ての必須プロパティを持つオブジェクトの場合 true
 */
export const isObjectWithProps = <T extends object>(
  value: unknown,
  requiredProps: (keyof T)[]
): value is T => {
  if (typeof value !== "object" || value === null) return false;

  return requiredProps.every((prop) =>
    Object.prototype.hasOwnProperty.call(value, prop)
  );
};

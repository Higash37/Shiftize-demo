/**
 * camelCase / snake_case 変換ユーティリティ
 *
 * アプリモデル(camelCase) <-> DB(snake_case) の相互変換
 */

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * オブジェクトのキーを camelCase → snake_case に変換
 * INSERT/UPDATE前に使用
 */
export function toSnakeCase<T extends Record<string, unknown>>(
  obj: T
): Record<string, unknown> {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      isNonNullObject(item) ? toSnakeCase(item) : item
    ) as unknown as Record<string, unknown>;
  }
  if (typeof obj !== "object") return obj;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = camelToSnake(key);
    if (value !== undefined) {
      if (value instanceof Date) {
        result[snakeKey] = value.toISOString();
      } else if (Array.isArray(value)) {
        result[snakeKey] = value.map((item) =>
          item instanceof Date
            ? item.toISOString()
            : isNonNullObject(item)
              ? toSnakeCase(item)
              : item
        );
      } else if (isNonNullObject(value)) {
        result[snakeKey] = toSnakeCase(value);
      } else {
        result[snakeKey] = value;
      }
    }
  }
  return result;
}

/**
 * オブジェクトのキーを snake_case → camelCase に変換
 * SELECT後に使用
 */
export function toCamelCase<T = Record<string, unknown>>(
  obj: Record<string, unknown>
): T {
  if (obj === null || obj === undefined) return obj as unknown as T;
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      isNonNullObject(item) ? toCamelCase(item) : item
    ) as unknown as T;
  }
  if (typeof obj !== "object") return obj as unknown as T;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamel(key);
    if (Array.isArray(value)) {
      result[camelKey] = value.map((item) =>
        isNonNullObject(item) ? toCamelCase(item) : item
      );
    } else if (isNonNullObject(value)) {
      result[camelKey] = toCamelCase(value);
    } else {
      result[camelKey] = value;
    }
  }
  return result as T;
}

/**
 * undefined 値を除外するヘルパー
 */
export function removeUndefined(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

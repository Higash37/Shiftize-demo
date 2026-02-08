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
      typeof item === "object" && item !== null
        ? toSnakeCase(item as Record<string, unknown>)
        : item
    ) as unknown as Record<string, unknown>;
  }
  if (typeof obj !== "object") return obj;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = camelToSnake(key);
    if (value !== undefined) {
      // Date -> ISO string
      if (value instanceof Date) {
        result[snakeKey] = value.toISOString();
      } else if (Array.isArray(value)) {
        result[snakeKey] = value.map((item) =>
          typeof item === "object" && item !== null && !(item instanceof Date)
            ? toSnakeCase(item as Record<string, unknown>)
            : item instanceof Date
              ? item.toISOString()
              : item
        );
      } else if (typeof value === "object" && value !== null) {
        result[snakeKey] = toSnakeCase(value as Record<string, unknown>);
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
      typeof item === "object" && item !== null
        ? toCamelCase(item as Record<string, unknown>)
        : item
    ) as unknown as T;
  }
  if (typeof obj !== "object") return obj as unknown as T;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamel(key);
    if (Array.isArray(value)) {
      result[camelKey] = value.map((item) =>
        typeof item === "object" && item !== null
          ? toCamelCase(item as Record<string, unknown>)
          : item
      );
    } else if (typeof value === "object" && value !== null) {
      result[camelKey] = toCamelCase(value as Record<string, unknown>);
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

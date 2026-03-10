/**
 * @file caseConverter.ts
 * @description camelCase / snake_case の相互変換ユーティリティ。
 *
 * 【このファイルの位置づけ】
 * TypeScript（アプリ側）は camelCase（例: storeId, createdAt）、
 * PostgreSQL（DB側）は snake_case（例: store_id, created_at）を使う慣例がある。
 *
 * このファイルはオブジェクトのキーを自動変換する関数を提供する:
 *   アプリのモデル → toSnakeCase() → Supabase INSERT/UPDATE
 *   Supabase SELECT → toCamelCase() → アプリのモデル
 *
 * 【再帰的変換】
 * ネストされたオブジェクトや配列内のオブジェクトも再帰的に変換する。
 * 例: { userName: { firstName: "太郎" } }
 *   → { user_name: { first_name: "太郎" } }
 */

/**
 * camelToSnake: camelCase文字列をsnake_caseに変換する。
 *
 * 正規表現 /[A-Z]/g は「大文字のアルファベット」にグローバルマッチする。
 * replace のコールバックで「大文字を "_ + 小文字" に置換」する。
 *
 * 例:
 *   "storeId"   → "store_id"
 *   "createdAt" → "created_at"
 *   "userId"    → "user_id"
 *
 * @param str - camelCase文字列
 * @returns snake_case文字列
 */
function camelToSnake(str: string): string {
  // [A-Z] にマッチした文字（letter）を "_小文字" に置換
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * snakeToCamel: snake_case文字列をcamelCaseに変換する。
 *
 * 正規表現 /_([a-z])/g は「_ の後の小文字」にマッチする。
 * マッチした部分を「大文字に変換した文字」で置換する。
 *
 * 例:
 *   "store_id"   → "storeId"
 *   "created_at" → "createdAt"
 *   "user_id"    → "userId"
 *
 * @param str - snake_case文字列
 * @returns camelCase文字列
 */
function snakeToCamel(str: string): string {
  // _([a-z]) の括弧部分がキャプチャされ、コールバックの第2引数 letter に入る
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * isNonNullObject: 値が null でないオブジェクトかどうかを判定する型ガード。
 *
 * 【型ガード（Type Guard）とは】
 * 戻り値の型が `value is Record<string, unknown>` になっている。
 * この関数がtrueを返した場合、以降のコードではvalueの型が
 * Record<string, unknown> に絞り込まれる（TypeScriptの型推論が効く）。
 *
 * typeof null === "object" が true を返すJavaScriptの罠に対処するため、
 * value !== null のチェックが必要。
 *
 * @param value - 判定対象の値
 * @returns value が非nullオブジェクトかどうか
 */
function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * toSnakeCase: オブジェクトのキーを camelCase → snake_case に再帰的に変換する。
 * INSERT/UPDATE文を発行する前にアプリモデルをDB形式に変換するために使用する。
 *
 * 【ジェネリクス <T extends Record<string, unknown>>】
 * T は Record<string, unknown> を拡張した任意の型。
 * つまり「キーがstringで値が何でもよいオブジェクト」を受け付ける。
 * これにより型安全に任意のオブジェクトを渡せる。
 *
 * 【再帰的変換の仕組み】
 * 1. 各キーを camelToSnake で変換
 * 2. 値が Date なら ISO文字列に変換
 * 3. 値が配列なら各要素を再帰処理
 * 4. 値がオブジェクトなら再帰的に toSnakeCase を適用
 * 5. それ以外（string, number等）はそのまま
 *
 * @param obj - 変換対象のオブジェクト
 * @returns snake_caseキーのオブジェクト
 */
export function toSnakeCase<T extends Record<string, unknown>>(
  obj: T
): Record<string, unknown> {
  // null / undefined はそのまま返す
  if (obj === null || obj === undefined) return obj;
  // 配列の場合: 各要素を再帰的に変換
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      isNonNullObject(item) ? toSnakeCase(item) : item
    ) as unknown as Record<string, unknown>;
  }
  // プリミティブ型（string, number等）はそのまま返す
  if (typeof obj !== "object") return obj;

  // 新しいオブジェクトを構築（元のオブジェクトは変更しない）
  const result: Record<string, unknown> = {};
  // Object.entries: { key: value } → [["key", value], ...] に変換
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = camelToSnake(key);  // キーをsnake_caseに変換
    // undefined の値はスキップ（DB側でDEFAULT値を使わせるため）
    if (value !== undefined) {
      if (value instanceof Date) {
        // Date型はISO 8601文字列に変換（PostgreSQLのtimestamp型に対応）
        result[snakeKey] = value.toISOString();
      } else if (Array.isArray(value)) {
        // 配列: 各要素を再帰的に変換
        result[snakeKey] = value.map((item) =>
          item instanceof Date
            ? item.toISOString()
            : isNonNullObject(item)
              ? toSnakeCase(item)
              : item
        );
      } else if (isNonNullObject(value)) {
        // ネストされたオブジェクト: 再帰的に変換
        result[snakeKey] = toSnakeCase(value);
      } else {
        // プリミティブ値（string, number, boolean等）: そのまま
        result[snakeKey] = value;
      }
    }
  }
  return result;
}

/**
 * toCamelCase: オブジェクトのキーを snake_case → camelCase に再帰的に変換する。
 * SELECT文のレスポンスをアプリモデルに変換するために使用する。
 *
 * 【ジェネリクス <T = Record<string, unknown>>】
 * T のデフォルト値が Record<string, unknown>。
 * 呼び出し時に toCamelCase<UserModel>(row) のように具体型を指定できる。
 * 指定しなければデフォルトの Record<string, unknown> になる。
 *
 * @param obj - snake_caseキーのオブジェクト（DBレスポンス）
 * @returns T - camelCaseキーのオブジェクト（アプリモデル）
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
    const camelKey = snakeToCamel(key);  // キーをcamelCaseに変換
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
  // as T でジェネリクス型にキャスト
  return result as T;
}

/**
 * removeUndefined: オブジェクトから undefined 値を持つプロパティを除外する。
 * UPDATE文の構築時に「変更されていないフィールド」をDBに送らないために使用する。
 *
 * 例:
 *   removeUndefined({ name: "太郎", age: undefined, email: "test@example.com" })
 *   → { name: "太郎", email: "test@example.com" }
 *
 * @param obj - 処理対象のオブジェクト
 * @returns undefined のプロパティが除去されたオブジェクト
 */
export function removeUndefined(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    // undefined でない場合のみ結果に含める
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

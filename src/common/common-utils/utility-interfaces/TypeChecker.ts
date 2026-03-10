/**
 * @file TypeChecker.ts
 * @description 型チェックユーティリティ関数群。
 *              値の型判定、空チェック、数値変換、日付検証、プロパティ存在確認を提供する。
 *
 * 【このファイルの位置づけ】
 * - アプリ全体で使用される汎用的な型チェック関数
 * - Validators.ts から参照される（バリデーションの基盤として使用）
 * - 関連ファイル: Validators.ts（バリデーション）, 各サービスアダプタ
 *
 * 【なぜ型チェックが必要か】
 * TypeScriptはコンパイル時に型チェックを行うが、ランタイム（実行時）では
 * APIレスポンスやユーザー入力など、型が保証されないデータが入ってくる。
 * このファイルの関数は、ランタイムで値の型を安全にチェックする。
 */

/**
 * isNullOrUndefined - 値が null または undefined かどうかをチェックする
 *
 * 【TypeScript構文の解説】
 * - `value: unknown` → unknown型。any型より安全で、使用前に型チェックが必要
 * - `value is null | undefined` → 型ガード（Type Guard）の戻り値型。
 *   この関数がtrueを返した場合、TypeScriptは value が null | undefined 型
 *   であると推論する。以降のコードでは null/undefined 前提で扱える
 *
 * 【型ガードとは】
 * 関数の戻り値を `value is 型` と宣言すると、if文で使った時に
 * TypeScriptが自動的に型を絞り込んでくれる。
 *
 * @param value - チェックする値
 * @returns 値が null または undefined の場合 true
 */
export const isNullOrUndefined = (
  value: unknown
): value is null | undefined => {
  return value === null || value === undefined;
};

/**
 * isEmpty - 値が「空」かどうかをチェックする
 *
 * 以下の場合に true を返す:
 * - null または undefined
 * - 空文字列（空白のみの文字列も含む）
 * - 空配列（長さ0）
 * - 空オブジェクト（プロパティなし）
 *
 * 【trim() の役割】
 * 文字列の前後の空白を除去する。" hello " → "hello"。
 * 空白のみの文字列 "   " は trim() 後に "" になるため、空と判定される。
 *
 * @param value - チェックする値
 * @returns 値が空の場合 true
 */
export const isEmpty = (value: unknown): boolean => {
  // null/undefinedチェック
  if (isNullOrUndefined(value)) return true;
  // 文字列の場合: trim()で空白を除去して長さ0なら空
  if (typeof value === "string") return value.trim() === "";
  // 配列の場合: 要素数0なら空
  if (Array.isArray(value)) return value.length === 0;
  // オブジェクトの場合: プロパティ数0なら空
  // Object.keys(value) → オブジェクトの全キーを配列で返す
  if (typeof value === "object") return Object.keys(value).length === 0;
  // 数値やboolean等は「空」ではない
  return false;
};

/**
 * isNumeric - 値が数値に変換可能かどうかをチェックする
 *
 * 数値型の値、および数値に変換可能な文字列（例: "123", "12.34"）を検出する。
 * NaN（Not a Number）、空文字列、空白のみの文字列は false。
 *
 * 【Number.isNaN vs isNaN の違い】
 * - Number.isNaN(x): x が正確にNaN値の場合のみ true
 * - isNaN(x): x を数値に変換した結果がNaNの場合 true（暗黙の型変換が入る）
 * このファイルでは厳密な Number.isNaN を使用している。
 *
 * 【Number.parseFloat と Number.isFinite】
 * - Number.parseFloat("12.34") → 12.34（文字列を浮動小数点数に変換）
 * - Number.isFinite(x) → x が有限数の場合 true（Infinity, NaN は false）
 *
 * @param value - チェックする値
 * @returns 数値に変換可能な場合 true
 */
export const isNumeric = (value: unknown): boolean => {
  if (typeof value === "number") return !Number.isNaN(value);
  if (typeof value !== "string") return false;
  return (
    // parseFloatで数値変換できるか + Number()の結果が有限数か
    !Number.isNaN(Number.parseFloat(value)) && Number.isFinite(Number(value))
  );
};

/**
 * toNumber - 値を安全に数値に変換する
 *
 * 変換できない値（文字列、null等）の場合はデフォルト値を返す。
 * Number()による直接変換と違い、変換失敗時にNaNにならない安全な関数。
 *
 * @param value - 変換する値
 * @param defaultValue - 変換できない場合のデフォルト値（デフォルト: 0）
 * @returns 変換後の数値
 */
export const toNumber = (value: unknown, defaultValue: number = 0): number => {
  if (isNumeric(value)) {
    return Number(value);
  }
  return defaultValue;
};

/**
 * isValidDate - 値が有効な日付かどうかをチェックする
 *
 * Date オブジェクト、日付文字列、タイムスタンプ（数値）を検証する。
 * 無効な日付（例: new Date("invalid")）は内部的にNaNを持つため、
 * getTime() で NaN チェックすることで無効な日付を検出する。
 *
 * 【getTime() の動作】
 * - 有効な日付: エポック（1970年1月1日）からのミリ秒数を返す
 * - 無効な日付: NaN を返す
 *
 * @param value - チェックする値
 * @returns 有効な日付の場合 true
 */
export const isValidDate = (value: unknown): boolean => {
  // Dateオブジェクトの場合: getTime()がNaNでないか確認
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  // 文字列・数値の場合: Dateオブジェクトに変換して検証
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return !Number.isNaN(date.getTime());
  }
  return false;
};

/**
 * hasProperty - オブジェクトが特定のプロパティを持っているかチェックする
 *
 * 【Object.hasOwn vs in 演算子 の違い】
 * - Object.hasOwn(obj, prop): オブジェクト自身のプロパティのみチェック
 * - prop in obj: プロトタイプチェーン上のプロパティもチェック
 * このファイルではObject.hasOwnを使い、プロトタイプの汚染を防いでいる。
 *
 * 【TypeScript構文の解説】
 * - `<T extends object, K extends PropertyKey>` → ジェネリクス型パラメータ
 *   - T: object型を満たす任意の型
 *   - K: PropertyKey（string | number | symbol）を満たす任意の型
 *   これにより、任意のオブジェクト型と任意のキー名で使える
 *
 * - `obj is T & Record<K, unknown>` → 型ガード
 *   trueを返した場合、objは「T型のプロパティ + K型のキーを持つオブジェクト」と推論される
 *   Record<K, unknown> → キーがK、値がunknownのオブジェクト型
 *
 * @param obj - チェックするオブジェクト
 * @param prop - プロパティ名
 * @returns プロパティを持っている場合 true
 */
export const hasProperty = <T extends object, K extends PropertyKey>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> => {
  return Object.hasOwn(obj, prop);
};

/**
 * isObjectWithProps - 値が指定された必須プロパティを持つオブジェクトかチェックする
 *
 * APIレスポンスや外部データが期待する構造を持っているかをランタイムで検証する。
 *
 * 【TypeScript構文の解説】
 * - `<T extends object>` → Tはobject型のサブタイプ
 * - `(keyof T)[]` → T型のプロパティ名の配列
 *   例: T = { id: string; name: string } の場合、("id" | "name")[]
 * - `value is T` → 型ガード。trueならvalueはT型と推論される
 *
 * 【every() の動作】
 * 配列の全要素がコールバック関数の条件を満たす場合にtrueを返す。
 * 1つでも条件を満たさない要素があればfalseを返し、以降の要素はチェックしない。
 *
 * @param value - チェックする値
 * @param requiredProps - 必須プロパティ名の配列
 * @returns 全ての必須プロパティを持つオブジェクトの場合 true
 */
export const isObjectWithProps = <T extends object>(
  value: unknown,
  requiredProps: (keyof T)[]
): value is T => {
  // null チェック: typeof null === "object" なので明示的に除外が必要
  if (typeof value !== "object" || value === null) return false;

  // 全ての必須プロパティがオブジェクト自身に存在するかチェック
  return requiredProps.every((prop) => Object.hasOwn(value, prop));
};

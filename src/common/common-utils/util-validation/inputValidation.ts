/**
 * @file inputValidation.ts
 * @description 入力検証・サニタイゼーション ユーティリティ。
 *              セキュリティ強化のための包括的な入力検証システム。
 *              メール、パスワード、ファイル名、日付、時間、Store ID、数値の検証と
 *              XSS対策のためのHTMLエスケープ・サニタイゼーション機能を提供する。
 *
 * 【このファイルの位置づけ】
 * - ユーザー入力をDBに保存する前のセキュリティバリデーション
 * - ログインフォーム、シフト登録フォーム等から呼び出される
 * - BoundaryConstants.ts から日付バリデーション定数を取得
 * - 関連ファイル: BoundaryConstants.ts（定数）, securityUtils.ts（セキュリティ対策）
 *
 * 【バリデーション vs サニタイゼーション の違い】
 * - バリデーション: 入力が正しい形式かどうかを「検査」する。不正ならエラーを返す
 * - サニタイゼーション: 入力から危険な文字を「除去・変換」する。変換後の値を返す
 *
 * 【このファイルの関数の設計パターン】
 * 戻り値: `{ isValid: boolean; error?: string }`
 * - isValid: true → 検証成功
 * - isValid: false, error: "..." → 検証失敗（エラーメッセージ付き）
 */
import { DATE_VALIDATION } from "@/common/common-constants/BoundaryConstants";

// ============================================================================
// メールアドレス検証
// ============================================================================

/**
 * validateEmail - メールアドレスの包括的な検証
 *
 * 【検証項目】
 * 1. 入力存在チェック（空チェック）
 * 2. 長さ制限チェック（RFC 5321: 最大254文字）
 * 3. 形式チェック（正規表現による基本的なメール形式検証）
 * 4. 危険な文字チェック（XSS/SQLインジェクション対策）
 *
 * 【危険な文字の正規表現】
 * `/[<>"'` + "`" + `;&|\\/]/`
 * - `<>` → HTMLタグ注入（XSS）
 * - `"'` → SQL/HTMLの属性値エスケープ
 * - `` ` `` → テンプレートリテラル注入
 * - `;&|` → コマンドインジェクション
 * - `\\/` → パストラバーサル
 *
 * @param email - 検証するメールアドレス
 * @returns { isValid: boolean, error?: string }
 */
export const validateEmail = (
  email: string
): { isValid: boolean; error?: string } => {
  if (!email || typeof email !== "string") {
    return { isValid: false, error: "メールアドレスが入力されていません" };
  }

  // trim() → 前後の空白を除去
  const trimmedEmail = email.trim();
  if (trimmedEmail.length === 0) {
    return { isValid: false, error: "メールアドレスが入力されていません" };
  }

  // RFC 5321 によるメールアドレスの最大長: 254文字
  if (trimmedEmail.length > 254) {
    return {
      isValid: false,
      error: "メールアドレスが長すぎます（254文字以内）",
    };
  }

  // 基本的なメール形式チェック
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: "有効なメールアドレスを入力してください" };
  }

  // XSS/SQLインジェクション対策: 危険な文字のチェック
  const dangerousChars = /[<>"'`;&|\\/]/;
  if (dangerousChars.test(trimmedEmail)) {
    return { isValid: false, error: "無効な文字が含まれています" };
  }

  return { isValid: true };
};

// ============================================================================
// パスワード検証
// ============================================================================

/**
 * validatePassword - パスワードの包括的な検証
 *
 * 【検証項目】
 * 1. 入力存在チェック
 * 2. 最小長チェック（8文字以上）
 * 3. 最大長チェック（128文字以下）
 * 4. 文字種チェック（大文字、小文字、数字の3種必須）
 *
 * 【なぜ最大長を制限するのか】
 * ハッシュ化処理のDoS攻撃対策。非常に長いパスワードを送りつけると、
 * PBKDF2等のハッシュ化に大量のCPU時間を消費させられる。
 *
 * @param password - 検証するパスワード
 * @returns { isValid: boolean, error?: string }
 */
export const validatePassword = (
  password: string
): { isValid: boolean; error?: string } => {
  if (!password || typeof password !== "string") {
    return { isValid: false, error: "パスワードが入力されていません" };
  }

  if (password.length < 8) {
    return { isValid: false, error: "パスワードは8文字以上で入力してください" };
  }

  if (password.length > 128) {
    return { isValid: false, error: "パスワードが長すぎます（128文字以内）" };
  }

  // 文字種の要求: 大文字、小文字、数字の全てを含む必要がある
  const hasUpperCase = /[A-Z]/.test(password); // 大文字が1文字以上
  const hasLowerCase = /[a-z]/.test(password); // 小文字が1文字以上
  const hasNumbers = /\d/.test(password);       // 数字が1文字以上

  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return {
      isValid: false,
      error: "パスワードは大文字、小文字、数字をそれぞれ含む必要があります",
    };
  }

  return { isValid: true };
};

// ============================================================================
// サニタイゼーション（無害化）
// ============================================================================

/**
 * sanitizeText - テキスト入力のサニタイゼーション（XSS対策）
 *
 * 危険な文字をHTMLエンティティに変換し、テキストの長さを制限する。
 *
 * 【HTMLエンティティ変換の例】
 * - `<` → `&lt;`   （HTMLタグの開始文字）
 * - `>` → `&gt;`   （HTMLタグの終了文字）
 * - `"` → `&quot;` （ダブルクォート）
 * - `'` → `&#x27;` （シングルクォート）
 * - `/` → `&#x2F;` （スラッシュ）
 *
 * 【なぜこの変換が必要か】
 * ユーザー入力をそのままHTMLに埋め込むと、`<script>alert('XSS')</script>` のような
 * 悪意のあるスクリプトが実行される可能性がある。
 * HTML特殊文字をエンティティに変換することで、ブラウザが文字として表示する。
 *
 * 【replaceAll の動作】
 * 文字列内の指定パターンを全て置換する。
 * replace() と異なり、最初の一致だけでなく全ての一致を置換する。
 *
 * @param input - サニタイズするテキスト
 * @returns サニタイズされたテキスト（最大1000文字）
 */
export const sanitizeText = (input: string): string => {
  if (!input || typeof input !== "string") {
    return "";
  }

  return input
    .replaceAll("<", "&lt;")    // HTMLタグ開始を無害化
    .replaceAll(">", "&gt;")    // HTMLタグ終了を無害化
    .replaceAll('"', "&quot;")  // ダブルクォートを無害化
    .replaceAll("'", "&#x27;") // シングルクォートを無害化
    .replaceAll("/", "&#x2F;") // スラッシュを無害化
    .trim()                     // 前後の空白を除去
    .substring(0, 1000);        // 最大1000文字に制限（DoS対策）
};

/**
 * escapeHtml - HTML安全な文字列への変換（より包括的なエスケープ）
 *
 * sanitizeText よりも多くの文字をエスケープする。
 *
 * 【追加でエスケープする文字】
 * - `&` → `&amp;`  （HTML エンティティの開始文字。最初に変換する必要がある）
 * - `` ` `` → `&#x60;`  （テンプレートリテラル）
 * - `=` → `&#x3D;`  （属性値の代入）
 *
 * ⚠️ 重要: `&` の変換は必ず最初に行うこと。
 * 後から変換すると、既に変換済みの `&lt;` が `&amp;lt;` になってしまう。
 *
 * @param text - エスケープするテキスト
 * @returns エスケープされたテキスト
 */
export const escapeHtml = (text: string): string => {
  if (!text || typeof text !== "string") {
    return "";
  }

  let result = text;
  result = result.replaceAll("&", "&amp;");   // ⚠️ 最初に変換（順序重要）
  result = result.replaceAll("<", "&lt;");
  result = result.replaceAll(">", "&gt;");
  result = result.replaceAll('"', "&quot;");
  result = result.replaceAll("'", "&#x27;");
  result = result.replaceAll("/", "&#x2F;");
  result = result.replaceAll("`", "&#x60;");
  result = result.replaceAll("=", "&#x3D;");
  return result;
};

// ============================================================================
// ファイル名検証
// ============================================================================

/**
 * validateFileName - ファイル名のセキュリティ検証
 *
 * 【検証する危険パターン】
 *
 * 1. `/\.\./` → パストラバーサル攻撃の検出
 *    "../" でディレクトリを遡り、意図しないファイルにアクセスする攻撃。
 *    例: "../../etc/passwd" → サーバーの設定ファイルにアクセス
 *
 * 2. `/[<>:"/\\|?*]/` → OSで無効なファイル名文字
 *    Windows/Linux/macOS で使用できない文字。
 *
 * 3. `/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i` → Windows予約語
 *    Windowsでは "CON", "NUL" 等の名前のファイルは作成できない。
 *    これらの名前でファイル操作を試みると予期しない動作が発生する。
 *    `i` フラグ → 大文字小文字を区別しない
 *
 * 4. `/^\./` → 隠しファイル（ドットファイル）
 *    Unix系OSではドットで始まるファイルは隠しファイル。
 *    設定ファイル等にアクセスされるリスクがある。
 *
 * 5. `/\.$|\.$/ ` → 末尾のドット
 *    一部のOSで問題を引き起こす可能性がある。
 *
 * @param fileName - 検証するファイル名
 * @returns { isValid: boolean, error?: string }
 */
export const validateFileName = (
  fileName: string
): { isValid: boolean; error?: string } => {
  if (!fileName || typeof fileName !== "string") {
    return { isValid: false, error: "ファイル名が入力されていません" };
  }

  const trimmedName = fileName.trim();
  if (trimmedName.length === 0) {
    return { isValid: false, error: "ファイル名が入力されていません" };
  }

  if (trimmedName.length > 255) {
    return { isValid: false, error: "ファイル名が長すぎます（255文字以内）" };
  }

  // 危険なパターンの配列を順にチェック
  const dangerousPatterns = [
    /\.\./,                                          // パストラバーサル
    /[<>:"/\\|?*]/,                                  // 無効なファイル名文字
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i,      // Windows予約語
    /^\./,                                            // 隠しファイル
    /\.$|\.$/ ,                                       // 末尾のドット
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmedName)) {
      return { isValid: false, error: "無効なファイル名です" };
    }
  }

  return { isValid: true };
};

// ============================================================================
// 日付検証
// ============================================================================

/**
 * validateDate - 日付文字列のセキュリティ検証
 *
 * 日付の形式チェックに加え、過去・未来の範囲制限を行う。
 * 範囲制限は BoundaryConstants.ts の DATE_VALIDATION 定数を使用。
 *
 * 【Date.parse() の動作】
 * 日付文字列を解析してタイムスタンプ（ミリ秒）を返す。
 * 解析できない場合は NaN を返す。
 *
 * 【Number.isNaN() vs isNaN() の違い】
 * - Number.isNaN(x): x が正確にNaN値の場合のみ true
 * - isNaN(x): 暗黙の型変換が入る（isNaN("hello") → true）
 * 厳密なチェックには Number.isNaN() を使用する。
 *
 * @param dateString - 検証する日付文字列
 * @returns { isValid: boolean, error?: string }
 */
export const validateDate = (
  dateString: string
): { isValid: boolean; error?: string } => {
  if (!dateString || typeof dateString !== "string") {
    return { isValid: false, error: "日付が入力されていません" };
  }

  const date = new Date(dateString);
  // getTime() が NaN → 無効な日付文字列
  if (Number.isNaN(date.getTime())) {
    return { isValid: false, error: "有効な日付を入力してください" };
  }

  // 未来日の制限（ちょうどN年後まで有効 = inclusive）
  const today = new Date();
  const futureLimit = new Date(
    today.getFullYear() + DATE_VALIDATION.MAX_FUTURE_YEARS_INCLUSIVE,
    today.getMonth(),
    today.getDate()
  );

  if (date >= futureLimit) {
    return { isValid: false, error: `日付が遠すぎます（${DATE_VALIDATION.MAX_FUTURE_YEARS_INCLUSIVE}年以内）` };
  }

  // 過去日の制限（ちょうどN年前まで有効 = inclusive）
  const pastLimit = new Date(
    today.getFullYear() - DATE_VALIDATION.MAX_PAST_YEARS_INCLUSIVE,
    today.getMonth(),
    today.getDate()
  );
  if (date <= pastLimit) {
    return { isValid: false, error: `日付が古すぎます（${DATE_VALIDATION.MAX_PAST_YEARS_INCLUSIVE}年以内）` };
  }

  return { isValid: true };
};

// ============================================================================
// 時間検証
// ============================================================================

/**
 * validateTime - 時間文字列のセキュリティ検証
 *
 * 【正規表現の解説】
 * `/^([01]?\d|2[0-3]):[0-5]\d$/`
 * - `([01]?\d|2[0-3])` → 時間部分（0-23）
 *   - `[01]?\d` → 0-19（0は省略可。"9:00" も "09:00" も有効）
 *   - `2[0-3]` → 20-23
 * - `:[0-5]\d` → 分部分（00-59）
 *
 * @param timeString - 検証する時間文字列（HH:MM形式）
 * @returns { isValid: boolean, error?: string }
 */
export const validateTime = (
  timeString: string
): { isValid: boolean; error?: string } => {
  if (!timeString || typeof timeString !== "string") {
    return { isValid: false, error: "時間が入力されていません" };
  }

  const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d$/;
  if (!timeRegex.test(timeString)) {
    return {
      isValid: false,
      error: "有効な時間を入力してください（HH:MM形式）",
    };
  }

  return { isValid: true };
};

// ============================================================================
// Store ID検証
// ============================================================================

/**
 * validateStoreId - 店舗IDのセキュリティ検証
 *
 * 【許可する文字パターン】
 * `/^[a-zA-Z0-9_-]+$/`
 * - `a-zA-Z` → 英字（大文字・小文字）
 * - `0-9` → 数字
 * - `_` → アンダースコア
 * - `-` → ハイフン
 * `+` → 1文字以上
 *
 * これ以外の文字（空白、日本語、特殊文字等）を含むとバリデーションエラー。
 * URLやDBクエリで安全に使用できる文字のみを許可する。
 *
 * @param storeId - 検証する店舗ID
 * @returns { isValid: boolean, error?: string }
 */
export const validateStoreId = (
  storeId: string
): { isValid: boolean; error?: string } => {
  if (!storeId || typeof storeId !== "string") {
    return { isValid: false, error: "Store IDが入力されていません" };
  }

  const trimmedStoreId = storeId.trim();
  if (trimmedStoreId.length === 0) {
    return { isValid: false, error: "Store IDが入力されていません" };
  }

  if (trimmedStoreId.length > 50) {
    return { isValid: false, error: "Store IDが長すぎます（50文字以内）" };
  }

  // 英数字・ハイフン・アンダースコアのみ許可
  const storeIdRegex = /^[a-zA-Z0-9_-]+$/;
  if (!storeIdRegex.test(trimmedStoreId)) {
    return {
      isValid: false,
      error: "Store IDは英数字、ハイフン、アンダースコアのみ使用可能です",
    };
  }

  return { isValid: true };
};

// ============================================================================
// 数値検証
// ============================================================================

/**
 * validateNumber - 数値のバリデーション（範囲チェック付き）
 *
 * 文字列と数値の両方を受け付ける。
 * Number.parseFloat() で数値に変換した後、範囲チェックを行う。
 *
 * @param value - 検証する値（文字列または数値）
 * @param min - 最小値（inclusive。省略可）
 * @param max - 最大値（inclusive。省略可）
 * @returns { isValid: boolean, error?: string }
 */
export const validateNumber = (
  value: string | number,
  min?: number,
  max?: number
): { isValid: boolean; error?: string } => {
  // typeof で文字列か数値かを判定し、適切に変換
  const num = typeof value === "string" ? Number.parseFloat(value) : value;

  if (Number.isNaN(num)) {
    return { isValid: false, error: "有効な数値を入力してください" };
  }

  if (min !== undefined && num < min) {
    return { isValid: false, error: `${min}以上の値を入力してください` };
  }

  if (max !== undefined && num > max) {
    return { isValid: false, error: `${max}以下の値を入力してください` };
  }

  return { isValid: true };
};

// ============================================================================
// 包括的フォーム検証システム
// ============================================================================

/**
 * FormValidationRule - フォームフィールドのバリデーションルール定義
 *
 * 1つのフォームフィールドに対するバリデーション設定を定義する。
 * validateForm() に渡すルールオブジェクトの値として使用する。
 *
 * 【TypeScript構文の解説】
 * - ユニオン型（|）: type プロパティが取りうる値の一覧
 * - `?` → オプショナルプロパティ（省略可能）
 */
export interface FormValidationRule {
  value: string | number;                    // フィールドの値
  type:                                       // フィールドの種類
    | "email"
    | "password"
    | "text"
    | "filename"
    | "date"
    | "time"
    | "storeId"
    | "number";
  required?: boolean;                         // 必須項目かどうか（デフォルト: false）
  minLength?: number;                         // 最小文字数
  maxLength?: number;                         // 最大文字数
  min?: number;                               // 最小値（数値用）
  max?: number;                               // 最大値（数値用）
  customValidator?: (value: string | number) => { isValid: boolean; error?: string }; // カスタムバリデーター
}

/**
 * validateByType - 型別の検証を実行するヘルパー関数
 *
 * type に応じて適切なバリデーション関数にディスパッチする。
 *
 * @param value - 検証する値
 * @param type - フィールドの種類
 * @param rule - バリデーションルール
 * @returns { isValid: boolean, error?: string }
 */
const validateByType = (
  value: string | number,
  type: FormValidationRule["type"],
  rule: FormValidationRule
): { isValid: boolean; error?: string } => {
  const str = String(value); // 数値を文字列に変換（文字列専用関数のため）
  switch (type) {
    case "email":
      return validateEmail(str);
    case "password":
      return validatePassword(str);
    case "filename":
      return validateFileName(str);
    case "date":
      return validateDate(str);
    case "time":
      return validateTime(str);
    case "storeId":
      return validateStoreId(str);
    case "number":
      return validateNumber(value, rule.min, rule.max);
    case "text":
    default: {
      // テキスト型: 文字数チェックのみ
      const text = String(value);
      if (rule.minLength && text.length < rule.minLength) {
        return {
          isValid: false,
          error: `${rule.minLength}文字以上入力してください`,
        };
      }
      if (rule.maxLength && text.length > rule.maxLength) {
        return {
          isValid: false,
          error: `${rule.maxLength}文字以内で入力してください`,
        };
      }
      return { isValid: true };
    }
  }
};

/**
 * validateField - 単一フィールドのバリデーションを実行するヘルパー関数
 *
 * 【処理の流れ】
 * 1. 必須チェック（requiredがtrueの場合）
 * 2. 空値スキップ（requiredでない場合、空値はOK）
 * 3. 型別バリデーション（validateByType）
 * 4. カスタムバリデーター（指定されている場合）
 *
 * @param fieldName - フィールド名（エラーメッセージに使用）
 * @param rule - バリデーションルール
 * @returns エラーメッセージ、またはnull（成功時）
 */
const validateField = (
  fieldName: string,
  rule: FormValidationRule
): string | null => {
  const { value, type, required = false } = rule;

  // 必須チェック
  if (
    required &&
    (!value || (typeof value === "string" && value.trim().length === 0))
  ) {
    return `${fieldName}は必須項目です`;
  }

  // 非必須で空の場合はスキップ
  if (!value || (typeof value === "string" && value.trim().length === 0)) {
    return null;
  }

  // 型別バリデーション
  const result = validateByType(value, type, rule);
  if (!result.isValid) {
    return result.error || "入力値が無効です";
  }

  // カスタムバリデーター
  if (rule.customValidator) {
    const customResult = rule.customValidator(value);
    if (!customResult.isValid) {
      return customResult.error || "入力値が無効です";
    }
  }

  return null; // バリデーション成功
};

/**
 * validateForm - 複数フィールドの一括バリデーション
 *
 * フォーム全体のバリデーションを一度に実行する。
 * エラーがあるフィールドのみエラーメッセージを返す。
 *
 * @param rules - フィールド名をキー、バリデーションルールを値とするオブジェクト
 * @returns { isValid: boolean, errors: { [fieldName]: errorMessage } }
 */
export const validateForm = (rules: {
  [key: string]: FormValidationRule;
}): { isValid: boolean; errors: { [key: string]: string } } => {
  const errors: { [key: string]: string } = {};

  // 全フィールドを反復処理
  for (const [fieldName, rule] of Object.entries(rules)) {
    const error = validateField(fieldName, rule);
    if (error) {
      errors[fieldName] = error;
    }
  }

  return {
    // Object.keys(errors).length === 0 → エラーが0件 = バリデーション成功
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================================
// XSS対策の安全な文字列出力
// ============================================================================

/**
 * safeString - XSS対策のための安全な文字列出力
 *
 * sanitizeText（基本サニタイゼーション）と escapeHtml（包括的エスケープ）の
 * 二重処理を行い、最大限の安全性を確保する。
 *
 * @param input - サニタイズするテキスト
 * @returns 二重サニタイズされた安全な文字列
 */
export const safeString = (input: string): string => {
  // 1. sanitizeText: 基本的なサニタイゼーション + 長さ制限
  // 2. escapeHtml: より包括的なHTMLエスケープ
  return escapeHtml(sanitizeText(input));
};

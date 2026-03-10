/**
 * @file AppErrors.ts
 * @description アプリケーション全体で使用するカスタムエラークラスの定義ファイル。
 *
 * 【このファイルの位置づけ】
 * - common/common-errors/ に配置された、アプリ共通のエラー定義
 * - サービス層（services/）やフック（hooks/）からthrowされる
 * - catch文で `instanceof` を使って種別を判別する
 *
 * 【なぜカスタムエラーが必要か】
 * JavaScriptの標準Errorだけでは「認証エラー」「バリデーションエラー」等の
 * 種別を判別できない。カスタムエラーを使うことで、catch文で種別分岐が可能になる。
 *
 * 【使い方の例】
 * ```typescript
 * try {
 *   await login(email, password);
 * } catch (error) {
 *   if (error instanceof AuthError) {
 *     // 認証エラー固有の処理
 *   } else if (error instanceof NetworkError) {
 *     // ネットワークエラー固有の処理
 *   }
 * }
 * ```
 */

/**
 * AppError - 全カスタムエラーの基底クラス
 *
 * JavaScriptの組み込みErrorクラスを継承（extends）している。
 * `code` プロパティでエラーの種別コードを持つ。
 *
 * 【TypeScript構文の解説】
 * - `public readonly code: string` → コンストラクタ引数にpublic readonlyを付けると、
 *   自動的にクラスのプロパティとして宣言＆代入される（TypeScriptのパラメータプロパティ）
 * - `readonly` → 一度代入したら変更不可。エラーコードが後から書き換えられるのを防ぐ
 */
export class AppError extends Error {
  constructor(message: string, public readonly code: string) {
    // super() → 親クラス（Error）のコンストラクタを呼び出す
    // Errorクラスにメッセージを渡して、error.messageで取得可能にする
    super(message);
    // name → エラー名。console.errorやスタックトレースに表示される
    this.name = "AppError";
  }
}

/**
 * AuthError - 認証・ログイン関連のエラー
 *
 * ログイン失敗、セッション切れ、トークン無効などの場合にthrowする。
 * code: "AUTH_ERROR" で統一される。
 */
export class AuthError extends AppError {
  constructor(message: string) {
    // 親クラスAppErrorのコンストラクタに、メッセージとエラーコードを渡す
    super(message, "AUTH_ERROR");
    this.name = "AuthError";
  }
}

/**
 * ValidationError - バリデーション・入力値エラー
 *
 * フォーム入力値が不正、APIリクエストのデータが規定外などの場合にthrowする。
 * code: "VALIDATION_ERROR" で統一される。
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

/**
 * NotFoundError - リソースが見つからないエラー
 *
 * 指定されたID等でデータベースを検索した結果、該当レコードが存在しない場合にthrowする。
 * code: "NOT_FOUND" で統一される。
 */
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

/**
 * PermissionError - 権限不足エラー
 *
 * ユーザーが操作権限を持たないリソースにアクセスしようとした場合にthrowする。
 * 例：講師がマスター専用機能を使おうとした場合。
 * code: "PERMISSION_DENIED" で統一される。
 */
export class PermissionError extends AppError {
  constructor(message: string) {
    super(message, "PERMISSION_DENIED");
    this.name = "PermissionError";
  }
}

/**
 * NetworkError - ネットワーク・外部サービスエラー
 *
 * APIリクエストの失敗、タイムアウト、Supabase接続エラーなどの場合にthrowする。
 * 元のエラー情報（originalError）を保持できるため、デバッグ時に原因を追跡可能。
 *
 * 【TypeScript構文の解説】
 * - `unknown` → any型より安全な「型不明」の型。使う前に型チェックが必要
 * - `?` (オプショナル) → この引数は省略可能であることを示す
 */
export class NetworkError extends AppError {
  public readonly originalError?: unknown;
  constructor(message: string, originalError?: unknown) {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";
    // 元のエラーオブジェクトを保持。デバッグ時に `error.originalError` で参照可能
    this.originalError = originalError;
  }
}

/**
 * ServiceNotInitializedError - サービス未初期化エラー
 *
 * ServiceProviderに登録されるべきサービスがまだ初期化されていない状態で
 * アクセスしようとした場合にthrowする。
 *
 * 【テンプレートリテラルの解説】
 * - `${serviceName}` → 文字列内に変数の値を埋め込む（テンプレートリテラル構文）
 * - バッククォート(`) で囲った文字列内で使用可能
 */
export class ServiceNotInitializedError extends AppError {
  constructor(serviceName: string) {
    super(
      `${serviceName} not initialized. Call ServiceProvider.set${serviceName}() first.`,
      "SERVICE_NOT_INITIALIZED"
    );
    this.name = "ServiceNotInitializedError";
  }
}

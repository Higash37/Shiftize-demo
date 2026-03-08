/**
 * アプリケーション共通エラークラス
 *
 * catch 側でエラー種別を判別可能にするためのカスタムエラー群。
 * 全て AppError を継承し、instanceof で分岐できる。
 */

export class AppError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "AppError";
  }
}

/** 認証・ログイン関連のエラー */
export class AuthError extends AppError {
  constructor(message: string) {
    super(message, "AUTH_ERROR");
    this.name = "AuthError";
  }
}

/** バリデーション・入力値エラー */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

/** リソースが見つからないエラー */
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

/** 権限不足エラー */
export class PermissionError extends AppError {
  constructor(message: string) {
    super(message, "PERMISSION_DENIED");
    this.name = "PermissionError";
  }
}

/** ネットワーク・外部サービスエラー */
export class NetworkError extends AppError {
  public readonly originalError?: unknown;
  constructor(message: string, originalError?: unknown) {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";
    this.originalError = originalError;
  }
}

/** サービス未初期化エラー */
export class ServiceNotInitializedError extends AppError {
  constructor(serviceName: string) {
    super(
      `${serviceName} not initialized. Call ServiceProvider.set${serviceName}() first.`,
      "SERVICE_NOT_INITIALIZED"
    );
    this.name = "ServiceNotInitializedError";
  }
}

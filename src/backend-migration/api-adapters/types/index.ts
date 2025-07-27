/**
 * API型定義のエクスポート
 */

// リクエスト型
export * from './api-requests';

// レスポンス型
export * from './api-responses';

// 共通ユーティリティ型
export type APIMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface APIConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface APIError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, any>;
}
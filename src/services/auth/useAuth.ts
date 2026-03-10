/**
 * @file useAuth.ts
 * @description 認証関連のエクスポートをまとめるバレルファイル（barrel file）。
 *
 * 【このファイルの位置づけ】
 * バレルファイルとは、複数のモジュールのエクスポートを1つのファイルに集約するパターン。
 * これにより、インポート側は以下のように書ける:
 *
 *   // バレルファイルなし（各ファイルから個別にインポート）
 *   import { useAuth } from "@/services/auth/AuthContext";
 *   import { getAuthToken } from "@/services/auth/authToken";
 *
 *   // バレルファイルあり（1つのパスからまとめてインポート）
 *   import { useAuth, getAuthToken } from "@/services/auth/useAuth";
 */

// AuthContext.tsx から useAuth フックを再エクスポート
export { useAuth } from "./AuthContext";

// authToken.ts から getAuthToken 関数を再エクスポート
export { getAuthToken } from "./authToken";

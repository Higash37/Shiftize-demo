/**
 * @file authToken.ts
 * @description Supabase の認証トークン（access_token）を取得するユーティリティ。
 *              API呼び出し時に Authorization ヘッダーにセットして使う。
 *
 * 【このファイルの位置づけ】
 *
 *   コンポーネント / サービス
 *       │
 *       │  const token = await getAuthToken();
 *       │  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
 *       ▼
 *   このファイル
 *       │
 *       │  supabase.auth.getSession() でセッション情報を取得
 *       ▼
 *   Supabase Auth（セッション管理）
 *
 * access_token とは？
 * → ユーザーがログイン済みであることを証明する文字列（JWT形式）。
 *   API呼び出し時にこのトークンを送ることで、サーバー側が「誰のリクエストか」を判定する。
 */

import { getSupabase } from "../supabase/supabase-client";

/**
 * 認証トークンを取得する関数。
 *
 * @returns access_token 文字列、またはログインしていない場合は null
 *
 * 【TypeScript構文解説: Promise<string | null>】
 * - Promise<T> は「非同期処理の結果が T 型で返ってくる」ことを表す
 * - string | null はユニオン型で「文字列か null のどちらか」
 * - async 関数は自動的に Promise を返す
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    // Supabase クライアントを取得
    const supabase = getSupabase();

    // 現在のセッション情報を取得する
    // data の中に session オブジェクトがある（分割代入で取り出し）
    const { data: { session } } = await supabase.auth.getSession();

    // session?.access_token は オプショナルチェーン（?. ）
    // → session が null/undefined の場合、undefined を返す（エラーにならない）
    // ?? は null合体演算子。左辺が null または undefined の場合に右辺の値を使う
    return session?.access_token ?? null;
  } catch {
    // エラー時は null を返す（トークンなし = 未認証として扱う）
    return null;
  }
};

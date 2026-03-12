/**
 * @file GoogleCalendarTokenManager.ts
 * @description Google OAuthトークンの取得・更新・保存を管理するクラス。
 *
 * 【このファイルの位置づけ】
 * Google Calendar APIを呼ぶには「アクセストークン」が必要。
 * アクセストークンには有効期限（通常1時間）があり、期限切れになったら
 * 「リフレッシュトークン」を使って新しいアクセストークンを取得する。
 *
 *   GoogleCalendarSyncService
 *        ↓ getValidAccessToken(uid)
 *   GoogleCalendarTokenManager（★このファイル）
 *        ↓ DBからトークン取得                    ↓ 期限切れの場合
 *   Supabase DB（user_google_tokens テーブル）   Supabase Edge Function
 *                                                     ↓
 *                                                Google OAuth Token API
 *
 * 【OAuthトークンの仕組み】
 * 1. ユーザーがGoogleログインすると、3つのトークンが発行される:
 *    - access_token: APIを呼ぶための短命トークン（1時間）
 *    - refresh_token: access_tokenを再発行するための長命トークン
 *    - token_expires_at: access_tokenの有効期限
 * 2. access_tokenが期限切れ → refresh_tokenを使って新しいaccess_tokenを取得
 * 3. refresh_tokenが無効化されることもある（ユーザーがGoogleで連携解除した場合等）
 */

// getSupabase: Supabaseクライアントインスタンスを取得する関数
import { getSupabase } from "../supabase/supabase-client";
// GoogleTokens: トークン型（accessToken, refreshToken, expiresAt）
import type { GoogleTokens } from "./GoogleCalendarTypes";

/**
 * トークンのリフレッシュ余裕時間: 5分（ミリ秒）。
 * 有効期限の5分前にリフレッシュすることで、
 * APIコール中にトークンが切れるリスクを回避する。
 */
const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000; // 5分 = 300,000ミリ秒

/**
 * GoogleCalendarTokenManager: OAuthトークンのライフサイクルを管理するクラス。
 */
export class GoogleCalendarTokenManager {
  /**
   * getValidAccessToken: 有効なアクセストークンを取得する。
   *
   * 処理の流れ:
   * 1. RPC経由でDBからトークンを取得（RLSバイパス）
   * 2. 有効期限を確認
   * 3. まだ有効 → そのまま返す
   * 4. 期限切れ or 期限間近 → Edge Functionでリフレッシュ
   *
   * 【RLS（Row Level Security）バイパスとは】
   * Supabaseのテーブルにはアクセス制御ポリシー（RLS）が設定されている。
   * 通常、ユーザーは自分のデータしか読めない。
   * しかしmasterユーザーが他ユーザーのトークンを取得する必要がある場面では、
   * RPC関数（SECURITY DEFINER）を使ってRLSをバイパスする。
   *
   * @param uid - 対象ユーザーのUID
   * @returns Promise<string | null> - 有効なアクセストークン、取得できない場合はnull
   */
  async getValidAccessToken(uid: string): Promise<string | null> {
    const supabase = getSupabase();

    // RPC関数 "get_google_tokens_for_user" を呼んでトークンを取得
    // RPC関数はPostgreSQLのストアドプロシージャで、SECURITY DEFINERで定義されている
    const { data: rows, error } = await supabase
      .rpc("get_google_tokens_for_user", { target_uid: uid });

    // rows は配列で返る。最初の要素を取得（なければnull）
    // ?. : オプショナルチェーン。rows がnull/undefinedの場合にエラーにならない
    // ?? : null合体演算子。左辺がnull/undefinedの場合に右辺を返す
    const data = rows?.[0] ?? null;
    // トークンが存在しない、またはRPCエラーの場合はnull
    if (error || !data) return null;

    // 有効期限のチェック
    // Date.getTime(): ミリ秒のタイムスタンプに変換
    const expiresAt = new Date(data.token_expires_at).getTime();
    const now = Date.now();

    // 有効期限まで5分以上の余裕がある → そのまま返す
    if (expiresAt - now > TOKEN_REFRESH_MARGIN_MS) {
      return data.access_token;
    }

    // 期限切れ or 5分以内に切れる → Edge Functionでリフレッシュ
    return this.refreshToken(uid);
  }

  /**
   * refreshToken: Supabase Edge Functionを呼んでアクセストークンをリフレッシュする。
   *
   * 【Edge Functionとは】
   * Supabaseが提供するサーバーレス関数の実行環境（Deno Runtime）。
   * クライアント側で秘密鍵（Google OAuth Client Secret）を扱えないため、
   * Edge Functionにリフレッシュ処理を委譲する。
   *
   * Edge Function "refresh-google-token" の処理:
   * 1. DBからユーザーのrefresh_tokenを取得
   * 2. Google OAuth Token APIに送信して新しいaccess_tokenを取得
   * 3. 新しいトークンをDBに保存
   * 4. 新しいaccess_tokenをレスポンスで返す
   *
   * private: このクラス内部からのみ呼び出し可能
   *
   * @param uid - 対象ユーザーのUID
   * @returns Promise<string | null> - 新しいアクセストークン、失敗時はnull
   */
  private async refreshToken(uid: string): Promise<string | null> {
    const supabase = getSupabase();

    // 現在のセッションを取得（Edge Function呼び出しの認証に使用）
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    // Edge Function "refresh-google-token" を呼び出し
    // supabase.functions.invoke: Supabase Edge Functionを呼ぶメソッド
    const { data, error } = await supabase.functions.invoke("refresh-google-token", {
      headers: {
        // Edge FunctionへのリクエストにもSupabaseの認証ヘッダーを付与
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    // リフレッシュ失敗時（トークン無効化、ネットワークエラー等）
    if (error || !data?.access_token) {
      return null;
    }

    // リフレッシュされた新しいアクセストークンを返す
    return data.access_token;
  }

  /**
   * saveTokensFromSession: OAuthセッションから取得したトークンをDBに保存する。
   * ユーザーがGoogleログインに成功した直後に呼ばれる。
   *
   * 【upsert とは】
   * INSERT + UPDATE の合成語。
   * レコードが存在しなければINSERT、存在すればUPDATEする。
   * 「uidが同じレコードがあれば上書き、なければ新規作成」という動作。
   *
   * @param uid - ユーザーUID
   * @param accessToken - Googleのアクセストークン
   * @param refreshToken - Googleのリフレッシュトークン
   * @throws Error - 保存失敗時
   */
  async saveTokensFromSession(
    uid: string,
    accessToken: string,
    refreshToken: string
  ): Promise<void> {
    const supabase = getSupabase();
    // 有効期限: 現在から1時間後（Googleのデフォルト有効期限）
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString(); // 3600秒 = 1時間

    // upsert: 既存レコードがあれば更新、なければ挿入
    const { error } = await supabase
      .from("user_google_tokens")
      .upsert({
        uid,                              // プライマリキー（既存レコードの判定に使用）
        access_token: accessToken,        // アクセストークン
        refresh_token: refreshToken,      // リフレッシュトークン
        token_expires_at: expiresAt,      // 有効期限（ISO 8601形式の文字列）
        calendar_sync_enabled: true,      // 保存時点で同期を有効化
        updated_at: new Date().toISOString(), // 最終更新日時
      });

    if (error) {
      throw new Error(`トークン保存に失敗しました: ${error.message}`);
    }
  }

  /**
   * clearTokens: ユーザーのトークンをDBから削除する。
   * OAuth連携解除やアカウント削除時に使用する。
   *
   * @param uid - ユーザーUID
   */
  async clearTokens(uid: string): Promise<void> {
    const supabase = getSupabase();
    // DELETE文: uid が一致するレコードを削除
    await supabase
      .from("user_google_tokens")
      .delete()
      .eq("uid", uid);
  }
}

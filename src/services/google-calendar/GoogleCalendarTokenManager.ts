import { getSupabase } from "../supabase/supabase-client";
import type { GoogleTokens } from "./GoogleCalendarTypes";

const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000; // 5分前にリフレッシュ

export class GoogleCalendarTokenManager {
  /** 有効なアクセストークンを取得（RPC経由でRLSバイパス。期限切れならEdge Functionでリフレッシュ） */
  async getValidAccessToken(uid: string): Promise<string | null> {
    const supabase = getSupabase();

    // RPC関数でRLSをバイパス（masterが他ユーザーのトークンを取得可能）
    const { data: rows, error } = await supabase
      .rpc("get_google_tokens_for_user", { target_uid: uid });

    const data = rows?.[0] ?? null;
    if (error || !data) return null;

    const expiresAt = new Date(data.token_expires_at).getTime();
    const now = Date.now();

    // まだ有効ならそのまま返す
    if (expiresAt - now > TOKEN_REFRESH_MARGIN_MS) {
      return data.access_token;
    }

    // 期限切れ → Edge Functionでリフレッシュ
    return this.refreshToken(uid);
  }

  /** Edge Functionを呼んでトークンをリフレッシュ */
  private async refreshToken(uid: string): Promise<string | null> {
    const supabase = getSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data, error } = await supabase.functions.invoke("refresh-google-token", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error || !data?.access_token) {
      console.warn("Google token refresh failed:", error);
      return null;
    }

    return data.access_token;
  }

  /** OAuthセッションからトークンをDBに保存 */
  async saveTokensFromSession(
    uid: string,
    accessToken: string,
    refreshToken: string
  ): Promise<void> {
    const supabase = getSupabase();
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString(); // 1時間後

    const { error } = await supabase
      .from("user_google_tokens")
      .upsert({
        uid,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: expiresAt,
        calendar_sync_enabled: true,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`トークン保存に失敗しました: ${error.message}`);
    }
  }

  /** トークンを削除 */
  async clearTokens(uid: string): Promise<void> {
    const supabase = getSupabase();
    await supabase
      .from("user_google_tokens")
      .delete()
      .eq("uid", uid);
  }
}

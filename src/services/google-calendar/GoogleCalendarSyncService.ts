/**
 * @file GoogleCalendarSyncService.ts
 * @description シフトとGoogle Calendarの同期を管理するサービス層。
 *
 * 【このファイルの位置づけ】
 * IGoogleCalendarService インターフェースを実装し、シフトのCRUD操作を
 * Google Calendar APIとの同期に変換するビジネスロジック層。
 *
 *   アプリのシフト操作
 *        ↓
 *   GoogleCalendarSyncService（★このファイル: 同期の判断ロジック）
 *        ↓ トークン取得          ↓ イベント作成/更新/削除
 *   GoogleCalendarTokenManager    GoogleCalendarClient
 *        ↓                          ↓
 *   Supabase DB（トークン保存）   Google Calendar API
 *
 * 【implements キーワード】
 * class A implements B は「AはBインターフェースの全メソッドを実装する」という宣言。
 * もしメソッドが足りなければTypeScriptがコンパイルエラーを出す。
 * これにより、サービスの入れ替え（例: Google→Outlook）が容易になる。
 */

// IGoogleCalendarService: Google Calendar連携サービスのインターフェース（契約）
import type { IGoogleCalendarService } from "../interfaces/IGoogleCalendarService";
// Shift: アプリ内のシフトデータ型
import type { Shift } from "@/common/common-models/model-shift/shiftTypes";
// CalendarSyncStatus: カレンダー同期状態の型
import type { CalendarSyncStatus } from "./GoogleCalendarTypes";
// GoogleCalendarTokenManager: OAuthトークンの取得・更新・保存を管理するクラス
import { GoogleCalendarTokenManager } from "./GoogleCalendarTokenManager";
// GoogleCalendarClient の関数群: シフト→イベント変換、API通信
import {
  shiftToCalendarEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from "./GoogleCalendarClient";
// getSupabase: Supabaseクライアントを取得する関数
import { getSupabase } from "../supabase/supabase-client";

/**
 * GoogleCalendarSyncService: Google Calendar同期サービスの実装クラス。
 * ServiceProviderに登録され、アプリ全体から利用される。
 */
export class GoogleCalendarSyncService implements IGoogleCalendarService {
  /**
   * tokenManager: OAuthトークンの管理を委譲するインスタンス。
   * private: このクラスの外部からはアクセスできない。
   */
  private tokenManager = new GoogleCalendarTokenManager();

  /**
   * syncShiftToCalendar: シフトをGoogle Calendarに同期する。
   *
   * 【同期ロジック】
   * 1. シフトのstatusが "approved"（承認済み）でなければ同期しない
   *    - もし既にカレンダーにイベントがあれば削除する
   * 2. 有効なアクセストークンを取得（期限切れなら自動更新）
   * 3. ユーザーの同期設定を確認（無効ならスキップ）
   * 4. 既存イベントがあればupdate、なければcreate
   *
   * @param shift - 同期対象のシフト（& { id: string } は「Shift型にid必須を追加」の意味）
   * @returns Promise<string | null> - 作成/更新されたイベントID、または同期不要時はnull
   */
  async syncShiftToCalendar(shift: Shift & { id: string }): Promise<string | null> {
    // 承認済み以外のシフトはカレンダーに同期しない
    if (shift.status !== "approved") {
      // 既にカレンダーにイベントがある場合は削除する（ステータスが取消された等）
      if (shift.googleCalendarEventId) {
        await this.removeShiftFromCalendar(shift.id, shift.googleCalendarEventId);
      }
      return null;
    }

    // OAuthアクセストークンを取得（期限切れの場合はEdge Functionで自動更新）
    const accessToken = await this.tokenManager.getValidAccessToken(shift.userId);
    // トークンがない = OAuth連携していない → 同期スキップ
    if (!accessToken) return null;

    // ユーザーの同期設定を確認
    const syncStatus = await this.getSyncStatus(shift.userId);
    // 同期がOFFなら何もしない
    if (!syncStatus.enabled) return null;

    // シフトデータをGoogle Calendar APIのイベント形式に変換
    const event = shiftToCalendarEvent(shift);

    if (shift.googleCalendarEventId) {
      // 既存イベントがある場合 → 更新（PATCH）
      await updateEvent(accessToken, shift.googleCalendarEventId, event);
      return shift.googleCalendarEventId;
    } else {
      // 新規イベント → 作成（POST）
      const eventId = await createEvent(accessToken, event);

      // 作成されたイベントIDをshiftsテーブルに保存（次回の更新・削除時に参照）
      const supabase = getSupabase();
      await supabase
        .from("shifts")
        .update({ google_calendar_event_id: eventId })
        .eq("id", shift.id);

      return eventId;
    }
  }

  /**
   * removeShiftFromCalendar: Google Calendarからシフトに対応するイベントを削除する。
   *
   * @param shiftId - 対象シフトのID（shiftsテーブルのPK）
   * @param eventId - Google Calendar上のイベントID
   */
  async removeShiftFromCalendar(shiftId: string, eventId: string): Promise<void> {
    // シフトに紐づくuserIdを取得（トークン取得のために必要）
    const supabase = getSupabase();
    const { data: shiftRow } = await supabase
      .from("shifts")
      .select("user_id")          // user_idカラムだけ取得（パフォーマンス最適化）
      .eq("id", shiftId)          // WHERE id = shiftId
      .maybeSingle();             // 0件ならnull、1件ならオブジェクトを返す

    // シフトが見つからない場合は何もしない
    if (!shiftRow) return;

    // ユーザーのアクセストークンを取得
    const accessToken = await this.tokenManager.getValidAccessToken(shiftRow.user_id);
    if (!accessToken) return;

    // Google Calendar APIでイベント削除
    await deleteEvent(accessToken, eventId);

    // shiftsテーブルのeventIdをクリア（nullに更新）
    await supabase
      .from("shifts")
      .update({ google_calendar_event_id: null })
      .eq("id", shiftId);
  }

  /**
   * getSyncStatus: ユーザーのカレンダー同期状態を取得する。
   *
   * 【RPC（Remote Procedure Call）とは】
   * Supabase RPCは、PostgreSQLの関数をHTTP経由で呼び出す仕組み。
   * ここでは "get_google_tokens_for_user" という関数を呼ぶ。
   * RPC関数はSECURITY DEFINER（定義者権限）で実行されるため、
   * RLS（Row Level Security）をバイパスしてデータにアクセスできる。
   * これによりmasterユーザーが他ユーザーのトークン状態を確認できる。
   *
   * @param uid - 対象ユーザーのUID
   * @returns CalendarSyncStatus - 同期の有効/無効とトークンの有無
   */
  async getSyncStatus(uid: string): Promise<CalendarSyncStatus> {
    const supabase = getSupabase();
    // RPC関数呼び出し: target_uid パラメータを渡す
    const { data: rows } = await supabase
      .rpc("get_google_tokens_for_user", { target_uid: uid });

    // rows は配列で返る。最初の要素を取得（なければnull）
    const data = rows?.[0] ?? null;
    return {
      enabled: data?.calendar_sync_enabled ?? false,  // 同期ON/OFF
      hasTokens: !!data,                               // トークンが存在するか（!!でboolean変換）
    };
  }

  /**
   * setSyncEnabled: カレンダー同期の有効/無効を切り替える。
   *
   * @param uid - 対象ユーザーのUID
   * @param enabled - true: 同期有効、false: 同期無効
   * @throws Error - 更新失敗時
   */
  async setSyncEnabled(uid: string, enabled: boolean): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("user_google_tokens")
      .update({
        calendar_sync_enabled: enabled,
        updated_at: new Date().toISOString(),  // 更新日時を記録
      })
      .eq("uid", uid);

    if (error) {
      throw new Error(`同期設定の更新に失敗しました: ${error.message}`);
    }
  }

  /**
   * saveOAuthTokens: OAuth認証で取得したトークンをDBに保存する。
   * AuthContextのonAuthStateChangeから呼ばれる。
   *
   * @param uid - ユーザーUID
   * @param providerToken - Googleのアクセストークン
   * @param refreshToken - Googleのリフレッシュトークン
   */
  async saveOAuthTokens(
    uid: string,
    providerToken: string,
    refreshToken: string
  ): Promise<void> {
    // 実際の保存処理はTokenManagerに委譲
    await this.tokenManager.saveTokensFromSession(uid, providerToken, refreshToken);
  }

  /**
   * clearCalendarData: ユーザーのカレンダー連携データを全削除する。
   * アカウント削除時やOAuth連携解除時に使用する。
   *
   * @param uid - ユーザーUID
   */
  async clearCalendarData(uid: string): Promise<void> {
    await this.tokenManager.clearTokens(uid);
  }
}

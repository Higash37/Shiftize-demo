import type { IGoogleCalendarService } from "../interfaces/IGoogleCalendarService";
import type { Shift } from "@/common/common-models/model-shift/shiftTypes";
import type { CalendarSyncStatus } from "./GoogleCalendarTypes";
import { GoogleCalendarTokenManager } from "./GoogleCalendarTokenManager";
import {
  shiftToCalendarEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from "./GoogleCalendarClient";
import { getSupabase } from "../supabase/supabase-client";

export class GoogleCalendarSyncService implements IGoogleCalendarService {
  private tokenManager = new GoogleCalendarTokenManager();

  async syncShiftToCalendar(shift: Shift & { id: string }): Promise<string | null> {
    // approved以外は同期しない
    if (shift.status !== "approved") {
      if (shift.googleCalendarEventId) {
        await this.removeShiftFromCalendar(shift.id, shift.googleCalendarEventId);
      }
      return null;
    }

    const accessToken = await this.tokenManager.getValidAccessToken(shift.userId);
    if (!accessToken) return null;

    const syncStatus = await this.getSyncStatus(shift.userId);
    if (!syncStatus.enabled) return null;

    const event = shiftToCalendarEvent(shift);

    if (shift.googleCalendarEventId) {
      await updateEvent(accessToken, shift.googleCalendarEventId, event);
      return shift.googleCalendarEventId;
    } else {
      const eventId = await createEvent(accessToken, event);

      const supabase = getSupabase();
      await supabase
        .from("shifts")
        .update({ google_calendar_event_id: eventId })
        .eq("id", shift.id);

      return eventId;
    }
  }

  async removeShiftFromCalendar(shiftId: string, eventId: string): Promise<void> {
    // シフトのuserIdを取得してトークンを取得
    const supabase = getSupabase();
    const { data: shiftRow } = await supabase
      .from("shifts")
      .select("user_id")
      .eq("id", shiftId)
      .maybeSingle();

    if (!shiftRow) return;

    const accessToken = await this.tokenManager.getValidAccessToken(shiftRow.user_id);
    if (!accessToken) return;

    await deleteEvent(accessToken, eventId);

    // eventIdをクリア
    await supabase
      .from("shifts")
      .update({ google_calendar_event_id: null })
      .eq("id", shiftId);
  }

  async getSyncStatus(uid: string): Promise<CalendarSyncStatus> {
    const supabase = getSupabase();
    // RPC経由でRLSバイパス（masterが他ユーザーの状態を確認可能）
    const { data: rows } = await supabase
      .rpc("get_google_tokens_for_user", { target_uid: uid });

    const data = rows?.[0] ?? null;
    return {
      enabled: data?.calendar_sync_enabled ?? false,
      hasTokens: !!data,
    };
  }

  async setSyncEnabled(uid: string, enabled: boolean): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("user_google_tokens")
      .update({
        calendar_sync_enabled: enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("uid", uid);

    if (error) {
      throw new Error(`同期設定の更新に失敗しました: ${error.message}`);
    }
  }

  async saveOAuthTokens(
    uid: string,
    providerToken: string,
    refreshToken: string
  ): Promise<void> {
    await this.tokenManager.saveTokensFromSession(uid, providerToken, refreshToken);
  }

  async clearCalendarData(uid: string): Promise<void> {
    await this.tokenManager.clearTokens(uid);
  }
}

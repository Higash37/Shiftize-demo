/** @file IGoogleCalendarService.ts @description Google Calendarとのシフト同期サービスのインターフェース */

import type { Shift } from "@/common/common-models/model-shift/shiftTypes";
import type { CalendarSyncStatus } from "../google-calendar/GoogleCalendarTypes";

/** Google Calendarとシフトを同期するサービス */
export interface IGoogleCalendarService {
  /** シフトをGoogle Calendarに同期（作成or更新） */
  syncShiftToCalendar(shift: Shift & { id: string }): Promise<string | null>;

  /** Google CalendarイベントをシフトIDで削除 */
  removeShiftFromCalendar(shiftId: string, eventId: string): Promise<void>;

  /** 同期状態を取得する */
  getSyncStatus(uid: string): Promise<CalendarSyncStatus>;

  /** 同期ON/OFF切り替え */
  setSyncEnabled(uid: string, enabled: boolean): Promise<void>;

  /** OAuthトークンをDBに保存する */
  saveOAuthTokens(uid: string, providerToken: string, refreshToken: string): Promise<void>;

  /** トークンと同期設定をクリアする */
  clearCalendarData(uid: string): Promise<void>;
}

/**
 * Google Calendar同期に関する型定義
 */

/** Google Calendar APIのイベント形式 */
export interface GoogleCalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
}

/** Google OAuthトークン */
export interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

/** カレンダー同期ステータス */
export interface CalendarSyncStatus {
  enabled: boolean;
  hasTokens: boolean;
}

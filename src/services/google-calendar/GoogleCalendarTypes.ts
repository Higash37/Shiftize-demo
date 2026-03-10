/**
 * @file GoogleCalendarTypes.ts
 * @description Google Calendar連携に関する型定義ファイル。
 *
 * 【このファイルの位置づけ】
 * Google Calendar連携モジュール（google-calendar/）で使う型をまとめて定義している。
 * 他のファイル（Client, SyncService, TokenManager）がこのファイルから型をインポートする。
 *
 * 型定義ファイルはロジックを持たず、型（interface / type）のみを定義する。
 * ビルド後のJavaScriptには一切出力されない（TypeScript専用）。
 */

/**
 * GoogleCalendarEvent: Google Calendar APIのイベント形式。
 * Google Calendar REST API の events.insert / events.update に送る
 * リクエストボディの構造に対応する。
 *
 * 参考: https://developers.google.com/calendar/api/v3/reference/events
 *
 * - summary: イベントのタイトル（例: "田中のシフト"）
 * - description: イベントの説明文（任意）。科目やメモを入れる
 * - start/end: 開始・終了の日時とタイムゾーン
 *   - dateTime: ISO 8601形式（例: "2025-03-10T09:00:00"）
 *   - timeZone: IANAタイムゾーン名（例: "Asia/Tokyo"）
 */
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

/**
 * GoogleTokens: Google OAuthで取得するトークン一式。
 * - accessToken: Google APIを呼ぶための一時的なトークン（有効期限: 通常1時間）
 * - refreshToken: accessTokenの有効期限切れ時に新しいトークンを取得するためのトークン
 * - expiresAt: accessTokenの有効期限（この時刻を過ぎたらrefreshが必要）
 */
export interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

/**
 * CalendarSyncStatus: カレンダー同期の状態を表す型。
 * - enabled: ユーザーがカレンダー同期を有効にしているか
 * - hasTokens: OAuthトークンがDBに保存されているか
 *   （hasTokens=true でも enabled=false ならトークンはあるが同期はOFF）
 */
export interface CalendarSyncStatus {
  enabled: boolean;
  hasTokens: boolean;
}

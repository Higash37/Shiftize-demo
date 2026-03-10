/**
 * @file GoogleCalendarClient.ts
 * @description Google Calendar REST APIとの直接通信を担当するクライアント層。
 *
 * 【このファイルの位置づけ】
 * このファイルはGoogle Calendar APIへのHTTPリクエストを直接発行する低レベルモジュール。
 *
 *   GoogleCalendarSyncService（ビジネスロジック）
 *        ↓ 呼び出す
 *   GoogleCalendarClient（★このファイル: HTTPリクエスト）
 *        ↓ fetch()
 *   Google Calendar REST API（Googleのサーバー）
 *
 * 【Google Calendar REST API の基本】
 * - ベースURL: https://www.googleapis.com/calendar/v3
 * - 認証方式: Bearer トークン（Authorization: Bearer <access_token>）
 * - "primary" は「ユーザーのデフォルトカレンダー」を指すエイリアス
 *
 * 【主要な関数】
 * - shiftToCalendarEvent: アプリのシフトデータ → Google Calendar API形式に変換
 * - createEvent: イベントを新規作成
 * - updateEvent: 既存イベントを部分更新（PATCH）
 * - deleteEvent: イベントを削除
 */

// Shift: アプリ内のシフトデータの型定義
import type { Shift } from "@/common/common-models/model-shift/shiftTypes";
// GoogleCalendarEvent: Google Calendar APIのイベント型
import type { GoogleCalendarEvent } from "./GoogleCalendarTypes";

/** Google Calendar REST API のベースURL */
const CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";

/** タイムゾーン: 日本標準時（JST, UTC+9） */
const TIMEZONE = "Asia/Tokyo";

/**
 * shiftToCalendarEvent: アプリ内部のShift型をGoogle Calendar APIのイベント形式に変換する。
 *
 * 変換のマッピング:
 *   Shift.date + Shift.startTime → event.start.dateTime（例: "2025-03-10T09:00:00"）
 *   Shift.date + Shift.endTime   → event.end.dateTime（例: "2025-03-10T17:00:00"）
 *   Shift.nickname               → event.summary（例: "田中のシフト"）
 *   Shift.subject + Shift.notes  → event.description（例: "数学\n補足メモ"）
 *
 * @param shift - アプリのシフトデータ
 * @returns GoogleCalendarEvent - Google Calendar API用のイベントオブジェクト
 */
export function shiftToCalendarEvent(shift: Shift): GoogleCalendarEvent {
  // 日付と時刻を結合してISO 8601形式の日時文字列を生成
  // T は日付と時刻の区切り文字（ISO 8601規格）
  const startDateTime = `${shift.date}T${shift.startTime}:00`;
  const endDateTime = `${shift.date}T${shift.endTime}:00`;

  // 説明文の組み立て: 科目とメモがあれば改行区切りで結合
  const parts: string[] = [];
  if (shift.subject) parts.push(shift.subject);
  if (shift.notes) parts.push(shift.notes);

  // イベントオブジェクトの構築
  const event: GoogleCalendarEvent = {
    summary: `${shift.nickname || "シフト"}のシフト`,  // タイトル
    start: { dateTime: startDateTime, timeZone: TIMEZONE },  // 開始日時
    end: { dateTime: endDateTime, timeZone: TIMEZONE },      // 終了日時
  };
  // 説明文は内容がある場合のみセット
  if (parts.length > 0) {
    event.description = parts.join("\n");
  }
  return event;
}

/**
 * createEvent: Google Calendarに新しいイベントを作成する。
 *
 * HTTP仕様:
 *   POST https://www.googleapis.com/calendar/v3/calendars/primary/events
 *   Authorization: Bearer <access_token>
 *   Content-Type: application/json
 *   Body: { summary, start, end, description? }
 *
 * @param accessToken - Google OAuth のアクセストークン
 * @param event - 作成するイベントのデータ
 * @returns Promise<string> - 作成されたイベントのID（更新・削除時に使用）
 * @throws Error - APIエラー時
 */
export async function createEvent(
  accessToken: string,
  event: GoogleCalendarEvent
): Promise<string> {
  // fetch: ブラウザ標準のHTTPクライアント。HTTP通信を行う。
  const res = await fetch(`${CALENDAR_API_BASE}/calendars/primary/events`, {
    method: "POST",  // 新規作成はPOST
    headers: {
      Authorization: `Bearer ${accessToken}`,  // OAuth2 Bearer認証
      "Content-Type": "application/json",       // リクエストボディはJSON
    },
    body: JSON.stringify(event),  // JavaScriptオブジェクトをJSON文字列に変換
  });

  // res.ok: ステータスコードが200-299の範囲ならtrue
  if (!res.ok) {
    const body = await res.text();  // エラー詳細をレスポンスボディから取得
    throw new Error(`Google Calendar API error (create): ${res.status} ${body}`);
  }

  // レスポンスのJSONをパースして、作成されたイベントのIDを返す
  const data = await res.json();
  return data.id;
}

/**
 * updateEvent: 既存のGoogle Calendarイベントを部分更新する。
 *
 * HTTP仕様:
 *   PATCH https://www.googleapis.com/calendar/v3/calendars/primary/events/{eventId}
 *   ※ PATCH は「指定したフィールドだけ更新」（PUT は全フィールド上書き）
 *
 * @param accessToken - Google OAuth のアクセストークン
 * @param eventId - 更新対象のイベントID
 * @param event - 更新するフィールドのデータ
 * @throws Error - APIエラー時
 */
export async function updateEvent(
  accessToken: string,
  eventId: string,
  event: GoogleCalendarEvent
): Promise<void> {
  const res = await fetch(
    // encodeURIComponent: URLに含められない特殊文字をエンコードする
    // eventId に特殊文字が含まれる可能性があるため安全策
    `${CALENDAR_API_BASE}/calendars/primary/events/${encodeURIComponent(eventId)}`,
    {
      method: "PATCH",  // 部分更新はPATCH
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Calendar API error (update): ${res.status} ${body}`);
  }
  // 戻り値なし（void）。更新成功すればそれでOK
}

/**
 * deleteEvent: Google Calendarからイベントを削除する。
 *
 * HTTP仕様:
 *   DELETE https://www.googleapis.com/calendar/v3/calendars/primary/events/{eventId}
 *
 * 注意: 404（Not Found）は「既に削除済み」として成功扱いにする。
 * これは冪等性（べきとうせい）の考え方 — 同じ操作を何度実行しても結果が同じであること。
 *
 * @param accessToken - Google OAuth のアクセストークン
 * @param eventId - 削除対象のイベントID
 * @throws Error - 404以外のAPIエラー時
 */
export async function deleteEvent(
  accessToken: string,
  eventId: string
): Promise<void> {
  const res = await fetch(
    `${CALENDAR_API_BASE}/calendars/primary/events/${encodeURIComponent(eventId)}`,
    {
      method: "DELETE",  // 削除はDELETE
      headers: {
        Authorization: `Bearer ${accessToken}`,  // 認証ヘッダーのみ（ボディなし）
      },
    }
  );

  // 404（Not Found）は「既に削除済み」として成功扱い
  if (!res.ok && res.status !== 404) {
    const body = await res.text();
    throw new Error(`Google Calendar API error (delete): ${res.status} ${body}`);
  }
}

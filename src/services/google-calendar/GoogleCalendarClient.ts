import type { Shift } from "@/common/common-models/model-shift/shiftTypes";
import type { GoogleCalendarEvent } from "./GoogleCalendarTypes";

const CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";
const TIMEZONE = "Asia/Tokyo";

/** Shift → Google Calendar Event 変換 */
export function shiftToCalendarEvent(shift: Shift): GoogleCalendarEvent {
  const startDateTime = `${shift.date}T${shift.startTime}:00`;
  const endDateTime = `${shift.date}T${shift.endTime}:00`;

  const parts: string[] = [];
  if (shift.subject) parts.push(shift.subject);
  if (shift.notes) parts.push(shift.notes);

  const event: GoogleCalendarEvent = {
    summary: `${shift.nickname || "シフト"}のシフト`,
    start: { dateTime: startDateTime, timeZone: TIMEZONE },
    end: { dateTime: endDateTime, timeZone: TIMEZONE },
  };
  if (parts.length > 0) {
    event.description = parts.join("\n");
  }
  return event;
}

/** イベント作成 */
export async function createEvent(
  accessToken: string,
  event: GoogleCalendarEvent
): Promise<string> {
  const res = await fetch(`${CALENDAR_API_BASE}/calendars/primary/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Calendar API error (create): ${res.status} ${body}`);
  }

  const data = await res.json();
  return data.id;
}

/** イベント更新 */
export async function updateEvent(
  accessToken: string,
  eventId: string,
  event: GoogleCalendarEvent
): Promise<void> {
  const res = await fetch(
    `${CALENDAR_API_BASE}/calendars/primary/events/${encodeURIComponent(eventId)}`,
    {
      method: "PATCH",
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
}

/** イベント削除 */
export async function deleteEvent(
  accessToken: string,
  eventId: string
): Promise<void> {
  const res = await fetch(
    `${CALENDAR_API_BASE}/calendars/primary/events/${encodeURIComponent(eventId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  // 404 = already deleted, treat as success
  if (!res.ok && res.status !== 404) {
    const body = await res.text();
    throw new Error(`Google Calendar API error (delete): ${res.status} ${body}`);
  }
}

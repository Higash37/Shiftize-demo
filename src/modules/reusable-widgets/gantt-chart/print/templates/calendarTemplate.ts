import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ja } from "date-fns/locale";
import { UserShiftData } from "../utils/shiftDataProcessor";

export const generateCalendarHTML = (
  userShiftData: UserShiftData[],
  selectedDate: Date
): string => {
  const monthYear = format(selectedDate, "yyyy年M月", { locale: ja });
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // カレンダーグリッドを生成（日曜日始まり）
  const firstDayOfWeek = monthStart.getDay();
  const calendarDays = Array(firstDayOfWeek).fill(null).concat(monthDays);

  // 6週分確保
  const totalCells = Math.ceil(calendarDays.length / 7) * 7;
  while (calendarDays.length < totalCells) {
    calendarDays.push(null);
  }

  // 6人ずつグループに分ける
  const userGroups = [];
  for (let i = 0; i < userShiftData.length; i += 6) {
    userGroups.push(userShiftData.slice(i, i + 6));
  }

  const calendarStyles = `
    <style>
      @media print {
        body { margin: 0; padding: 0; }
        .calendar-page { page-break-after: always; }
      }
      body {
        font-family: 'Noto Sans JP', sans-serif;
        color: #333;
      }
      .calendar-header {
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 20px;
      }
      .calendar-grid-container {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
      }
      .calendar-container {
        border: 1px solid #ccc;
        padding: 10px;
      }
      .calendar-title {
        text-align: center;
        font-weight: bold;
        margin-bottom: 10px;
        background: #f0f0f0;
        padding: 5px;
      }
      .calendar-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }
      .calendar-table th {
        background: #e0e0e0;
        border: 1px solid #999;
        padding: 3px;
        font-size: 12px;
        width: 14.28%;
      }
      .calendar-table th:first-child {
        background: #e74c3c;
        color: white;
      }
      .calendar-table th:last-child {
        background: #3498db;
        color: white;
      }
      .calendar-day {
        border: 1px solid #ccc;
        height: 60px;
        width: 14.28%;
        vertical-align: top;
        padding: 2px;
        position: relative;
      }
      .weekend.sunday {
        background: #fff5f5;
      }
      .weekend.saturday {
        background: #f0f8ff;
      }
      .day-number {
        font-size: 11px;
        font-weight: bold;
      }
      .weekend.sunday .day-number {
        color: #e74c3c;
      }
      .weekend.saturday .day-number {
        color: #3498db;
      }
      .shift-info {
        font-size: 9px;
        margin-top: 2px;
        min-height: 30px;
      }
      .shift-time {
        line-height: 1.2;
      }
      .break-info {
        color: #666;
        font-size: 8px;
      }
      .empty-day {
        background: #f5f5f5;
        border: 1px solid #ccc;
        width: 14.28%;
      }
    </style>
  `;

  return `
    <div class="printable-content">
      ${calendarStyles}
      ${userGroups
        .map(
          (group, groupIndex) => `
        <div class="calendar-page" ${
          groupIndex > 0 ? 'style="page-break-before: always;"' : ""
        }>
          <div class="calendar-header">${monthYear}分カレンダー</div>
          <div class="calendar-grid-container">
            ${group
              .map((userData) => {
                // このユーザーのシフトをマッピング
                const userShiftsMap = userData.shifts.reduce((acc, shift) => {
                  const dayMatch = shift.date.match(/(\d+)月(\d+)日/);
                  if (dayMatch) {
                    const day = parseInt(dayMatch[2], 10);
                    acc[day] = shift;
                  }
                  return acc;
                }, {} as Record<number, any>);

                return `
                <div class="calendar-container">
                  <div class="calendar-title">${userData.nickname}</div>
                  <table class="calendar-table">
                    <thead>
                      <tr>
                        <th>日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th>土</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${generateCalendarRows(calendarDays, userShiftsMap)}
                    </tbody>
                  </table>
                </div>
              `;
              })
              .join("")}
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
};

function generateCalendarRows(
  calendarDays: (Date | null)[],
  userShiftsMap: Record<number, any>
): string {
  let html = "";
  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];

  calendarDays.forEach((day, index) => {
    if (index % 7 === 0 && currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  weeks.forEach((week) => {
    html += "<tr>";
    for (let i = 0; i < 7; i++) {
      const day = week[i];
      if (day === null) {
        html += '<td class="empty-day"></td>';
      } else {
        const dayNumber = day.getDate();
        const shift = userShiftsMap[dayNumber];
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;

        const weekendClass = day.getDay() === 0 ? "weekend sunday" 
                         : day.getDay() === 6 ? "weekend saturday" 
                         : "";

        html += `
          <td class="calendar-day ${weekendClass}">
            <div class="day-number">${dayNumber}</div>
            ${
              shift
                ? `
              <div class="shift-info">
                <div class="shift-time">${shift.startTime.substring(0, 5)}</div>
                <div class="shift-time">${shift.endTime.substring(0, 5)}</div>
                <div class="break-info">${
                  shift.extendedTasks ? "授業あり" : "授業なし"
                }</div>
              </div>
            `
                : `<div class="shift-info">&nbsp;</div>`
            }
          </td>
        `;
      }
    }
    html += "</tr>";
  });

  return html;
}
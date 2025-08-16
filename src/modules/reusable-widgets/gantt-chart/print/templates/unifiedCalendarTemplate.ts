import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ja } from "date-fns/locale";
import { UserShiftData } from "../utils/shiftDataProcessor";

export const generateUnifiedCalendarHTML = (
  userShiftData: UserShiftData[],
  selectedDate: Date
): string => {
  const monthYear = format(selectedDate, "yyyy年M月", { locale: ja });
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // カレンダーグリッドを生成
  const firstDayOfWeek = monthStart.getDay();
  const calendarDays = Array(firstDayOfWeek).fill(null).concat(monthDays);
  const totalCells = Math.ceil(calendarDays.length / 7) * 7;
  while (calendarDays.length < totalCells) {
    calendarDays.push(null);
  }

  // 全ユーザーのシフトを日付ごとにマッピング
  const shiftsByDate: Record<number, Array<{ nickname: string; time: string; extendedTasks?: boolean }>> = {};
  
  userShiftData.forEach((userData) => {
    userData.shifts.forEach((shift) => {
      const dayMatch = shift.date.match(/(\d+)月(\d+)日/);
      if (dayMatch) {
        const day = parseInt(dayMatch[2], 10);
        if (!shiftsByDate[day]) {
          shiftsByDate[day] = [];
        }
        shiftsByDate[day].push({
          nickname: userData.nickname,
          time: `${shift.startTime.substring(0, 5)}-${shift.endTime.substring(0, 5)}`,
          extendedTasks: shift.extendedTasks,
        });
      }
    });
  });

  const styles = `
    <style>
      @media print {
        body { margin: 0; padding: 0; }
      }
      body {
        font-family: 'Noto Sans JP', sans-serif;
        color: #333;
      }
      .unified-calendar-header {
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 20px;
        padding: 10px;
        border-bottom: 2px solid #333;
      }
      .unified-calendar-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }
      .unified-calendar-table th {
        background: #333;
        color: white;
        border: 1px solid #666;
        padding: 8px;
        font-size: 14px;
        width: 14.28%;
      }
      .unified-calendar-table th:first-child {
        background: #e74c3c;
        color: white;
      }
      .unified-calendar-table th:last-child {
        background: #3498db;
        color: white;
      }
      .unified-calendar-day {
        border: 1px solid #ccc;
        min-height: 100px;
        width: 14.28%;
        vertical-align: top;
        padding: 5px;
        position: relative;
      }
      .unified-weekend.sunday {
        background: #fff5f5;
      }
      .unified-weekend.saturday {
        background: #f0f8ff;
      }
      .unified-day-number {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 5px;
      }
      .unified-weekend.sunday .unified-day-number {
        color: #e74c3c;
      }
      .unified-weekend.saturday .unified-day-number {
        color: #3498db;
      }
      .unified-shifts-container {
        display: flex;
        flex-direction: column;
        height: calc(100% - 25px);
        justify-content: flex-start;
      }
      .unified-shift-item {
        font-size: 11px;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 1px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        white-space: nowrap;
      }
      .unified-shift-name {
        font-weight: bold;
        font-size: 11px;
        color: #333;
        flex-shrink: 0;
        margin-right: 4px;
        max-width: 70%;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .unified-shift-time {
        color: #666;
        font-size: 11px;
        flex-shrink: 1;
        min-width: 30%;
        font-weight: 500;
        text-align: right;
      }
      .unified-extended {
        color: #ff6600;
        font-size: 7px;
      }
      .unified-more-count {
        background: #6b7280;
        color: white;
        padding: 1px 4px;
        border-radius: 10px;
        font-size: 8px;
        margin-top: 2px;
        text-align: center;
      }
      .unified-empty-day {
        background: #f5f5f5;
        border: 1px solid #ccc;
        width: 14.28%;
      }
    </style>
  `;

  return `
    <div class="printable-content">
      ${styles}
      <div class="unified-calendar-header">${monthYear} 統合勤務カレンダー</div>
      <table class="unified-calendar-table">
        <thead>
          <tr>
            <th>日曜日</th>
            <th>月曜日</th>
            <th>火曜日</th>
            <th>水曜日</th>
            <th>木曜日</th>
            <th>金曜日</th>
            <th>土曜日</th>
          </tr>
        </thead>
        <tbody>
          ${generateUnifiedCalendarRows(calendarDays, shiftsByDate)}
        </tbody>
      </table>
    </div>
  `;
};

function generateUnifiedCalendarRows(
  calendarDays: (Date | null)[],
  shiftsByDate: Record<number, Array<{ nickname: string; time: string; extendedTasks?: boolean }>>
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
        html += '<td class="unified-empty-day"></td>';
      } else {
        const dayNumber = day.getDate();
        const shifts = shiftsByDate[dayNumber] || [];
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;

        // 最初の5人まで表示、それ以降は「他◯人」と表示
        const maxDisplay = 5;
        const displayShifts = shifts.slice(0, maxDisplay);
        const remainingCount = shifts.length - maxDisplay;

        const weekendClass = day.getDay() === 0 ? "unified-weekend sunday" 
                         : day.getDay() === 6 ? "unified-weekend saturday" 
                         : "";

        html += `
          <td class="unified-calendar-day ${weekendClass}">
            <div class="unified-day-number">${dayNumber}</div>
            <div class="unified-shifts-container">
              ${displayShifts
                .map(
                  (shift) => `
                <div class="unified-shift-item">
                  <span class="unified-shift-name">${shift.nickname}</span>
                  <span class="unified-shift-time">${shift.time}</span>
                </div>
              `
                )
                .join("")}
              ${Array(5 - Math.min(displayShifts.length, 5))
                .fill(0)
                .map(() => `<div class="unified-shift-item">&nbsp;</div>`)
                .join("")}
              ${remainingCount > 0 ? `
                <div class="unified-shift-item">
                  <span class="unified-shift-name">他${remainingCount}人</span>
                  <span class="unified-shift-time"></span>
                </div>
              ` : ''}
            </div>
          </td>
        `;
      }
    }
    html += "</tr>";
  });

  return html;
}
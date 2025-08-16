import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { UserShiftData, calculateTotalHours, formatHours } from "../utils/shiftDataProcessor";

export const generateListHTML = (
  userShiftData: UserShiftData[],
  selectedDate: Date
): string => {
  const monthYear = format(selectedDate, "yyyy年M月", { locale: ja });

  if (userShiftData.length === 0) {
    return `
      <div class="printable-content">
        <h2>${monthYear}分</h2>
        <p>選択されたスタッフにはシフトがありません。</p>
      </div>
    `;
  }

  return `
    <div class="printable-content">
      <style>
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
        }
        body {
          font-family: 'Noto Sans JP', sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          padding: 10px 0;
          border-bottom: 2px solid #333;
        }
        .header h2 {
          margin: 0;
          font-size: 24px;
        }
        .staff-section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .staff-name {
          font-size: 18px;
          font-weight: bold;
          background: #f0f0f0;
          padding: 8px;
          margin-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 8px;
          text-align: center;
        }
        th {
          background: #e0e0e0;
          font-weight: bold;
        }
        .total-hours {
          text-align: right;
          font-weight: bold;
          margin-top: 10px;
        }
        .extended-task {
          color: #ff6600;
          font-size: 12px;
        }
      </style>
      <div class="header">
        <h2>スタッフ勤務表 - ${monthYear}</h2>
      </div>
      ${userShiftData
        .map((userData) => {
          const totalHours = calculateTotalHours(userData.shifts);
          return `
          <div class="staff-section">
            <div class="staff-name">${userData.nickname}</div>
            <table>
              <thead>
                <tr>
                  <th>日付</th>
                  <th>曜日</th>
                  <th>開始時刻</th>
                  <th>終了時刻</th>
                  <th>勤務時間</th>
                  <th>備考</th>
                </tr>
              </thead>
              <tbody>
                ${userData.shifts
                  .map((shift) => {
                    const [startHour, startMin] = shift.startTime
                      .split(":")
                      .map(Number);
                    const [endHour, endMin] = shift.endTime
                      .split(":")
                      .map(Number);
                    const startMinutes = startHour * 60 + startMin;
                    const endMinutes = endHour * 60 + endMin;
                    const duration = (endMinutes - startMinutes) / 60;
                    const hours = Math.floor(duration);
                    const minutes = Math.round((duration - hours) * 60);
                    const timeStr =
                      minutes === 0
                        ? `${hours}時間`
                        : `${hours}時間${minutes}分`;

                    return `
                    <tr>
                      <td>${shift.date}</td>
                      <td>${shift.dayOfWeek}</td>
                      <td>${shift.startTime}</td>
                      <td>${shift.endTime}</td>
                      <td>${timeStr}</td>
                      <td>${
                        shift.extendedTasks
                          ? '<span class="extended-task">授業あり</span>'
                          : "授業なし"
                      }</td>
                    </tr>
                  `;
                  })
                  .join("")}
              </tbody>
            </table>
            <div class="total-hours">
              合計勤務時間: ${formatHours(totalHours)}
            </div>
          </div>
        `;
        })
        .join("")}
    </div>
  `;
};
import { ShiftStatus } from "@/common/common-models/ModelIndex";
import { colors } from "@/common/common-theme/ThemeColors";
import { HOLIDAYS } from "../constants";

// ステータスのテキストを取得する関数
export const getStatusText = (status: ShiftStatus) => {
  switch (status) {
    case "draft":
      return "下書き";
    case "pending":
      return "申請中";
    case "approved":
      return "承認済";
    case "rejected":
      return "却下";
    case "deletion_requested":
      return "削除申請中";
    case "deleted":
      return "削除済";
    default:
      return "";
  }
};

// ステータスに基づく色を取得する関数
export const getStatusColor = (status: ShiftStatus) => {
  switch (status) {
    case "draft":
      return "#B0BEC5";
    case "approved":
      return "#4CAF50";
    case "pending":
      return "#FFC107";
    case "deleted":
      return "#F44336";
    case "rejected":
      return "#ffcdd2";
    case "completed":
      return "#4CAF50";
    case "deletion_requested":
      return "#FFA500";
    case "recruitment":
      return "#9e9e9e";
    default:
      return "#9E9E9E";
  }
};

// 日付の色を判定する関数
export const getDayColor = (
  date: string | undefined,
  state?: string,
  isSelected?: boolean
) => {
  if (!date || state === "disabled") return "#d9e1e8";

  const day = new Date(date).getDay();
  if (day === 0 || HOLIDAYS[date]) return "#f44336";
  if (state === "today") return "#2196F3";
  return colors.text.primary; // その他の日付
};

// 日付文字列と時間文字列を組み合わせてDateオブジェクトを生成する関数
export function parseTimeString(dateStr: string, timeStr: string): Date {
  const [hoursStr, minutesStr] = timeStr.split(":");
  const hours = hoursStr ? Number(hoursStr) : 0;
  const minutes = minutesStr ? Number(minutesStr) : 0;
  const date = new Date(dateStr);
  date.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  return date;
}

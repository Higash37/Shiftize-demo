import { StyleSheet } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { HOLIDAYS } from "../../calendar-constants/constants";

/**
 * iOSカレンダー風：曜日ごとに色分け
 */
export function getIOSDayColor(
  dateString?: string,
  state?: string,
  isSelected?: boolean
) {
  if (!dateString) return colors.text.primary;
  const day = new Date(dateString).getDay();
  if (isSelected) return "#fff";
  if (state === "disabled") return "#C0C0C0";
  if (state === "today") return colors.primary;
  // 祝日チェックを追加
  if (HOLIDAYS[dateString]) return "#FF3B30"; // 祝日:赤
  if (day === 0) return "#FF3B30"; // 日曜:赤
  if (day === 6) return "#007AFF"; // 土曜:青
  return "#222"; // 平日:濃いグレー
}

/**
 * 共通スタイル定義
 */
export const styles = StyleSheet.create({
  dayContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    position: "relative",
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 0,
    margin: 0, // 隙間を完全になくす
  },
  dayText: {
    fontWeight: "500",
    color: "#222",
    zIndex: 1,
    margin: 0,
    fontFamily: "SF Pro Text, San Francisco, Helvetica Neue, Arial, sans-serif",
  },
  todayText: {
    color: "#007AFF",
    fontWeight: "700",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
    zIndex: 1,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 2,
    alignSelf: "center",
  },
  selectedDay: {
    // 旧selectedDayは不要
  },
});

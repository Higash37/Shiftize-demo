import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";
import { HOLIDAYS } from "../constants";

/**
 * iOSカレンダー風：曜日ごとに色分け
 */
export function getIOSDayColor(
  theme: MD3Theme,
  dateString?: string,
  state?: string,
  isSelected?: boolean
) {
  if (!dateString) return theme.colorScheme.onSurface;
  const day = new Date(dateString).getDay();
  if (isSelected) return theme.colorScheme.onPrimary;
  if (state === "disabled") return theme.colorScheme.outline;
  if (state === "today") return theme.colorScheme.primary;
  // 祝日チェックを追加
  if (HOLIDAYS[dateString]) return theme.colorScheme.error; // 祝日:赤
  if (day === 0) return theme.colorScheme.error; // 日曜:赤
  if (day === 6) return theme.colorScheme.primary; // 土曜:青
  return theme.colorScheme.onSurface; // 平日
}

/**
 * 共通スタイル定義
 */
export const createDayComponentStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    dayContainer: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      position: "relative",
      paddingVertical: 0,
      paddingHorizontal: 0,
      borderRadius: 0,
      margin: 0,
    },
    dayText: {
      ...theme.typography.bodyMedium,
      fontWeight: "500",
      color: theme.colorScheme.onSurface,
      zIndex: 1,
      margin: 0,
    },
    todayText: {
      color: theme.colorScheme.primary,
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
      bottom: -8,
      alignSelf: "center",
    },
    selectedDay: {
      // 旧selectedDayは不要
    },
  });

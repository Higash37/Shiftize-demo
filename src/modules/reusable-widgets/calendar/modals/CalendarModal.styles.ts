import { StyleSheet, Platform, Dimensions } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { getPlatformShadow } from "@/common/common-utils/util-style/StyleGenerator";
import { CalendarModalStyles } from "./CalendarModal.types";

// 画面幅に基づいてカレンダーのサイズを計算
const SCREEN_WIDTH = Dimensions.get("window").width;
export const CALENDAR_WIDTH = Math.min(SCREEN_WIDTH - 32, 400); // モーダルの最大幅を考慮
export const DAY_WIDTH = Math.floor(CALENDAR_WIDTH / 7); // 7日分で割る

export const styles = StyleSheet.create<CalendarModalStyles>({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: colors.background,
    borderRadius: 12,
    width: Platform.OS === "web" ? CALENDAR_WIDTH : "90%",
    maxWidth: CALENDAR_WIDTH,
    padding: 16,
    ...getPlatformShadow(4),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
  },
  closeButton: {
    fontSize: 20,
    color: colors.text.secondary,
    padding: 4,
  },
  calendar: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 16,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 80,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.surface,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: "500",
  },
  confirmButtonText: {
    color: colors.text.white,
    fontSize: 14,
    fontWeight: "500",
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});

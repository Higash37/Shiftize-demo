import { StyleSheet } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // 白色背景に変更
    justifyContent: "flex-start",
    alignItems: "stretch",
  },
  centerContent: {
    width: "100%",
    flexShrink: 0,
    alignItems: "flex-start",
    flex: 1, // ← 追加
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    color: colors.primary,
    marginVertical: 16,
  },
  headerCell: {
    paddingVertical: 8,
    alignItems: "center",
    borderRightWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FFFFFF",
  },
  timeHeaderCell: {
    backgroundColor: colors.primary + "10",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderRightWidth: 1,
    borderColor: colors.primary,
  },
  positionHeaderCell: {
    backgroundColor: colors.secondary + "10",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderRightWidth: 1,
    borderColor: colors.secondary,
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 15,
    color: colors.primary,
  },
  cell: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRightWidth: 1,
    borderColor: colors.border,
    minHeight: 26, // ← 44の60%に変更
    backgroundColor: colors.surface,
  },
  timeCell: {
    backgroundColor: colors.primary + "10",
    borderBottomLeftRadius: 12,
    borderTopLeftRadius: 0,
    borderRightWidth: 1,
    borderColor: colors.primary,
  },
  positionCell: {
    backgroundColor: colors.secondary + "10",
    borderBottomLeftRadius: 12,
    borderTopLeftRadius: 0,
    borderRightWidth: 1,
    borderColor: colors.secondary,
  },
  timeText: {
    fontWeight: "bold",
    fontSize: 15,
    color: colors.primary,
  },
  positionText: {
    fontWeight: "bold",
    fontSize: 14,
    color: colors.secondary,
  },
  taskText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  datePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  dateNavBtn: {
    fontSize: 22,
    color: colors.primary,
    fontWeight: "bold",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  dateLabel: {
    fontSize: 17,
    color: colors.text.primary,
    fontWeight: "bold",
    paddingHorizontal: 8,
  },
});

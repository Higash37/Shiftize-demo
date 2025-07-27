import { StyleSheet, Dimensions } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { ShiftCalendarStyles } from "./ShiftCalendar.types";
import { getPlatformShadow } from "@/common/common-utils/util-style/StyleGenerator";
import { shadows } from "@/common/common-constants/ThemeConstants";

export const styles = StyleSheet.create<ShiftCalendarStyles>({
  container: {
    alignItems: "center",
    paddingVertical: 8, // iOS風に余白を増やす
    // backgroundColor: "#fff", // ←親で白背景なので不要
    borderRadius: 16, // iOS風に角丸
    borderWidth: 0,
    elevation: 0,
    ...shadows.none,
    margin: 0, // マージンを削除
    paddingHorizontal: 0, // 水平パディングを削除
    width: "96%", // カレンダー全体の幅を96%に（リストと統一）
    alignSelf: "center", // 中央揃え
  },
  containerFullWidth: {
    paddingHorizontal: 16, // 余白を増やして見切れないようにする
  },
  calendar: {
    // backgroundColor: "#fff", // ←親で白背景なので不要
    borderRadius: 16,
    marginHorizontal: "auto",
    borderWidth: 0,
    ...shadows.none,
  },
  calendarShadow: {
    // 影も完全に消す
    ...shadows.none,
    marginBottom: 0,
  },
});

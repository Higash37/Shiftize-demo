import React, { memo, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/common/common-theme/ThemeColors";
import { useResponsiveCalendarSize } from "./constants";

interface ResponsiveHeaderStyle {
  fontSize?: number;
}

interface CalendarHeaderProps {
  date: Date;
  onYearMonthSelect: () => void;
  responsiveStyle?: ResponsiveHeaderStyle;
}

/**
 * カレンダーヘッダーコンポーネント
 * 年月表示と日付選択ボタンを含む
 */
const CalendarHeaderComponent: React.FC<CalendarHeaderProps> = ({
  date,
  onYearMonthSelect,
  responsiveStyle,
}) => {
  const { isSmallScreen } = useResponsiveCalendarSize();
  // レスポンシブサイズに基づくスタイル
  const dynamicStyles = useMemo(
    () => ({
      monthText: {
        fontSize: isSmallScreen ? 18 : 16,
        ...(responsiveStyle?.fontSize
          ? { fontSize: responsiveStyle.fontSize }
          : {}),
      },
      monthSelector: {
        padding: isSmallScreen ? 10 : 12,
      },
    }),
    [isSmallScreen, responsiveStyle]
  ); // 日付が無効な場合のフォールバック値
  const validDate = isNaN(date.getTime()) ? new Date() : date;
  const year = validDate.getFullYear();
  const month = validDate.getMonth() + 1;
  const formattedDate = `${year}年${month}月`;

  return (
    <View style={styles.calendarHeader}>
      <TouchableOpacity
        style={[styles.monthSelector, dynamicStyles.monthSelector]}
        onPress={onYearMonthSelect}
        activeOpacity={0.7}
      >
        <Text style={[styles.monthText, dynamicStyles.monthText]}>
          {formattedDate}
        </Text>
        <AntDesign
          name="calendar"
          size={isSmallScreen ? 20 : 22}
          color={colors.text.primary}
          style={styles.calendarIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

CalendarHeaderComponent.displayName = "CalendarHeader";

export const CalendarHeader = memo(CalendarHeaderComponent);

const styles = StyleSheet.create({
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 0,
    backgroundColor: "transparent",
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
  },
  monthText: {
    fontWeight: "bold",
    color: colors.text.primary,
  },
  calendarIcon: {
    marginLeft: 8,
  },
});

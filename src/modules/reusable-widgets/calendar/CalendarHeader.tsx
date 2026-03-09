import React, { memo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { SUB_HEADER_HEIGHT } from "@/common/common-ui/ui-navigation/DateNavigator";

interface CalendarHeaderProps {
  date: Date;
  onYearMonthSelect: () => void;
  responsiveStyle?: { fontSize?: number };
}

/**
 * カレンダーヘッダーコンポーネント
 * DateNavigator と同じスタイルで年月を表示
 */
const CalendarHeaderComponent: React.FC<CalendarHeaderProps> = ({
  date,
  onYearMonthSelect,
}) => {
  const { colorScheme: cs } = useMD3Theme();
  const validDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const year = validDate.getFullYear();
  const month = validDate.getMonth() + 1;

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: SUB_HEADER_HEIGHT,
      }}
    >
      <TouchableOpacity
        onPress={onYearMonthSelect}
        activeOpacity={0.7}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 4,
          height: SUB_HEADER_HEIGHT,
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: "bold", color: cs.onSurface }}>
          {year}年{month}月
        </Text>
      </TouchableOpacity>
    </View>
  );
};

CalendarHeaderComponent.displayName = "CalendarHeader";

export const CalendarHeader = memo(CalendarHeaderComponent);

import React from "react";
import { View, Text } from "react-native";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { getDateTextColor } from "@/common/common-utils/date/dateUtils";

export type DateCellProps = {
  date: string;
  dateColumnWidth: number;
  styles: any;
};

export const DateCell: React.FC<DateCellProps> = ({
  date,
  dateColumnWidth,
  styles,
}) => {
  const formattedDate = new Date(date);
  const dayOfWeek = format(formattedDate, "E", { locale: ja });
  const dayOfMonth = format(formattedDate, "d");
  
  const holidayTextColor = getDateTextColor(date);
  const textColor = holidayTextColor || (dayOfWeek === "土" ? "#0000FF" : "#000000");
  
  return (
    <View
      style={[
        styles.dateCell,
        {
          width: dateColumnWidth,
          borderWidth: 1,
          borderColor: "#ddd",
          borderRightWidth: 2,
          borderRightColor: "#bbb",
          backgroundColor: "#f8f9fa",
        },
      ]}
    >
      <Text style={[styles.dateDayText, { color: textColor }]}>
        {dayOfMonth}
      </Text>
      <Text style={[styles.dateWeekText, { color: textColor }]}>
        {dayOfWeek}
      </Text>
    </View>
  );
};
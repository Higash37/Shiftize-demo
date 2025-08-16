import React from "react";
import { View, Text } from "react-native";
import { TimeAxisProps } from "./types";

export const TimeAxis: React.FC<TimeAxisProps> = ({
  halfHourLines,
  cellWidth,
  ganttColumnWidth,
  styles,
  startHour = 9,
  showTimeLabels = true,
  showClassMarkers = false,
  isClassTime,
}) => {
  return (
    <View style={[styles.timeAxis, { width: ganttColumnWidth }]}>
      {halfHourLines.map((time, index) => {
        const isHourMark = time.endsWith(":00");
        const isClassTimeSlot = isClassTime && isClassTime(time);

        return (
          <View
            key={time}
            style={{
              position: "absolute",
              left: index * cellWidth,
              width: cellWidth,
              height: "100%",
              borderLeftWidth: isHourMark ? 1 : 0.5,
              borderLeftColor: isHourMark ? "#999" : "#ddd",
              backgroundColor: isClassTimeSlot ? "rgba(255, 235, 59, 0.1)" : "transparent",
            }}
          >
            {showTimeLabels && isHourMark && (
              <Text
                style={{
                  position: "absolute",
                  top: -15,
                  left: -10,
                  fontSize: 10,
                  color: "#666",
                }}
              >
                {time.substring(0, 2)}
              </Text>
            )}
            {showClassMarkers && isClassTimeSlot && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  backgroundColor: "#FFC107",
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};
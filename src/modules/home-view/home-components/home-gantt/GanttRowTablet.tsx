import React from "react";
import { View, Text } from "react-native";
import { styles } from "../../home-styles/home-view-styles";
import type { SampleScheduleColumn } from "../../home-types/home-view-types";
import { colors } from "@/common/common-theme/ThemeColors";
import { MaterialIcons } from "@expo/vector-icons";

interface GanttRowTabletProps {
  time: string;
  names: string[];
  sampleSchedule: SampleScheduleColumn[];
  cellWidth: number;
  cellHeight: number;
  onCellPress?: (userName: string) => void;
}

export const GanttRowTablet: React.FC<GanttRowTabletProps> = ({
  time,
  names,
  sampleSchedule,
  cellWidth,
  cellHeight,
  onCellPress,
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
      }}
    >
      <View
        style={[styles.positionCell, { width: cellWidth, height: cellHeight }]}
      >
        <Text style={styles.positionText}>{time}</Text>
      </View>
      {names.map((name) => {
        const slot = sampleSchedule
          .flatMap((col) => col.slots)
          .find((s) => {
            if (s.name !== name) return false;
            if (time === s.start && time === s.end && time === "22:00")
              return true;
            return time >= s.start && time < s.end;
          });
        return (
          <View
            key={name}
            style={[
              styles.cell,
              {
                width: cellWidth,
                height: cellHeight,
                backgroundColor: slot
                  ? slot.type === "class"
                    ? "#eee"
                    : undefined // スタッフのときは背景色なし
                  : undefined,
                borderColor: slot
                  ? slot.type === "class"
                    ? "#bbb"
                    : colors.primary // スタッフのときは青枠
                  : undefined,
                borderWidth: slot ? 1 : 0,
                opacity: slot ? 1 : 0.1,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row", // アイコンとテキストを横並び
              },
            ]}
            onTouchEnd={() => onCellPress && onCellPress(name)}
          >
            {slot && (
              <MaterialIcons
                name={slot.type === "class" ? "school" : "person"}
                size={16}
                color={
                  slot.type === "class" ? colors.text.secondary : colors.primary
                }
                style={{ marginRight: 4 }}
              />
            )}
            {slot && slot.task && (
              <Text
                style={[
                  styles.taskText,
                  slot.type !== "class" && { color: colors.primary }, // スタッフのときは青文字
                ]}
              >
                {slot.task}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

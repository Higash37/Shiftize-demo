import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../../home-styles/home-view-styles";
import type { SampleScheduleColumn, SampleSlot } from "../../home-types/home-view-types";
import { colors } from "@/common/common-constants/ThemeConstants";
import { MaterialIcons } from "@expo/vector-icons";
import type {
  ShiftItem,
  ShiftStatus,
  ShiftStatusConfig,
} from "@/common/common-models/model-shift/shiftTypes";
import { User } from "@/common/common-models/model-user/UserModel";

interface GanttRowMobileProps {
  time: string;
  names: string[];
  sampleSchedule: SampleScheduleColumn[];
  cellWidth: number;
  cellHeight: number;
  onCellPress?: (userName: string) => void;
  // PC版機能用の新しいプロパティ
  shifts?: ShiftItem[];
  users?: User[];
  date?: string;
  onShiftPress?: (shift: ShiftItem) => void;
  onEmptyCellPress?: (date: string, time: string, userId: string) => void;
  userColorsMap?: Record<string, string>;
  getStatusConfig?: (status: ShiftStatus) => ShiftStatusConfig | undefined;
}

export const GanttRowMobile: React.FC<GanttRowMobileProps> = ({
  time,
  names,
  sampleSchedule,
  cellWidth,
  cellHeight,
  onCellPress,
  shifts = [],
  users = [],
  date,
  onShiftPress,
  onEmptyCellPress,
  userColorsMap = {},
  getStatusConfig,
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View
        style={[styles.positionCell, { width: cellWidth, height: cellHeight }]}
      >
        <Text style={styles.positionText}>{time}</Text>
      </View>
      {names.map((name, index) => {
        // PC版機能: 実際のシフトデータがある場合はそれを使用
        if (shifts.length > 0 && date && users.length > 0) {
          const user = users.find(u => u.nickname === name);
          if (!user) return null;
          
          // この時間とユーザーのシフトを検索
          const userShift = shifts.find(shift => 
            shift.userId === user.uid && 
            shift.date === date &&
            time >= shift.startTime && 
            time < shift.endTime
          );
          
          const statusConfig = getStatusConfig ? getStatusConfig(userShift?.status || 'approved') : null;
          const backgroundColor = userShift
            ? userColorsMap[user.uid] || statusConfig?.color || colors.primary
            : "transparent";
            
          return (
            <TouchableOpacity
              key={`${name}-${index}`}
              style={[
                styles.cell,
                {
                  width: cellWidth,
                  height: cellHeight,
                  backgroundColor: userShift ? backgroundColor : "transparent",
                  borderColor: userShift ? colors.border : colors.border,
                  borderWidth: 1,
                  opacity: userShift ? 0.8 : 0.3,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
              onPress={() => {
                if (userShift && onShiftPress) {
                  onShiftPress(userShift);
                } else if (!userShift && onEmptyCellPress && date) {
                  onEmptyCellPress(date, time, user.uid);
                }
              }}
              disabled={!userShift && !onEmptyCellPress}
            >
              {userShift && (
                <View style={{ alignItems: "center" }}>
                  <MaterialIcons
                    name={userShift.type === "class" ? "school" : "person"}
                    size={14}
                    color="white"
                  />
                  {userShift.subject && (
                  <Text
                    style={{
                      fontSize: 10,
                      color: colors.text.white,
                      textAlign: "center",
                      marginTop: 2,
                    }}
                  >
                    {userShift.subject.length > 6
                      ? `${userShift.subject.slice(0, 6)}...`
                      : userShift.subject}
                  </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        }
        
        // 従来のサンプルデータ表示（後方互換性のため）
        const classSlot: SampleSlot | undefined = sampleSchedule
          .flatMap((col) => col.slots)
          .find(
            (s) =>
              s.name === name &&
              s.type === "class" &&
              ((time === s.start && time === s.end && time === "22:00") ||
                (time >= s.start && time < s.end))
          );
        const staffSlot: SampleSlot | undefined = sampleSchedule
          .flatMap((col) => col.slots)
          .find(
            (s) =>
              s.name === name &&
              s.type !== "class" &&
              ((time === s.start && time === s.end && time === "22:00") ||
                (time >= s.start && time < s.end))
          );
        const slot = classSlot || staffSlot;
        return (
          <TouchableOpacity
            key={`${name}-${index}`}
            style={[
              styles.cell,
              {
                width: cellWidth,
                height: cellHeight,
                backgroundColor: slot
                  ? slot.type === "class"
                    ? colors.surfaceElevated
                    : slot.color || colors.primary + "1A"
                  : undefined,
                borderColor: slot
                  ? slot.type === "class"
                    ? colors.border
                    : slot.color || colors.primary
                  : undefined,
                borderWidth: slot ? 1 : 0,
                opacity: slot ? 1 : 0.1,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              },
            ]}
            onPress={() => onCellPress && onCellPress(name)}
          >
            {slot && (
              <MaterialIcons
                name={slot.type === "class" ? "school" : "person"}
                size={16}
                color={
                  slot.type === "class"
                    ? colors.text.secondary
                    : colors.text.white
                }
                style={{ marginRight: 4 }}
              />
            )}
            {slot && slot.task && (
              <Text
                style={[
                  styles.taskText,
                  slot.type !== "class" && { color: colors.text.white },
                ]}
              >
                {slot.task}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

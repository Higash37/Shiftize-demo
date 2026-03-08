import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { createHomeViewStyles } from "../../home-styles/home-view-styles";
import type { SampleScheduleColumn, SampleSlot } from "../../home-types/home-view-types";
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

const isSlotActiveAtTime = (time: string, slot: { start: string; end: string }): boolean => {
  const isEndOfDay = time === slot.start && time === slot.end && time === "22:00";
  return isEndOfDay || (time >= slot.start && time < slot.end);
};

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
  const styles = useThemedStyles(createHomeViewStyles);
  const theme = useMD3Theme();

  const renderShiftCell = (name: string, index: number, user: User) => {
    const userShift = shifts.find(shift =>
      shift.userId === user.uid &&
      shift.date === date &&
      time >= shift.startTime &&
      time < shift.endTime
    );

    const statusConfig = getStatusConfig ? getStatusConfig(userShift?.status || 'approved') : null;
    const backgroundColor = userShift
      ? userColorsMap[user.uid] || statusConfig?.color || theme.colorScheme.primary
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
            borderColor: theme.colorScheme.outlineVariant,
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
              color={theme.colorScheme.onPrimary}
            />
            {userShift.subject && (
              <Text
                style={{
                  fontSize: 10,
                  color: theme.colorScheme.onPrimary,
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
  };

  const renderSampleCell = (name: string, index: number) => {
    const allSlots = sampleSchedule.flatMap((col) => col.slots);
    const classSlot: SampleSlot | undefined = allSlots.find(
      (s) => s.name === name && s.type === "class" && isSlotActiveAtTime(time, s)
    );
    const staffSlot: SampleSlot | undefined = allSlots.find(
      (s) => s.name === name && s.type !== "class" && isSlotActiveAtTime(time, s)
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
                ? theme.colorScheme.surfaceContainerHigh
                : slot.color || theme.colorScheme.primary + "1A"
              : undefined,
            borderColor: slot
              ? slot.type === "class"
                ? theme.colorScheme.outlineVariant
                : slot.color || theme.colorScheme.primary
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
                ? theme.colorScheme.onSurfaceVariant
                : theme.colorScheme.onPrimary
            }
            style={{ marginRight: 4 }}
          />
        )}
        {slot?.task && (
          <Text
            style={[
              styles.taskText,
              slot.type !== "class" && { color: theme.colorScheme.onPrimary },
            ]}
          >
            {slot.task}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: theme.colorScheme.outlineVariant,
      }}
    >
      <View
        style={[styles.positionCell, { width: cellWidth, height: cellHeight }]}
      >
        <Text style={styles.positionText}>{time}</Text>
      </View>
      {names.map((name, index) => {
        const hasRealData = shifts.length > 0 && date && users.length > 0;
        if (!hasRealData) return renderSampleCell(name, index);

        const user = users.find(u => u.nickname === name);
        if (!user) return null;

        return renderShiftCell(name, index, user);
      })}
    </View>
  );
};

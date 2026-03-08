import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
} from "react-native";
import type { SampleScheduleColumn } from "../../home-types/home-view-types";
import { timeSlots } from "../../home-data/scheduleSample";
import { colors } from "@/common/common-constants/ThemeConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";

const isSlotActiveAtTime = (time: string, slot: { start: string; end: string }): boolean => {
  const isEndOfDay = time === slot.start && time === slot.end && time === "22:00";
  return isEndOfDay || (time >= slot.start && time < slot.end);
};

interface UserDayGanttModalProps {
  visible: boolean;
  onClose: () => void;
  userName: string;
  sampleSchedule: SampleScheduleColumn[];
}

export const UserDayGanttModal: React.FC<UserDayGanttModalProps> = ({
  visible,
  onClose,
  userName,
  sampleSchedule,
}) => {
  // ユーザーのその日の全シフトを抽出
  const userSlots = sampleSchedule
    .flatMap((col) => col.slots)
    .filter((s) => s.name === userName);

  // 30分刻みで全スロットを生成
  const slotRows = [];
  for (let i = 0; i < timeSlots.length - 1; i++) {
    const start = timeSlots[i];
    const end = timeSlots[i + 1];
    // このスロットに該当するシフトを探す
    const slot = userSlots.find((s) => {
      if (!start || !s.start || !s.end) return false;
      return isSlotActiveAtTime(start, s);
    });
    slotRows.push({
      start,
      end,
      task: slot ? slot.task : "",
      color: slot
        ? slot.type === "class"
          ? colors.surfaceElevated
          : slot.color || colors.primary + "1A" // スタッフはカラーか薄いアクセント
        : undefined,
      type: slot ? slot.type : undefined,
    });
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={modalStyles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={modalStyles.content}>
              <Text style={modalStyles.title}>
                {userName} の1日ガントチャート
              </Text>
              {/* その日のシフト開始～終了時間 */}
              {userSlots.length > 0 && (
                <Text
                  style={{
                    color: colors.text.primary,
                    fontWeight: "bold",
                    marginBottom: 8,
                    fontSize: 25,
                  }}
                >
                  {userSlots[0]?.start || "unknown"} ～ {userSlots.at(-1)?.end || "unknown"}
                </Text>
              )}
              {/* 30分刻みで全スロット表示 */}
              <ScrollView
                style={{
                  width: "100%",
                  marginBottom: 16,
                  maxHeight: 320,
                }}
              >
                {slotRows.map((row, idx) => {
                  // スタッフシフトの場合は白文字、それ以外は通常の文字色
                  const isStaffSlot = row.type !== "class" && row.task;
                  const textColor = isStaffSlot ? "#FFFFFF" : row.task ? colors.text.primary : colors.text.secondary;
                  const timeColor = isStaffSlot ? "#FFFFFF" : colors.primary;

                  return (
                    <View
                      key={idx}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 4,
                        backgroundColor: row.color,
                      }}
                    >
                      <Text
                        style={{
                          color: timeColor,
                          fontWeight: "bold",
                          minWidth: 90,
                          textAlign: "center", // 中央揃え
                        }}
                      >
                        {row.start}~{row.end}
                      </Text>
                      <Text
                        style={{
                          color: textColor,
                          fontSize: 15,
                          marginLeft: 8,
                        }}
                      >
                        {row.task}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    minWidth: 320,
    maxWidth: 400,
    width: "90%",
    maxHeight: "90%",
    alignItems: "center",
    ...shadows.modal,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 16,
    color: colors.primary,
  },
});

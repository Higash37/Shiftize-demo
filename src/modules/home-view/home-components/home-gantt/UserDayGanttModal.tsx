import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
} from "react-native";
import { styles as ganttStyles } from "../../home-styles/home-view-styles";
import type { SampleScheduleColumn } from "../../home-types/home-view-types";
import { timeSlots } from "../../home-data/scheduleSample";
import { shadows } from "@/common/common-constants/ShadowConstants";

interface UserDayGanttModalProps {
  visible: boolean;
  onClose: () => void;
  userName: string;
  times: string[];
  sampleSchedule: SampleScheduleColumn[];
}

export const UserDayGanttModal: React.FC<UserDayGanttModalProps> = ({
  visible,
  onClose,
  userName,
  times,
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
      if (start === s.start && end === s.end && start === "22:00") return true;
      return start >= s.start && start < s.end;
    });
    slotRows.push({
      start,
      end,
      task: slot ? slot.task : "",
      color: slot
        ? slot.type === "class"
          ? "#eee"
          : undefined // スタッフのときは背景色なし
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
                    color: "black",
                    fontWeight: "bold",
                    marginBottom: 8,
                    fontSize: 25,
                  }}
                >
                  {userSlots[0].start} ～ {userSlots[userSlots.length - 1].end}
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
                {slotRows.map((row, idx) => (
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
                        color: "#1976d2",
                        fontWeight: "bold",
                        minWidth: 90,
                        textAlign: "center", // 中央揃え
                      }}
                    >
                      {row.start}~{row.end}
                    </Text>
                    <Text
                      style={{
                        color: row.task ? "#333" : "#bbb",
                        fontSize: 15,
                        marginLeft: 8,
                      }}
                    >
                      {row.task}
                    </Text>
                  </View>
                ))}
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
    backgroundColor: "#fff",
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
    color: "#1976d2",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 32,
  },
  activeRow: {
    backgroundColor: "#e3f2fd",
  },
  time: {
    width: 60,
    color: "#1976d2",
    fontWeight: "bold",
    fontSize: 15,
  },
  task: {
    color: "#333",
    fontSize: 15,
    marginLeft: 8,
  },
});

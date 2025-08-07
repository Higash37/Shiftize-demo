import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import { RecruitmentShift } from "@/common/common-models/model-shift/shiftTypes";
import { styles } from "./applicationModalStyles";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform } from "react-native";

interface RecruitmentApplicationModalProps {
  visible: boolean;
  onClose: () => void;
  recruitmentShift: RecruitmentShift;
  onApply: (startTime: string, endTime: string, notes?: string) => Promise<void>;
}

export function RecruitmentApplicationModal({
  visible,
  onClose,
  recruitmentShift,
  onApply,
}: RecruitmentApplicationModalProps) {
  const [requestedStartTime, setRequestedStartTime] = useState(recruitmentShift.startTime);
  const [requestedEndTime, setRequestedEndTime] = useState(recruitmentShift.endTime);
  const [notes, setNotes] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parseTimeToDate = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === "ios");
    if (selectedDate) {
      const newTime = formatTime(selectedDate);
      // 募集シフトの時間範囲内かチェック
      if (newTime < recruitmentShift.startTime) {
        Alert.alert("エラー", `開始時間は${recruitmentShift.startTime}以降にしてください。`);
        return;
      }
      setRequestedStartTime(newTime);
    }
  };

  const handleEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === "ios");
    if (selectedDate) {
      const newTime = formatTime(selectedDate);
      // 募集シフトの時間範囲内かチェック
      if (newTime > recruitmentShift.endTime) {
        Alert.alert("エラー", `終了時間は${recruitmentShift.endTime}以前にしてください。`);
        return;
      }
      setRequestedEndTime(newTime);
    }
  };

  const handleSubmit = async () => {
    // バリデーション
    if (requestedStartTime >= requestedEndTime) {
      Alert.alert("エラー", "終了時間は開始時間より後にしてください。");
      return;
    }

    setIsSubmitting(true);
    try {
      await onApply(requestedStartTime, requestedEndTime, notes);
      onClose();
    } catch (error) {
      Alert.alert("エラー", "応募に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>シフト応募</Text>
            <TouchableOpacity onPress={onClose}>
              <AntDesign name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.shiftInfo}>
            <Text style={styles.shiftInfoLabel}>募集シフト</Text>
            <Text style={styles.shiftInfoText}>
              {recruitmentShift.date} {recruitmentShift.startTime} - {recruitmentShift.endTime}
            </Text>
            {recruitmentShift.subject && (
              <Text style={styles.shiftInfoSubject}>教科: {recruitmentShift.subject}</Text>
            )}
          </View>

          <View style={styles.timeSelectionContainer}>
            <Text style={styles.sectionTitle}>希望時間を選択</Text>
            <Text style={styles.helperText}>
              募集時間内で希望の時間帯を選択してください
            </Text>

            <View style={styles.timeInputContainer}>
              <View style={styles.timeInput}>
                <Text style={styles.timeLabel}>開始時間</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowStartPicker(true)}
                >
                  <Text style={styles.timeButtonText}>{requestedStartTime}</Text>
                  <AntDesign name="down" size={16} color={colors.text.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.timeSeparator}>
                <Text style={styles.timeSeparatorText}>〜</Text>
              </View>

              <View style={styles.timeInput}>
                <Text style={styles.timeLabel}>終了時間</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowEndPicker(true)}
                >
                  <Text style={styles.timeButtonText}>{requestedEndTime}</Text>
                  <AntDesign name="down" size={16} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.notesContainer}>
            <Text style={styles.sectionTitle}>備考（任意）</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="メッセージがあれば入力してください"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>応募する</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>

      {showStartPicker && (
        <DateTimePicker
          value={parseTimeToDate(requestedStartTime)}
          mode="time"
          is24Hour={true}
          onChange={handleStartTimeChange}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={parseTimeToDate(requestedEndTime)}
          mode="time"
          is24Hour={true}
          onChange={handleEndTimeChange}
        />
      )}
    </Modal>
  );
}
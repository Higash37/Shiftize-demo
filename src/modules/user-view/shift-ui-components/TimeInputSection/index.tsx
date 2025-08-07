import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { styles } from "./styles";
import { TimeInputSectionProps, TimeSlot } from "./types";
import { generateTimeOptions } from "../../shift-ui-utils/ui-utils";

/**
 * TimeInputSection - 時間帯入力コンポーネント
 *
 * 開始時間と終了時間を選択するためのUIを提供します。
 * 時間選択はネイティブのピッカーを使用します。
 */
const TimeInputSection: React.FC<TimeInputSectionProps> = ({
  value,
  onChange,
}) => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const timeOptions = generateTimeOptions();

  // 時間変更時のハンドラ
  const handleTimeChange = (type: "start" | "end", selectedTime: string) => {
    const newTimeSlots = [...value];
    if (newTimeSlots.length === 0) {
      newTimeSlots.push({ start: "", end: "" });
    }
    newTimeSlots[0][type] = selectedTime;
    onChange(newTimeSlots);
  };

  // 時間表示のフォーマット
  const formatTime = (time: string) => {
    return time || "時間を選択";
  };

  // 時間ピッカーの描画
  const renderPicker = (
    type: "start" | "end",
    visible: boolean,
    setVisible: (visible: boolean) => void
  ) => {
    const currentValue = value[0]?.[type] || timeOptions[0];

    if (!visible) return null;

    return (
      <View style={styles.pickerContainer}>
        <View style={styles.pickerHeader}>
          <TouchableOpacity onPress={() => setVisible(false)}>
            <Text style={styles.pickerCancelText}>キャンセル</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (!value[0]?.[type]) {
                handleTimeChange(type, timeOptions[0]);
              }
              setVisible(false);
            }}
          >
            <Text style={styles.pickerDoneText}>完了</Text>
          </TouchableOpacity>
        </View>
        <Picker
          selectedValue={currentValue}
          onValueChange={(itemValue) => handleTimeChange(type, itemValue)}
          style={styles.picker}
        >
          {timeOptions.map((time) => (
            <Picker.Item key={time} label={time} value={time} />
          ))}
        </Picker>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>時間帯</Text>
      <View style={styles.timeContainer}>
        <View style={styles.timeInput}>
          <Text style={styles.timeLabel}>開始時間</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.timeButtonText}>
              {formatTime(value[0]?.start)}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.separator}>〜</Text>
        <View style={styles.timeInput}>
          <Text style={styles.timeLabel}>終了時間</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.timeButtonText}>
              {formatTime(value[0]?.end)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {renderPicker("start", showStartPicker, setShowStartPicker)}
      {renderPicker("end", showEndPicker, setShowEndPicker)}
    </View>
  );
};

export default TimeInputSection;

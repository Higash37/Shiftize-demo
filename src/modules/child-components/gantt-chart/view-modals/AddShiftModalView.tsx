import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { TimeInput } from "@/common/common-ui/ui-input/TimeInput";

interface AddShiftModalViewProps {
  visible: boolean;
  newShiftData: any;
  users: { uid: string; nickname: string }[];
  timeOptions: string[];
  statusConfigs: any[];
  isLoading: boolean;
  styles: any;
  extendedTasks?: any[]; // 既存タスクのリスト
  onChange: (field: string, value: any) => void;
  onClose: () => void;
  onSave: () => void;
}

export const AddShiftModalView: React.FC<AddShiftModalViewProps> = ({
  visible,
  newShiftData,
  users,
  timeOptions,
  statusConfigs,
  isLoading,
  styles,
  extendedTasks = [],
  onChange,
  onClose,
  onSave,
}) => {
  const [showUserError, setShowUserError] = useState(false);
  const [attemptedSave, setAttemptedSave] = useState(false);
  const [isManualInput, setIsManualInput] = useState(false);
  const [manualStartTime, setManualStartTime] = useState(newShiftData.startTime);
  const [manualEndTime, setManualEndTime] = useState(newShiftData.endTime);

  // ユーザー選択状態を監視
  useEffect(() => {
    if (newShiftData.userId && showUserError) {
      setShowUserError(false);
    }
  }, [newShiftData.userId]);

  // モーダルが閉じられたときにエラー状態をリセット
  useEffect(() => {
    if (!visible) {
      setShowUserError(false);
      setAttemptedSave(false);
      setIsManualInput(false);
    }
  }, [visible]);

  // 手動入力値をnewShiftDataに反映
  useEffect(() => {
    if (isManualInput) {
      setManualStartTime(newShiftData.startTime);
      setManualEndTime(newShiftData.endTime);
    }
  }, [isManualInput, newShiftData.startTime, newShiftData.endTime]);

  // 時間のバリデーション
  const validateTime = (time: string) => {
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time);
  };

  const handleTimeChange = (value: string, isStart: boolean) => {
    if (isStart) {
      setManualStartTime(value);
      if (validateTime(value)) {
        onChange("startTime", value);
      }
    } else {
      setManualEndTime(value);
      if (validateTime(value)) {
        onChange("endTime", value);
      }
    }
  };

  const handleSave = () => {
    setAttemptedSave(true);
    if (!newShiftData.userId) {
      setShowUserError(true);
      return;
    }
    onSave();
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>シフト追加</Text>
            <Text style={styles.modalSubtitle}>{newShiftData.date}</Text>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, showUserError && { color: '#FF4444' }]}>
                ユーザー {showUserError && '(必須)'}
              </Text>
              <View style={[
                styles.pickerContainer,
                showUserError && { borderColor: '#FF4444', borderWidth: 2 }
              ]}>
                <Picker
                  selectedValue={newShiftData.userId}
                  onValueChange={(itemValue) => {
                    if (itemValue === "recruitment") {
                      onChange("userData", {
                        userId: "recruitment",
                        nickname: "募集",
                      });
                    } else {
                      const user = users.find((u) => u.uid === itemValue);
                      onChange("userData", {
                        userId: itemValue,
                        nickname: user ? user.nickname : "",
                      });
                    }
                  }}
                  style={styles.picker}
                >
                  <Picker.Item
                    label={newShiftData.nickname || "ユーザーを選択"}
                    value=""
                  />
                  <Picker.Item
                    label="募集"
                    value="recruitment"
                  />
                  {users.map((user) => (
                    <Picker.Item
                      key={user.uid}
                      label={user.nickname}
                      value={user.uid}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.timeInputContainer}>
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeInputLabel}>開始時間</Text>
                <View style={styles.pickerContainer}>
                  {isManualInput ? (
                    <TimeInput
                      style={[
                        styles.picker,
                        { paddingHorizontal: 10, textAlign: 'center' }
                      ]}
                      value={newShiftData.startTime}
                      onChangeText={(value) => onChange("startTime", value)}
                      placeholder="00:00"
                      isError={false}
                    />
                  ) : (
                    <Picker
                      selectedValue={newShiftData.startTime}
                      onValueChange={(itemValue) =>
                        onChange("startTime", itemValue)
                      }
                      style={styles.picker}
                    >
                      {timeOptions.map((time) => (
                        <Picker.Item key={time} label={time} value={time} />
                      ))}
                    </Picker>
                  )}
                </View>
              </View>

              <Text style={styles.timeInputSeparator}>～</Text>

              <View style={styles.timeInputGroup}>
                <Text style={styles.timeInputLabel}>終了時間</Text>
                <View style={styles.pickerContainer}>
                  {isManualInput ? (
                    <TimeInput
                      style={[
                        styles.picker,
                        { paddingHorizontal: 10, textAlign: 'center' }
                      ]}
                      value={newShiftData.endTime}
                      onChangeText={(value) => onChange("endTime", value)}
                      placeholder="00:00"
                      isError={false}
                    />
                  ) : (
                    <Picker
                      selectedValue={newShiftData.endTime}
                      onValueChange={(itemValue) =>
                        onChange("endTime", itemValue)
                      }
                      style={styles.picker}
                    >
                      {timeOptions.map((time) => (
                        <Picker.Item key={time} label={time} value={time} />
                      ))}
                    </Picker>
                  )}
                </View>
              </View>
            </View>

            {/* 手動入力切り替えボタン */}
            <TouchableOpacity
              style={{
                alignSelf: 'center',
                marginTop: 8,
                marginBottom: 16,
                paddingVertical: 8,
                paddingHorizontal: 16,
                backgroundColor: isManualInput ? '#4A90E2' : '#f0f0f0',
                borderRadius: 20,
              }}
              onPress={() => setIsManualInput(!isManualInput)}
            >
              <Text style={{
                color: isManualInput ? '#fff' : '#4A90E2',
                fontWeight: 'bold',
                fontSize: 14,
              }}>
                {isManualInput ? 'プルダウンに戻る' : '手動で入力'}
              </Text>
            </TouchableOpacity>

            {/* ステータス選択はマスター画面では非表示にする */}
            {/* <View style={styles.formGroup}>
          <Text style={styles.formLabel}>ステータス</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={newShiftData.status}
              onValueChange={(itemValue) => onChange("status", itemValue)}
              style={styles.picker}
            >
              {statusConfigs.map((config) => (
                <Picker.Item
                  key={config.status}
                  label={config.label}
                  value={config.status}
                />
              ))}
            </Picker>
          </View>
        </View> */}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>授業時間（任意・複数可）</Text>
              {(newShiftData.classes || []).map(
                (classTime: any, idx: number) => (
                  <View
                    key={idx}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.timeInputLabel}>開始</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={classTime.startTime}
                          onValueChange={(v) => {
                            const updated = [...(newShiftData.classes || [])];
                            updated[idx] = { ...updated[idx], startTime: v };
                            onChange("classes", updated);
                          }}
                          style={styles.picker}
                        >
                          {timeOptions.map((time) => (
                            <Picker.Item key={time} label={time} value={time} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                    <Text style={styles.timeInputSeparator}>～</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.timeInputLabel}>終了</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={classTime.endTime}
                          onValueChange={(v) => {
                            const updated = [...(newShiftData.classes || [])];
                            updated[idx] = { ...updated[idx], endTime: v };
                            onChange("classes", updated);
                          }}
                          style={styles.picker}
                        >
                          {timeOptions.map((time) => (
                            <Picker.Item key={time} label={time} value={time} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={{ marginLeft: 8 }}
                      onPress={() => {
                        const updated = [...(newShiftData.classes || [])];
                        updated.splice(idx, 1);
                        onChange("classes", updated);
                      }}
                    >
                      <Text style={{ color: "#FF4444", fontWeight: "bold" }}>
                        削除
                      </Text>
                    </TouchableOpacity>
                  </View>
                )
              )}
              <TouchableOpacity
                style={{ marginTop: 4, alignSelf: "flex-start" }}
                onPress={() => {
                  const updated = [...(newShiftData.classes || [])];
                  updated.push({
                    startTime: newShiftData.startTime,
                    endTime: newShiftData.endTime,
                  });
                  onChange("classes", updated);
                }}
              >
                <Text style={{ color: "#4A90E2", fontWeight: "bold" }}>
                  ＋授業時間を追加
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.saveButton,
                  attemptedSave && !newShiftData.userId && { backgroundColor: '#FF4444' }
                ]}
                onPress={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>追加</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

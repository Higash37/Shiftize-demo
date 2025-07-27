import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

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
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.modalTitle}>シフト追加</Text>
            <Text style={styles.modalSubtitle}>{newShiftData.date}</Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>ユーザー</Text>
              <View style={styles.pickerContainer}>
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
                </View>
              </View>

              <Text style={styles.timeInputSeparator}>～</Text>

              <View style={styles.timeInputGroup}>
                <Text style={styles.timeInputLabel}>終了時間</Text>
                <View style={styles.pickerContainer}>
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
                </View>
              </View>
            </View>

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
                style={[styles.modalButton, styles.saveButton]}
                onPress={onSave}
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

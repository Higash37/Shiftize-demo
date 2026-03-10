/** @file EditShiftModalView.tsx
 *  @description シフト編集用のモーダルフォーム。
 *    既存シフトのユーザー、時間、ステータスの変更と削除が可能。
 *    途中時間（授業等）の追加・編集サブ画面を内包する。
 *    マスターロールのみステータス変更プルダウンが表示される。
 */

// 【このファイルの位置づけ】
// - import元: ClassTimeEditor, TimeInput, useAuth（ロール判定）
// - importされる先: ShiftModalRenderer（showEditModal === true 時に表示）
// - 役割: 既存シフトの編集フォーム。isAddingClassTime フラグで
//   メイン編集画面と途中時間追加画面を切り替える。

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
import { useAuth } from "@/services/auth/useAuth";
import { TimeInput } from "@/common/common-ui/ui-input/TimeInput";
import { ClassTimeEditor } from "./ClassTimeEditor";
import type { NewShiftData } from "../gantt-chart-common/ShiftModalRenderer";
import type { ShiftStatusConfig } from "@/common/common-models/ModelIndex";

interface EditShiftModalViewProps {
  visible: boolean;
  newShiftData: NewShiftData;
  users: { uid: string; nickname: string }[];
  timeOptions: string[];
  statusConfigs: ShiftStatusConfig[];
  isLoading: boolean;
  styles: any;
  onChange: (field: string, value: any) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: (shift: NewShiftData) => void;
}

export const EditShiftModalView: React.FC<EditShiftModalViewProps> = React.memo((
  props
) => {
  const { user, role } = useAuth();
  const {
    visible,
    newShiftData,
    users,
    timeOptions,
    statusConfigs,
    isLoading,
    styles,
    onChange,
    onClose,
    onSave,
    onDelete,
  } = props;

  const [isAddingClassTime, setIsAddingClassTime] = React.useState(false);
  const [isManualInput, setIsManualInput] = React.useState(false);

  React.useEffect(() => {
    if (!visible) {
      setIsManualInput(false);
    }
  }, [visible]);

  const renderTimeInput = (label: string, field: "startTime" | "endTime") => (
    <View style={styles.timeInputGroup}>
      <Text style={styles.timeInputLabel}>{label}</Text>
      <View style={styles.pickerContainer}>
        {isManualInput ? (
          <TimeInput
            style={[
              styles.picker,
              { paddingHorizontal: 10, textAlign: 'center' }
            ]}
            value={newShiftData[field]}
            onChangeText={(value) => onChange(field, value)}
            placeholder="00:00"
            isError={false}
          />
        ) : (
          <Picker
            selectedValue={newShiftData[field]}
            onValueChange={(itemValue) => onChange(field, itemValue)}
            style={styles.picker}
          >
            {timeOptions.map((time) => (
              <Picker.Item key={time} label={time} value={time} />
            ))}
          </Picker>
        )}
      </View>
    </View>
  );

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
          {isAddingClassTime ? (
            // 授業時間追加モーダル
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
                    >
              <Text style={styles.modalTitle}>途中時間を追加</Text>

              <ClassTimeEditor
                classes={newShiftData.classes || []}
                timeOptions={timeOptions}
                defaultStartTime={newShiftData.startTime}
                defaultEndTime={newShiftData.endTime}
                styles={styles}
                onChange={onChange}
              />

              <TouchableOpacity
                style={{ marginTop: 20, alignSelf: "center" }}
                onPress={() => setIsAddingClassTime(false)}
              >
                <Text style={{ color: "#4A90E2", fontWeight: "bold" }}>
                  シフト編集に戻る
                </Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            // メインのシフト編集画面
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              >
              <Text style={styles.modalTitle}>シフト編集</Text>
              <Text style={styles.modalSubtitle}>{newShiftData.date}</Text>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>ユーザー</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newShiftData.userId}
                    onValueChange={(itemValue) => {
                      const user = users.find((u) => u.uid === itemValue);
                      onChange("userId", itemValue);
                      onChange("nickname", user ? user.nickname : "未選択");
                    }}
                    style={styles.picker}
                  >
                    <Picker.Item label="ユーザーを選択" value="" />
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
                {renderTimeInput("開始時間", "startTime")}
                <Text style={styles.timeInputSeparator}>～</Text>
                {renderTimeInput("終了時間", "endTime")}
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

              {role === "master" && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>ステータス</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={newShiftData.status}
                      onValueChange={(itemValue) =>
                        onChange("status", itemValue)
                      }
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
                    <Text
                      style={[
                        styles.formLabel,
                        { color: "#FF4444", fontWeight: "bold", fontSize: 12 },
                      ]}
                    >
                      ・講師を変える場合は新しく追加しなおした後このシフトを削除してください。
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={{ marginBottom: 20, alignSelf: "center" }}
                onPress={() => setIsAddingClassTime(true)}
              >
                <Text style={{ color: "#4A90E2", fontWeight: "bold" }}>
                  途中時間を追加
                </Text>
              </TouchableOpacity>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: "#FF4444", marginRight: 8 },
                  ]}
                  onPress={() => onDelete(newShiftData)}
                  disabled={isLoading}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    削除
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={onSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>更新</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
});

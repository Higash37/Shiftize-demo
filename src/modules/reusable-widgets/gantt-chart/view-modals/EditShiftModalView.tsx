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
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "@/services/auth/useAuth";
import { TimeInput } from "@/common/common-ui/ui-input/TimeInput";
import { ClassTimeEditor } from "./ClassTimeEditor";
import { useShiftUndoRedo } from "./useShiftUndoRedo";
import type { ShiftSnapshot } from "./useShiftUndoRedo";
import type { NewShiftData } from "../gantt-chart-common/ShiftModalRenderer";
import type { ShiftStatusConfig } from "@/common/common-models/ModelIndex";

interface EditShiftModalViewProps {
  visible: boolean;
  newShiftData: NewShiftData;
  shiftId?: string | undefined;
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
    shiftId,
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

  // visible=false 時は shiftId を渡さずDB fetchをスキップ
  const { canUndo, canRedo, undo, redo, historyCount, currentIndex } =
    useShiftUndoRedo(visible ? shiftId : undefined, user?.storeId);

  const applySnapshot = React.useCallback(
    (snapshot: ShiftSnapshot) => {
      if (snapshot.startTime !== undefined) onChange("startTime", snapshot.startTime);
      if (snapshot.endTime !== undefined) onChange("endTime", snapshot.endTime);
      if (snapshot.userId !== undefined) {
        onChange("userId", snapshot.userId);
        const matched = users.find((u) => u.uid === snapshot.userId);
        onChange("nickname", matched ? matched.nickname : snapshot.nickname ?? "");
      }
      if (snapshot.status !== undefined) onChange("status", snapshot.status);
      if (snapshot.classes !== undefined) onChange("classes", snapshot.classes);
    },
    [onChange, users]
  );

  const handleUndo = React.useCallback(() => {
    const snapshot = undo();
    if (snapshot) applySnapshot(snapshot);
  }, [undo, applySnapshot]);

  const handleRedo = React.useCallback(() => {
    const snapshot = redo();
    if (snapshot) applySnapshot(snapshot);
  }, [redo, applySnapshot]);

  React.useEffect(() => {
    if (!visible) {
      setIsManualInput(false);
    }
  }, [visible]);

  // 全フックの後で早期リターン（フックルール遵守）
  if (!visible) return null;

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
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 4,
              }}>
                <TouchableOpacity
                  onPress={handleUndo}
                  disabled={!canUndo}
                  style={{
                    padding: 6,
                    marginRight: 10,
                    opacity: canUndo ? 1 : 0.2,
                  }}
                >
                  <Ionicons
                    name="arrow-undo-outline"
                    size={20}
                    color={canUndo ? "#4A90E2" : "#BDBDBD"}
                  />
                </TouchableOpacity>

                <Text style={[styles.modalTitle, { marginBottom: 0 }]}>シフト編集</Text>

                <TouchableOpacity
                  onPress={handleRedo}
                  disabled={!canRedo}
                  style={{
                    padding: 6,
                    marginLeft: 10,
                    opacity: canRedo ? 1 : 0.2,
                  }}
                >
                  <Ionicons
                    name="arrow-redo-outline"
                    size={20}
                    color={canRedo ? "#4A90E2" : "#BDBDBD"}
                  />
                </TouchableOpacity>
              </View>
              {historyCount > 1 && (
                <Text style={{
                  textAlign: "center",
                  fontSize: 11,
                  color: "#999",
                  marginBottom: 4,
                }}>
                  履歴 {currentIndex + 1} / {historyCount}
                </Text>
              )}
              <Text style={styles.modalSubtitle}>{newShiftData.date}</Text>

              {newShiftData.status === "deletion_requested" && (
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#FFF3E0",
                  borderRadius: 8,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  marginTop: 8,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: "#FF9F0A",
                }}>
                  <Ionicons name="trash-outline" size={16} color="#FF9F0A" style={{ marginRight: 6 }} />
                  <Text style={{ color: "#E65100", fontWeight: "bold", fontSize: 13 }}>
                    削除申請中
                  </Text>
                </View>
              )}

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

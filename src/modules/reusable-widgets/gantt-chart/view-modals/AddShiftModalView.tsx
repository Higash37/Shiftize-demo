import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { TimeInput } from "@/common/common-ui/ui-input/TimeInput";
import { ClassTimeEditor } from "./ClassTimeEditor";
import type { NewShiftData } from "../gantt-chart-common/ShiftModalRenderer";

interface AddShiftModalViewProps {
  visible: boolean;
  newShiftData: NewShiftData;
  users: { uid: string; nickname: string }[];
  timeOptions: string[];
  isLoading: boolean;
  styles: any;
  onChange: (field: string, value: any) => void;
  onClose: () => void;
  onSave: () => void;
}

export const AddShiftModalView: React.FC<AddShiftModalViewProps> = React.memo(({
  visible,
  newShiftData,
  users,
  timeOptions,
  isLoading,
  styles,
  onChange,
  onClose,
  onSave,
}) => {
  const [showUserError, setShowUserError] = useState(false);
  const [attemptedSave, setAttemptedSave] = useState(false);
  const [isManualInput, setIsManualInput] = useState(false);

  useEffect(() => {
    if (newShiftData.userId && showUserError) {
      setShowUserError(false);
    }
  }, [newShiftData.userId]);

  useEffect(() => {
    if (!visible) {
      setShowUserError(false);
      setAttemptedSave(false);
      setIsManualInput(false);
    }
  }, [visible]);

  const handleSave = () => {
    setAttemptedSave(true);
    if (!newShiftData.userId) {
      setShowUserError(true);
      return;
    }
    onSave();
  };

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
          <ScrollView 
            contentContainerStyle={styles.scrollContainer} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
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

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>途中時間（任意・複数可）</Text>
              <ClassTimeEditor
                classes={newShiftData.classes || []}
                timeOptions={timeOptions}
                defaultStartTime={newShiftData.startTime}
                defaultEndTime={newShiftData.endTime}
                styles={styles}
                onChange={onChange}
              />
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
});

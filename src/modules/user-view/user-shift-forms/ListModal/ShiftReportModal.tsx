import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Pressable,
  Modal,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ServiceProvider } from "@/services/ServiceProvider";
import { useAuth } from "@/services/auth/useAuth";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { generateTimeOptions } from "../../user-shift-utils/ui-utils";
import CustomScrollView from "@/common/common-ui/ui-scroll/ScrollViewComponent";

/**
 * 時間文字列("HH:MM")を時・分に分解
 */
const parseTime = (time: string): { h: number; m: number } => {
  const [h, m] = (time || "00:00").split(":").map(Number);
  return { h: h ?? 0, m: m ?? 0 };
};

/**
 * 時・分を"HH:MM"形式にフォーマット
 */
const formatTime = (h: number, m: number): string =>
  `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

const timeOptions = generateTimeOptions();

/**
 * 分単位の増減ボタン付き時間ピッカー（時間タップでリスト選択も可能）
 */
const TimePicker = ({
  label,
  value,
  onChange,
  colors,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  colors: any;
}) => {
  const [showList, setShowList] = useState(false);
  const { h, m } = parseTime(value);

  const adjust = (deltaMinutes: number) => {
    let total = h * 60 + m + deltaMinutes;
    if (total < 0) total = 0;
    if (total > 23 * 60 + 59) total = 23 * 60 + 59;
    onChange(formatTime(Math.floor(total / 60), total % 60));
  };

  return (
    <View style={pickerStyles.container}>
      <Text style={[pickerStyles.label, { color: colors.onSurface }]}>
        {label}
      </Text>
      <View style={pickerStyles.row}>
        <TouchableOpacity
          onPress={() => adjust(-1)}
          style={[pickerStyles.btn, { backgroundColor: colors.primaryContainer }]}
        >
          <Ionicons name="remove" size={18} color={colors.onPrimaryContainer} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowList(true)}>
          <Text style={[pickerStyles.time, { color: colors.primary }]}>
            {value}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => adjust(1)}
          style={[pickerStyles.btn, { backgroundColor: colors.primaryContainer }]}
        >
          <Ionicons name="add" size={18} color={colors.onPrimaryContainer} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showList}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowList(false)}
      >
        <Pressable
          style={pickerStyles.listOverlay}
          onPress={() => setShowList(false)}
        >
          <View style={[pickerStyles.listContent, { backgroundColor: colors.surface }]}>
            <Pressable>
              <CustomScrollView
                style={pickerStyles.listScroll}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              >
                {timeOptions.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      pickerStyles.listItem,
                      { borderBottomColor: colors.outlineVariant },
                      value === time && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => {
                      onChange(time);
                      setShowList(false);
                    }}
                  >
                    <Text
                      style={[
                        pickerStyles.listItemText,
                        { color: colors.onSurface },
                        value === time && { color: colors.onPrimary },
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </CustomScrollView>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const pickerStyles = StyleSheet.create({
  container: { flex: 1, alignItems: "center" },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  btn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  time: { fontSize: 20, fontWeight: "700", minWidth: 56, textAlign: "center", textDecorationLine: "underline" },
  listOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    width: "80%",
    maxWidth: 320,
    borderRadius: 12,
    padding: 16,
  },
  listScroll: {
    maxHeight: 300,
  },
  listItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  listItemText: {
    fontSize: 16,
    textAlign: "center",
  },
});

const ShiftReportModal = ({
  reportModalVisible,
  setReportModalVisible,
  comments,
  setComments,
  modalShift,
  fetchShifts,
}: {
  reportModalVisible: boolean;
  setReportModalVisible: (visible: boolean) => void;
  comments: string;
  setComments: (comments: string) => void;
  modalShift: ShiftItem | null;
  fetchShifts: () => void;
}) => {
  const { user } = useAuth();
  const { colorScheme } = useMD3Theme();

  const [startTime, setStartTime] = useState(modalShift?.startTime || "");
  const [endTime, setEndTime] = useState(modalShift?.endTime || "");
  const [loading, setLoading] = useState(false);

  // モーダルが開かれるたびにシフトの時間をセット
  useEffect(() => {
    if (reportModalVisible && modalShift) {
      setStartTime(modalShift.startTime);
      setEndTime(modalShift.endTime);
    }
  }, [reportModalVisible, modalShift]);

  const handleReportSubmit = async () => {
    if (!modalShift) return;

    // 時間バリデーション
    const { h: sh, m: sm } = parseTime(startTime);
    const { h: eh, m: em } = parseTime(endTime);
    if (sh * 60 + sm >= eh * 60 + em) {
      Alert.alert("エラー", "終了時間は開始時間より後にしてください");
      return;
    }

    setLoading(true);
    try {
      await ServiceProvider.shifts.updateShift(modalShift.id, {
        status: "completed",
        startTime,
        endTime,
        notes: comments,
      });

      fetchShifts();
      setReportModalVisible(false);
    } catch (error) {
      Alert.alert("エラー", "シフト報告の保存に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={reportModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setReportModalVisible(false)}
    >
      <Pressable
        style={styles.overlay}
        onPress={() => setReportModalVisible(false)}
      >
        <Pressable style={[styles.content, { backgroundColor: colorScheme.surface }]} onPress={(e) => e.stopPropagation()}>
          <Text style={[styles.title, { color: colorScheme.onSurface }]}>
            シフト報告
          </Text>

          {/* 予定時間の表示 */}
          <Text style={[styles.originalTime, { color: colorScheme.onSurfaceVariant }]}>
            予定: {modalShift?.startTime} - {modalShift?.endTime}
          </Text>

          {/* 実績時間の編集 */}
          <Text style={[styles.sectionLabel, { color: colorScheme.onSurface }]}>
            実績時間
          </Text>
          <View style={styles.timeRow}>
            <TimePicker
              label="開始"
              value={startTime}
              onChange={setStartTime}
              colors={colorScheme}
            />
            <Text style={[styles.timeSeparator, { color: colorScheme.onSurfaceVariant }]}>
              ~
            </Text>
            <TimePicker
              label="終了"
              value={endTime}
              onChange={setEndTime}
              colors={colorScheme}
            />
          </View>

          {/* コメント */}
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colorScheme.outlineVariant,
                color: colorScheme.onSurface,
              },
            ]}
            placeholder="コメントを入力（任意）"
            placeholderTextColor={colorScheme.onSurfaceVariant}
            value={comments}
            onChangeText={setComments}
            multiline
          />

          {/* 報告ボタン */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: colorScheme.primary },
              loading && { opacity: 0.6 },
            ]}
            onPress={handleReportSubmit}
            disabled={loading}
          >
            <Ionicons name="checkmark-circle" size={20} color={colorScheme.onPrimary} />
            <Text style={[styles.submitText, { color: colorScheme.onPrimary }]}>
              {loading ? "送信中..." : "報告して完了"}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  originalTime: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  timeSeparator: {
    fontSize: 20,
    fontWeight: "600",
    marginHorizontal: 8,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    minHeight: 60,
    textAlignVertical: "top",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  submitText: {
    fontSize: 16,
    fontWeight: "700",
  },
});

export default ShiftReportModal;

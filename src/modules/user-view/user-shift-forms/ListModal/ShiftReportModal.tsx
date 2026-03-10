/** @file ShiftReportModal.tsx
 *  @description シフト報告モーダルコンポーネント。
 *    承認済みシフトの実績時間（開始・終了）を修正してコメントと共に報告する。
 *    TimePicker サブコンポーネントで時間を±1分単位で調整、
 *    またはリスト選択で時間を設定できる。
 *
 *  【このファイルの位置づけ】
 *  - 依存: React / React Native / ServiceProvider（shifts サービス）/
 *          useAuth / useMD3Theme / generateTimeOptions ユーティリティ
 *  - 利用先: ShiftListView（UserShiftList）内の「シフト報告」操作から表示される
 *
 *  【ファイル構成】
 *  - parseTime / formatTime: 時間文字列のパース・フォーマットユーティリティ
 *  - TimePicker: ±ボタン+リスト選択の時間入力コンポーネント
 *  - ShiftReportModal: メインの報告モーダルコンポーネント
 */
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
 * 時間文字列("HH:MM")を時・分に分解する。
 * @param time "HH:MM" 形式の文字列
 * @returns { h: 時, m: 分 }
 */
const parseTime = (time: string): { h: number; m: number } => {
  const [h, m] = (time || "00:00").split(":").map(Number);
  return { h: h ?? 0, m: m ?? 0 };
};

/**
 * 時・分を"HH:MM"形式にフォーマットする。
 * String.padStart(2, "0") で1桁の場合にゼロ埋めする。
 */
const formatTime = (h: number, m: number): string =>
  `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

/** 30分刻みの時間選択肢リスト（"00:00"〜"23:30"等） */
const timeOptions = generateTimeOptions();

/**
 * 分単位の増減ボタン付き時間ピッカーコンポーネント。
 * 時間表示をタップするとリスト選択モーダルが開く。
 *
 * @param label  ラベル文字列（「開始」「終了」等）
 * @param value  現在の時間文字列（"HH:MM"形式）
 * @param onChange 時間変更時のコールバック
 * @param colors  テーマカラースキーム
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
  /** リスト選択モーダルの表示フラグ */
  const [showList, setShowList] = useState(false);
  /** 現在の時間を時・分に分解 */
  const { h, m } = parseTime(value);

  /**
   * 指定した分数だけ時間を調整する。
   * 0未満や24時間以上にならないようクランプする。
   */
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

/**
 * シフト報告モーダル本体。
 * 実績時間（開始・終了）の調整とコメント入力ができる。
 *
 * @param reportModalVisible モーダル表示フラグ
 * @param setReportModalVisible 表示切替セッター
 * @param comments コメント文字列（親で管理）
 * @param setComments コメント変更セッター
 * @param modalShift 報告対象のシフトデータ（null なら何もしない）
 * @param fetchShifts 報告完了後にシフト一覧を再取得するコールバック
 */
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

  // --- State ---
  /** 実績の開始時間 */
  const [startTime, setStartTime] = useState(modalShift?.startTime || "");
  /** 実績の終了時間 */
  const [endTime, setEndTime] = useState(modalShift?.endTime || "");
  /** 送信中フラグ */
  const [loading, setLoading] = useState(false);

  // モーダルが開かれるたびにシフトの予定時間で初期化する
  useEffect(() => {
    if (reportModalVisible && modalShift) {
      setStartTime(modalShift.startTime);
      setEndTime(modalShift.endTime);
    }
  }, [reportModalVisible, modalShift]);

  // --- Handlers ---
  /**
   * 報告を送信する。
   * 開始時間 >= 終了時間の場合はバリデーションエラーを表示する。
   * 成功時はシフトのステータスを "completed" に更新する。
   */
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

  // --- Render ---
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

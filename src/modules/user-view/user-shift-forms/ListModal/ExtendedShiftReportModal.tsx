/** @file ExtendedShiftReportModal.tsx
 *  @description 拡張シフト報告モーダルコンポーネント。
 *    シフトの完了報告（ステータスを "completed" に更新）を行う。
 *    全体コメントを入力して送信する。
 *
 *  【このファイルの位置づけ】
 *  - 依存: React / React Native / ServiceProvider（shifts サービス）/
 *          useAuth / useThemedStyles / ShiftItem モデル / shiftHistoryLogger
 *  - 利用先: シフト一覧画面から「シフト報告」ボタンで表示される
 *
 *  【コンポーネント概要】
 *  - 表示内容: ヘッダー（閉じる/報告ボタン）、シフト情報、コメント入力
 *  - 主要Props: visible, shift, storeId, onClose, onReported
 */
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ServiceProvider } from "@/services/ServiceProvider";
import { useAuth } from "@/services/auth/useAuth";
import { createExtendedShiftReportStyles } from "./ExtendedShiftReportModal.styles";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { createActor } from "@/services/shift-history/shiftHistoryLogger";

/** このモーダルに渡す Props */
interface ExtendedShiftReportModalProps {
  visible: boolean;       // モーダルの表示/非表示
  shift: ShiftItem;       // 報告対象のシフトデータ
  storeId: string;        // 店舗ID
  onClose: () => void;    // モーダルを閉じるコールバック
  onReported: () => void; // 報告完了後に親に通知するコールバック
}

export const ExtendedShiftReportModal: React.FC<
  ExtendedShiftReportModalProps
> = ({ visible, shift, storeId: _storeId, onClose, onReported }) => {
  const { user } = useAuth();
  // useThemedStyles はテーマファクトリ関数を渡すと、現在のテーマを適用したスタイルを返す
  const styles = useThemedStyles(createExtendedShiftReportStyles);

  // --- State ---
  /** 全体コメントの入力値 */
  const [comments, setComments] = useState("");
  /** 送信中フラグ */
  const [loading, setLoading] = useState(false);

  // --- Handlers ---
  /** 送信ボタン押下時のハンドラ */
  const handleSubmit = async () => {
    await submitReport();
  };

  /**
   * シフトを完了状態に更新し、コメントを保存する。
   * createActor でアクター情報（操作者）を生成し、履歴ログに残す。
   */
  const submitReport = async () => {
    setLoading(true);
    try {
      // シフトを完了状態に更新
      await ServiceProvider.shifts.updateShift(
        shift.id,
        {
          status: "completed",
          notes: comments || shift.notes || "",
        },
        createActor(user, "teacher") ?? {
          userId: shift?.userId || "",
          nickname: shift?.nickname || "不明",
          role: "teacher" as const,
        }
      );

      Alert.alert("完了", "シフト報告を送信しました");
      onReported();
      onClose();
    } catch (error) {
      Alert.alert("エラー", "シフト報告の送信に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet" // iOS でページシート風表示にする
    >
      <View style={styles.container}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>シフト報告</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "送信中..." : "報告"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* シフト情報 */}
        <View style={styles.shiftInfo}>
          <Text style={styles.shiftInfoText}>
            {shift?.date} {shift?.startTime} - {shift?.endTime}
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 全体コメント */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>全体コメント</Text>
            <TextInput
              style={styles.commentsInput}
              placeholder="シフト全体のコメントを入力..."
              placeholderTextColor="#999"
              value={comments}
              onChangeText={setComments}
              multiline
              numberOfLines={4}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

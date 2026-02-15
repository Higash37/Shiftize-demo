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

interface ExtendedShiftReportModalProps {
  visible: boolean;
  shift: ShiftItem;
  storeId: string;
  onClose: () => void;
  onReported: () => void;
}

export const ExtendedShiftReportModal: React.FC<
  ExtendedShiftReportModalProps
> = ({ visible, shift, storeId, onClose, onReported }) => {
  const { user } = useAuth();
  const styles = useThemedStyles(createExtendedShiftReportStyles);

  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    await submitReport();
  };

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
        {
          userId: user?.uid || shift?.userId || "",
          nickname: user?.nickname || shift?.nickname || "不明",
          role: ((user?.role as "master" | "teacher") || "teacher") as "master" | "teacher"
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
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

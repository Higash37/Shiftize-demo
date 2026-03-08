import React, { useContext } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { useAuth } from "@/services/auth/useAuth";
import { ServiceProvider } from "@/services/ServiceProvider";
import { createActor } from "@/services/shift-history/shiftHistoryLogger";
import { ShiftSelectionContext } from "../gantt-chart-common/components";
import type { ShiftItem } from "@/common/common-models/ModelIndex";

interface BatchConfirmModalProps {
  visible: boolean;
  type: "approve" | "delete" | null;
  shifts: ShiftItem[];
  isLoading: boolean;
  styles: any;
  setBatchModal: (modal: {
    visible: boolean;
    type: "approve" | "delete" | null;
  }) => void;
  setIsLoading: (loading: boolean) => void;
  refreshPage?: () => void;
}

const BatchConfirmModal: React.FC<BatchConfirmModalProps> = ({
  visible,
  type,
  shifts,
  isLoading,
  styles,
  setBatchModal,
  setIsLoading,
  refreshPage,
}) => {
  const { user } = useAuth();
  const { selectedShiftIds, clearSelection } = useContext(ShiftSelectionContext);

  if (!visible) return null;

  const title =
    type === "approve" ? "一括承認" : type === "delete" ? "完全削除" : "";

  const hasSelection = selectedShiftIds && selectedShiftIds.size > 0;

  const getDescription = (): string => {
    if (type === "approve") {
      if (hasSelection) {
        const count = shifts.filter(
          (s) => s.status === "pending" && selectedShiftIds.has(s.id)
        ).length;
        return `${count}件の選択シフトを承認します。本当によろしいですか？`;
      }
      const count = shifts.filter((s) => s.status === "pending").length;
      return `${count}件の未承認シフトを一括で承認します。本当によろしいですか？`;
    }
    if (type === "delete") {
      const count = shifts.filter((s) => s.status === "deleted").length;
      return `${count}件の削除済みシフトを画面から消します。本当によろしいですか？`;
    }
    return "";
  };

  const description = getDescription();

  const handleBatchApprove = async () => {
    const targets = hasSelection
      ? shifts.filter((s) => s.status === "pending" && selectedShiftIds.has(s.id))
      : shifts.filter((s) => s.status === "pending");

    const actor = createActor(user);

    // 各シフトを承認
    for (const shift of targets) {
      await ServiceProvider.shifts.updateShift(
        shift.id,
        { status: "approved", updatedAt: new Date() },
        actor
      );
    }

    // 一括承認の監査ログ
    const canLogApproval = actor && user?.storeId && targets.length > 0;
    if (canLogApproval) {
      const yearMonth = shifts[0]?.date
        ? shifts[0].date.substring(0, 7)
        : new Date().toISOString().substring(0, 7);

      await ServiceProvider.audit.logBatchApprove(
        actor,
        user!.storeId!,
        yearMonth,
        targets.length
      );
    }
  };

  const handleBatchDelete = async () => {
    const targets = shifts.filter((s) => s.status === "deletion_requested");
    for (const shift of targets) {
      await ServiceProvider.shifts.updateShift(
        shift.id,
        { status: "deleted", updatedAt: new Date() }
      );
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      if (type === "approve") {
        await handleBatchApprove();
      } else if (type === "delete") {
        await handleBatchDelete();
      }
    } catch (error) {
      setIsLoading(false);
      setBatchModal({ visible: false, type: null });
      Alert.alert("エラー", "操作に失敗しました");
      return;
    }
    setIsLoading(false);
    setBatchModal({ visible: false, type: null });
    clearSelection();
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => setBatchModal({ visible: false, type: null })} // モーダル外を押した際に閉じる
    >
      <TouchableWithoutFeedback
        onPress={() => setBatchModal({ visible: false, type: null })} // モーダル外を押した際に閉じる
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Text style={styles.modalDescription}>{description}</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleConfirm}
                disabled={isLoading}
              >
                <Text style={styles.modalButtonText}>確認</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setBatchModal({ visible: false, type: null })}
                disabled={isLoading}
              >
                <Text style={styles.modalButtonText}>キャンセル</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default BatchConfirmModal;

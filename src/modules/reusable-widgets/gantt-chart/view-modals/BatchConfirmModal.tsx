import React, { useContext } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "@/services/auth/useAuth";
import { ServiceProvider } from "@/services/ServiceProvider";
import { ShiftSelectionContext } from "../gantt-chart-common/components";

interface BatchConfirmModalProps {
  visible: boolean;
  type: "approve" | "delete" | null;
  shifts: any[];
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
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { selectedShiftIds, clearSelection } = useContext(ShiftSelectionContext);

  if (!visible) return null;

  const title =
    type === "approve" ? "一括承認" : type === "delete" ? "完全削除" : "";

  const hasSelection = selectedShiftIds && selectedShiftIds.size > 0;

  const description =
    type === "approve"
      ? (() => {
          if (hasSelection) {
            const selectedPending = shifts.filter(
              (s) => s.status === "pending" && selectedShiftIds.has(s.id)
            );
            return `${selectedPending.length}件の選択シフトを承認します。本当によろしいですか？`;
          }
          const targets = shifts.filter((s) => s.status === "pending");
          return `${targets.length}件の未承認シフトを一括で承認します。本当によろしいですか？`;
        })()
      : type === "delete"
      ? (() => {
          const targets = shifts.filter((s) => s.status === "deleted");
          return `${targets.length}件の削除済みシフトを画面から消します。本当によろしいですか？`;
        })()
      : "";

  const handleConfirm = async () => {
    setIsLoading(true);
    if (type === "approve") {
      const targets = hasSelection
        ? shifts.filter((s) => s.status === "pending" && selectedShiftIds.has(s.id))
        : shifts.filter((s) => s.status === "pending");
      try {
        const actor = user ? {
          userId: user.uid,
          nickname: user.nickname || "教室長",
          role: ((user.role as "master" | "teacher") || "master") as "master" | "teacher",
        } : undefined;

        for (const shift of targets) {
          await ServiceProvider.shifts.updateShift(
            shift.id,
            { status: "approved", updatedAt: new Date() },
            actor
          );
        }

        // 一括承認のログを記録
        if (actor && user?.storeId && targets.length > 0) {
          const yearMonth = shifts[0]?.date ?
            shifts[0].date.substring(0, 7) :
            new Date().toISOString().substring(0, 7);

          await ServiceProvider.audit.logBatchApprove(
            actor,
            user.storeId,
            yearMonth,
            targets.length
          );
        }
      } catch (error) {
        setIsLoading(false);
        setBatchModal({ visible: false, type: null });
        return;
      }
    } else if (type === "delete") {
      const targets = shifts.filter((s) => s.status === "deletion_requested");
      try {
        for (const shift of targets) {
          await ServiceProvider.shifts.updateShift(
            shift.id,
            { status: "deleted", updatedAt: new Date() }
          );
        }
      } catch (error) {
        setIsLoading(false);
        setBatchModal({ visible: false, type: null });
        return;
      }
    }
    setIsLoading(false);
    setBatchModal({ visible: false, type: null });
    clearSelection();
    // リアルタイムリスナーで自動更新されるため、リフレッシュ不要
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

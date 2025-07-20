import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { useNavigation, useRoute } from "@react-navigation/native";

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

  if (!visible) return null;

  const title =
    type === "approve" ? "一括承認" : type === "delete" ? "完全削除" : "";

  const description =
    type === "approve"
      ? (() => {
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
      const targets = shifts.filter((s) => s.status === "pending");
      try {
        for (const shift of targets) {
          await updateDoc(doc(db, "shifts", shift.id), {
            status: "approved",
            updatedAt: serverTimestamp(),
          });
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
          await updateDoc(doc(db, "shifts", shift.id), {
            status: "deleted",
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        setIsLoading(false);
        setBatchModal({ visible: false, type: null });
        return;
      }
    }
    setIsLoading(false);
    setBatchModal({ visible: false, type: null });
    // バッチ操作後にページをリフレッシュ
    if (refreshPage) {
      refreshPage();
    }
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

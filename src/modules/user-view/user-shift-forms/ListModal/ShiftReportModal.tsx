import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Pressable,
  Modal,
} from "react-native";
import { modalStyles } from "./ModalStyles";
import { ServiceProvider } from "@/services/ServiceProvider";
import { useAuth } from "@/services/auth/useAuth";
import { ShiftItem } from "@/common/common-models/ModelIndex";

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
  const handleReportSubmit = async () => {
    if (modalShift) {
      try {
        await ServiceProvider.shifts.updateShift(modalShift.id, {
          status: "completed",
          notes: comments,
        });

        fetchShifts();
        setReportModalVisible(false);
      } catch (error) {
      }
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
        style={modalStyles.modalOverlay}
        onPress={() => setReportModalVisible(false)}
      >
        <View style={modalStyles.modalContent}>
          <Text style={modalStyles.modalTitle}>シフト報告</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 5,
              padding: 10,
              marginVertical: 10,
              width: "100%",
            }}
            placeholder="コメントを入力してください"
            placeholderTextColor="#999"
            value={comments}
            onChangeText={setComments}
          />
          <TouchableOpacity
            style={modalStyles.modalButton}
            onPress={handleReportSubmit}
          >
            <Text style={modalStyles.modalButtonText}>報告を送信</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

export default ShiftReportModal;

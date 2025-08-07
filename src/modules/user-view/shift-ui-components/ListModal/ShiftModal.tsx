import React from "react";
import { View, Text, TouchableOpacity, Pressable, Modal } from "react-native";
import { modalStyles } from "./ModalStyles";
import { designSystem } from "@/common/common-constants/DesignSystem";
import Button from "@/common/common-ui/ui-forms/FormButton";

const ShiftModal = ({
  isModalVisible,
  setModalVisible,
  handleReportShift,
  handleEditShift,
}: any) => {
  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setModalVisible(false)}
    >
      <Pressable
        style={designSystem.modal.overlay}
        onPress={() => setModalVisible(false)}
      >
        <View style={designSystem.modal.modal}>
          <Text style={designSystem.text.welcomeText}>シフト操作</Text>

          <Button
            title="シフト報告をする"
            onPress={handleReportShift}
            variant="primary"
            size="large"
            fullWidth
            style={{ marginBottom: 12 }}
          />

          <Button
            title="シフト変更をする"
            onPress={handleEditShift}
            variant="secondary"
            size="large"
            fullWidth
          />
        </View>
      </Pressable>
    </Modal>
  );
};

export default ShiftModal;

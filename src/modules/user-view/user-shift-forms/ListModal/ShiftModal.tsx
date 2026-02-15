import React from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import Button from "@/common/common-ui/ui-forms/FormButton";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

interface ShiftModalProps {
  isModalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  handleReportShift: () => void;
  handleEditShift: () => void;
}

const ShiftModal: React.FC<ShiftModalProps> = ({
  isModalVisible,
  setModalVisible,
  handleReportShift,
  handleEditShift,
}) => {
  const styles = useThemedStyles(createShiftModalStyles);

  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setModalVisible(false)}
    >
      <Pressable
        style={styles.overlay}
        onPress={() => setModalVisible(false)}
      >
        <View style={styles.modal}>
          <Text style={styles.title}>シフト操作</Text>

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

const createShiftModalStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.32)",
      justifyContent: "center",
      alignItems: "center",
      padding: theme.spacing.lg,
    },
    modal: {
      backgroundColor: theme.colorScheme.surfaceContainerHigh,
      borderRadius: theme.shape.extraLarge,
      padding: theme.spacing.xxl,
      width: "100%",
      maxWidth: 400,
    },
    title: {
      ...theme.typography.headlineSmall,
      color: theme.colorScheme.onSurface,
      textAlign: "center",
      marginBottom: theme.spacing.xl,
    },
  });

export default ShiftModal;

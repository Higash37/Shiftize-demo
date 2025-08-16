import React from "react";
import { View, StyleSheet } from "react-native";
import Button from "@/common/common-ui/ui-forms/FormButton";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";

interface ShiftModalActionsProps {
  mode: "create" | "edit" | "delete";
  loading: boolean;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export const ShiftModalActions: React.FC<ShiftModalActionsProps> = ({
  mode,
  loading,
  onSave,
  onDelete,
  onClose,
}) => {
  return (
    <View style={styles.buttonContainer}>
      <Button
        variant="secondary"
        onPress={onClose}
        style={styles.button}
        disabled={loading}
      >
        キャンセル
      </Button>

      {mode === "delete" ? (
        <Button
          variant="danger"
          onPress={onDelete}
          style={styles.button}
          loading={loading}
        >
          削除
        </Button>
      ) : (
        <Button
          variant="primary"
          onPress={onSave}
          style={styles.button}
          loading={loading}
        >
          {mode === "create" ? "作成" : "更新"}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: layout.spacing.large,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    gap: layout.spacing.medium,
  },
  button: {
    flex: 1,
  },
});
import React from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { colors } from "@/common/common-constants/ColorConstants";
import Button from "@/common/common-ui/ui-forms/FormButton";

interface CreateGroupActionsProps {
  loading: boolean;
  onCreateGroup: () => void;
}

export const CreateGroupActions: React.FC<CreateGroupActionsProps> = ({
  loading,
  onCreateGroup,
}) => {
  return (
    <View style={styles.actions}>
      <Button
        variant="secondary"
        onPress={() => router.back()}
        style={[styles.button, styles.cancelButton]}
        disabled={loading}
      >
        キャンセル
      </Button>

      <Button
        variant="primary"
        onPress={onCreateGroup}
        style={[styles.button, styles.createButton]}
        loading={loading}
        disabled={loading}
      >
        {loading ? "作成中..." : "グループを作成"}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  button: {
    flex: 1,
    minHeight: 50,
  },
  cancelButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  createButton: {
    backgroundColor: colors.primary.main,
  },
});
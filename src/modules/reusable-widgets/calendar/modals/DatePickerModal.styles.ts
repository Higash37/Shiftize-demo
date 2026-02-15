import { StyleSheet, ViewStyle, TextStyle } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

// スタイルの型定義
interface DatePickerModalStyles {
  modalOverlay: ViewStyle;
  modalContainer: ViewStyle;
  modalContent: ViewStyle;
  modalTitle: TextStyle;
  pickerContainer: ViewStyle;
  pickerItem: ViewStyle;
  selectedItem: ViewStyle;
  pickerText: TextStyle;
  selectedText: TextStyle;
  monthGrid: ViewStyle;
  monthItem: ViewStyle;
  monthItemText: TextStyle;
  modalButtons: ViewStyle;
  modalButton: ViewStyle;
  modalButtonText: TextStyle;
}

export const createDatePickerModalStyles = (theme: MD3Theme) =>
  StyleSheet.create<DatePickerModalStyles>({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
    },
    modalContainer: {
      alignItems: "center",
      justifyContent: "center",
      maxWidth: "100%",
      position: "relative",
    },
    modalContent: {
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.medium,
      padding: theme.spacing.xxl,
      width: "90%",
      maxWidth: 650,
      maxHeight: "100%",
      minWidth: 350,
      ...theme.elevation.level5.shadow,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginHorizontal: "auto",
    },
    modalTitle: {
      ...theme.typography.titleMedium,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: theme.spacing.lg,
      color: theme.colorScheme.onSurface,
    },
    pickerContainer: {
      maxHeight: 400,
      width: "100%",
    },
    pickerItem: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.colorScheme.outlineVariant,
      width: "100%",
    },
    selectedItem: {
      backgroundColor: theme.colorScheme.primary + "20",
    },
    pickerText: {
      ...theme.typography.bodyLarge,
      textAlign: "center",
      color: theme.colorScheme.onSurface,
    },
    selectedText: {
      color: theme.colorScheme.primary,
      fontWeight: "bold",
    },
    monthGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-around",
      width: "100%",
      marginBottom: theme.spacing.md,
    },
    monthItem: {
      width: "30%",
      padding: 15,
      marginBottom: 10,
      borderRadius: theme.shape.small,
      alignItems: "center",
    },
    monthItemText: {
      ...theme.typography.bodyLarge,
      color: theme.colorScheme.onSurface,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: theme.spacing.lg,
      width: "100%",
    },
    modalButton: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: 10,
      marginHorizontal: theme.spacing.sm,
      backgroundColor: theme.colorScheme.primary + "10",
      borderRadius: theme.shape.small,
    },
    modalButtonText: {
      color: theme.colorScheme.primary,
      ...theme.typography.bodyLarge,
      fontWeight: "bold",
      textAlign: "center",
    },
  });

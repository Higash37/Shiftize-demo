import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";
import { TimeInputSectionStyles } from "./TimeInputSection.types";
import {
  shiftUIConstants,
  shiftUIStyles,
} from "../user-shift-utils/ui-constants";

export const createTimeInputSectionStyles = (theme: MD3Theme) =>
  StyleSheet.create<TimeInputSectionStyles>({
    ...shiftUIStyles,
    container: {
      ...shiftUIStyles.container,
    },
    label: {
      ...shiftUIStyles.title,
    },
    timeContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    timeInput: {
      flex: 1,
    },
    timeLabel: {
      ...shiftUIStyles.label,
    },
    separator: {
      marginHorizontal: shiftUIConstants.spacing.sm,
      color: theme.colorScheme.onSurfaceVariant,
    },
    timeButton: {
      ...shiftUIStyles.input,
      borderWidth: 1,
      borderColor: theme.colorScheme.primary,
    },
    timeButtonText: {
      color: theme.colorScheme.onSurface,
      ...theme.typography.bodyLarge,
      textAlign: "center",
    },
    pickerContainer: {
      backgroundColor: theme.colorScheme.surface,
      borderTopLeftRadius: theme.shape.large,
      borderTopRightRadius: theme.shape.large,
      ...theme.elevation.level2.shadow,
    },
    pickerHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colorScheme.outlineVariant,
    },
    pickerCancelText: {
      color: theme.colorScheme.onSurfaceVariant,
      ...theme.typography.bodyLarge,
    },
    pickerDoneText: {
      color: theme.colorScheme.primary,
      ...theme.typography.bodyLarge,
      fontWeight: "bold",
    },
    picker: {
      height: 216,
    },
  });

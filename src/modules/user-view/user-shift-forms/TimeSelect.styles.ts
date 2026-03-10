/**
 * @file TimeSelect.styles.ts
 * @description TimeSelect のスタイル定義（レスポンシブ対応）。
 */
import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";
import { TimeSelectStyles } from "./TimeSelect.types";
import {
  shiftUIConstants,
  shiftUIStyles,
} from "../user-shift-utils/ui-constants";

export const createTimeSelectStyles = (
  theme: MD3Theme,
  breakpoint: { isMobile: boolean; isTablet: boolean; isDesktop: boolean },
) =>
  StyleSheet.create<TimeSelectStyles>({
    ...shiftUIStyles,
    container: {
      ...shiftUIStyles.container,
      marginBottom: shiftUIConstants.spacing.md,
      padding: breakpoint.isMobile
        ? shiftUIConstants.spacing.sm
        : shiftUIConstants.spacing.md,
    },
    timeContainer: {
      flexDirection: "row",
      gap: breakpoint.isMobile
        ? shiftUIConstants.spacing.sm
        : shiftUIConstants.spacing.md,
    },
    timeSelect: {
      flex: 1,
    },
    label: {
      ...shiftUIStyles.label,
      fontSize: shiftUIConstants.fontSize.md,
    },
    button: {
      ...shiftUIStyles.input,
      padding: breakpoint.isMobile
        ? shiftUIConstants.spacing.sm
        : shiftUIConstants.spacing.md,
    },
    buttonText: {
      fontSize: shiftUIConstants.fontSize.md,
      color: theme.colorScheme.onSurface,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      width: breakpoint.isMobile ? "90%" : "80%",
      maxHeight: breakpoint.isMobile ? "90%" : "80%",
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.small,
      padding: breakpoint.isMobile ? theme.spacing.md : theme.spacing.lg,
    },
    optionsContainer: {
      maxHeight: breakpoint.isMobile ? 250 : 300,
    },
    scrollContainer: {
      maxHeight: breakpoint.isMobile ? 250 : 300,
    },
    optionItem: {
      padding: breakpoint.isMobile ? 10 : theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colorScheme.outlineVariant,
    },
    selectedOption: {
      backgroundColor: theme.colorScheme.primary,
    },
    optionText: {
      fontSize: shiftUIConstants.fontSize.md,
      color: theme.colorScheme.onSurface,
    },
    selectedOptionText: {
      color: theme.colorScheme.onPrimary,
    },
  });
